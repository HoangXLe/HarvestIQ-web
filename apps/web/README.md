# @harvestiq/web

Farmer-facing HarvestIQ application (Next.js).

## Run

```bash
# from repo root (preferred)
npm run dev

# or from this folder
npm install
npm run dev
```

→ http://localhost:3000

## Source layout

```
src/
  app/                 # Route segments + API
  components/
    layout/            # Shell navigation
    ui/                # Shared presentational components
  lib/                 # Domain helpers and client store
```

See [`../../docs/`](../../docs/) for architecture and MVP notes.
