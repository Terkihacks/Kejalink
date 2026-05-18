# KejaLink — Architecture & Codebase Reference


Kenya's verified rental marketplace. Connects renters with pre-vetted agents in under 5 minutes.

---

## Table of Contents

1. [Tech Stack](#1-tech-stack)
2. [Project Structure](#2-project-structure)
3. [Routing & Page Layout](#3-routing--page-layout)
4. [Data & API Layer](#4-data--api-layer)
5. [State Management](#5-state-management)
6. [Performance Optimisations](#6-performance-optimisations)
7. [Design System](#7-design-system)
8. [Component Library](#8-component-library)
9. [Hooks Reference](#9-hooks-reference)
10. [Theming System](#10-theming-system)
11. [Build & Dev Workflow](#11-build--dev-workflow)
12. [Environment Variables](#12-environment-variables)
13. [Adding a New Feature](#13-adding-a-new-feature)

---

## 1. Tech Stack

| Concern | Library | Version | Notes |
|---|---|---|---|
| UI framework | React | 19 | StrictMode enabled |
| Language | TypeScript | 5.7 | Strict mode via `tsconfig.app.json` |
| Styling | Tailwind CSS | 4 | `@tailwindcss/vite` plugin — no postcss config |
| Build tool | Vite | 6 | ESNext target, source maps on |
| Routing | React Router | 7 | `BrowserRouter` + `<Routes>` |
| Server state | TanStack Query | 5 | Polling, caching, mutations |
| Icons | Lucide React | 0.564 | Outline, consistent stroke-width rules |
| Animation | tw-animate-css | — | `animate-in`, `zoom-in`, etc. |
| Class merging | clsx + tailwind-merge | — | via `cn()` utility |
| CVA | class-variance-authority | 0.7 | Button variant system |
| Package manager | pnpm | — | `pnpm-lock.yaml` is source of truth |

---

## 2. Project Structure

```
src/
├── App.tsx                   # Route tree — lazy loads request/status pages
├── main.tsx                  # Entry point — mounts QueryClientProvider + BrowserRouter
├── vite-env.d.ts             # Vite import.meta.env type reference
│
├── types/
│   └── index.ts              # Shared domain types (form data, API shapes)
│
├── lib/
│   ├── api.ts                # Typed fetch wrapper + ApiError class + isMockMode flag
│   └── utils.ts              # cn() — clsx + tailwind-merge
│
├── services/
│   └── requests.ts           # submitRequest · getRequest · getNotifications
│                             # Automatic mock fallback when VITE_API_BASE_URL is unset
│
├── hooks/
│   ├── index.ts              # Barrel re-exports
│   ├── useRequestQuery.ts    # TanStack Query hooks (submit, status, notifications)
│   ├── useTheme.ts           # Dark/light toggle + localStorage persistence
│   ├── useScrolled.ts        # Passive scroll listener — returns bool past threshold
│   └── useIsMobile.ts        # matchMedia listener — returns bool below 768 px
│
├── styles/
│   └── index.css             # All Tailwind tokens, design system, light mode overrides
│
├── features/
│   ├── home/
│   │   ├── index.ts          # Barrel
│   │   ├── HomePage.tsx      # Composes all home sections
│   │   ├── Hero.tsx          # Headline + CTAs + trust signals
│   │   ├── HowItWorks.tsx    # 3-step process cards
│   │   ├── TrustSection.tsx  # 4 social-proof stat cards
│   │   ├── BecomeAgent.tsx   # Agent signup section
│   │   └── FAQ.tsx           # Accordion FAQ
│   │
│   ├── request/
│   │   ├── index.ts          # Barrel
│   │   ├── RequestPage.tsx   # 5-step multi-screen form
│   │   └── constants.ts      # AREAS, HOUSE_TYPES, MOVE_TIMELINES, budget bounds
│   │
│   └── status/
│       ├── index.ts          # Barrel
│       └── StatusPage.tsx    # Live request tracking — polls API every 5 / 8 s
│
└── components/
    ├── Logo.tsx              # KejaLinkIcon · KejaLinkWordmark SVG components
    ├── layout/
    │   ├── index.ts
    │   ├── Navbar.tsx        # Sticky header, scroll-aware, mobile drawer
    │   └── Footer.tsx        # Links, contact, WhatsApp CTA
    └── ui/
        ├── index.ts
        ├── Button.tsx        # CVA-based button with variants
        ├── Input.tsx         # Styled text input
        ├── Slider.tsx        # Range slider (Radix-free)
        ├── Accordion.tsx     # Controlled accordion (used in FAQ)
        ├── ThemeToggle.tsx   # Sun/Moon icon button
        └── ErrorBoundary.tsx # Class-based error catcher
```

---

## 3. Routing & Page Layout

### Route Map

```
/                  → HomePage      (inside RootLayout — has Navbar + Footer)
/request           → RequestPage   (lazy, own sticky header)
/request/status    → StatusPage    (lazy, own sticky header)
```

### RootLayout

`Navbar` + `<Outlet />` + `Footer`. Only the home page uses this shell.
`RequestPage` and `StatusPage` render their own sticky progress/status headers
so they are mounted outside `RootLayout`.

### Lazy Loading

`RequestPage` and `StatusPage` are `React.lazy()`-wrapped in `App.tsx`.
Their JS chunks are only downloaded when the user navigates to those routes.
The initial page load only pulls the home page code.

```ts
// App.tsx
const RequestPage = lazy(() =>
  import('@/features/request').then(m => ({ default: m.RequestPage }))
)
```

The `.then(m => ({ default: m.X }))` adapter is necessary because `React.lazy`
requires a default export, while the features use named exports.

A `<Suspense fallback={<PageLoader />}>` wraps the entire `<Routes>` tree
so any lazy chunk shows a branded three-dot bounce loader while loading.

### Error Boundaries

Two `<ErrorBoundary>` instances are in place:

1. **Root** — wraps the entire `<Suspense>` tree. Catches any catastrophic
   render failure across the whole app.
2. **Per-route** — wraps `<RequestPage>` and `<StatusPage>` individually.
   A crash on `/request/status` cannot take down the home page.

---

## 4. Data & API Layer

### Overview

```
Component
  └── Hook (useSubmitRequest / useRequestStatus / useNotifications)
        └── Service (src/services/requests.ts)
              └── API client (src/lib/api.ts)
                    └── fetch() → VITE_API_BASE_URL/api/...
```

### `src/lib/api.ts` — Fetch Wrapper

A thin typed wrapper around `fetch`. All calls go through here.

```ts
export const api = {
  get:    <T>(path) => request<T>(path),
  post:   <T>(path, body) => request<T>(path, { method: 'POST', body: JSON.stringify(body) }),
  patch:  <T>(path, body) => request<T>(path, { method: 'PATCH', ... }),
  delete: <T>(path) => request<T>(path, { method: 'DELETE' }),
}
```

Non-2xx responses throw `ApiError(status, message, code?)`. Components can
catch this type to distinguish HTTP errors from network errors.

`isMockMode` is `true` when `VITE_API_BASE_URL` is not set in the environment.

### `src/services/requests.ts` — Service Layer

Three functions, each with a **real path** and a **mock fallback**:

| Function | Real endpoint | Mock behaviour |
|---|---|---|
| `submitRequest(input)` | `POST /api/requests` | Returns a seeded record after a 2 s delay |
| `getRequest(id)` | `GET /api/requests/:id` | Simulates `agentsReviewing` growing based on elapsed time |
| `getNotifications(id)` | `GET /api/requests/:id/notifications` | Drip-feeds 3 notifications at 6 s / 12 s / 18 s |

The mock fallback runs automatically when `isMockMode === true` — no code
changes needed to switch between mock and real backend. Set
`VITE_API_BASE_URL` in `.env.local` to activate the real API.

### `src/hooks/useRequestQuery.ts` — TanStack Query Hooks

```
useSubmitRequest()         — mutation, no polling
useRequestStatus(id)       — query, refetchInterval: 5 000 ms, staleTime: 4 000 ms
useNotifications(id)       — query, refetchInterval: 8 000 ms, staleTime: 7 000 ms
```

**`staleTime` is set just under `refetchInterval`** to prevent a double-fetch
when React StrictMode double-invokes effects. Data is considered fresh until
1 s before the next scheduled poll.

**`gcTime: 2 min`** means cached data survives for 2 minutes after the
component unmounts. A back-navigation to `/request/status` restores instantly
from cache rather than showing a skeleton.

### API Contract (backend must implement)

#### `POST /api/requests`

Request body (`HouseRequestInput`):
```json
{
  "areas":        ["Kilimani", "Westlands"],
  "maxBudget":    25000,
  "houseType":    "1br",
  "moveTimeline": "this-month",
  "phone":        "+254712345678"
}
```

Response (`RequestRecord`):
```json
{
  "id":                "req_abc123",
  "status":            "pending",
  "areas":             ["Kilimani"],
  "maxBudget":         25000,
  "houseType":         "1br",
  "houseTypeLabel":    "1 Bedroom",
  "moveTimeline":      "this-month",
  "moveTimelineLabel": "This Month",
  "phone":             "+254712345678",
  "agentsReviewing":   0,
  "createdAt":         "2026-03-23T10:00:00Z"
}
```

#### `GET /api/requests/:id`

Same `RequestRecord` shape, with `agentsReviewing` updated in real time.

#### `GET /api/requests/:id/notifications`

Array of `AgentNotification`:
```json
[
  {
    "id":      1,
    "type":    "agent_accepted",
    "title":   "Agent John accepted your request",
    "message": "...",
    "time":    "2 min ago",
    "avatar":  "J",
    "isNew":   true
  }
]
```

`type` must be one of: `agent_accepted` | `house_found` | `viewing_scheduled`

### Data Flow — Request Submission

```
RequestPage (form state)
  │
  └─ handleNext() on step 5
        │
        └─ submitRequest.mutate({ areas, maxBudget, houseType, moveTimeline, phone })
              │
              ├── isPending = true  →  loading screen renders
              │
              ├── onSuccess(record)
              │     └─ navigate('/request/status', { state: { requestId: record.id } })
              │
              └── isError  →  error banner renders with Retry button
```

### Data Flow — Status Page Polling

```
StatusPage mounts
  │
  ├─ reads requestId from useLocation().state
  │   (passed by RequestPage via React Router state on navigation)
  │
  ├─ useRequestStatus(requestId) — polls every 5 s
  │   └─ requestData.agentsReviewing → live counter + progress bar
  │
  └─ useNotifications(requestId) — polls every 8 s
      └─ notifications[] → agent response cards drip in as array grows
```

If `requestId` is `undefined` (user navigated directly to `/request/status`),
the hooks fall back to `'mock-req-001'` which the mock service always resolves.

---

## 5. State Management

### Philosophy

**No global store.** State lives as close to where it is used as possible:

| State type | Where it lives |
|---|---|
| Server data (agents, notifications) | TanStack Query cache |
| Form data (5-step wizard) | `useState` in `RequestPage` |
| Theme preference | `useTheme` hook + `localStorage` |
| Mobile nav open/closed | `useState` in `Navbar` |
| Scroll position (for nav shadow) | `useScrolled` hook |
| Viewport size | `useIsMobile` hook |

### RequestPage Form State

```ts
step          : 1–5  (which screen is shown)
selectedAreas : string[]  (multi-select area pills)
budget        : [number]  (Slider returns single-element array)
houseType     : string    (id from HOUSE_TYPES constant)
moveTimeline  : string    (id from MOVE_TIMELINES constant)
phone         : string    (digits only, no +254 prefix)
```

`isValid` (a `useMemo`) is derived from those fields based on the current
step — it drives the disabled state of the Continue / Submit button.

---

## 6. Performance Optimisations

### Code Splitting

`React.lazy` splits `RequestPage` and `StatusPage` into their own Rollup
chunks. The initial page load only ships the home page code.

Vite `manualChunks` creates named vendor bundles for independent caching:

| Chunk | Contents | ~gzip size |
|---|---|---|
| `react-vendor` | react + react-dom | 0.07 kB (Vite deduplicated) |
| `router` | react-router-dom | 16.8 kB |
| `query` | @tanstack/react-query | 10.9 kB |
| `icons` | lucide-react (tree-shaken) | 3.6 kB |
| `index` (app) | all product code | 74 kB |

A lucide icon update only busts the `icons` chunk. React upgrades only bust
`react-vendor`. User code changes never bust vendor caches.

### React.memo

`Card`, `InfoChip`, and `NotificationCard` in `StatusPage` are wrapped in
`React.memo`. The status page polls every 5–8 seconds, so these components
re-render frequently. Memoising them means they skip re-rendering unless
their specific props change, not just because the parent re-ran.

### useMemo

| Computed value | File | Dependencies |
|---|---|---|
| `newCount` (unread notifications) | StatusPage | `notifications` array |
| `isValid` (form step gate) | RequestPage | `step`, current step's field |

`isValid` is particularly important — without memoisation, every keystroke
in the phone field on step 5 would re-evaluate validation for all 5 steps.

### useCallback

`toggleArea` and `handleNext` in `RequestPage` are stable references across
renders. This prevents unnecessary re-renders of any child that accepts
these functions as props or uses them as `useEffect` dependencies.

### useTransition

Step navigation in `RequestPage` wraps `setStep` in `startTransition`.
React treats the step change as non-urgent — if the user is typing or
tapping when the transition fires, their input is processed first.

### TanStack Query — Polling Efficiency

`staleTime` is set 1 s below `refetchInterval` for each query:
- Status: `staleTime: 4_000`, `refetchInterval: 5_000`
- Notifications: `staleTime: 7_000`, `refetchInterval: 8_000`

This prevents the StrictMode double-invoke (which mounts → unmounts →
remounts components) from triggering two back-to-back fetches.

`placeholderData: (prev) => prev` on the notifications query means the UI
never flickers to empty between polls — the previous data stays visible
while the next fetch is in flight.

---

## 7. Design System

### Brand Philosophy

> "Purpose-serving, not AI-ish"

Colors are warm and organic (savanna/earth tones) rather than the cold
blue-shifted palette common in AI/fintech products.

### Color Tokens

| Token | Value | WCAG on dark BG | Usage rule |
|---|---|---|---|
| `--primary` (dark) | `#00CE92` | 5.05:1 ✓ AA | All CTAs, active states, verified badges, key data |
| `--primary` (light) | `#007A52` | ~5.0:1 ✓ AA | Same role, adjusted for light BG |
| `--teal` | `#00897B` | 1.93:1 ✗ FAIL | **Structure/fill only** — chip BGs, borders, icon containers. NEVER text |
| `--accent` | `#00E5FF` | — | Availability dots, live indicators only — keep minimal |
| `--gold` / `--amber` | `#F5A623` | 8.20:1 ✓ AAA | Agent CTA, urgency, ratings |
| `--whatsapp` | `#25D366` | — | WhatsApp buttons only — fixed brand colour |
| `--background` | `#0A0F1E` | — | Page background (deep navy) |
| `--card` | `#141C1A` | — | Card surface (warm teal-dark) |
| `--foreground` | `#E8E6E1` | 16:1 ✓ AAA | Primary text (warm parchment) |
| `--muted-foreground` | `#7A7873` | — | Secondary text, labels, icons |

### Surface Elevation

```
Background  #0A0F1E  (deepest — page bg)
Card        #141C1A  (base surface — most cards)
Secondary   #1E2725  (elevated — selected state BG, info chips)
Popover     #181F1D  (modals, dropdowns)
Surface3    #1E2725  (drawers, bottom sheets)
```

All surfaces have a warm bias (green channel > blue channel) so they feel
organic rather than cold.

### Typography

| Token | Font | Weights | Used for |
|---|---|---|---|
| `font-display` | Plus Jakarta Sans | 600–800 | H1–H3, hero copy, brand wordmark, key numbers |
| `font-sans` | Inter | 400–700 | Body text, UI chrome, form labels, badges |

Both fonts are loaded via Google Fonts `<link>` in `index.html`.

**Number formatting rules:**
- `tabular-nums` only on **animating** numbers (budget slider) or **stacked** price lists — never on static stats
- Display numbers (KES amounts, stat figures): `font-display`, `tracking-[-0.015em]`
- KES label: `text-xs uppercase tracking-widest text-muted-foreground`, above the number

### Icon System

| Context | Container | Icon | Shape | strokeWidth |
|---|---|---|---|---|
| Section feature cards | `h-12 w-12` | `h-6 w-6` | `rounded-xl` | 2 |
| Step form headings | `h-12 w-12` | `h-6 w-6` | `rounded-xl` | 2 |
| Utility cards (time, share) | `h-11 w-11` | `h-5 w-5` | `rounded-xl` | 2 |
| Trust / reassurance badges | `h-8 w-8` | `h-4 w-4` | `rounded-lg` | 1.5 |
| Communication (WhatsApp, push) | `h-12 w-12` | `h-6 w-6` | `rounded-full` | 2 |
| Avatars / success state | varies | — | `rounded-full` | — |
| Inline with text (h-4 = 16 px) | none | `h-4 w-4` | — | 1.5 |
| Navigation chrome (h-5 = 20 px) | `h-11 w-11` touch zone | `h-5 w-5` | — | 2 |
| CTA button trailing arrow | none | `h-4 w-4` | — | 1.5 |

**Container ratio rule:** icon always occupies exactly 50% of the container
dimension (`h-6 w-6` in `h-12 w-12`). This is the "premium" ratio used by
Airbnb, Linear, and Stripe.

**Shape rule:** `rounded-xl` for feature/content contexts; `rounded-full`
only for avatar-like and communication (messaging) contexts.

**Color rule:** one accent color per card. Use `text-primary` for the
primary icon in a section; `text-muted-foreground` for label-companion
icons that carry no semantic meaning of their own.

---

## 8. Component Library

### `Button`

CVA-based button with `variant` and `size` props.
Variants: `default` (primary) · `secondary` · `outline` · `ghost` · `link`
Sizes: `default` · `sm` · `lg` · `icon` (44 × 44 px touch target)

### `Input`

Styled `<input>` with focus ring and dark/light mode support.
Use `className` overrides for field-specific adjustments.

### `Slider`

Range slider built on the native `<input type="range">`, extended to match
the Radix-style `value` / `onValueChange` array API so it feels like
`@radix-ui/react-slider` without the dependency.

The `defaultValue` override in the `Omit<>` type ensures TypeScript doesn't
conflict between the native string API and the number-array component API.

### `Accordion`

Controlled accordion. `openItems: string[]` is managed externally.
Used in `FAQ.tsx` with `AccordionItem`, `AccordionTrigger`, `AccordionContent`.

### `ThemeToggle`

Icon button: **Sun** in dark mode (switch to light), **Moon** in light mode.
Reads/writes `useTheme` hook. `h-4 w-4` icons at `strokeWidth={1.5}`.

### `ErrorBoundary`

Class component (required — hooks cannot catch render errors).
- `getDerivedStateFromError` captures the error into state
- `componentDidCatch` logs to console (swap for Sentry/Datadog)
- Renders a branded recovery UI with a "Try again" reset button
- Accepts an optional `fallback` render prop for custom error UIs

---

## 9. Hooks Reference

### `useTheme()`

```ts
const { theme, toggleTheme } = useTheme()
// theme: 'dark' | 'light'
// toggleTheme: () => void
```

Reads `localStorage('keja-theme')` on init. Applies/removes the `.light`
class on `<html>`. A blocking inline script in `index.html` applies the
class *before* React hydrates to prevent flash of wrong theme.

### `useScrolled(threshold = 8)`

```ts
const scrolled = useScrolled()  // true once Y > 8 px
```

Passive scroll listener — never blocks the main thread. Used by `Navbar`
to add the border + blur shadow once the user starts scrolling.

### `useIsMobile()`

```ts
const isMobile = useIsMobile()  // true below 768 px
```

Uses `window.matchMedia` — no `resize` polling. Initialises synchronously
on mount so there is no flash of incorrect layout.

### `useSubmitRequest()`

TanStack Query mutation. Returns `{ mutate, isPending, isError, reset }`.
Calls `submitRequest()` from the service layer.

### `useRequestStatus(id)`

```ts
const { data: requestData } = useRequestStatus(requestId)
```

Polls `getRequest(id)` every 5 seconds. `data` is `RequestRecord | undefined`.
Query is disabled when `id` is falsy.

### `useNotifications(id)`

```ts
const { data: notifications = [] } = useNotifications(requestId)
```

Polls `getNotifications(id)` every 8 seconds. Returns `AgentNotification[]`.
Uses `placeholderData` to keep the previous array visible between polls.

---

## 10. Theming System

### Architecture

Tailwind CSS v4 with a **dark-first** strategy:

```
:root { }              ← dark mode tokens (always loaded)
html.light { }         ← light mode overrides (applied by useTheme)
@theme inline { }      ← maps CSS vars → Tailwind color utilities
```

The `.light` class is toggled on `<html>` by `useTheme`. This means
every Tailwind utility like `bg-background` or `text-primary` automatically
picks up the correct value for the active mode.

### Flash Prevention

`index.html` contains a synchronous inline script that runs before React
boots. It reads `localStorage('keja-theme')` and applies `.light` to
`<html>` immediately if needed. Without this, there is a flash of dark
mode even if the user prefers light.

### Token Hierarchy

```
CSS custom properties (:root / html.light)
       ↓
@theme inline mapping (CSS var → Tailwind token)
       ↓
Tailwind utility classes (bg-primary, text-foreground, etc.)
       ↓
Component className props
```

Never hardcode hex colors in component files. Always use a token.

---

## 11. Build & Dev Workflow

### Scripts

```bash
pnpm dev          # Vite dev server (HMR)
pnpm build        # tsc type-check → vite build → dist/
pnpm preview      # Serve dist/ locally
pnpm typecheck    # tsc --noEmit only (no build)
```

### Build Output

```
dist/assets/react-vendor-*.js   # React + ReactDOM
dist/assets/router-*.js         # React Router
dist/assets/query-*.js          # TanStack Query
dist/assets/icons-*.js          # Lucide React (tree-shaken)
dist/assets/index-*.js          # Home page + shared code
dist/assets/index-*.js (×2)     # RequestPage chunk · StatusPage chunk
dist/assets/index-*.css         # All Tailwind styles
```

### Path Alias

`@/` resolves to `src/` in both Vite (`vite.config.ts`) and TypeScript
(`tsconfig.app.json`). Always prefer `@/...` over relative `../../` paths.

### No PostCSS Config

`@tailwindcss/vite` handles CSS processing directly as a Vite plugin.
There is no `postcss.config.mjs`. Do not create one — it will conflict.

---

## 12. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Base URL of the backend API (e.g. `https://api.kejalink.co.ke`). Omit to run in mock mode. |

All `VITE_` prefixed variables are inlined at build time by Vite and
accessible via `import.meta.env.VITE_*`.

**Mock mode** is active when `VITE_API_BASE_URL` is empty or absent.
All three API functions return realistic fake data with simulated delays
and a timed notification drip-feed. The UI is fully functional without
a backend.

---

## 13. Adding a New Feature

### New home page section

1. Create `src/features/home/MySection.tsx`
2. Export from `src/features/home/index.ts`
3. Import and place in `src/features/home/HomePage.tsx`

### New route

1. Create feature folder: `src/features/my-page/`
2. Add `lazy(() => import('@/features/my-page')...)` in `App.tsx`
3. Wrap in `<ErrorBoundary>` in the route element
4. Add the route inside `<Suspense>` in `App.tsx`

### New API resource

1. Add types to `src/types/index.ts`
2. Add service functions to `src/services/` (new file or existing)
   - Always implement a mock branch guarded by `if (isMockMode)`
3. Add TanStack Query hooks to `src/hooks/useRequestQuery.ts`
   - Use `useQuery` for reads (set `refetchInterval` if real-time)
   - Use `useMutation` for writes
4. Export from `src/hooks/index.ts`

### New UI component

1. Create `src/components/ui/MyComponent.tsx`
2. Export from `src/components/ui/index.ts`
3. Follow icon system rules (see §7) and use `cn()` for class merging
4. Wrap with `React.memo` if it is a pure display component used in lists

---

*Last updated: 2026-03-23 · KejaLink v1.0.0 · Nguvu Group*
