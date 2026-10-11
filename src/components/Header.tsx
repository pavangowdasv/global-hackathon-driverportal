import React from 'react';

interface HeaderProps {
  unreadCount?: number;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenDispatchHelp?: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  unreadCount = 2,
  onOpenNotifications,
  onOpenProfile,
  onOpenDispatchHelp,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-[#FFFFFF] border-b border-[#E5ECE8] pt-safe">
      <div className="h-14 px-[20px] flex items-center justify-between">
        {/* Left: Verya Logo + Wordmark vertically centered */}
        <div className="flex items-center gap-2">
          <img
            alt="Verya Logo"
            className="h-7 w-auto object-contain"
            src="https://lh3.googleusercontent.com/aida/AEtjO1UrFD4VflPxCNij5Z2YSuFZqm0fX8z2fIOqQ_W9xcZdKiwvFnZB6nH-HBy6-r5UfUdVSn3tsZcInZTxfTlmkI7ycLmH26FKkp5ZuG5keZPSKQO3GRrk1nrKpx6CEVyaT-zM4SkZZFgSy3SdEhVOY79mkp890fo7c3ltW-qMtwVli8vnuqLGg6T773bbzZNdblrB-AiBRW-_VC-M0LaOjfEl3LPq6WC5i5NRu23bsaNP8jWH-Is3fpjxVBTs"
            referrerPolicy="no-referrer"
          />
          <span className="font-['Manrope'] text-[20px] font-bold tracking-tight text-[#26352F]">
            Verya
          </span>
        </div>

        {/* Right: AI Dispatch + Notifications + Profile avatar */}
        <div className="flex items-center gap-2">
          {onOpenDispatchHelp && (
            <button
              type="button"
              onClick={onOpenDispatchHelp}
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#E7F5EF] hover:bg-[#D5EFE3] text-[#27866F] text-[11px] font-bold border border-[#35A88A]/30 transition-all cursor-pointer shadow-2xs active:scale-95"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-[#35A88A] animate-pulse" />
              <span className="material-symbols-outlined text-[14px]">smart_toy</span>
              <span>AI Dispatch</span>
            </button>
          )}

          <button
            type="button"
            aria-label="Notifications"
            onClick={onOpenNotifications}
            className="w-9 h-9 flex items-center justify-center relative rounded-full text-[#26352F] hover:bg-[#E7F5EF] active:bg-[#E5ECE8] transition-colors cursor-pointer"
          >
            <span className="material-symbols-outlined text-[22px]">notifications</span>
            {unreadCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#ba1a1a]" />
            )}
          </button>

          <button
            type="button"
            aria-label="Rahul Profile"
            onClick={onOpenProfile}
            className="w-9 h-9 flex items-center justify-center rounded-full hover:opacity-90 transition-opacity cursor-pointer focus:outline-none"
          >
            <img
              alt="Rahul"
              className="w-8 h-8 rounded-full object-cover ring-2 ring-[#35A88A]/40"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuCWSM5YlTqmi0hLsQyGt0LajmOPI7DhjSn7Qjz14UMSat82i6zbFMaDmJC-TJQtVHIEzdCOe2zujYNsWVvezDbtP8qlxL-AQXs1XYWwZrjNPGOkk1ewK7N1Hw5J7U16Nsh8oX5YJudu7UL8ZfH-gm9CH__AWiBVgdUswXDzbhB_Xn_22PyZa0Y3diJhm3qjOOQOtj_6mfS8Vc887f7s5vuykGonxitieO35ATOb9uRuJajuiRW4VqB31Q"
              referrerPolicy="no-referrer"
            />
          </button>
        </div>
      </div>
    </header>
  );
};
