-- ============================================================
--  Verya Field Dispatch & Delivery Interface — Supabase Schema
--  Run this in: Supabase Dashboard → SQL Editor → New query → Run
-- ============================================================

-- ── 1. Create Tables ─────────────────────────────────────────

-- 1.1 Riders (Partner Profiles)
create table if not exists public.riders (
  id                  text primary key,
  name                text not null,
  phone               text,
  email               text,
  avatar_url          text,
  rating              numeric(3,2) default 4.9,
  total_deliveries    int default 0,
  on_time_rate        int default 98,
  acceptance_rate     int default 96,
  vehicle_model       text default 'Ather 450X',
  plate_number        text default 'KA 05 EM 7823',
  vehicle_type        text default 'Electric Scooter',
  battery_percent     int default 78,
  estimated_range_km  int default 42,
  hub                 text default 'Indiranagar Hub #04',
  joined_date         text default '2023-11-01',
  created_at          timestamptz default now()
);

-- 1.2 Batches (Assignment Groups)
create table if not exists public.batches (
  id                  text primary key,
  priority            text default 'High Priority',
  title               text,
  hub_name            text default 'Indiranagar Hub #04',
  payout              numeric(10,2) default 0,
  total_distance_km   numeric(5,2) default 0,
  est_time_minutes    int default 0,
  deadline            text,
  orders_count        int default 0,
  optimization_note   text default 'Grouped to reduce unnecessary travel.',
  created_at          timestamptz default now()
);

-- 1.3 Deliveries (Active & Completed Orders)
create table if not exists public.deliveries (
  id                  text primary key,
  batch_id            text references public.batches(id) on delete set null,
  status              text not null default 'Pending Pickup'
                        check (status in ('Out for Delivery','Picked Up','Pending Pickup','Delivered')),
  customer_name       text not null,
  customer_phone      text,
  destination_name    text,
  destination_address text,
  pickup_location     text,
  eta_minutes         int default 0,
  distance_km         numeric(5,2) default 0,
  payout              numeric(10,2) default 0,
  cod_amount          numeric(10,2) default 0,
  package_count       int default 1,
  package_type        text default 'Standard Package',
  notes               text,
  delivery_otp        text,
  time_window         text,
  lat                 numeric(10,7),
  lng                 numeric(10,7),
  created_at          timestamptz default now()
);

-- 1.4 Earnings (Daily Summary per Rider)
create table if not exists public.earnings (
  id          bigserial primary key,
  rider_id    text references public.riders(id) on delete cascade,
  date        date not null default current_date,
  total       numeric(10,2) default 0,
  tips        numeric(10,2) default 0,
  base        numeric(10,2) default 0,
  surge       numeric(10,2) default 0,
  completed   int default 0,
  pending     int default 0,
  created_at  timestamptz default now(),
  unique(rider_id, date)
);

-- 1.5 Transactions
create table if not exists public.transactions (
  id          text primary key,
  rider_id    text references public.riders(id) on delete cascade,
  title       text,
  time        text,
  amount      numeric(10,2) default 0,
  type        text default 'order'
                check (type in ('order','tip','quest','cashout')),
  created_at  timestamptz default now()
);

-- 1.6 Notifications
create table if not exists public.notifications (
  id          text primary key,
  rider_id    text references public.riders(id) on delete cascade,
  title       text,
  message     text,
  time        text,
  type        text default 'dispatch'
                check (type in ('dispatch','earning','alert')),
  read        boolean default false,
  created_at  timestamptz default now()
);

-- ── 2. Row Level Security & Anonymous Access ──────────────────

alter table public.riders        enable row level security;
alter table public.batches       enable row level security;
alter table public.deliveries    enable row level security;
alter table public.earnings      enable row level security;
alter table public.transactions  enable row level security;
alter table public.notifications enable row level security;

-- Drop existing policies if re-running
drop policy if exists "anon_full_access_riders"        on public.riders;
drop policy if exists "anon_full_access_batches"       on public.batches;
drop policy if exists "anon_full_access_deliveries"    on public.deliveries;
drop policy if exists "anon_full_access_earnings"      on public.earnings;
drop policy if exists "anon_full_access_transactions"  on public.transactions;
drop policy if exists "anon_full_access_notifications" on public.notifications;

-- Grant full read/write access to anon (public frontend)
create policy "anon_full_access_riders"        on public.riders        for all using (true) with check (true);
create policy "anon_full_access_batches"       on public.batches       for all using (true) with check (true);
create policy "anon_full_access_deliveries"    on public.deliveries    for all using (true) with check (true);
create policy "anon_full_access_earnings"      on public.earnings      for all using (true) with check (true);
create policy "anon_full_access_transactions"  on public.transactions  for all using (true) with check (true);
create policy "anon_full_access_notifications" on public.notifications for all using (true) with check (true);

-- ── 3. Seed Data ─────────────────────────────────────────────

-- Rider Profile
insert into public.riders (
  id, name, phone, email, rating, total_deliveries, on_time_rate,
  acceptance_rate, vehicle_model, plate_number, vehicle_type, battery_percent, estimated_range_km, hub, joined_date
) values (
  'RIDER-001', 'Rahul', '+91 98765 43210', 'rahul@verya.in', 4.9, 1284, 98,
  96, 'Ather 450X', 'KA 05 EM 7823', 'Electric Scooter', 78, 42, 'Indiranagar Hub #04', '2023-11-01'
) on conflict (id) do nothing;

