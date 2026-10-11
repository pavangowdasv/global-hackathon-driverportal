import React, { useState } from 'react';
import { BatchAssignment, DeliveryOrder } from '../types/delivery';
import { LiveDeliveryMap } from './LiveDeliveryMap';

interface DeliveriesScreenProps {
  activeBatch: BatchAssignment;
  activeDeliveries: DeliveryOrder[];
  completedDeliveries: DeliveryOrder[];
  onSelectDelivery: (delivery: DeliveryOrder) => void;
  onOpenBatchManifest: () => void;
}

export const DeliveriesScreen: React.FC<DeliveriesScreenProps> = ({
  activeBatch,
  activeDeliveries,
  completedDeliveries,
  onSelectDelivery,
  onOpenBatchManifest,
}) => {
  const [filter, setFilter] = useState<'active' | 'all' | 'completed'>('active');
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [searchQuery, setSearchQuery] = useState('');

  const allOrders = [...activeDeliveries, ...completedDeliveries];
  const displayedOrders = (
    filter === 'active'
      ? activeDeliveries
      : filter === 'completed'
      ? completedDeliveries
      : allOrders
  ).filter((order) => {
    if (!searchQuery.trim()) return true;
    const q = searchQuery.toLowerCase();
    return (
      order.id.toLowerCase().includes(q) ||
      order.customerName.toLowerCase().includes(q) ||
      order.destinationName.toLowerCase().includes(q)
    );
  });

  return (
    <div className="flex flex-col w-full px-[20px] pt-4 pb-6 space-y-4">
      {/* Screen Title */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-['Manrope'] text-[22px] font-bold text-[#26352F] tracking-tight">
            Deliveries
          </h1>
          <p className="text-[12px] text-[#5C6E66]">
            Active routes & manifests
          </p>
        </div>
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-[#F8FAF9] border border-[#E5ECE8] rounded-lg p-0.5">
            <button
              type="button"
              onClick={() => setViewMode('list')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'list'
                  ? 'bg-[#FFFFFF] text-[#27866F] shadow-2xs'
                  : 'text-[#5C6E66]'
              }`}
            >
              List
            </button>
            <button
              type="button"
              onClick={() => setViewMode('map')}
              className={`px-2.5 py-1 rounded text-[11px] font-bold transition-all cursor-pointer ${
                viewMode === 'map'
                  ? 'bg-[#FFFFFF] text-[#27866F] shadow-2xs'
                  : 'text-[#5C6E66]'
              }`}
            >
              Live Map
            </button>
          </div>
          <button
            type="button"
            onClick={onOpenBatchManifest}
            className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg bg-[#27866F] text-white text-[12px] font-bold hover:bg-[#1F6C59] transition-all cursor-pointer"
          >
            <span className="material-symbols-outlined text-[16px]">alt_route</span>
            <span>VY1024</span>
          </button>
        </div>
      </div>

      {viewMode === 'map' && (
        <LiveDeliveryMap
          activeDeliveries={activeDeliveries}
          onSelectOrder={onSelectDelivery}
          heightPx={380}
        />
      )}

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 p-1 bg-[#F8FAF9] rounded-xl border border-[#E5ECE8]">
        <button
          type="button"
          onClick={() => setFilter('active')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
            filter === 'active'
              ? 'bg-[#FFFFFF] text-[#27866F] shadow-xs'
              : 'text-[#5C6E66]'
          }`}
        >
          Active ({activeDeliveries.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('all')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
            filter === 'all'
              ? 'bg-[#FFFFFF] text-[#27866F] shadow-xs'
              : 'text-[#5C6E66]'
          }`}
        >
          All ({allOrders.length})
        </button>
        <button
          type="button"
          onClick={() => setFilter('completed')}
          className={`flex-1 py-1.5 px-2 rounded-lg text-[12px] font-bold transition-all cursor-pointer ${
            filter === 'completed'
              ? 'bg-[#FFFFFF] text-[#27866F] shadow-xs'
              : 'text-[#5C6E66]'
          }`}
        >
          Done ({completedDeliveries.length})
        </button>
      </div>

      {/* Search Input */}
      <div className="relative">
        <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#8A9B93]">
          search
        </span>
        <input
          type="text"
          placeholder="Search by order ID or street..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full h-10 pl-9 pr-3 bg-[#FFFFFF] rounded-xl border border-[#E5ECE8] text-[12px] text-[#26352F] placeholder-[#8A9B93] focus:outline-none focus:border-[#27866F]"
        />
      </div>

      {/* Deliveries List */}
      <div className="space-y-2">
        {displayedOrders.length === 0 ? (
          <div className="p-8 text-center text-[#5C6E66] text-[13px] bg-[#F8FAF9] rounded-xl border border-[#E5ECE8]">
            No orders found
          </div>
        ) : (
          displayedOrders.map((order) => {
            const isDelivered = order.status === 'Delivered';
            return (
              <div
                key={order.id}
                onClick={() => onSelectDelivery(order)}
                className="bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E5ECE8] hover:border-[#35A88A] active:bg-[#F8FAF9] transition-all cursor-pointer flex items-center justify-between shadow-[0_1px_3px_rgba(0,0,0,0.02)]"
              >
                <div className="min-w-0 pr-2 space-y-1">
                  <div className="flex items-center gap-1.5">
                    <span className="text-[12px] font-bold text-[#26352F]">
                      #{order.id}
                    </span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.2 rounded-full ${
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
                  <p className="text-[13px] font-medium text-[#26352F] truncate">
                    {order.destinationName}
                  </p>
                  <p className="text-[11px] text-[#5C6E66] truncate">
                    {order.destinationAddress}
                  </p>
                </div>

                <div className="text-right shrink-0">
                  <span className="font-['Manrope'] text-[14px] font-bold text-[#27866F] block">
                    ₹{order.payout}
                  </span>
                  <span className="text-[11px] text-[#5C6E66]">
                    {isDelivered ? 'Done' : `${order.etaMinutes} min`}
                  </span>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
};
