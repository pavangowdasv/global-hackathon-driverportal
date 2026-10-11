import React from 'react';
import { PartnerProfile } from '../types/delivery';

interface ProfileScreenProps {
  profile: PartnerProfile;
  isOnline: boolean;
  onToggleOnline: () => void;
  onEmergencySOS: () => void;
}

export const ProfileScreen: React.FC<ProfileScreenProps> = ({
  profile,
  isOnline,
  onToggleOnline,
  onEmergencySOS,
}) => {
  return (
    <div className="flex flex-col w-full px-[20px] pt-4 pb-6 space-y-4">
      {/* Profile Header */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5ECE8] shadow-[0_2px_8px_rgba(0,0,0,0.02)] flex items-center gap-3.5">
        <img
          alt={profile.name}
          src={profile.avatarUrl}
          referrerPolicy="no-referrer"
          className="w-14 h-14 rounded-full object-cover ring-2 ring-[#35A88A]/30"
        />
        <div className="min-w-0 flex-1">
          <div className="flex items-center justify-between">
            <h2 className="font-['Manrope'] text-[17px] font-bold text-[#26352F]">
              {profile.name} Sharma
            </h2>
            <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-[#E7F5EF] text-[#27866F]">
              Active Partner
            </span>
          </div>
          <p className="text-[11px] text-[#5C6E66] mt-0.5">
            ID: {profile.id} · Indiranagar Hub
          </p>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-2">
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5ECE8] text-center">
          <span className="text-[10px] text-[#5C6E66] block">Rating</span>
          <span className="font-['Manrope'] text-[16px] font-bold text-[#27866F] mt-0.5 block">
            {profile.rating} ★
          </span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5ECE8] text-center">
          <span className="text-[10px] text-[#5C6E66] block">Trips</span>
          <span className="font-['Manrope'] text-[16px] font-bold text-[#26352F] mt-0.5 block">
            {profile.totalDeliveries}
          </span>
        </div>
        <div className="bg-[#FFFFFF] p-3 rounded-xl border border-[#E5ECE8] text-center">
          <span className="text-[10px] text-[#5C6E66] block">On-Time</span>
          <span className="font-['Manrope'] text-[16px] font-bold text-[#27866F] mt-0.5 block">
            {profile.onTimeRate}%
          </span>
        </div>
      </div>

      {/* Vehicle Info */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5ECE8] shadow-[0_1px_3px_rgba(0,0,0,0.02)] space-y-2">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[18px] text-[#27866F]">
              two_wheeler
            </span>
            <span className="text-[13px] font-bold text-[#26352F]">
              {profile.vehicle.model}
            </span>
          </div>
          <span className="text-[11px] font-mono text-[#5C6E66]">
            {profile.vehicle.plateNumber}
          </span>
        </div>
        <p className="text-[12px] text-[#5C6E66]">
          Battery: {profile.vehicle.batteryPercent}% · Est. {profile.vehicle.estimatedRangeKm} km range
        </p>
      </div>

      {/* Online / Offline Shift Duty */}
      <div className="bg-[#FFFFFF] rounded-2xl p-4 border border-[#E5ECE8] flex items-center justify-between">
        <div>
          <span className="text-[13px] font-bold text-[#26352F] block">
            Duty Status
          </span>
          <span className="text-[11px] text-[#5C6E66]">
            {isOnline ? 'Currently receiving orders' : 'Shift currently paused'}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleOnline}
          className={`px-3 py-1.5 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
            isOnline
              ? 'bg-[#E7F5EF] text-[#27866F]'
              : 'bg-[#F2F4F3] text-[#5C6E66]'
          }`}
        >
          {isOnline ? 'Go Offline' : 'Go Online'}
        </button>
      </div>

      {/* SOS Button */}
      <button
        type="button"
        onClick={onEmergencySOS}
        className="w-full h-11 rounded-xl bg-[#F8FAF9] border border-[#E5ECE8] text-[#ba1a1a] text-[13px] font-bold flex items-center justify-center gap-2 hover:bg-[#ffdad6]/30 transition-all cursor-pointer"
      >
        <span className="material-symbols-outlined text-[18px]">sos</span>
        <span>Emergency SOS Dispatch</span>
      </button>
    </div>
  );
};
