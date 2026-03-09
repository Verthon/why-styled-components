# Monorepo Structure

npm workspaces monorepo.

```
root/
├── package.json
├── packages/
│   └── core/               # core component library
└── apps/
    └── web/              # React Router v7 SSR app
```

## packages/ui

Local npm package (`@why/core`). Built with Vite in lib mode (esm). **Not published — consumed via workspace `"*"`.**

Key exports:
- `Box` — styled-components Box component
- `AppProviders` — wraps app with ThemeProvider + internal theme

styled-components `5.3.11` is a **direct dependency** (not peer) — intentional. The lib is self-contained and owns its own styled-components instance.

Build output: `dist/index.mjs` (esm)

## apps/web

React Router v7 framework mode with SSR. Entry files are ejected via `npx react-router reveal`:
- `app/entry.client.tsx` — hydration
- `app/entry.server.tsx` — renderToString + ServerStyleSheet

styled-components SSR sheet collection happens in `entry.server.tsx`.

## Dev Workflow

```bash
npm install           # from root
npm run build:ui      # build packages/ui first
npm run dev -w apps/web
```
