# Development

## Prerequisites

- Node.js 20+ (22 recommended)
- npm 10+

## Run the farmer app

From the repository root:

```bash
npm install
npm run dev
```

Or from the app folder:

```bash
cd apps/web
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start Next.js with Turbopack |
| `npm run build` | Production build |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint |

## Persistence

Workspace data is stored under `localStorage` keys prefixed with `harvestiq:`:

- `harvestiq:profile`
- `harvestiq:farms`
- `harvestiq:diagnoses`
- `harvestiq:units`

Clear via **Settings → Clear data**.

## Prototype

The earlier single-page HTML prototype lives at:

`prototypes/field-diagnostics.html`

Open it directly in a browser; it does not require the Next.js server.
