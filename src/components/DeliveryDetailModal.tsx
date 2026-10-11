import React, { useState } from 'react';
import { DeliveryOrder } from '../types/delivery';
import { SwipeToConfirm } from './SwipeToConfirm';
import { LiveDeliveryMap } from './LiveDeliveryMap';
import { generateCustomerUpdateMessage } from '../services/geminiService';

interface DeliveryDetailModalProps {
  order: DeliveryOrder | null;
  onClose: () => void;
  onConfirmDelivery: (orderId: string) => void;
}

export const DeliveryDetailModal: React.FC<DeliveryDetailModalProps> = ({
  order,
  onClose,
  onConfirmDelivery,
}) => {
  if (!order) return null;

  const [otpValue, setOtpValue] = useState('');
  const [navigating, setNavigating] = useState(false);
  const [aiMessage, setAiMessage] = useState<string | null>(null);
  const [generatingAiMsg, setGeneratingAiMsg] = useState(false);
  const isDelivered = order.status === 'Delivered';

  const handleStartNav = () => {
    setNavigating(true);
    const dest = order.lat && order.lng ? `${order.lat},${order.lng}` : encodeURIComponent(order.destinationAddress);
    const url = `https://www.google.com/maps/dir/?api=1&destination=${dest}&travelmode=driving`;
    window.open(url, '_blank');
    setTimeout(() => setNavigating(false), 1200);
  };

  const handleCall = () => {
    window.location.href = `tel:${order.customerPhone}`;
  };

  const handleGenerateAiMessage = async () => {
    setGeneratingAiMsg(true);
    try {
      const msg = await generateCustomerUpdateMessage(order);
      setAiMessage(msg);
    } catch (e) {
      console.error(e);
    } finally {
      setGeneratingAiMsg(false);
    }
  };

  const handleSwipeComplete = () => {
    onConfirmDelivery(order.id);
  };

  return (
    <div
      className="fixed inset-0 z-[1000] flex items-end justify-center animate-in fade-in duration-200"
      style={{ background: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(4px)' }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        className="w-full max-w-[390px] bg-[#FFFFFF] rounded-t-[28px] flex flex-col shadow-2xl border-t border-[#E5ECE8] animate-in slide-in-from-bottom duration-250 overflow-hidden"
        style={{ height: '88dvh', maxHeight: '92dvh' }}
      >
        {/* Grab Handle */}
        <div className="pt-3 pb-1 flex justify-center shrink-0">
          <div className="w-10 h-1 bg-[#E5ECE8] rounded-full" />
        </div>

        {/* Modal Header */}
        <div className="px-5 py-3 border-b border-[#E5ECE8] flex items-center justify-between shrink-0">
          <div className="flex items-center gap-2">
            <span className="font-['Manrope'] text-[17px] font-bold text-[#26352F]">
              #{order.id}
            </span>
            <span
              className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                isDelivered
                  ? 'bg-[#E7F5EF] text-[#27866F]'
                  : order.status === 'Out for Delivery'
                  ? 'bg-[#E7F5EF] text-[#27866F]'
                  : 'bg-[#F2F4F3] text-[#5C6E66]'
              }`}
            >
              {order.status}
            </span>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-[#5C6E66] hover:bg-[#F2F4F3] cursor-pointer transition-colors"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Scrollable Content Body */}
        <div className="p-4 overflow-y-auto space-y-3 flex-1 min-h-0">
          {/* Live Mini Map without duplicate floating turn-by-turn button */}
          <LiveDeliveryMap
            activeDeliveries={[order]}
            selectedOrder={order}
            heightPx={180}
            showTurnByTurn={false}
          />

          {/* Destination & Navigation Bar */}
          <div className="p-3.5 bg-[#F8FAF9] rounded-2xl border border-[#E5ECE8]">
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-start gap-2">
                <span className="material-symbols-outlined text-[20px] text-[#27866F] mt-0.5 shrink-0">
                  location_on
                </span>
                <div>
                  <h3 className="font-['Manrope'] text-[14px] font-bold text-[#26352F]">
                    {order.destinationName}
                  </h3>
                  <p className="text-[11px] text-[#5C6E66] mt-0.5">
                    {order.destinationAddress}
                  </p>
                </div>
              </div>

              <div className="text-right shrink-0">
                <span className="font-['Manrope'] text-[15px] font-bold text-[#27866F]">
                  {order.etaMinutes > 0 ? `${order.etaMinutes} min` : 'Arrived'}
                </span>
                <span className="text-[11px] text-[#5C6E66] block">
                  {order.distanceKm} km
                </span>
              </div>
            </div>

            {/* Quick Action Buttons */}
            <div className="mt-3 grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={handleStartNav}
                className="h-10 px-3 rounded-xl bg-[#27866F] text-white text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#1F6C59] active:scale-95 transition-all cursor-pointer shadow-xs"
              >
                <span className="material-symbols-outlined text-[16px]">navigation</span>
                <span>{navigating ? 'Opening Maps...' : 'Google Maps Turn-by-Turn'}</span>
              </button>

              <button
                type="button"
                onClick={handleCall}
                className="h-10 px-3 rounded-xl bg-[#FFFFFF] border border-[#E5ECE8] text-[#26352F] text-[12px] font-bold flex items-center justify-center gap-1.5 hover:bg-[#F2F4F3] active:scale-95 transition-all cursor-pointer min-w-0 overflow-hidden"
              >
                <span className="material-symbols-outlined text-[16px] text-[#27866F] shrink-0">call</span>
                <span className="truncate">Call {order.customerPhone}</span>
              </button>
            </div>
          </div>

          {/* AI Customer Message Generator */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5ECE8] space-y-2 text-[12px]">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1 text-[#27866F] font-bold">
                <span className="material-symbols-outlined text-[16px]">smart_toy</span>
                <span>AI Customer ETA Update</span>
              </div>
              <button
                type="button"
                onClick={handleGenerateAiMessage}
                disabled={generatingAiMsg}
                className="text-[11px] font-bold text-[#27866F] hover:underline cursor-pointer disabled:opacity-50"
              >
                {generatingAiMsg ? 'Drafting...' : 'Generate with Gemini'}
              </button>
            </div>

            {aiMessage && (
              <div className="p-2.5 bg-[#F0F9F5] rounded-lg border border-[#D1EDE1] text-[11px] text-[#26352F] space-y-1.5 animate-in fade-in">
                <p className="italic">"{aiMessage}"</p>
                <button
                  type="button"
                  onClick={() => {
                    const url = `https://wa.me/${order.customerPhone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(aiMessage)}`;
                    window.open(url, '_blank');
                  }}
                  className="bg-[#25D366] text-white px-2.5 py-1 rounded-md text-[10px] font-bold flex items-center gap-1 cursor-pointer w-fit"
                >
                  <span>Send via WhatsApp</span>
                </button>
              </div>
            )}
          </div>

          {/* Recipient Details & Notes */}
          <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5ECE8] space-y-1.5 text-[12px]">
            <div className="flex items-center justify-between">
              <span className="font-medium text-[#5C6E66]">Recipient</span>
              <span className="font-bold text-[#26352F]">{order.customerName}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5C6E66]">Package</span>
              <span className="text-[#26352F] font-medium">{order.packageType}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-[#5C6E66]">Time Window</span>
              <span className="text-[#26352F]">{order.timeWindow}</span>
            </div>
            {order.notes && (
              <div className="mt-1.5 p-2 bg-[#F8FAF9] rounded-lg border border-[#E5ECE8] text-[11px] text-[#5C6E66]">
                Note: {order.notes}
              </div>
            )}
          </div>

          {/* OTP Code */}
          {!isDelivered && (
            <div className="p-3 bg-[#FFFFFF] rounded-xl border border-[#E5ECE8] space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
                  Customer Delivery OTP
                </span>
                <button
                  type="button"
                  onClick={() => setOtpValue(order.deliveryOtp)}
                  className="text-[11px] font-bold text-[#27866F] hover:underline cursor-pointer"
                >
                  Auto-fill demo code ({order.deliveryOtp})
                </button>
              </div>

              <input
                type="text"
                maxLength={4}
                placeholder="Enter 4-digit OTP"
                value={otpValue}
                onChange={(e) => setOtpValue(e.target.value)}
                className="w-full h-10 px-3 text-center tracking-widest font-mono text-[16px] font-bold bg-[#F8FAF9] border border-[#E5ECE8] rounded-xl focus:border-[#27866F] focus:outline-none"
              />
            </div>
          )}
        </div>

        {/* Bottom Swipe Slider */}
        <div className="p-4 bg-[#FFFFFF] border-t border-[#E5ECE8] shrink-0">
          {isDelivered ? (
            <div className="h-14 bg-[#E7F5EF] text-[#27866F] rounded-2xl flex items-center justify-center text-[13px] font-bold gap-1.5">
              <span className="material-symbols-outlined text-[20px]">check_circle</span>
              <span>Delivery Completed</span>
            </div>
          ) : (
            <SwipeToConfirm
              onConfirm={handleSwipeComplete}
              label="Swipe to Complete Delivery"
              confirmedLabel="Delivery Confirmed!"
            />
          )}
        </div>
      </div>
    </div>
  );
};
