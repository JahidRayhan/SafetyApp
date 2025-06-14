# SafetyApp
# Welcome to our project

## Project info

**URL**: https://safetyprotection.netlify.app/

## Safety & Protection Web & Mobile Application

# Overview

A multi-platform safety-focused application offering real-time emergency response, protection features, and centralized incident management. The system is built to support three user roles: General Users, Admins, and Government Officials, each with a clearly defined set of capabilities and restrictions.

# Core Features

1. User Authentication & Profile
2. SOS & Emergency Functions
3. Alerts & Alarms
4. Safety Support
5. AI Chatbot & Voice Assistant
6. Emotional & Mental Wellness
7. Mapping & Geolocation
8. Incident Reporting
9. Admin Panel
10. Miscellaneous Tools

Quick access buttons: “Get Help”, “Send Alert”, “Fake Call”, etc.

Periodic location sharing

History of alerts & reports

Access to Safety Resource Directory (legal help, police, ambulance, NGOs)

# Mobile App Specifics

1. Android App

Trigger SOS with triple power button tap

Access all user-level web app features

Mobile-specific tools:

Spy camera detector

Shake for fake call

Background scream detection

2. iOS App

Trigger SOS with specific hand gesture or shake

Access all user-level web app features

Mobile-specific tools:

Shake-to-fake call

Background scream detection

# Data Management & Compliance

Critical data deletion requires a 7-day grace period

User-sensitive content can be accessed only with permission (Admin ↔ Govt Admin)

Admin cannot delete sensitive data without Govt approval

All roles can view their activity history/logs

# Tech Stack
Frontend: React.js + TypeScript + Tailwind CSS + Shadcn/UI

Backend: Supabase (PostgreSQL database + Auth + Edge Functions + Real-time subscriptions)

Mobile: Capacitor.js with native Android integration (power button SOS triggers)

Cloud Storage: Supabase Storage (for emergency recordings and evidence uploads)

UI Framework: Radix UI components + Shadcn/UI + Tailwind CSS

State Management: React Query (TanStack Query) + React Context

Routing: React Router DOM

Audio/Video Processing: Web MediaRecorder API + MediaDevices API

Real-time Features: Supabase Real-time (for live location tracking and alerts)

Authentication: Supabase Auth (with role-based access control)

Geolocation: Browser Geolocation API + Google Maps integration

Push Notifications: Web Push Notifications API + Supabase Edge Functions

Audio Analysis: Web Audio API (for scream detection using frequency analysis)

Forms & Validation: React Hook Form + Zod schema validation

Date Handling: date-fns library

Charts & Analytics: Recharts

Development Tools: Vite + ESLint + TypeScript

# Summary

This Safety & Protection App is a robust multi-role system offering emergency tools, reporting features, AI detection mechanisms, and government oversight integration. The combination of mobile app functionality with a secure web backend enables responsive and structured safety handling in real-time for both personal and community benefit.
