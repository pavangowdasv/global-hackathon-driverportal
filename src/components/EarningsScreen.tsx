import React, { useState } from 'react';
import { EarningsData } from '../types/delivery';

interface EarningsScreenProps {
  earningsData: EarningsData;
  onInstantCashout: (amount: number) => void;
}

export const EarningsScreen: React.FC<EarningsScreenProps> = ({
  earningsData,
  onInstantCashout,
}) => {
  const [cashoutDone, setCashoutDone] = useState(false);

  const handleCashout = () => {
    if (earningsData.todayTotal <= 0) return;
    onInstantCashout(earningsData.todayTotal);
    setCashoutDone(true);
    setTimeout(() => setCashoutDone(false), 2500);
  };

  return (
    <div className="flex flex-col w-full px-[20px] pt-4 pb-6 space-y-4">
      {/* Title */}
      <div>
        <h1 className="font-['Manrope'] text-[22px] font-bold text-[#26352F] tracking-tight">
          Earnings
        </h1>
        <p className="text-[12px] text-[#5C6E66]">
          Daily payout & balance
        </p>
      </div>

      {/* Hero Earnings Card */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5ECE8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] space-y-3">
        <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
          Today’s Total Balance
        </span>
        <div className="flex items-baseline gap-1">
          <span className="font-['Manrope'] text-[28px] font-extrabold text-[#27866F]">
            ₹{earningsData.todayTotal}
          </span>
          <span className="text-[12px] text-[#5C6E66]">
            (+₹{earningsData.todayTips} tips)
          </span>
        </div>

        {/* Breakdown */}
        <div className="grid grid-cols-2 gap-2 pt-2 border-t border-[#E5ECE8] text-[12px]">
          <div>
            <span className="text-[#5C6E66] block">Base Pay</span>
            <span className="font-bold text-[#26352F]">₹{earningsData.todayBase}</span>
          </div>
          <div>
            <span className="text-[#5C6E66] block">Tips & Incentives</span>
            <span className="font-bold text-[#27866F]">₹{earningsData.todayTips + earningsData.todaySurge}</span>
          </div>
        </div>

        {/* Cashout Button */}
        <button
          type="button"
          onClick={handleCashout}
          disabled={earningsData.todayTotal <= 0}
          className={`w-full h-11 rounded-xl text-[13px] font-['Manrope'] font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
            cashoutDone
              ? 'bg-[#E7F5EF] text-[#27866F]'
              : 'bg-[#27866F] hover:bg-[#1F6C59] text-white active:scale-[0.99]'
          }`}
        >
          <span className="material-symbols-outlined text-[18px]">
            {cashoutDone ? 'check' : 'account_balance'}
          </span>
          <span>{cashoutDone ? 'Transferred to Bank' : 'Withdraw to Bank'}</span>
        </button>
      </div>

      {/* Week overview */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5ECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[11px] font-bold uppercase tracking-wider text-[#5C6E66]">
            This Week
          </span>
          <span className="font-['Manrope'] text-[15px] font-bold text-[#26352F]">
            ₹{earningsData.weekTotal}
          </span>
        </div>

        {/* Day pills */}
        <div className="grid grid-cols-7 gap-1 pt-2">
          {earningsData.dailyHistory.map((d) => (
            <div key={d.day} className="text-center p-1.5 bg-[#F8FAF9] rounded-lg border border-[#E5ECE8]">
              <span className="text-[10px] text-[#5C6E66] block">{d.day}</span>
              <span className="text-[11px] font-bold text-[#26352F] block mt-0.5">₹{d.earnings}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
