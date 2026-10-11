/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { Header } from './components/Header';
import { BottomNav, TabType } from './components/BottomNav';
import { DashboardScreen } from './components/DashboardScreen';
import { DeliveriesScreen } from './components/DeliveriesScreen';
import { EarningsScreen } from './components/EarningsScreen';
import { ProfileScreen } from './components/ProfileScreen';
import { DeliveryDetailModal } from './components/DeliveryDetailModal';
import { BatchManifestModal } from './components/BatchManifestModal';
import { NotificationsModal } from './components/NotificationsModal';
import { DispatchHelpModal } from './components/DispatchHelpModal';
import {
  initialActiveDeliveries,
  initialBatchAssignment,
  initialCompletedDeliveries,
  initialEarningsData,
  initialNotifications,
  initialProfile,
} from './data/mockData';
import {
  fetchActiveDeliveries,
  fetchCompletedDeliveries,
  fetchLatestBatch,
  fetchRiderProfile,
  fetchEarningsData,
  fetchNotifications,
  markDeliveryComplete,
} from './services/supabaseService';
import { DeliveryOrder } from './types/delivery';

export default function App() {
  const [currentTab, setCurrentTab] = useState<TabType>('dashboard');
  const [isOnline, setIsOnline] = useState(true);
  const [loading, setLoading] = useState(true);

  // Data state — initialised with mock data immediately so UI shows instantly
  const [profile, setProfile] = useState(initialProfile);
  const [activeBatch, setActiveBatch] = useState(initialBatchAssignment);
  const [isBatchAccepted, setIsBatchAccepted] = useState(false);
  const [activeDeliveries, setActiveDeliveries] = useState(initialActiveDeliveries);
  const [completedDeliveries, setCompletedDeliveries] = useState(initialCompletedDeliveries);
  const [earningsData, setEarningsData] = useState(initialEarningsData);
  const [notifications, setNotifications] = useState(initialNotifications);

  // Modal state
  const [selectedOrder, setSelectedOrder] = useState<DeliveryOrder | null>(null);
  const [batchManifestOpen, setBatchManifestOpen] = useState(false);
  const [notificationsOpen, setNotificationsOpen] = useState(false);
  const [dispatchHelpOpen, setDispatchHelpOpen] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // ── Load from Supabase on mount ──────────────────────────────────────────
  useEffect(() => {
    let mounted = true;
    const load = async () => {
      try {
        const [deliveries, completed, batch, riderProfile, earnings, notifs] =
          await Promise.all([
            fetchActiveDeliveries(),
            fetchCompletedDeliveries(),
            fetchLatestBatch(),
            fetchRiderProfile(),
            fetchEarningsData(),
            fetchNotifications(),
          ]);
        if (!mounted) return;
        setActiveDeliveries(deliveries);
        setCompletedDeliveries(completed);
        setActiveBatch(batch);
        setProfile(riderProfile);
        setEarningsData(earnings);
        setNotifications(notifs);
      } catch (err) {
        console.error('[App] Data load error:', err);
        // Fallback data already set as initial state — nothing more to do.
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => { mounted = false; };
  }, []);

  // ── Helpers ───────────────────────────────────────────────────────────────
  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => {
      setToastMessage((prev) => (prev === msg ? null : prev));
    }, 2800);
  };

  const handleToggleOnline = () => {
    setIsOnline((prev) => {
      const next = !prev;
      showToast(next ? 'Status: Online' : 'Status: Offline');
      return next;
    });
  };

  const handleSelectDelivery = (delivery: DeliveryOrder) => {
    setSelectedOrder(delivery);
  };

  const handleConfirmDelivery = async (orderId: string) => {
    const orderToComplete =
      activeDeliveries.find((o) => o.id === orderId) ||
      activeBatch.orders.find((o) => o.id === orderId);
    if (!orderToComplete) return;

    // Optimistic UI update
    setActiveDeliveries((prev) => prev.filter((o) => o.id !== orderId));
    const completedOrder: DeliveryOrder = { ...orderToComplete, status: 'Delivered', etaMinutes: 0 };
    setCompletedDeliveries((prev) => [completedOrder, ...prev]);
    setEarningsData((prev) => ({
      ...prev,
      todayTotal: prev.todayTotal + orderToComplete.payout,
      todayBase: prev.todayBase + orderToComplete.payout,
      completedDeliveriesToday: prev.completedDeliveriesToday + 1,
      pendingDeliveriesToday: Math.max(0, prev.pendingDeliveriesToday - 1),
    }));
    setProfile((prev) => ({ ...prev, totalDeliveries: prev.totalDeliveries + 1 }));
    setSelectedOrder(null);
    showToast(`Delivered #${orderId}! +₹${orderToComplete.payout}`);

    // Persist to Supabase (fire-and-forget)
    await markDeliveryComplete(orderId);
  };

  const handleAcceptBatch = () => {
    setIsBatchAccepted(true);
    setActiveDeliveries((prev) => {
      const existingIds = new Set(prev.map((d) => d.id));
      const additions = activeBatch.orders.filter((o) => !existingIds.has(o.id));
      return [...prev, ...additions];
    });
    setBatchManifestOpen(false);
    showToast(`Assignment ${activeBatch.batchId} accepted`);
  };

  const handleInstantCashout = (amount: number) => {
    setEarningsData((prev) => ({ ...prev, todayTotal: 0 }));
    showToast(`₹${amount} transferred to bank`);
  };

  const handleMarkAllRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    showToast('Notifications marked read');
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#E8EDEB] flex justify-center items-start sm:py-6">
      {/* Phone Viewport: 390px, strictly mobile */}
      <div
        className="w-full max-w-[390px] bg-[#F0F2F1] flex flex-col relative sm:rounded-[40px] sm:shadow-[0_20px_60px_rgba(0,0,0,0.16)] sm:border sm:border-[#D6DDD9] overflow-hidden"
        style={{ minHeight: '100svh' }}
      >
        {/* Sticky Mobile Header */}
        <Header
          unreadCount={unreadCount}
          onOpenNotifications={() => setNotificationsOpen(true)}
          onOpenProfile={() => setCurrentTab('profile')}
          onOpenDispatchHelp={() => setDispatchHelpOpen(true)}
        />

        {/* Scrollable Content — padded for bottom nav */}
        <main className="flex-1 w-full overflow-y-auto" style={{ paddingBottom: '72px' }}>
          {loading && (
            <div className="flex flex-col items-center justify-center py-20 gap-3">
              <div className="w-8 h-8 border-3 border-[#35A88A] border-t-transparent rounded-full animate-spin" />
              <span className="text-[12px] text-[#5C6E66] font-medium">Syncing with Supabase…</span>
            </div>
          )}

          {!loading && currentTab === 'dashboard' && (
            <DashboardScreen
              partnerName={profile.name}
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              earningsData={earningsData}
              activeBatch={activeBatch}
              activeDeliveries={activeDeliveries}
              onViewManifest={() => setBatchManifestOpen(true)}
              onSelectDelivery={handleSelectDelivery}
              onViewAllDeliveries={() => setCurrentTab('deliveries')}
              onOpenDispatchHelp={() => setDispatchHelpOpen(true)}
            />
          )}

          {!loading && currentTab === 'deliveries' && (
            <DeliveriesScreen
              activeBatch={activeBatch}
              activeDeliveries={activeDeliveries}
              completedDeliveries={completedDeliveries}
              onSelectDelivery={handleSelectDelivery}
              onOpenBatchManifest={() => setBatchManifestOpen(true)}
            />
          )}

          {!loading && currentTab === 'earnings' && (
            <EarningsScreen
              earningsData={earningsData}
              onInstantCashout={handleInstantCashout}
            />
          )}

          {!loading && currentTab === 'profile' && (
            <ProfileScreen
              profile={profile}
              isOnline={isOnline}
              onToggleOnline={handleToggleOnline}
              onEmergencySOS={() => showToast('SOS alert triggered to dispatch')}
            />
          )}
        </main>

        {/* Bottom Navigation — positioned inside the phone container */}
        <BottomNav
          currentTab={currentTab}
          onTabChange={(tab) => setCurrentTab(tab)}
          activeDeliveriesCount={activeDeliveries.length}
        />

        {/* Toast */}
        {toastMessage && (
          <div className="absolute top-16 left-1/2 -translate-x-1/2 z-50 px-3.5 py-1.5 bg-[#26352F] text-white text-[12px] font-medium rounded-full shadow-lg flex items-center gap-1.5 whitespace-nowrap pointer-events-none">
            <span className="w-1.5 h-1.5 rounded-full bg-[#35A88A]" />
            <span>{toastMessage}</span>
          </div>
        )}

        {/* Order Details Modal */}
        {selectedOrder && (
          <DeliveryDetailModal
            order={selectedOrder}
            onClose={() => setSelectedOrder(null)}
            onConfirmDelivery={handleConfirmDelivery}
          />
        )}

        {/* Batch Manifest Modal */}
        {batchManifestOpen && (
          <BatchManifestModal
            batch={activeBatch}
            onClose={() => setBatchManifestOpen(false)}
            onSelectOrder={(order) => {
              setBatchManifestOpen(false);
              setSelectedOrder(order);
            }}
            onAcceptBatch={handleAcceptBatch}
            isAccepted={isBatchAccepted}
          />
        )}

        {/* Notifications Modal */}
        {notificationsOpen && (
          <NotificationsModal
            notifications={notifications}
            onClose={() => setNotificationsOpen(false)}
            onMarkAllRead={handleMarkAllRead}
          />
        )}

        {/* AI Dispatch Modal */}
        {dispatchHelpOpen && (
          <DispatchHelpModal
            onClose={() => setDispatchHelpOpen(false)}
            onRecalculateRoute={() => showToast('Route re-optimized with Gemini AI')}
            onEmergencySOS={() => showToast('Emergency SOS alert dispatched to Hub')}
            activeDeliveries={activeDeliveries}
          />
        )}
      </div>
    </div>
  );
}
