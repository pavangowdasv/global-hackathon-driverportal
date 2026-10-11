import React, { useState, useEffect } from 'react';
import { DeliveryOrder } from '../types/delivery';
import {
  recalculateRouteWithAI,
  analyzeHazardWithAI,
  askDispatchCopilot,
  RouteRecalculationResult,
  HazardAnalysisResult,
} from '../services/geminiService';

interface DispatchHelpModalProps {
  onClose: () => void;
  onRecalculateRoute: () => void;
  onEmergencySOS: () => void;
  activeDeliveries?: DeliveryOrder[];
}

export const DispatchHelpModal: React.FC<DispatchHelpModalProps> = ({
  onClose,
  onRecalculateRoute,
  onEmergencySOS,
  activeDeliveries = [],
}) => {
  const [recalculating, setRecalculating] = useState(false);
  const [recalcResult, setRecalcResult] = useState<RouteRecalculationResult | null>(null);

  // Hazard Reporting
  const [hazardLoading, setHazardLoading] = useState(false);
  const [hazardResult, setHazardResult] = useState<HazardAnalysisResult | null>(null);
  const [selectedHazard, setSelectedHazard] = useState('Traffic Barricade / Police Checkpoint');
  const [hazardLocation, setHazardLocation] = useState(
    activeDeliveries[0]?.destinationName || 'Indiranagar Hub #04'
  );
  const [detectingLocation, setDetectingLocation] = useState(false);

  // Automatically detect and use real GPS position
  const detectCurrentLocation = () => {
    if (!navigator.geolocation) return;
    setDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      async (pos) => {
        const lat = pos.coords.latitude;
        const lon = pos.coords.longitude;
        try {
          const res = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}&zoom=16&addressdetails=1`
          );
          if (res.ok) {
            const data = await res.json();
            const addr = data.address || {};
            const place =
              addr.suburb ||
              addr.neighbourhood ||
              addr.road ||
              addr.residential ||
              addr.city_district ||
              data.display_name?.split(',')[0] ||
              'Bengaluru Sector';
            const city = addr.city || addr.town || addr.county || 'Bengaluru';
            setHazardLocation(`${place}, ${city}`);
            setDetectingLocation(false);
            return;
          }
        } catch {
          // If reverse geocoding is blocked, fallback to coordinate string
        }
        setHazardLocation(`${lat.toFixed(4)}°N, ${lon.toFixed(4)}°E`);
        setDetectingLocation(false);
      },
      () => {
        // Fallback if permission denied
        if (activeDeliveries[0]?.destinationName) {
          setHazardLocation(activeDeliveries[0].destinationName);
        }
        setDetectingLocation(false);
      },
      { enableHighAccuracy: true, timeout: 6000 }
    );
  };

  useEffect(() => {
    detectCurrentLocation();
  }, []);

  // AI Copilot Chat
  const [copilotQuery, setCopilotQuery] = useState('');
  const [copilotLoading, setCopilotLoading] = useState(false);
  const [copilotResponse, setCopilotResponse] = useState<string | null>(null);

  // Live AI Recalculate
  const handleRecalc = async () => {
    setRecalculating(true);
    setRecalcResult(null);
    try {
      const result = await recalculateRouteWithAI(activeDeliveries);
      setRecalcResult(result);
      onRecalculateRoute();
    } catch (e) {
      console.error(e);
    } finally {
      setRecalculating(false);
    }
  };

  // Live AI Hazard Report
  const handleReportObstruction = async () => {
    setHazardLoading(true);
    setHazardResult(null);
    try {
      const result = await analyzeHazardWithAI(selectedHazard, hazardLocation);
      setHazardResult(result);
    } catch (e) {
      console.error(e);
    } finally {
      setHazardLoading(false);
    }
  };

  // Live Copilot Query
  const handleAskCopilot = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!copilotQuery.trim() || copilotLoading) return;
    setCopilotLoading(true);
    try {
      const answer = await askDispatchCopilot(copilotQuery, activeDeliveries);
      setCopilotResponse(answer);
    } catch (e) {
      console.error(e);
    } finally {
      setCopilotLoading(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-xs transition-opacity animate-in fade-in duration-200"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="w-full max-w-[420px] bg-[#FFFFFF] rounded-t-3xl sm:rounded-2xl max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-[#E5ECE8] animate-in slide-in-from-bottom duration-250">
        <div className="pt-3 pb-1 flex justify-center sm:hidden">
          <div className="w-12 h-1.5 bg-[#E5ECE8] rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-[#e1f2e9] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[22px] text-[#006954]">
              smart_toy
            </span>
            <div>
              <span className="font-['Manrope'] text-[16px] font-bold text-[#101e19]">
                Live AI Dispatch Control
              </span>
              <span className="text-[10px] bg-[#E7F5EF] text-[#27866F] font-bold px-2 py-0.5 rounded-full ml-2">
                Gemini 3.8 Flash Online
              </span>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full flex items-center justify-center text-[#525f5a] hover:bg-[#e1f2e9] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-5 overflow-y-auto space-y-4 flex-1">
          {/* Active Status Info */}
          <div className="p-3.5 bg-[#e6f8ee]/80 rounded-xl border border-[#d5e7dd]/60 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <span className="w-2.5 h-2.5 rounded-full bg-[#006954] animate-ping" />
              <div>
                <p className="text-[12px] font-bold text-[#101e19]">
                  Live Telemetry & AI Model Connected
                </p>
                <p className="text-[11px] text-[#3e4945]">
                  Latency: 14ms · Indiranagar Hub Server 04 · Gemini Online
                </p>
              </div>
            </div>
            <span className="text-[10px] font-bold text-[#006954] bg-[#87f3d2]/60 px-2 py-0.5 rounded">
              Synced
            </span>
          </div>

          {/* Action 1: Real AI Route Optimization */}
          <div className="p-4 bg-[#ffffff] rounded-xl border border-[#e1f2e9] space-y-2.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-[#101e19] flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[17px] text-[#006954]">
                  alt_route
                </span>
                AI Route Optimization & Rerouting
              </h4>
              <span className="text-[10px] text-[#006954] font-semibold">Gemini 3.8</span>
            </div>

            <p className="text-[12px] text-[#3e4945] leading-relaxed">
              Analyzes live traffic on Old Airport Road, 100ft Road & Domlur corridors to re-sequence deliveries for maximum speed.
            </p>

            <button
              type="button"
              onClick={handleRecalc}
              disabled={recalculating}
              className="w-full min-h-[42px] rounded-xl bg-[#006954] hover:bg-[#007059] active:scale-[0.99] text-white text-[13px] font-bold flex items-center justify-center gap-2 transition-all cursor-pointer shadow-xs disabled:opacity-75"
            >
              <span className={`material-symbols-outlined text-[18px] ${recalculating ? 'animate-spin' : ''}`}>
                {recalculating ? 'refresh' : 'auto_mode'}
              </span>
              <span>
                {recalculating ? 'Gemini Analyzing Live Traffic...' : 'Recalculate Route with Gemini AI'}
              </span>
            </button>

            {recalcResult && (
              <div className="mt-3 p-3 bg-[#F0F9F5] rounded-xl border border-[#D1EDE1] text-[12px] space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between text-[#006954] font-bold">
                  <span>⚡ Saved ~{recalcResult.savedMinutes} minutes!</span>
                  <span>New ETA: {recalcResult.newEtaMinutes} mins</span>
                </div>
                <p className="text-[#26352F]">{recalcResult.summary}</p>
                {recalcResult.trafficInsights?.length > 0 && (
                  <div className="pt-1 border-t border-[#D1EDE1]/60">
                    <span className="font-semibold text-[#101e19] block text-[11px]">Insights:</span>
                    <ul className="list-disc list-inside text-[#3e4945] text-[11px] space-y-0.5">
                      {recalcResult.trafficInsights.map((t, idx) => (
                        <li key={idx}>{t}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action 2: Real AI Hazard / Obstruction Report */}
          <div className="p-4 bg-[#FFFFFF] rounded-2xl border border-[#E5ECE8] space-y-3.5 shadow-2xs">
            <div className="flex items-center justify-between">
              <h4 className="text-[13px] font-bold text-[#101E19] flex items-center gap-2">
                <span className="w-7 h-7 rounded-lg bg-[#FDF2F1] text-[#C93B2B] flex items-center justify-center shrink-0">
                  <span className="material-symbols-outlined text-[17px]">report_problem</span>
                </span>
                <span>Report Road Hazard / Obstruction</span>
              </h4>
            </div>

            {/* Form Fields: Stacked with equal height, full width, and aligned labels */}
            <div className="space-y-3 text-[12px]">
              {/* 1. Obstruction Type */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-[#5C6E66] block">
                  Obstruction Type
                </label>
                <div className="relative">
                  <select
                    value={selectedHazard}
                    onChange={(e) => setSelectedHazard(e.target.value)}
                    className="w-full h-10 bg-[#F8FAF9] border border-[#E5ECE8] rounded-xl px-3 pr-8 text-[#101E19] text-[13px] font-medium appearance-none focus:outline-none focus:border-[#27866F] focus:ring-1 focus:ring-[#27866F]/20 cursor-pointer"
                  >
                    <option value="Traffic Barricade / Police Checkpoint">Police Barricade / Checkpoint</option>
                    <option value="Waterlogged Underpass / Flash Flood">Waterlogging / Underpass Flooding</option>
                    <option value="Road Construction & Metro Works">Road Work & Metro Construction</option>
                    <option value="Accident / Severe Chokepoint">Accident / Road Blockage</option>
                  </select>
                  <span className="material-symbols-outlined absolute right-3 top-1/2 -translate-y-1/2 text-[18px] text-[#8A9B93] pointer-events-none">
                    expand_more
                  </span>
                </div>
              </div>

              {/* 2. Location / Sector */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-[#5C6E66]">
                    Location / Sector
                  </label>
                  <button
                    type="button"
                    onClick={detectCurrentLocation}
                    disabled={detectingLocation}
                    className="text-[11px] font-bold text-[#27866F] hover:text-[#1F6C59] flex items-center gap-1 cursor-pointer transition-colors"
                    title="Refresh current GPS location"
                  >
                    <span className={`w-2 h-2 rounded-full bg-[#35A88A] ${detectingLocation ? 'animate-ping' : ''}`} />
                    <span>{detectingLocation ? 'Locating…' : 'Use Current GPS'}</span>
                  </button>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[17px] text-[#27866F]">
                    location_on
                  </span>
                  <input
                    type="text"
                    value={hazardLocation}
                    onChange={(e) => setHazardLocation(e.target.value)}
                    placeholder="e.g. Koramangala 4th Block"
                    className="w-full h-10 bg-[#F8FAF9] border border-[#E5ECE8] rounded-xl pl-9 pr-3 text-[#101E19] text-[13px] font-medium placeholder-[#8A9B93] focus:outline-none focus:border-[#27866F] focus:ring-1 focus:ring-[#27866F]/20"
                  />
                </div>

                {/* Quick Select Route Stops */}
                {activeDeliveries.length > 0 && (
                  <div className="pt-1 flex items-center gap-1.5 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#8A9B93]">
                      Quick select:
                    </span>
                    {activeDeliveries.map((d) => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => setHazardLocation(d.destinationName)}
                        className={`text-[11px] px-2.5 py-1 rounded-lg font-semibold border transition-all cursor-pointer ${
                          hazardLocation === d.destinationName
                            ? 'bg-[#E7F5EF] text-[#27866F] border-[#27866F] shadow-2xs'
                            : 'bg-[#F8FAF9] text-[#5C6E66] border-[#E5ECE8] hover:border-[#35A88A] hover:bg-white'
                        }`}
                      >
                        {d.destinationName.split(',')[0]}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Broadcast Button */}
            <button
              type="button"
              onClick={handleReportObstruction}
              disabled={hazardLoading}
              className="w-full h-11 rounded-xl bg-[#27866F] hover:bg-[#1F6C59] active:scale-[0.99] text-white text-[13px] font-bold flex items-center justify-center gap-2 shadow-sm transition-all cursor-pointer disabled:opacity-70 mt-1"
            >
              <span className={`material-symbols-outlined text-[19px] ${hazardLoading ? 'animate-spin' : ''}`}>
                {hazardLoading ? 'sync' : 'campaign'}
              </span>
              <span>
                {hazardLoading ? 'AI Generating Incident Detour...' : 'Broadcast Incident with AI Detour'}
              </span>
            </button>

            {hazardResult && (
              <div className="mt-2.5 p-3 bg-[#FEF6F5] rounded-xl border border-[#FCD9D5] text-[12px] space-y-1.5 animate-in fade-in">
                <div className="flex items-center justify-between font-bold text-[#93000A]">
                  <span>Severity: {hazardResult.hazardSeverity}</span>
                  <span>+{hazardResult.delayImpactMinutes}m Delay Impact</span>
                </div>
                <p className="text-[#3e4945]">
                  <strong>Detour:</strong> {hazardResult.detourAdvice}
                </p>
                <div className="text-[11px] text-[#93000A] bg-[#FFDAD6]/50 p-2 rounded-lg font-mono">
                  {hazardResult.gridAlertBroadcast}
                </div>
              </div>
            )}
          </div>

          {/* Action 3: Live AI Dispatch Copilot Chat */}
          <div className="p-4 bg-[#ffffff] rounded-xl border border-[#e1f2e9] space-y-2.5 shadow-2xs">
            <h4 className="text-[13px] font-bold text-[#101e19] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[17px] text-[#006954]">
                support_agent
              </span>
              Rider Copilot AI Desk
            </h4>
            <p className="text-[11px] text-[#3e4945]">
              Ask any instant dispatch question (OTP issues, gate access, customer unreachable policy, damaged parcel).
            </p>

            <form onSubmit={handleAskCopilot} className="flex gap-2">
              <input
                type="text"
                value={copilotQuery}
                onChange={(e) => setCopilotQuery(e.target.value)}
                placeholder="e.g. Customer not answering phone at Koramangala..."
                className="flex-1 bg-[#F8FAF9] border border-[#d5e7dd] rounded-xl px-3 py-2 text-[12px] text-[#101e19] placeholder:text-[#8A9B93] focus:outline-none focus:border-[#006954]"
              />
              <button
                type="submit"
                disabled={copilotLoading || !copilotQuery.trim()}
                className="bg-[#006954] text-white px-3.5 py-2 rounded-xl text-[12px] font-bold cursor-pointer disabled:opacity-50 flex items-center gap-1"
              >
                {copilotLoading ? (
                  <span className="material-symbols-outlined text-[16px] animate-spin">refresh</span>
                ) : (
                  <span>Ask AI</span>
                )}
              </button>
            </form>

            {copilotResponse && (
              <div className="p-3 bg-[#F0F9F5] rounded-xl border border-[#D1EDE1] text-[12px] text-[#26352F] leading-relaxed animate-in fade-in">
                <span className="font-bold text-[#006954] block mb-0.5">Verya AI Copilot:</span>
                {copilotResponse}
              </div>
            )}
          </div>

          {/* Hotline & SOS buttons */}
          <div className="pt-1 space-y-2">
            <a
              href="tel:+918049102200"
              className="w-full min-h-[42px] rounded-xl border border-[#bdc9c3]/50 bg-[#ffffff] text-[#101e19] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#e1f2e9] transition-all"
            >
              <span className="material-symbols-outlined text-[18px] text-[#006954]">
                call
              </span>
              <span>Direct Hub Hotline (+91 80 4910 2200)</span>
            </a>

            <button
              type="button"
              onClick={onEmergencySOS}
              className="w-full min-h-[42px] rounded-xl bg-[#ffdad6]/60 text-[#93000a] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#ffdad6] transition-all cursor-pointer"
            >
              <span className="material-symbols-outlined text-[18px]">
                emergency
              </span>
              <span>Trigger Emergency SOS Alert</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