-- Active Batch Assignment
insert into public.batches (
  id, priority, title, hub_name, payout, total_distance_km, est_time_minutes, deadline, orders_count, optimization_note
) values (
  'VY1024', 'High Priority', '3-Stop Cluster — Koramangala Loop', 'Indiranagar Hub #04', 340, 14.2, 55, '2:45 PM', 3, 'Smart batched to eliminate 3.2 km unnecessary deadhead travel.'
) on conflict (id) do nothing;

-- Active Deliveries
insert into public.deliveries (
  id, batch_id, status, customer_name, customer_phone, destination_name, destination_address,
  pickup_location, eta_minutes, distance_km, payout, cod_amount, package_count, package_type,
  notes, delivery_otp, time_window, lat, lng
) values
  ('VY-9821', 'VY1024', 'Out for Delivery', 'Ananya Sharma', '+91 98712 34510', 'Koramangala 4th Block',  'Indiranagar Sector 3, Bengaluru',     'Indiranagar Central Hub', 10, 2.1, 65,  0,   1, 'Temperature Sensitive · Sealed Box', 'Call on arrival. Gate security pass ready.',                     '4892', '1:45 PM - 2:05 PM', 12.9345, 77.6265),
  ('VY-9815', 'VY1024', 'Picked Up',        'Karthik Raman', '+91 99014 55122', 'Prestige Meridian, MG Rd', 'Central Business District, Bengaluru', 'Indiranagar Central Hub', 22, 2.4, 60,  450, 2, 'Express Parcel · Fragile',            'Tower B, 7th floor, Flat 704. Collect ₹450 Cash.',         '7139', '2:00 PM - 2:20 PM', 12.9756, 77.6067),
  ('VY-9830', 'VY1024', 'Pending Pickup',   'Sanjay Reddy',  '+91 98451 88921', 'Domlur Flyover Residences', 'Old Airport Road, Bengaluru',         'Indiranagar Central Hub', 35, 2.0, 55,  0,   1, 'Documents & Small Electronics',       'Security gate passes needed. Visitor parking at Gate 2.', '3350', '2:15 PM - 2:30 PM', 12.9609, 77.6387)
on conflict (id) do nothing;

-- Completed Deliveries (History)
insert into public.deliveries (
  id, batch_id, status, customer_name, customer_phone, destination_name, destination_address,
  pickup_location, eta_minutes, distance_km, payout, cod_amount, package_count, package_type,
  notes, delivery_otp, time_window, lat, lng
) values
  ('VY-9788', null, 'Delivered', 'Meera Nair',       '+91 97412 11090', 'Defence Colony, Indiranagar', '100ft Road, Bengaluru',         'Indiranagar Central Hub', 0, 1.8, 65, 0, 1, 'Gourmet Cold Pack',        null, '9012', '11:15 AM - 11:35 AM', 12.9780, 77.6400),
  ('VY-9774', null, 'Delivered', 'Arjun Das',        '+91 98860 44321', 'Ulsoor Lake Promenade',       'Kensington Road, Bengaluru',     'Indiranagar Central Hub', 0, 3.2, 75, 0, 3, 'Apparel & Accessories',     null, '6618', '10:30 AM - 11:00 AM', 12.9830, 77.6200),
  ('VY-9760', null, 'Delivered', 'Priya Venkatesh',  '+91 98201 77411', 'HAL 2nd Stage',               'Old Airport Road, Bengaluru',     'Indiranagar Central Hub', 0, 2.5, 70, 0, 1, 'Electronics Accessory',     null, '4419', '10:00 AM - 10:25 AM', 12.9650, 77.6500)
on conflict (id) do nothing;

-- Daily Earnings Summary
insert into public.earnings (
  rider_id, date, total, tips, base, surge, completed, pending
) values (
  'RIDER-001', current_date, 520, 45, 450, 25, 6, 2
) on conflict (rider_id, date) do nothing;

-- Transactions History
insert into public.transactions (id, rider_id, title, time, amount, type)
values
  ('TX-001', 'RIDER-001', 'Order #VY-9821 Delivered', '12:34 PM', 65,  'order'),
  ('TX-002', 'RIDER-001', 'Customer Tip — Ananya S.', '12:36 PM', 25,  'tip'),
  ('TX-003', 'RIDER-001', 'Order #VY-9819 Delivered', '11:45 AM', 130, 'order'),
  ('TX-004', 'RIDER-001', 'Surge Bonus — Peak Hours', '11:00 AM', 25,  'quest')
on conflict (id) do nothing;

-- Notifications
insert into public.notifications (id, rider_id, title, message, time, type, read)
values
  ('N-001', 'RIDER-001', 'New Batch Assignment',  'Assignment VY1024 with 3 orders is ready for pickup.',     '10 min ago', 'dispatch', false),
  ('N-002', 'RIDER-001', 'Earnings Credited',     '₹65 for order #VY-9821 has been credited.',                '25 min ago', 'earning',  false),
  ('N-003', 'RIDER-001', 'Route Optimised by AI', 'Gemini AI re-routed your 3-stop cluster for 14% savings.', '1 hr ago',   'dispatch', true)
on conflict (id) do nothing;
