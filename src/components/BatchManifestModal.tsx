import React from 'react';
import { BatchAssignment, DeliveryOrder } from '../types/delivery';

interface BatchManifestModalProps {
  batch: BatchAssignment;
  onClose: () => void;
  onSelectOrder: (order: DeliveryOrder) => void;
  onAcceptBatch: () => void;
  isAccepted: boolean;
}

export const BatchManifestModal: React.FC<BatchManifestModalProps> = ({
  batch,
  onClose,
  onSelectOrder,
  onAcceptBatch,
  isAccepted,
}) => {
  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[390px] bg-[#FFFFFF] rounded-t-3xl flex flex-col overflow-hidden shadow-2xl border-t border-[#E5ECE8] animate-in slide-in-from-bottom duration-200"
        style={{ height: '85dvh', maxHeight: '90dvh' }}
      >
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 bg-[#E5ECE8] rounded-full" />
        </div>

        <div className="px-5 py-3 border-b border-[#E5ECE8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-['Manrope'] text-[17px] font-bold text-[#26352F]">
              Assignment {batch.batchId}
            </span>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F5EF] text-[#27866F]">
              {batch.ordersCount} Combined
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C6E66] hover:bg-[#F2F4F3] cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="p-5 overflow-y-auto space-y-3.5 flex-1 min-h-0">
          <div className="p-3.5 bg-[#F8FAF9] rounded-2xl border border-[#E5ECE8] flex items-center justify-between">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#5C6E66] block">
                Total Payout
              </span>
              <span className="font-['Manrope'] text-[24px] font-extrabold text-[#27866F]">
                ₹{batch.payout}
              </span>
            </div>
            <div className="text-right text-[11px] text-[#5C6E66]">
              <span className="block font-semibold text-[#26352F]">
                {batch.totalDistanceKm} km · {batch.estTimeMinutes} min
              </span>
              <span>Deadline {batch.deadline}</span>
            </div>
          </div>

          {/* Grouped note */}
          <div className="flex items-center gap-2 px-3 py-2 bg-[#E7F5EF]/60 rounded-xl text-[#27866F] text-[12px]">
            <span className="material-symbols-outlined text-[16px] shrink-0">
              alt_route
            </span>
            <span className="font-medium">Grouped to reduce unnecessary travel.</span>
          </div>

          <div className="space-y-2">
            <h4 className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
              Stops List
            </h4>

            {batch.orders.map((order, idx) => (
              <div
                key={order.id}
                onClick={() => onSelectOrder(order)}
                className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5ECE8] hover:border-[#35A88A] active:bg-[#F8FAF9] transition-all cursor-pointer flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <div className="flex items-center gap-2.5 min-w-0 pr-2">
                  <span className="w-6 h-6 rounded-full bg-[#E7F5EF] text-[#27866F] text-[11px] font-bold flex items-center justify-center shrink-0">
                    {idx + 1}
                  </span>
                  <div className="min-w-0">
                    <p className="text-[13px] font-semibold text-[#26352F] truncate">
                      {order.destinationName}
                    </p>
                    <p className="text-[11px] text-[#5C6E66] truncate">
                      #{order.id} · {order.distanceKm} km
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  <span className="text-[12px] font-bold text-[#27866F]">
                    ₹{order.payout}
                  </span>
                  <span className="material-symbols-outlined text-[16px] text-[#8A9B93]">
                    chevron_right
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="p-4 bg-[#FFFFFF] border-t border-[#E5ECE8] shrink-0">
          <button
            type="button"
            onClick={onAcceptBatch}
            className={`w-full h-12 rounded-xl text-[14px] font-['Manrope'] font-bold flex items-center justify-center gap-1.5 shadow-sm transition-all cursor-pointer ${
              isAccepted
                ? 'bg-[#E7F5EF] text-[#27866F]'
                : 'bg-[#27866F] hover:bg-[#1F6C59] text-white active:scale-[0.99]'
            }`}
          >
            <span className="material-symbols-outlined text-[18px]">
              {isAccepted ? 'check' : 'local_shipping'}
            </span>
            <span>{isAccepted ? 'Assignment In Progress' : 'Accept Assignment'}</span>
          </button>
        </div>
      </div>
    </div>
  );
};
