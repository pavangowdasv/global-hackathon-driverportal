import React, { useEffect, useRef, useState } from 'react';
import { DeliveryOrder } from '../types/delivery';

// ---------------------------------------------------------------------------
// Leaflet is lazy-loaded to avoid SSR issues and ensure CSS loads first
// ---------------------------------------------------------------------------

let leafletLoaded = false;
let L: typeof import('leaflet') | null = null;

async function loadLeaflet() {
  if (leafletLoaded && L) return L;
  const leaflet = await import('leaflet');
  await import('leaflet/dist/leaflet.css');
  // Fix default marker icon URLs broken by bundlers
  const DefaultIcon = leaflet.default.Icon.Default as unknown as {
    prototype: { _getIconUrl?: unknown };
    mergeOptions: (opts: Record<string, unknown>) => void;
  };
  delete DefaultIcon.prototype._getIconUrl;
  DefaultIcon.mergeOptions({
    iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
    iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
    shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
  });
  L = leaflet.default;
  leafletLoaded = true;
  return L;
}

interface LiveDeliveryMapProps {
  activeDeliveries: DeliveryOrder[];
  selectedOrder?: DeliveryOrder | null;
  onSelectOrder?: (order: DeliveryOrder) => void;
  /** Height in pixels, default 220 */
  heightPx?: number;
  showTurnByTurn?: boolean;
}

