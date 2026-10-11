/**
 * supabaseService.ts
 * ------------------
 * All Supabase data-fetching logic lives here.
 * Falls back to mock data when Supabase is not configured.
 *
 * TABLE ASSUMPTIONS (adjust column names to match your schema):
 *   deliveries   → id, status, customer_name, customer_phone, destination_name,
 *                  destination_address, pickup_location, eta_minutes, distance_km,
 *                  payout, cod_amount, package_count, package_type, notes,
 *                  delivery_otp, time_window, lat, lng, batch_id
 *   batches      → id, priority, title, hub_name, payout, total_distance_km,
 *                  est_time_minutes, deadline, orders_count, optimization_note
 *   riders       → id, name, phone, email, avatar_url, rating, total_deliveries,
 *                  on_time_rate, acceptance_rate, vehicle_model, plate_number,
 *                  vehicle_type, battery_percent, estimated_range_km, hub, joined_date
 *   earnings     → id, rider_id, date, total, tips, base, surge, completed, pending
 *   transactions → id, rider_id, title, time, amount, type
 *   notifications→ id, rider_id, title, message, time, type, read
 */

import { supabase } from './supabaseClient';
import {
  BatchAssignment,
  DeliveryOrder,
  EarningsData,
  NotificationItem,
  PartnerProfile,
} from '../types/delivery';
import {
  initialActiveDeliveries,
  initialBatchAssignment,
  initialCompletedDeliveries,
  initialEarningsData,
  initialNotifications,
  initialProfile,
} from '../data/mockData';

