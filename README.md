# SafetyApp
# Welcome to our project

## Project info

**URL**: https://safetyprotection.netlify.app/

# Safety Protect & Alert System

A cross-platform personal safety and emergency response application designed to provide real-time protection, monitoring, and rapid alert mechanisms during emergencies.

The platform combines live location tracking, SOS alerting, emergency contact communication, route monitoring, activity logging, and mobile device integration into a unified safety ecosystem.

---

# Overview

The Safety Protect & Alert System is designed to improve user safety through proactive monitoring and rapid emergency response workflows.

The system supports:

* Emergency SOS triggering
* Real-time geolocation tracking
* Emergency contact notification
* Background location monitoring
* Activity and incident logging
* Mobile-first deployment using Capacitor
* Interactive map visualization
* Secure cloud backend integration

The project is built using a modern TypeScript-based architecture with a focus on scalability, modularity, and mobile compatibility.

---

# Core Features

## Emergency SOS System

Users can trigger emergency alerts that:

* Notify predefined emergency contacts
* Share real-time location
* Record incident metadata
* Generate emergency activity logs

## Live Location Tracking

The application continuously tracks user location using device geolocation services.

Capabilities include:

* Real-time coordinate updates
* Background tracking
* Route visualization
* Distance monitoring

## Activity Monitoring

The system maintains a history of:

* Emergency events
* Location activities
* Alert triggers
* Route tracking sessions

## Interactive Mapping

Integrated mapping functionality enables:

* Route display
* User position visualization
* Tracking paths
* Safety zone awareness

## Mobile Integration

The application supports Android deployment using Capacitor.

Mobile functionality includes:

* Native geolocation access
* Background tracking
* Mobile permission handling
* Device-level integrations

---

# Technology Stack

## Frontend

* React
* TypeScript
* Vite
* Tailwind CSS
* shadcn/ui
* React Router

## Backend & Services

* Supabase
* PostgreSQL
* Supabase Authentication
* Supabase Realtime Services

## Mobile & Native

* Capacitor
* Android Platform
* Capacitor Geolocation

## Maps & Location

* Leaflet
* React Leaflet
* Background Geolocation

## State & Data Management

* TanStack Query

---

# Project Structure

```txt
src/
 ├── components/
 ├── hooks/
 ├── pages/
 ├── integrations/
 ├── lib/
 ├── services/
 ├── utils/
 ├── types/
 └── styles/
```

---

# Installation

## Prerequisites

Ensure the following are installed:

* Node.js (v18 or later recommended)
* npm or pnpm
* Android Studio (for Android builds)
* Java JDK

---

# Setup

Install dependencies:

```bash
npm install
```

Run the development server:

```bash
npm run dev
```

Build the project:

```bash
npm run build
```

Preview production build:

```bash
npm run preview
```

---

# Android Deployment

Add Android platform:

```bash
npx cap add android
```

Sync Capacitor:

```bash
npx cap sync
```

Open Android Studio:

```bash
npx cap open android
```

---

# Potential Future Enhancements

The system architecture supports future expansion including:

* AI-powered threat detection
* Voice-based emergency activation
* Violence/scream detection
* Geo-fencing alerts
* Safe route recommendation
* Wearable device integration
* Emergency response dashboards
* Push notification infrastructure
* Offline emergency mode

---

# Development Goals

The primary goals of this project are:

* Improve personal safety accessibility
* Enable rapid emergency response
* Provide scalable safety infrastructure
* Support mobile-first emergency systems
* Integrate real-time monitoring technologies

---

# Summary

This Safety & Protection App is a robust multi-role system offering emergency tools, reporting features, AI detection mechanisms, and government oversight integration. The combination of mobile app functionality with a secure web backend enables responsive and structured safety handling in real-time for both personal and community benefit.
