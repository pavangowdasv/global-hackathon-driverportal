import React from 'react';
import { NotificationItem } from '../types/delivery';

interface NotificationsModalProps {
  notifications: NotificationItem[];
  onClose: () => void;
  onMarkAllRead: () => void;
}

export const NotificationsModal: React.FC<NotificationsModalProps> = ({
  notifications,
  onClose,
  onMarkAllRead,
}) => {
  return (
    <div className="fixed inset-0 z-[1000] flex items-end justify-center bg-black/60 backdrop-blur-xs transition-opacity">
      <div className="w-full max-w-[390px] bg-[#FFFFFF] rounded-t-3xl max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border-t border-[#E5ECE8] animate-in slide-in-from-bottom duration-200">
        <div className="pt-3 pb-1 flex justify-center">
          <div className="w-10 h-1 bg-[#E5ECE8] rounded-full" />
        </div>

        <div className="px-5 py-3 border-b border-[#E5ECE8] flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-[#27866F]">
              notifications
            </span>
            <span className="font-['Manrope'] text-[17px] font-bold text-[#26352F]">
              Notifications
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

        <div className="p-4 overflow-y-auto space-y-2 flex-1">
          {notifications.map((item) => (
            <div
              key={item.id}
              className={`p-3 rounded-xl border transition-all ${
                item.read
                  ? 'bg-[#FFFFFF] border-[#E5ECE8]'
                  : 'bg-[#E7F5EF]/50 border-[#35A88A]/30'
              }`}
            >
              <div className="flex items-start justify-between gap-2">
                <div>
                  <h4 className="text-[13px] font-bold text-[#26352F]">
                    {item.title}
                  </h4>
                  <p className="text-[12px] text-[#5C6E66] mt-0.5 leading-snug">
                    {item.message}
                  </p>
                </div>
                <span className="text-[10px] text-[#8A9B93] font-medium whitespace-nowrap">
                  {item.time}
                </span>
              </div>
            </div>
          ))}
        </div>

        <div className="p-4 bg-[#FFFFFF] border-t border-[#E5ECE8] flex items-center justify-between">
          <button
            type="button"
            onClick={onMarkAllRead}
            className="text-[12px] font-bold text-[#27866F] hover:underline cursor-pointer"
          >
            Mark all read
          </button>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 bg-[#27866F] text-white rounded-xl text-[12px] font-bold cursor-pointer hover:bg-[#1F6C59]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