export const LiveDeliveryMap: React.FC<LiveDeliveryMapProps> = ({
  activeDeliveries,
  selectedOrder,
  onSelectOrder,
  heightPx = 220,
  showTurnByTurn = true,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import('leaflet').Map | null>(null);
  const markersRef = useRef<import('leaflet').Marker[]>([]);
  const polylineRef = useRef<import('leaflet').Polyline | null>(null);

  // Bengaluru Indiranagar Hub fallback
  const [riderPos, setRiderPos] = useState<[number, number]>([12.9716, 77.6412]);
  const [usingRealGps, setUsingRealGps] = useState(false);
  const [ready, setReady] = useState(false);

  // Try device GPS silently
  const requestGps = () => {
    if (!('geolocation' in navigator)) return;
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const p: [number, number] = [pos.coords.latitude, pos.coords.longitude];
        setRiderPos(p);
        setUsingRealGps(true);
        mapRef.current?.setView(p, 14);
      },
      () => {/* fallback ok */},
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  // Initialise Leaflet map exactly once
  useEffect(() => {
    let cancelled = false;
    loadLeaflet().then((leaflet) => {
      if (cancelled || !mapContainerRef.current || mapRef.current) return;

      const map = leaflet.map(mapContainerRef.current, {
        center: [12.9716, 77.6412],
        zoom: 13,
        zoomControl: false,
      });

      // 100% free OSM tiles — NO API key, NO watermark
      leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
        maxZoom: 19,
      }).addTo(map);

      leaflet.control.zoom({ position: 'bottomright' }).addTo(map);

      mapRef.current = map;
      setReady(true);
      requestGps();

      // Force tile refresh after DOM settles
      setTimeout(() => map.invalidateSize(), 100);
      setTimeout(() => map.invalidateSize(), 400);
    });

    return () => {
      cancelled = true;
      mapRef.current?.remove();
      mapRef.current = null;
    };
  }, []);

  // Update markers & polyline whenever deliveries or selection change
  useEffect(() => {
    if (!ready || !mapRef.current || !L) return;
    const map = mapRef.current;
    const leaflet = L; // captured so TS knows it's non-null inside closures

    map.invalidateSize();

    // Clear old markers + polyline
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];
    polylineRef.current?.remove();
    polylineRef.current = null;

    // Rider marker (pulsing teal dot via divIcon)
    const riderIcon = leaflet.divIcon({
      className: '',
      html: `<div style="position:relative;width:32px;height:32px;display:flex;align-items:center;justify-content:center;">
               <div style="position:absolute;width:32px;height:32px;background:rgba(53,168,138,0.35);border-radius:50%;animation:ping 1.4s ease-in-out infinite;"></div>
               <div style="width:18px;height:18px;background:#27866F;border:3px solid #fff;border-radius:50%;box-shadow:0 2px 6px rgba(0,0,0,0.3);z-index:2;"></div>
             </div>`,
      iconSize: [32, 32],
      iconAnchor: [16, 16],
    });

    const riderM = leaflet.marker(riderPos, { icon: riderIcon })
      .addTo(map)
      .bindPopup('<strong>Your Location</strong><br/>Indiranagar Hub #04');
    markersRef.current.push(riderM);

    const target = selectedOrder || activeDeliveries[0];
    const boundsPoints: [number, number][] = [riderPos];

    activeDeliveries.forEach((order, idx) => {
      const lat = order.lat ?? (riderPos[0] + (idx === 0 ? -0.025 : 0.015 * idx));
      const lng = order.lng ?? (riderPos[1] + (idx === 0 ? -0.015 : 0.025 * idx));
      const isActive = target?.id === order.id;

      const pinIcon = leaflet.divIcon({
        className: '',
        html: `<div style="background:${isActive ? '#101E19' : '#35A88A'};color:#fff;font-size:11px;font-weight:700;
                     padding:4px 9px;border-radius:12px;border:2px solid #fff;
                     box-shadow:0 3px 8px rgba(0,0,0,0.3);white-space:nowrap;cursor:pointer;">
                 #${order.id.replace('VY-', '')} · ${order.etaMinutes}m
               </div>`,
        iconSize: [80, 24],
        iconAnchor: [40, 12],
      });

      const m = leaflet.marker([lat, lng], { icon: pinIcon })
        .addTo(map)
        .bindPopup(
          `<strong>#${order.id}</strong> — ${order.customerName}<br/>
           ${order.destinationName}<br/>
           <span style="color:#27866F;font-weight:600;">ETA ${order.etaMinutes} min</span>`
        );
      m.on('click', () => onSelectOrder?.(order));
      markersRef.current.push(m);
      boundsPoints.push([lat, lng]);
    });

    // Dashed route polyline to active stop
    if (target) {
      const destLat = target.lat ?? 12.9345;
      const destLng = target.lng ?? 77.6265;
      polylineRef.current = leaflet.polyline([riderPos, [destLat, destLng]], {
        color: '#27866F',
        weight: 4,
        opacity: 0.9,
        dashArray: '8 8',
      }).addTo(map);
      map.fitBounds(leaflet.latLngBounds([riderPos, [destLat, destLng]]), { padding: [40, 40] });
    } else if (boundsPoints.length > 1) {
      map.fitBounds(leaflet.latLngBounds(boundsPoints), { padding: [40, 40] });
    }
  }, [ready, activeDeliveries, selectedOrder, riderPos]);

  const recenter = () => {
    mapRef.current?.setView(riderPos, 14);
    mapRef.current?.invalidateSize();
  };

  const fitAll = () => {
    if (!mapRef.current || !L) return;
    const pts: [number, number][] = [riderPos];
    activeDeliveries.forEach((d) => { if (d.lat && d.lng) pts.push([d.lat, d.lng]); });
    if (pts.length > 1) mapRef.current.fitBounds(L.latLngBounds(pts), { padding: [35, 35] });
  };

  const openGoogleMaps = () => {
    const t = selectedOrder || activeDeliveries[0];
    if (!t) return;
    const dest = t.lat && t.lng ? `${t.lat},${t.lng}` : encodeURIComponent(t.destinationAddress);
    window.open(`https://www.google.com/maps/dir/?api=1&origin=${riderPos[0]},${riderPos[1]}&destination=${dest}&travelmode=driving`, '_blank');
  };

  return (
    /* Stacking context is strictly isolated so overlay buttons never bleed through modals */
    <div
      style={{ height: `${heightPx}px`, position: 'relative', isolation: 'isolate', zIndex: 0 }}
      className="w-full rounded-2xl overflow-hidden border border-[#E5ECE8] shadow-xs bg-[#e8e8e8]"
    >
      {/* Leaflet mounts here */}
      <div ref={mapContainerRef} style={{ width: '100%', height: '100%' }} />

      {/* Ping animation keyframe */}
      <style>{`
        @keyframes ping {
          0%   { transform: scale(1);   opacity: 1; }
          75%  { transform: scale(2.2); opacity: 0; }
          100% { transform: scale(2.2); opacity: 0; }
        }
      `}</style>

      {/* GPS status badge */}
      <div
        style={{ position: 'absolute', top: 8, left: 8, zIndex: 10 }}
        className="flex items-center gap-1.5 bg-white/90 backdrop-blur px-2.5 py-1.5 rounded-full border border-[#E5ECE8] shadow-xs text-[11px] font-semibold text-[#26352F]"
      >
        <span className="w-2 h-2 rounded-full bg-[#35A88A] animate-pulse" />
        <span>{usingRealGps ? 'Live GPS' : 'Hub Telemetry'}</span>
        <button
          type="button"
          onClick={requestGps}
          className="ml-1 text-[10px] text-[#27866F] font-bold hover:underline cursor-pointer"
        >
          {usingRealGps ? '✓' : 'Sync'}
        </button>
      </div>

      {/* Top-right controls */}
      <div style={{ position: 'absolute', top: 8, right: 8, zIndex: 10, display: 'flex', gap: 4 }}>
        <button
          type="button"
          onClick={recenter}
          title="Recenter"
          className="w-7 h-7 bg-white/90 hover:bg-white rounded-lg border border-[#E5ECE8] shadow-xs flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-[#26352F]">my_location</span>
        </button>
        <button
          type="button"
          onClick={fitAll}
          title="Fit all stops"
          className="w-7 h-7 bg-white/90 hover:bg-white rounded-lg border border-[#E5ECE8] shadow-xs flex items-center justify-center cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px] text-[#26352F]">fit_screen</span>
        </button>
      </div>

      {/* Google Maps launcher (optional for mini-maps) */}
      {showTurnByTurn && (
        <div style={{ position: 'absolute', bottom: 8, left: 8, zIndex: 10 }}>
          <button
            type="button"
            onClick={openGoogleMaps}
            className="bg-[#101E19] hover:bg-[#26352F] text-white px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center gap-1.5 shadow cursor-pointer active:scale-95 transition-all"
          >
            <span className="material-symbols-outlined text-[14px] text-[#35A88A]">near_me</span>
            <span>Turn-by-Turn Nav</span>
          </button>
        </div>
      )}
    </div>
  );
};