// ─── helpers ────────────────────────────────────────────────────────────────

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToOrder(r: any): DeliveryOrder {
  return {
    id: r.id,
    status: r.status,
    customerName: r.customer_name,
    customerPhone: r.customer_phone,
    destinationName: r.destination_name,
    destinationAddress: r.destination_address,
    pickupLocation: r.pickup_location,
    etaMinutes: r.eta_minutes,
    distanceKm: r.distance_km,
    payout: r.payout,
    codAmount: r.cod_amount,
    packageCount: r.package_count,
    packageType: r.package_type,
    notes: r.notes,
    deliveryOtp: r.delivery_otp,
    timeWindow: r.time_window,
    lat: r.lat,
    lng: r.lng,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function rowToBatch(r: any, orders: DeliveryOrder[]): BatchAssignment {
  return {
    batchId: r.id,
    priority: r.priority,
    title: r.title,
    hubName: r.hub_name,
    payout: r.payout,
    totalDistanceKm: r.total_distance_km,
    estTimeMinutes: r.est_time_minutes,
    deadline: r.deadline,
    ordersCount: r.orders_count ?? orders.length,
    optimizationNote: r.optimization_note,
    orders,
  };
}

// ─── Active Deliveries ───────────────────────────────────────────────────────

export async function fetchActiveDeliveries(): Promise<DeliveryOrder[]> {
  if (!supabase) return initialActiveDeliveries;
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .in('status', ['Out for Delivery', 'Picked Up', 'Pending Pickup'])
    .order('eta_minutes', { ascending: true });

  if (error || !data) {
    console.error('[Supabase] fetchActiveDeliveries:', error?.message);
    return initialActiveDeliveries;
  }
  return data.map(rowToOrder);
}

// ─── Completed Deliveries ────────────────────────────────────────────────────

export async function fetchCompletedDeliveries(): Promise<DeliveryOrder[]> {
  if (!supabase) return initialCompletedDeliveries;
  const { data, error } = await supabase
    .from('deliveries')
    .select('*')
    .eq('status', 'Delivered')
    .order('id', { ascending: false })
    .limit(50);

  if (error || !data) {
    console.error('[Supabase] fetchCompletedDeliveries:', error?.message);
    return initialCompletedDeliveries;
  }
  return data.map(rowToOrder);
}

// ─── Batch Assignment ────────────────────────────────────────────────────────

export async function fetchLatestBatch(): Promise<BatchAssignment> {
  if (!supabase) return initialBatchAssignment;
  const { data: batches, error: bErr } = await supabase
    .from('batches')
    .select('*')
    .order('id', { ascending: false })
    .limit(1);

  if (bErr || !batches || batches.length === 0) {
    console.error('[Supabase] fetchLatestBatch:', bErr?.message);
    return initialBatchAssignment;
  }

  const batch = batches[0];
  const { data: orders, error: oErr } = await supabase
    .from('deliveries')
    .select('*')
    .eq('batch_id', batch.id);

  if (oErr) console.error('[Supabase] fetchLatestBatch orders:', oErr.message);
  return rowToBatch(batch, (orders ?? []).map(rowToOrder));
}

// ─── Rider Profile ───────────────────────────────────────────────────────────

export async function fetchRiderProfile(riderId?: string): Promise<PartnerProfile> {
  if (!supabase) return initialProfile;
  const query = supabase.from('riders').select('*');
  if (riderId) query.eq('id', riderId);
  else query.limit(1);

  const { data, error } = await query;
  if (error || !data || data.length === 0) {
    console.error('[Supabase] fetchRiderProfile:', error?.message);
    return initialProfile;
  }
  const r = data[0];
  return {
    name: r.name,
    id: r.id,
    phone: r.phone,
    email: r.email,
    avatarUrl: r.avatar_url ?? initialProfile.avatarUrl,
    rating: r.rating,
    totalDeliveries: r.total_deliveries,
    onTimeRate: r.on_time_rate,
    acceptanceRate: r.acceptance_rate,
    vehicle: {
      model: r.vehicle_model,
      plateNumber: r.plate_number,
      type: r.vehicle_type,
      batteryPercent: r.battery_percent,
      estimatedRangeKm: r.estimated_range_km,
    },
    hub: r.hub,
    joinedDate: r.joined_date,
  };
}

// ─── Earnings ────────────────────────────────────────────────────────────────

export async function fetchEarningsData(riderId?: string): Promise<EarningsData> {
  if (!supabase) return initialEarningsData;

  // Today's summary row
  const today = new Date().toISOString().split('T')[0];
  const earningsQuery = supabase.from('earnings').select('*').eq('date', today);
  if (riderId) earningsQuery.eq('rider_id', riderId);
  earningsQuery.limit(1);

  const { data: todayData } = await earningsQuery;
  const todayRow = todayData?.[0];

  // Daily history (last 7 days)
  const { data: histData } = await supabase
    .from('earnings')
    .select('date, total, completed')
    .order('date', { ascending: false })
    .limit(7);

  // Recent transactions
  const txQuery = supabase.from('transactions').select('*').order('id', { ascending: false }).limit(10);
  if (riderId) txQuery.eq('rider_id', riderId);
  const { data: txData } = await txQuery;

  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  return {
    todayTotal: todayRow?.total ?? initialEarningsData.todayTotal,
    todayTips: todayRow?.tips ?? initialEarningsData.todayTips,
    todayBase: todayRow?.base ?? initialEarningsData.todayBase,
    todaySurge: todayRow?.surge ?? initialEarningsData.todaySurge,
    weekTotal: histData?.reduce((s: number, r: { total: number }) => s + (r.total ?? 0), 0) ?? initialEarningsData.weekTotal,
    completedDeliveriesToday: todayRow?.completed ?? initialEarningsData.completedDeliveriesToday,
    pendingDeliveriesToday: todayRow?.pending ?? initialEarningsData.pendingDeliveriesToday,
    dailyHistory: histData?.map((r: { date: string; total: number; completed: number }) => ({
      day: days[new Date(r.date).getDay()],
      date: r.date,
      earnings: r.total,
      trips: r.completed,
    })) ?? initialEarningsData.dailyHistory,
    recentTransactions: txData?.map((r: { id: string; title: string; time: string; amount: number; type: string }) => ({
      id: r.id,
      title: r.title,
      time: r.time,
      amount: r.amount,
      type: r.type as 'order' | 'tip' | 'quest' | 'cashout',
    })) ?? initialEarningsData.recentTransactions,
  };
}

// ─── Notifications ───────────────────────────────────────────────────────────

export async function fetchNotifications(riderId?: string): Promise<NotificationItem[]> {
  if (!supabase) return initialNotifications;
  const q = supabase.from('notifications').select('*').order('id', { ascending: false }).limit(20);
  if (riderId) q.eq('rider_id', riderId);
  const { data, error } = await q;
  if (error || !data) {
    console.error('[Supabase] fetchNotifications:', error?.message);
    return initialNotifications;
  }
  return data.map((r: { id: string; title: string; message: string; time: string; type: string; read: boolean }) => ({
    id: r.id,
    title: r.title,
    message: r.message,
    time: r.time,
    type: r.type as 'dispatch' | 'earning' | 'alert',
    read: r.read,
  }));
}

// ─── Mark delivery complete ──────────────────────────────────────────────────

export async function markDeliveryComplete(orderId: string): Promise<void> {
  if (!supabase) return;
  const { error } = await supabase
    .from('deliveries')
    .update({ status: 'Delivered', eta_minutes: 0 })
    .eq('id', orderId);
  if (error) console.error('[Supabase] markDeliveryComplete:', error.message);
}
