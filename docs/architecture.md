# Architecture

## Overview

HarvestIQ is a browser-based AgTech MVP that helps small and medium farms:

1. Manage field profiles  
2. Upload a crop leaf photo  
3. Receive AI-assisted disease screening  
4. Estimate 7-day outbreak risk from field conditions  
5. Save reports and find nearby agricultural resources  

The current implementation is a **Next.js 15 App Router** web client with API routes for diagnosis and forecast. Browser `localStorage` persists workspace data (prototype-grade stand-in for PostgreSQL + S3 from the full lifecycle plan).

## Repository layout

```
HarvestIQ/
├── apps/
│   └── web/                 # Farmer-facing Next.js app
│       └── src/
│           ├── app/         # Routes + API handlers
│           ├── components/  # UI shell and shared primitives
│           │   ├── layout/  # AppShell, Sidebar
│           │   └── ui/      # Headers, badges, form errors, alerts
│           └── lib/         # Types, storage, validation, AI helpers, store
├── docs/                    # Product and engineering notes
├── prototypes/              # Early single-file HTML prototype
└── README.md
```

## Request flow (MVP)

```
Browser (React)
  ├─ localStorage  ← profile, farms, diagnoses, units
  └─ fetch ────────→ /api/diagnose  → demo pathology model
                   → /api/forecast  → demo risk model
```

## Planned production stack (lifecycle doc)

| Layer | Planned |
|-------|---------|
| Frontend | Next.js, TypeScript, Tailwind |
| Backend | FastAPI, Celery, Redis |
| Data | PostgreSQL + PostGIS, S3 |
| ML | YOLOv11, EfficientNet-B4, XGBoost, RAG recommendations |
| Integrations | OpenWeatherMap, Google Maps |

The MVP deliberately uses demo inference and local persistence so the farmer UX can be demonstrated without cloud credentials.
