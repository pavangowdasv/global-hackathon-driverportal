export interface DeliveryOrder {
  id: string; // e.g., 'VY-9821'
  status: 'Out for Delivery' | 'Picked Up' | 'Pending Pickup' | 'Delivered';
  customerName: string;
  customerPhone: string;
  destinationName: string;
  destinationAddress: string;
  pickupLocation: string;
  etaMinutes: number;
  distanceKm: number;
  payout: number;
  codAmount?: number;
  packageCount: number;
  packageType: string;
  notes?: string;
  deliveryOtp: string;
  timeWindow: string;
  lat?: number;
  lng?: number;
}

export interface BatchAssignment {
  batchId: string; // 'VY1024'
  priority: 'High Priority' | 'Standard';
  title: string;
  hubName: string;
  payout: number;
  totalDistanceKm: number;
  estTimeMinutes: number;
  deadline: string;
  ordersCount: number;
  optimizationNote: string;
  orders: DeliveryOrder[];
}

export interface PartnerProfile {
  name: string;
  id: string;
  phone: string;
  email: string;
  avatarUrl: string;
  rating: number;
  totalDeliveries: number;
  onTimeRate: number;
  acceptanceRate: number;
  vehicle: {
    model: string;
    plateNumber: string;
    type: 'Electric Scooter' | 'Motorcycle';
    batteryPercent: number;
    estimatedRangeKm: number;
  };
  hub: string;
  joinedDate: string;
}

export interface EarningsData {
  todayTotal: number;
  todayTips: number;
  todayBase: number;
  todaySurge: number;
  weekTotal: number;
  completedDeliveriesToday: number;
  pendingDeliveriesToday: number;
  dailyHistory: {
    day: string;
    date: string;
    earnings: number;
    trips: number;
  }[];
  recentTransactions: {
    id: string;
    title: string;
    time: string;
    amount: number;
    type: 'order' | 'tip' | 'quest' | 'cashout';
  }[];
}

export interface NotificationItem {
  id: string;
  title: string;
  message: string;
  time: string;
  type: 'dispatch' | 'earning' | 'alert';
  read: boolean;
}
