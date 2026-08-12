# SafeGuard — Safety Protect & Alert System

**Live web app:** https://safetyprotection.netlify.app/

A cross-platform personal safety and emergency response application providing real-time protection, monitoring, and rapid alert mechanisms during emergencies. The platform combines live location tracking, SOS alerting, emergency contact notification, geofencing, activity logging, and native mobile integration into a unified safety ecosystem.

The project ships as **two separate apps sharing one Supabase backend**:
- **Web app** (`src/`) — React + TypeScript + Vite, deployed to Netlify
- **Mobile app** (`mobile/`) — Flutter, built natively for Android and iOS

---

## Overview

The system supports:

- Emergency SOS triggering (button tap, volume-button triple-press on Android, shake gesture on iOS)
- Real-time geolocation tracking and live location sharing
- Emergency contact notification via email (Brevo)
- Geofencing / safe-zone entry alerts
- Activity and incident logging
- Interactive map visualization
- Evidence recording (audio/video) and device file upload
- Secure Supabase backend: Postgres, Auth, Storage, Realtime, and Edge Functions

---

## Core Features

### Emergency SOS System
Triggering SOS:
- Notifies emergency contacts by email with the user's location
- Creates an emergency incident record
- Auto-starts audio evidence recording
- Generates an activity log entry

### Live Location Tracking & Sharing
- Real-time coordinate updates via device geolocation
- Live location sharing sessions with auto-expiry
- Distance-based safe-zone entry/exit detection

### Activity Monitoring
A running history of emergency events, location activity, alert triggers, and incident reports — visible to the user, and platform-wide to admins.

### Interactive Mapping
Route display, live position, tracking paths, and safe-zone visualization via OpenStreetMap (web: Leaflet; mobile: flutter_map) — no API key required.

### Multi-Role System
- **User** — SOS, contacts, location, reporting, community, wellness tools
- **Admin** — user oversight, SOS alert monitoring, community moderation, content management
- **Government Admin** — request review, safe-zone management, data requests

---

## Technology Stack

### Web (`src/`)
- React, TypeScript, Vite
- Tailwind CSS, shadcn/ui
- React Router, TanStack Query
- Leaflet / React Leaflet

### Mobile (`mobile/`)
- Flutter (Dart) — single codebase, native Android + iOS builds
- `geolocator`, `flutter_map`, `sensors_plus`, `record`, `camera`, `file_picker`, `speech_to_text`
- `supabase_flutter` — same backend as the web app

### Backend & Services
- Supabase: PostgreSQL, Auth, Realtime, Storage, Edge Functions
- Brevo — transactional email (emergency alert delivery)

---

## Project Structure

```txt
.
├── src/                     # Web app (React + Vite)
│   ├── components/
│   ├── hooks/
│   ├── pages/
│   ├── integrations/
│   ├── lib/
│   ├── services/
│   ├── utils/
│   ├── types/
│   └── styles/
├── mobile/                  # Mobile app (Flutter)
│   ├── lib/
│   │   ├── core/            # theme, navigation, Supabase client
│   │   ├── models/
│   │   ├── services/
│   │   ├── screens/
│   │   └── widgets/
│   ├── android/
│   └── ios/
├── supabase/
│   ├── functions/           # Edge functions (Deno)
│   │   ├── send-emergency-alerts/
│   │   ├── share-live-location/
│   │   ├── notify-fence-breach/
│   │   ├── process-recording-upload/
│   │   └── chatbot-support/
│   └── migrations/
└── public/
```

---

## Installation

### Prerequisites
- Node.js (v18+) and npm
- Flutter SDK (for the mobile app) — see [flutter.dev/docs/get-started/install](https://docs.flutter.dev/get-started/install)
- Android Studio + Java JDK (for Android builds)
- Xcode (for iOS builds, macOS only)
- Supabase CLI (`npm install -g supabase`) — for deploying edge functions/migrations

### Web app setup
```bash
npm install
npm run dev        # start dev server
npm run build       # production build
npm run preview     # preview production build
```

### Mobile app setup
```bash
cd mobile
flutter pub get
flutter run          # run on a connected device/emulator
```

---

## Backend Deployment

```bash
supabase login
supabase link --project-ref <your-project-ref>

# Deploy an edge function after changes
supabase functions deploy send-emergency-alerts

# Apply database migrations
supabase db push

# Set secrets (e.g. email provider API key)
supabase secrets set BREVO_API_KEY=your_key_here
```

---

## Potential Future Enhancements

- AI-powered threat detection
- Voice-activated SOS (in progress — mobile app has working speech recognition, trigger-phrase detection wired to SOS)
- Scream/distress-sound detection (basic amplitude-based version implemented on mobile)
- Safe route recommendation
- Wearable device integration
- Push notification infrastructure
- Offline emergency mode
- SMS delivery alongside email alerts

---

## Development Goals

- Improve personal safety accessibility
- Enable rapid, reliable emergency response
- Provide scalable safety infrastructure across web and native mobile
- Integrate real-time monitoring technologies
- Support multi-role oversight (user / admin / government) for community and institutional use

---

## Summary

SafeGuard is a multi-role personal safety platform offering emergency SOS tools, incident reporting, community support features, and administrative/government oversight — delivered as a web app and a native Flutter mobile app sharing one Supabase backend, enabling responsive, structured safety handling in real time.
