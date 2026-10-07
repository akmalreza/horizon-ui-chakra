# AGENTS.md

Persistent project context for AI coding agents. Command Code loads this file into
every turn, so keep it to standing rules and pointers — not a changelog.

## Project Overview

Point-of-sale (POS) client frontend. It is built on top of the **Horizon UI Chakra**
admin template (package name `horizon-ui-chakra`), which means a lot of the tree is
still unused template scaffolding (NFT marketplace, RTL demo, profile pages, charts).
Treat Horizon demo code as removable/replaceable, not as sacred product code.

## Commands

Create React App (`react-scripts`) — **not** Vite, **not** TypeScript.

| Task | Command |
| ---- | ------- |
| Dev server | `npm start` (serve at http://localhost:3000) |
| Production build | `npm run build` |
| Tests | `npm test` (CRA jest) |

There is no `lint` or `typecheck` script. ESLint runs through `react-scripts` using
`eslintConfig.extends: ["react-app", "react-app/jest"]` in `package.json`. Prettier is
configured in `prettier.config.js` (`singleQuote: true`, `trailingComma: 'all'`).

## Tech Stack

- **React 18.0.0** + **react-dom 18.0.0**. Do not bump to React 19 — the README/CHANGELOG
  say 3.0.0/React 19, but `package.json` was deliberately pinned back to React 18 because
  **Chakra UI 2.6.1 targets React 18**. The README is stale.
- **Chakra UI** `@chakra-ui/react` 2.6.1 (+ icons, system, theme-tools) with `@emotion/*`.
- **React Router** v6 (`react-router-dom` ^6.25).
- **TanStack Table** v8 (`@tanstack/react-table`) for data tables.
- **ApexCharts** via `react-apexcharts`; chart data/options live in `src/variables/charts.js`.
- `framer-motion`, `react-icons`, `react-calendar`, `react-dropzone`,
  `react-custom-scrollbars-2`, `stylis` + `stylis-plugin-rtl` (RTL support).
- JS only (`jsconfig.json`: `baseUrl: "src"`). No `.ts`/`.tsx`.

## Project Structure

```
src/
├── index.js            # ReactDOM root, wraps App in BrowserRouter
├── App.js              # ChakraProvider + top-level <Routes> per layout prefix
├── routes.js           # SINGLE source of truth for the nav/route table
├── assets/             # css/ and img/ (images imported as modules)
├── components/         # reusable UI: sidebar, navbar, card, charts, menu, fields, ...
│   └── routeGuards/    # RequireAuth — redirects unauthenticated users
├── contexts/           # AuthContext.js (AuthProvider + useAuth), SidebarContext.js
├── layouts/            # admin/, auth/, app/, rtl/ — the app chrome per area
├── lib/                # apiClient.js, authService.js, authStorage.js
├── theme/              # Chakra theme: components/, additions/, foundations/, styles.js
├── variables/          # charts.js (ApexCharts config)
└── views/              # pages, grouped by area: admin/, auth/, app/
```

## Routing & Layouts — read this before adding a page

Routing is two-layered and has non-obvious coupling:

1. `src/routes.js` exports an array of route objects
   `{ name, layout, path, icon, component, secondary? }`. `layout` is a string key
   (`'/admin'`, `'/auth'`, `'/rtl'`, or `'/app'`).
2. `src/App.js` maps each **layout prefix** to a layout component:
   `auth/* -> AuthLayout`, `admin/* -> AdminLayout`, `app/* -> AppLayout`,
   `rtl/* -> RTLLayout`; `/` redirects to `/app`. The `app/*` route is wrapped in
   `<RequireAuth>` (a pathless guard route), so unauthenticated visitors are redirected
   to `/auth/sign-in`.
3. Each `src/layouts/<area>/index.js` filters `routes` by its own `layout` value inside a
   `getRoutes()` helper and renders a nested `<Routes>`.

**To add a page you must touch three places**, or it silently renders nothing:
1. Add the route object in `src/routes.js`.
2. Ensure the target layout's `getRoutes()` has a branch for that route's `layout` value
   (e.g. the App layout adds `route.layout === '/app'`).
3. Add/extend the top-level `<Route>` in `src/App.js` if it's a new area.

Gotchas:
- `src/components/sidebar/components/Links.js` only renders items whose `layout` is
  `'/admin'`, `'/auth'`, or `'/rtl'`. Routes with `layout: '/app'` (the POS home) do
  **not** appear in the sidebar — add a branch there if you want them shown.
- Layouts mutate `document.documentElement.dir` (`ltr`/`rtl`) as a side effect.

## Auth & the `/app` area

- Backend contract lives in `docs/postman_collection.json`: `POST /api/auth/login`
  (`{ email, password }` → `{ token, expires_at, user }`), then Bearer JWT on everything
  else; `GET /api/users/me` validates the token. There is no refresh endpoint, and
  store-scoped calls return `403` when the user has no store assignment — that is **not**
  an auth failure, so don't log the user out on it.
- `src/lib/apiClient.js` is the fetch wrapper: base URL from `REACT_APP_API_BASE_URL`
  (fallback `http://localhost:8080`), sends JSON + `Authorization: Bearer`, throws
  `ApiError` carrying `.status`, and invokes the registered 401 handler. Use `api.get`,
  `api.post`, `api.patch`.
- `src/lib/authStorage.js` persists `{ token, expires_at, user }` in `localStorage` under
  the single key `pos.auth` and discards expired sessions. `src/lib/authService.js` wraps
  `login()` and `fetchMe()`.
- `src/contexts/AuthContext.js` exports `AuthProvider` (mounted once in `App.js`, wrapping
  `<Routes>`) and `useAuth()`. It exposes `{ user, token, status, isAuthenticated, error,
  login, logout, refetch }`, where `status` is `'loading' | 'authenticated' |
  'unauthenticated'`.
- `src/components/routeGuards/RequireAuth.js` guards `app/*`: spinner while `loading`,
  redirect to `/auth/sign-in` when unauthenticated, `<Outlet/>` otherwise.
- `src/views/auth/signIn/index.jsx` calls `login()`; on success it navigates to `/app` (or
  back to the `from` location RequireAuth stashed). Logout is wired to the navbar avatar
  menu in `components/navbar/NavbarLinksAdmin.js`.
- `src/views/app/index.jsx` (`AppHome`) is still the admin `dataTables` placeholder — the
  real POS feature pages are not built yet.

## Styling & Theme

- Chakra theme is assembled in `src/theme/theme.js` from `src/theme/components/*`,
  `additions/`, `foundations/`, plus global styles in `src/theme/styles.js`.
- Custom palette tokens: `brand`, `brandScheme`, `brandTabs`, `secondaryGray`, `navy`
  (plus `red/blue/orange/green`). Use these, not raw hex, where possible.
- Light/dark handled with `useColorModeValue('lightVal', 'darkVal')`. Global font is
  `DM Sans`. Prefer `mode(...)` from `@chakra-ui/theme-tools` inside theme files.
- Reusable primitives: `components/card/Card.js` for panels, `components/charts/*` for
  ApexCharts wrappers, `components/separator/Separator` (`HSeparator`).
- RTL is supported via `layouts/rtl` + `components/rtlProvider`.

## Conventions

- **Absolute imports from `src`** (via `baseUrl`): `import Card from 'components/card/Card'`,
  `contexts/...`, `views/...`, `assets/...`. Follow this; don't use long relative paths.
- Function components with `export default function Name()`; one component per file.
  `PropTypes` is used in parts of the codebase — match the file you're editing.
- File extensions are mixed (`.js`, `.jsx`); imports usually omit the extension.
- **Do not add comments** unless the logic is genuinely non-obvious.
- When editing, prefer running Prettier so single quotes / trailing commas stay consistent
  (some template files still use double quotes and tabs, e.g. `components/navbar/NavbarAdmin.js`).
- No test files or `setupTests` exist yet; adding tests means setting these up.

## Gotchas

- `react-scripts` is not ejected — there is no `config/` to edit, and no TS.
- `package-lock.json` is listed in `.gitignore` and is **not tracked**. Do not rely on it
  in commits.
- `.env` sets `GENERATE_SOURCEMAP=false` and `REACT_APP_API_BASE_URL`. CRA only exposes
  env vars prefixed `REACT_APP_` to the browser. `process.env.PUBLIC_URL` is used in some
  navbar links.
- Several template files carry `/* eslint-disable */` and a stray `'use client'` directive
  (copied from a Next.js origin) — these are inert under CRA; don't propagate them.
- The tree contains unused Horizon demo routes/pages; removing them is fine, but keep
  `routes.js` and each layout's `getRoutes()` in sync.

## Validation Before Finishing

- `npm run build` to catch import/compile errors (there is no separate typecheck).
- `npm test` if tests exist / are added.
- Sanity-check routing changes in the browser at `npm start`, since a missing `layout`
  branch fails silently instead of erroring.
