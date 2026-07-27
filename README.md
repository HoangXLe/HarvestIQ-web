# HarvestIQ

**AI-assisted crop disease detection and 7-day outbreak risk for small and medium farms.**

HarvestIQ helps growers photograph a leaf, get a screening result with confidence and treatment guidance, estimate near-term disease pressure from field conditions, and find nearby agronomic support — without requiring expensive IoT hardware.

> Course context: AIML-510 — Responsible Applications of AI (July 2026)

---

## Quick start

```bash
# from repository root
npm install
npm run dev
```

Open **http://localhost:3000**

| Command | Purpose |
|---------|---------|
| `npm run dev` | Development server (Turbopack) |
| `npm run build` | Production build |
| `npm run start` | Run production build |
| `npm run lint` | Lint the web app |

---

## Project structure

```
HarvestIQ/
├── apps/
│   └── web/                    # Next.js farmer application
│       ├── src/
│       │   ├── app/            # Pages & API routes
│       │   │   ├── api/        # /api/diagnose, /api/forecast
│       │   │   ├── diagnose/
│       │   │   ├── farms/
│       │   │   ├── reports/
│       │   │   ├── resources/
│       │   │   └── settings/
│       │   ├── components/
│       │   │   ├── layout/     # AppShell, Sidebar
│       │   │   └── ui/         # Shared UI primitives
│       │   └── lib/            # Types, storage, validation, AI, store
│       ├── public/
│       └── package.json
├── docs/                       # Architecture, MVP map, development notes
├── prototypes/                 # Single-file HTML Field Diagnostics prototype
├── package.json                # Root workspace scripts
└── README.md
```

---

## Features

| Area | What growers get |
|------|------------------|
| **Dashboard** | Farms tracked, diagnoses, confidence, high-risk alerts, activity charts |
| **My Farms** | Add / edit / remove field profiles (crop, acreage, location) |
| **Diagnose** | 4-step flow: select field → upload → classify → risk forecast |
| **Reports** | Saved history with expandable detail and farm filters |
| **Resources** | Google Maps search for agronomists, extension, supply, mechanics |
| **Settings** | Profile, metric/imperial units, clear local workspace |

Form validation, loading and error states, mobile layout, and local persistence (survives refresh) are built into the web app.

---

## Tech stack

| Layer | Choice |
|-------|--------|
| Framework | Next.js 15 (App Router) |
| Language | TypeScript |
| UI | Tailwind CSS 4 + HarvestIQ design tokens |
| State / persistence | React context + `localStorage` |
| Inference (MVP) | Demo pathology & risk models via API routes |

Full lifecycle plan (FastAPI, PostgreSQL, YOLO/EfficientNet/XGBoost, OpenWeather) is documented under [`docs/`](./docs/). This repository ships the **farmer-facing MVP** that matches the validated prototype scope.

---

## Documentation

- [Architecture](./docs/architecture.md) — structure and data flow  
- [MVP features](./docs/mvp-features.md) — planned vs implemented  
- [Development](./docs/development.md) — setup and workflows  
- [Web app notes](./apps/web/README.md) — app-specific readme  

---

## Prototype

An earlier single-page recreation of the Field Diagnostics UI:

```text
prototypes/field-diagnostics.html
```

Open that file in a browser to explore the original SPA without Node.

---

## Disclaimer

HarvestIQ is an AI-assisted **screening and decision-support** tool. Outputs are not a certified agronomic diagnosis. Confirm high-risk cases with a qualified professional before treatment.

---

## License

Private / course project — all rights reserved unless otherwise stated.
