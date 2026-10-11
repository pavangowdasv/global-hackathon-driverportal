# global-hackathon-driverportal
**CBC-035 — Verya: Field Dispatch & Delivery Interface**

<div align="center">
<img width="1200" height="475" alt="GHBanner" src="https://ai.google.dev/static/site-assets/images/share-ais-513315318.png" />
</div>

## Overview
Verya is an intelligent field dispatch and delivery interface built with React, Vite, Tailwind CSS, Leaflet/OpenStreetMap, Gemini AI, and Supabase.

## Features
- **Live GPS Telemetry & Interactive Map**: Turn-by-turn navigation without proprietary API keys.
- **Smart Batch Dispatch**: Optimized multi-stop delivery routes.
- **Gemini AI Dispatch Control**: Real-time traffic rerouting, incident/hazard detour analysis, and automated customer ETA update generators.
- **Supabase Integration**: Live data persistence for riders, deliveries, earnings, transactions, and notifications.

## Run Locally

**Prerequisites:** Node.js (v18+)

1. Install dependencies:
   ```bash
   npm install --legacy-peer-deps
   ```
2. Set environment variables in `.env`:
   ```env
   VITE_GEMINI_API_KEY="your-gemini-key"
   VITE_SUPABASE_URL="https://your-project.supabase.co"
   VITE_SUPABASE_ANON_KEY="your-anon-key"
   ```
3. Run the development server:
   ```bash
   npm run dev
   ```
