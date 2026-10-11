import React from 'react';

export type TabType = 'dashboard' | 'deliveries' | 'earnings' | 'profile';

interface BottomNavProps {
  currentTab: TabType;
  onTabChange: (tab: TabType) => void;
  activeDeliveriesCount?: number;
}

export const BottomNav: React.FC<BottomNavProps> = ({
  currentTab,
  onTabChange,
  activeDeliveriesCount = 0,
}) => {
  const tabs: { id: TabType; label: string; icon: string; badge?: number }[] = [
    { id: 'dashboard', label: 'Home', icon: 'home' },
    { id: 'deliveries', label: 'Deliveries', icon: 'local_shipping', badge: activeDeliveriesCount },
    { id: 'earnings', label: 'Earnings', icon: 'payments' },
    { id: 'profile', label: 'Profile', icon: 'person' },
  ];

  return (
    /* sticky bottom inside the phone container — NOT fixed to the viewport */
    <nav
      className="w-full bg-[#FFFFFF] border-t border-[#E5ECE8] shadow-[0_-2px_12px_rgba(0,0,0,0.05)]"
      style={{ position: 'sticky', bottom: 0, zIndex: 40 }}
    >
      <div className="h-16 grid grid-cols-4 items-center px-1">
        {tabs.map((tab) => {
          const isActive = currentTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex flex-col items-center justify-center h-full min-h-[48px] py-1.5 gap-0.5 transition-colors cursor-pointer relative select-none ${
                isActive ? 'text-[#27866F]' : 'text-[#8A9B93] hover:text-[#26352F]'
              }`}
              aria-current={isActive ? 'page' : undefined}
            >
              {/* Active indicator pill */}
              {isActive && (
                <span className="absolute top-0 left-1/2 -translate-x-1/2 w-6 h-0.5 bg-[#35A88A] rounded-full" />
              )}

              <div className="relative flex items-center justify-center">
                <span
                  className={`material-symbols-outlined transition-all ${
                    isActive ? 'text-[24px]' : 'text-[22px]'
                  }`}
                  style={{ fontVariationSettings: isActive ? "'FILL' 1" : "'FILL' 0" }}
                >
                  {tab.icon}
                </span>
                {tab.badge && tab.badge > 0 && !isActive && (
                  <span className="absolute -top-1 -right-2.5 min-w-[16px] h-4 px-1 rounded-full bg-[#27866F] text-white text-[10px] font-bold flex items-center justify-center leading-none">
                    {tab.badge}
                  </span>
                )}
              </div>

              <span
                className={`text-[10px] tracking-tight leading-none ${
                  isActive ? 'font-bold' : 'font-medium'
                }`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>
    </nav>
  );
};
