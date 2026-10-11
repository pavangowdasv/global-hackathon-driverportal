import React from 'react';
import { BatchAssignment, DeliveryOrder, EarningsData } from '../types/delivery';
import { LiveDeliveryMap } from './LiveDeliveryMap';

interface DashboardScreenProps {
  partnerName: string;
  isOnline: boolean;
  onToggleOnline: () => void;
  earningsData: EarningsData;
  activeBatch: BatchAssignment;
  activeDeliveries: DeliveryOrder[];
  onViewManifest: (batchId?: string) => void;
  onSelectDelivery: (delivery: DeliveryOrder) => void;
  onViewAllDeliveries: () => void;
  onOpenDispatchHelp?: () => void;
}

export const DashboardScreen: React.FC<DashboardScreenProps> = ({
  partnerName,
  isOnline,
  onToggleOnline,
  earningsData,
  activeBatch,
  activeDeliveries,
  onViewManifest,
  onSelectDelivery,
  onViewAllDeliveries,
  onOpenDispatchHelp,
}) => {
  return (
    <div className="flex flex-col w-full px-[20px] pt-4 pb-6 space-y-5">
      {/* 1. Greeting Section */}
      <section className="space-y-3">
        <div>
          <h1 className="font-['Manrope'] text-[24px] leading-tight font-bold text-[#26352F] tracking-tight">
            Good morning, {partnerName}
          </h1>
          <p className="text-[13px] text-[#5C6E66] mt-0.5 leading-snug">
            Here’s your live delivery operations overview.
          </p>
        </div>

        {/* Compact Online/Offline toggle + AI Dispatch launcher */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            type="button"
            onClick={onToggleOnline}
            className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
              isOnline
                ? 'bg-[#E7F5EF] border-[#35A88A]/30 text-[#27866F]'
                : 'bg-[#F2F4F3] border-[#E5ECE8] text-[#5C6E66]'
            }`}
          >
            <span
              className={`w-2 h-2 rounded-full ${
                isOnline ? 'bg-[#35A88A] animate-pulse' : 'bg-[#8A9B93]'
              }`}
            />
            <span className="text-[12px] font-semibold tracking-wide uppercase">
              {isOnline ? 'Network Online' : 'Offline'}
            </span>
            <span className="material-symbols-outlined text-[16px] -ml-0.5">
              {isOnline ? 'toggle_on' : 'toggle_off'}
            </span>
          </button>

          {onOpenDispatchHelp && (
            <button
              type="button"
              onClick={onOpenDispatchHelp}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#101E19] hover:bg-[#26352F] active:scale-95 text-white text-[12px] font-bold shadow-xs cursor-pointer transition-all"
            >
              <span className="material-symbols-outlined text-[15px] text-[#35A88A]">
                smart_toy
              </span>
              <span>AI Dispatch & Reroute</span>
            </button>
          )}
        </div>
      </section>

      {/* 2. Today's Summary (Three balanced metric cards) */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
          Today’s Summary
        </h2>

        <div className="grid grid-cols-3 gap-2.5">
          {/* Metric 1: Earnings */}
          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5ECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[84px]">
            <span className="text-[11px] font-medium text-[#5C6E66]">Earnings</span>
            <div className="flex items-baseline gap-0.5">
              <span className="font-['Manrope'] text-[20px] font-bold text-[#27866F] leading-none tracking-tight">
                ₹{earningsData.todayTotal}
              </span>
            </div>
            <span className="text-[10px] text-[#5C6E66]">+₹{earningsData.todayTips} tips</span>
          </div>

          {/* Metric 2: Completed */}
          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5ECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[84px]">
            <span className="text-[11px] font-medium text-[#5C6E66]">Completed</span>
            <span className="font-['Manrope'] text-[20px] font-bold text-[#26352F] leading-none tracking-tight">
              {earningsData.completedDeliveriesToday}
            </span>
            <span className="text-[10px] text-[#5C6E66]">deliveries</span>
          </div>

          {/* Metric 3: Active */}
          <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5ECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between h-[84px]">
            <span className="text-[11px] font-medium text-[#5C6E66]">Active</span>
            <span className="font-['Manrope'] text-[20px] font-bold text-[#26352F] leading-none tracking-tight">
              {activeDeliveries.length}
            </span>
            <span className="text-[10px] text-[#5C6E66]">en route</span>
          </div>
        </div>
      </section>

      {/* 3. New Assignment Card */}
      <section className="space-y-2">
        <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
          New Assignment
        </h2>

        <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5ECE8] shadow-[0_2px_8px_rgba(39,134,111,0.06)] space-y-3.5">
          {/* Card Top: Assignment ID & Payout */}
          <div className="flex items-start justify-between">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-[#E7F5EF] text-[#27866F] text-[11px] font-bold">
                <span className="w-1.5 h-1.5 rounded-full bg-[#35A88A]" />
                Assignment {activeBatch.batchId}
              </div>
              <h3 className="font-['Manrope'] text-[17px] font-bold text-[#26352F] mt-1.5">
                {activeBatch.ordersCount} combined orders
              </h3>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold text-[#5C6E66] block">
                Expected Payout
              </span>
              <span className="font-['Manrope'] text-[24px] font-extrabold text-[#27866F] leading-tight">
                ₹{activeBatch.payout}
              </span>
            </div>
          </div>

          {/* Meta Details Grid */}
          <div className="grid grid-cols-3 gap-2 bg-[#F8FAF9] p-2.5 rounded-xl border border-[#E5ECE8]/60 text-center">
            <div>
              <span className="text-[10px] text-[#5C6E66] block">Distance</span>
              <span className="text-[12px] font-bold text-[#26352F] mt-0.5 block">
                {activeBatch.totalDistanceKm} km
              </span>
            </div>
            <div className="border-x border-[#E5ECE8]">
              <span className="text-[10px] text-[#5C6E66] block">Est. Time</span>
              <span className="text-[12px] font-bold text-[#26352F] mt-0.5 block">
                {activeBatch.estTimeMinutes} min
              </span>
            </div>
            <div>
              <span className="text-[10px] text-[#5C6E66] block">Deadline</span>
              <span className="text-[12px] font-bold text-[#26352F] mt-0.5 block">
                {activeBatch.deadline}
              </span>
            </div>
          </div>

          {/* Grouped Note */}
          <div className="flex items-center gap-2 px-2.5 py-1.5 bg-[#E7F5EF]/60 rounded-lg text-[#27866F] text-[12px]">
            <span className="material-symbols-outlined text-[16px] shrink-0">
              alt_route
            </span>
            <span className="font-medium truncate">
              Grouped to reduce unnecessary travel.
            </span>
          </div>

          {/* Primary Action Button */}
          <button
            type="button"
            onClick={() => onViewManifest(activeBatch.batchId)}
            className="w-full h-12 bg-[#27866F] hover:bg-[#1F6C59] active:scale-[0.99] text-white font-['Manrope'] text-[14px] font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer"
          >
            <span>View Delivery</span>
            <span className="material-symbols-outlined text-[18px]">
              arrow_forward
            </span>
          </button>
        </div>
      </section>

      {/* Live Operations Map Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
              Live GPS Operations Grid
            </h2>
            <span className="text-[10px] font-bold text-[#006954] bg-[#E7F5EF] px-1.5 py-0.5 rounded-full flex items-center gap-1">
              <span className="w-1.5 h-1.5 rounded-full bg-[#35A88A] animate-ping" />
              Live Telemetry
            </span>
          </div>
        </div>
        <LiveDeliveryMap
          activeDeliveries={activeDeliveries}
          onSelectOrder={onSelectDelivery}
          heightPx={220}
        />
      </section>

      {/* 4. Active Deliveries Section */}
      <section className="space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-1.5">
            <h2 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
              Active Deliveries
            </h2>
            <span className="text-[11px] font-bold text-[#27866F] bg-[#E7F5EF] px-1.5 py-0.2 rounded-full">
              {activeDeliveries.length}
            </span>
          </div>
          <button
            type="button"
            onClick={onViewAllDeliveries}
            className="text-[12px] font-semibold text-[#27866F] hover:underline flex items-center gap-0.5 cursor-pointer"
          >
            <span>View all</span>
            <span className="material-symbols-outlined text-[14px]">chevron_right</span>
          </button>
        </div>

        {/* Two compact delivery rows */}
        <div className="space-y-2">
          {activeDeliveries.slice(0, 2).map((delivery) => (
            <div
              key={delivery.id}
              onClick={() => onSelectDelivery(delivery)}
              className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E5ECE8] hover:border-[#35A88A]/50 active:bg-[#F8FAF9] transition-all cursor-pointer flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
            >
              <div className="min-w-0 pr-3 space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-[12px] font-bold text-[#26352F]">
                    #{delivery.id}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                      delivery.status === 'Out for Delivery'
                        ? 'bg-[#E7F5EF] text-[#27866F]'
                        : 'bg-[#F2F4F3] text-[#5C6E66]'
                    }`}
                  >
                    {delivery.status}
                  </span>
                </div>
                <p className="text-[13px] font-medium text-[#26352F] truncate">
                  {delivery.destinationName}
                </p>
                <p className="text-[11px] text-[#5C6E66] truncate">
                  {delivery.destinationAddress}
                </p>
              </div>

              <div className="flex items-center gap-1.5 shrink-0 text-[#27866F]">
                <span className="text-[11px] font-bold whitespace-nowrap">
                  {delivery.etaMinutes} min
                </span>
                <span className="material-symbols-outlined text-[18px] text-[#8A9B93]">
                  chevron_right
                </span>
              </div>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};
