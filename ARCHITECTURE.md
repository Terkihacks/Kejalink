# KejaLink - Architecture & Codebase Reference


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
| Styling | Tailwind CSS | 4 | `@tailwindcss/vite` plugin - no postcss config |
| Build tool | Vite | 6 | ESNext target, source maps on |
| Routing | React Router | 7 | `BrowserRouter` + `<Routes>` |
| Server state | TanStack Query | 5 | Polling, caching, mutations |
| Icons | Lucide React | 0.564 | Outline, consistent stroke-width rules |
| Animation | tw-animate-css | - | `animate-in`, `zoom-in`, etc. |
| Class merging | clsx + tailwind-merge | - | via `cn()` utility |
| CVA | class-variance-authority | 0.7 | Button variant system |
| Package manager | pnpm | - | `pnpm-lock.yaml` is source of truth |

---

## 2. Project Structure

```
src/
├── App.tsx                   # Route tree - lazy loads request/status/agent/admin pages
├── main.tsx                  # Entry point - mounts QueryClientProvider + BrowserRouter
├── vite-env.d.ts             # Vite import.meta.env type reference
│
├── types/
│   └── index.ts              # Cross-feature domain types (request/result/match shapes)
│
├── lib/
│   ├── api.ts                # Typed fetch wrapper - envelope unwrap, bearer auth, 401 refresh-retry
│   ├── auth-storage.ts       # Per-role session persistence (renter/agent/admin), localStorage
│   ├── error-messages.ts     # ERROR_MESSAGES code table + getErrorMessage()
│   ├── magic-link.ts         # extractMagicLinkToken() - parses /results/:token from a magicLink URL
│   ├── constants.ts          # AREAS - shared between the request form and agent apply form
│   └── utils.ts              # cn() - clsx + tailwind-merge
│
├── services/
│   ├── requests.ts           # createRequest - POST /requests (authenticated renter)
│   ├── results.ts            # getResultsByToken - GET /results/:token (public magic link)
│   ├── renterAuth.ts         # request-otp / verify-otp / logout for RENTER
│   ├── agentAuth.ts          # request-otp / verify-otp (+ hasProfile) / logout for AGENT
│   ├── agents.ts             # agent profile (apply/me/patch) + leads (list/accept/decline)
│   ├── adminAuth.ts          # login / verify-2fa / setup-2fa / disable-2fa for ADMIN
│   └── admin.ts              # agents (list/get/suspend/unsuspend), appeals, verifications
│                             # Every function ships an `if (isMockMode)` branch - the app
│                             # stays fully demoable without a backend running.
│
├── hooks/
│   ├── index.ts              # Barrel re-exports
│   ├── useAuthSession.ts     # Reads a stored session, reacts to login/logout events
│   ├── useRequestQuery.ts    # useCreateRequest
│   ├── useResultsQuery.ts    # useRequestResults - polls GET /results/:token every 5s
│   ├── useRenterAuth.ts      # useRequestRenterOtp / useVerifyRenterOtp
│   ├── useAgentAuth.ts       # useRequestAgentOtp / useVerifyAgentOtp
│   ├── useAgentQuery.ts      # profile, apply/update, leads (poll 15s), accept/decline
│   ├── useAdminAuth.ts       # useAdminLogin / useVerifyAdmin2fa
│   ├── useAdminQuery.ts      # agents, suspend/unsuspend, appeals, verifications
│   ├── useTheme.ts           # Dark/light toggle + localStorage persistence
│   ├── useScrolled.ts        # Passive scroll listener - returns bool past threshold
│   └── useIsMobile.ts        # matchMedia listener - returns bool below 768 px
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
│   │   ├── BecomeAgent.tsx   # Agent signup section - CTA routes to /agent/login
│   │   └── FAQ.tsx           # Accordion FAQ
│   │
│   ├── request/
│   │   ├── index.ts          # Barrel
│   │   ├── RequestPage.tsx   # 5-step form; step 5 does inline phone→OTP→submit
│   │   └── constants.ts      # HOUSE_TYPES, BEDROOMS_BY_HOUSE_TYPE, MOVE_TIMELINES, budget bounds
│   │
│   ├── status/
│   │   ├── index.ts          # Barrel
│   │   └── StatusPage.tsx    # Public /results/:token - matches feed, polls every 5s
│   │
│   ├── agent/
│   │   ├── index.ts          # Barrel
│   │   ├── AgentLayout.tsx   # Slim internal-tool shell (logo + name + logout)
│   │   ├── AgentLoginPage.tsx     # Phone/OTP → routes to apply or dashboard
│   │   ├── AgentApplyPage.tsx     # One-time profile submission
│   │   ├── AgentDashboardPage.tsx # Leads list, accept/decline
│   │   ├── types.ts          # AgentProfile, AgentLead, VerificationStatus, etc.
│   │   └── constants.ts      # PROPERTY_TYPES (no backend enum - curated list)
│   │
│   └── admin/
│       ├── index.ts          # Barrel
│       ├── AdminLayout.tsx           # Internal shell with nav tabs
│       ├── AdminLoginPage.tsx        # Email/password → TOTP two-phase
│       ├── VerificationsQueuePage.tsx
│       ├── VerificationDetailPage.tsx # Approve checklist / reject-with-reason
│       ├── AdminAgentsListPage.tsx    # Search/filter
│       ├── AdminAgentDetailPage.tsx   # Suspend/unsuspend + history
│       ├── AdminAppealsPage.tsx      # Escalate (ADMIN) / resolve (SUPER_ADMIN only)
│       └── types.ts
│
└── components/
    ├── Logo.tsx              # KejaLinkIcon · KejaLinkWordmark SVG components
    ├── RequireAuth.tsx       # Route guard - session presence/role check, redirects to login
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
/                         → HomePage                (RootLayout - Navbar + Footer)
/request                  → RequestPage              (lazy, own sticky header)
/results/:token           → StatusPage               (lazy, own header, PUBLIC magic link)

/agent/login              → AgentLoginPage           (lazy, own header, unauthenticated)
/agent/apply              → AgentApplyPage            (lazy, AgentLayout, guarded: agent)
/agent/dashboard          → AgentDashboardPage        (lazy, AgentLayout, guarded: agent)

/admin/login              → AdminLoginPage            (lazy, own header, unauthenticated)
/admin/verifications      → VerificationsQueuePage    (lazy, AdminLayout, guarded: admin)
/admin/verifications/:id  → VerificationDetailPage    (lazy, AdminLayout, guarded: admin)
/admin/agents             → AdminAgentsListPage       (lazy, AdminLayout, guarded: admin)
/admin/agents/:id         → AdminAgentDetailPage      (lazy, AdminLayout, guarded: admin)
/admin/appeals            → AdminAppealsPage          (lazy, AdminLayout, guarded: admin;
                                                        resolve action further gated to SUPER_ADMIN)
```

`/request/status` (the old mock-era route) no longer exists - the status
page is reached only via the `magicLink` token returned by `POST /requests`.

### RootLayout vs. feature-owned shells

`RootLayout` (`Navbar` + `<Outlet />` + `Footer`) is used only by the home
page. `RequestPage`/`StatusPage` render their own sticky progress/status
headers. `AgentLayout`/`AdminLayout` are separate internal-tool shells (logo
+ session-aware name/logout, no public Navbar/Footer) - these are workspaces
for authenticated agents/admins, not marketing pages.

### Route Guards

`src/components/RequireAuth.tsx` wraps every `/agent/*` and `/admin/*` route
(except the login pages themselves):

```tsx
<RequireAuth kind="agent" roles={['AGENT']}>
  <AgentDashboardPage />
</RequireAuth>
```

It only checks whether a session is *present* (and matches an optional
`roles` allow-list) - it does not decode or check JWT expiry client-side.
Expiry is handled transparently by `api.ts`'s refresh-and-retry (see §4);
if a refresh ultimately fails, the session is cleared and the next guarded
navigation redirects to `/${kind}/login`.

### Lazy Loading

Every route past the home page is `React.lazy()`-wrapped in `App.tsx`.
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

An `<ErrorBoundary>` wraps the entire `<Suspense>` tree (catches any
catastrophic render failure across the whole app), plus one per top-level
route/layout group (`RequestPage`, `StatusPage`, `AgentLayout`,
`AdminLayout`, and the two standalone login pages) so a crash in one
section can't take down the rest of the app.

---

## 4. Data & API Layer

### Overview

```
Component
  └── Hook (useCreateRequest / useRequestResults / useAgentLeads / ...)
        └── Service (src/services/*.ts)
              └── API client (src/lib/api.ts)
                    └── fetch() → VITE_API_BASE_URL/...
```

### Response Envelope

The real backend wraps every response (except `/health`, which is flat):

```json
// success
{ "success": true, "data": { /* endpoint-specific payload */ } }

// error
{ "success": false, "code": "SOME_ERROR_CODE", "message": "...", "statusCode": 400 }
```

`message` is a string for domain errors, or an array of strings for
class-validator request-validation errors.

### `src/lib/api.ts` - Fetch Wrapper

All calls go through here. Same call-site shape as before, plus an optional
trailing `auth` argument naming which stored session to attach:

```ts
export const api = {
  get:    <T>(path, auth?: SessionKind) => request<T>(path, { auth }),
  post:   <T>(path, body, auth?: SessionKind) => request<T>(path, { method: 'POST',  body: JSON.stringify(body), auth }),
  patch:  <T>(path, body, auth?: SessionKind) => request<T>(path, { method: 'PATCH', body: JSON.stringify(body), auth }),
  delete: <T>(path, auth?: SessionKind) => request<T>(path, { method: 'DELETE', auth }),
  health: () => request<{ status; timestamp; checks }>('/health'),
}
```

Internally, `request<T>`:
- Attaches `Authorization: Bearer <accessToken>` when `auth` is given and a
  session exists for that kind (see `auth-storage.ts` below).
- Unwraps `{ success: true, data }` → returns `data` directly. On
  `{ success: false, ... }` (or non-2xx), joins array `message`s and throws
  the existing `ApiError(status, message, code?)` - call sites are
  unaffected by the envelope change.
- On a `401` with `auth` set (and not already retried): calls
  `POST /auth/${auth}/refresh` with the stored `refreshToken`, updates the
  session on success, and retries the original request **once**. If refresh
  fails, clears the session and throws - the next guarded navigation
  (`RequireAuth`) redirects to that role's login.
- `/health` is special-cased to skip envelope unwrapping (it returns a flat
  body for uptime/infra tooling).

`isMockMode` is `true` when `VITE_API_BASE_URL` is not set. **Every service
function below ships its own `if (isMockMode)` branch that bypasses
`api.ts` entirely** - the app stays fully demoable without a backend.

### `src/lib/auth-storage.ts` - Session Persistence

One localStorage key per session kind - `keja-auth-renter`,
`keja-auth-agent`, `keja-auth-admin` - so a renter/agent/admin session can
coexist in the same browser (useful across dev tabs). Mirrors the
lazy-`useState` + write-on-change pattern `useTheme` already uses, applied
to a JSON blob:

```ts
export function getSession(kind: SessionKind): AuthSession | null
export function setSession(kind: SessionKind, session: AuthSession): void   // dispatches 'keja-auth-change'
export function clearSession(kind: SessionKind): void                       // dispatches 'keja-auth-change'
```

No JWT decoding happens client-side - `verify-otp`/`verify-2fa` responses
already include `user.role`, which is stored directly. `useAuthSession(kind)`
wraps `getSession` in state and re-renders on the `keja-auth-change` event.

### Service Layer

| File | Endpoints | Notes |
|---|---|---|
| `renterAuth.ts` | `POST /auth/renter/{request-otp,verify-otp,logout}` | Mock: code `123456` always verifies |
| `requests.ts` | `POST /requests` | Requires renter auth; phone comes from the JWT, not the body |
| `results.ts` | `GET /results/:token` | Public - no `auth` kind passed |
| `agentAuth.ts` | `POST /auth/agent/{request-otp,verify-otp,logout}` | `verify-otp` also returns `hasProfile`; logout has **no** header fallback (body-only) |
| `agents.ts` | `POST /agents/apply`, `PATCH /agents/me`, `GET /agents/me`, `GET /agents/leads`, `POST /agents/leads/:id/{accept,decline}` | `getMyAgentProfile()` catches a `404` and returns `null` instead of throwing |
| `adminAuth.ts` | `POST /auth/admin/{login,verify-2fa,setup-2fa,disable-2fa}` | Two-step login; `otpCode` bootstrap hint only appears pre-2FA-setup |
| `admin.ts` | `GET/POST /admin/agents/*`, `/admin/appeals/*`, `/admin/verifications/*` | List endpoints take query params via a small `query()` helper |

### API Contract (selected - see the companion API reference for full detail)

#### `POST /requests` (🔒 renter)
```json
// request
{ "area": "Kilimani", "budgetMin": 15000, "budgetMax": 30000, "bedrooms": 1, "timeline": "ASAP" }

// response (201)
{ "requestId": "uuid", "status": "MATCHED", "magicLink": "http://host/results/<token>", "matchedAgentCount": 2 }
```

#### `GET /results/:token` (public)
```json
{
  "id": "uuid", "area": "Kilimani", "budgetMin": 15000, "budgetMax": 30000, "bedrooms": 1,
  "timeline": "ASAP", "status": "MATCHED", "matchedAgentCount": 2,
  "expiresAt": "...", "createdAt": "...",
  "matches": [
    { "id": "matchId", "rank": 1, "status": "NOTIFIED",
      "agent": { "id": "uuid", "name": "Jane Mwangi", "phone": "254711111111", "bio": "...", "serviceAreas": [...], "propertyTypes": [...] } }
  ]
}
```
`status`: `MATCHED` | `PENDING_SUPPLY`. Errors: `401 MAGIC_LINK_INVALID`, `410 MAGIC_LINK_REVOKED`.
Match `status`: `NOTIFIED` | `ACCEPTED` | `DECLINED` | `EXPIRED` - agent phone is visible immediately, before acceptance.

### Data Flow - Request Submission

```
RequestPage (form state, steps 1–4) → step 5 (otpPhase: 'phone' | 'otp')
  │
  ├─ 'phone' phase: useRequestRenterOtp().mutate(phone) → onSuccess → otpPhase = 'otp'
  │
  └─ 'otp' phase: handleVerifyAndSubmit()
        │
        ├─ useVerifyRenterOtp().mutateAsync({ phone, code })  →  setSession('renter', ...)
        │    (skipped if a session already exists - lets a failed createRequest retry
        │     without re-verifying the OTP)
        │
        ├─ useCreateRequest().mutateAsync({ area, budgetMin, budgetMax, bedrooms, timeline })
        │
        └─ navigate(`/results/${extractMagicLinkToken(result.magicLink)}`)
```

### Data Flow - Status Page Polling

```
StatusPage mounts
  │
  ├─ token = useParams().token   (from the magicLink URL, not React Router state -
  │                                bookmarkable and survives a page refresh)
  │
  └─ useRequestResults(token) - polls GET /results/:token every 5s
      ├─ status === 'PENDING_SUPPLY' → "no agents in this area yet" empty state
      ├─ status === 'MATCHED'        → matches[] rendered as MatchCard rows
      └─ error (401/410)             → "link invalid/closed" + CTA back to /request
```

### Data Flow - Agent Leads

```
AgentDashboardPage mounts
  │
  ├─ useAgentProfile() → verificationStatus banner if not yet VERIFIED
  │
  └─ useAgentLeads() - polls GET /agents/leads every 15s
      └─ per-lead Accept/Decline → invalidates ['agent-leads'] on success
         (decline shows the `rematch` message: "next agent notified" or "no agents available")
```

---

## 5. State Management

### Philosophy

**No global store.** State lives as close to where it is used as possible:

| State type | Where it lives |
|---|---|
| Server data (leads, matches, verifications) | TanStack Query cache |
| Form data (5-step wizard) | `useState` in `RequestPage` |
| Auth session (renter/agent/admin) | `localStorage` (`auth-storage.ts`) + `useAuthSession` |
| Theme preference | `useTheme` hook + `localStorage` |
| Mobile nav open/closed | `useState` in `Navbar` |
| Scroll position (for nav shadow) | `useScrolled` hook |
| Viewport size | `useIsMobile` hook |

### RequestPage Form State

```ts
step          : 1–5  (which screen is shown)
selectedArea  : string    (single-select area pill)
budgetMin     : [number]  (Slider returns single-element array)
budgetMax     : [number]
houseType     : string    (id from HOUSE_TYPES constant, mapped to `bedrooms` at submit time)
moveTimeline  : string    (id IS the RequestTimeline enum value - no translation needed)
phone         : string    (digits only, no +254 prefix)
otpPhase      : 'phone' | 'otp'   (sub-phase of step 5, not a separate step)
otpCode       : string
```

`isValid` (a `useMemo`) is derived from those fields based on the current
step (and, for step 5, the current `otpPhase`) - it drives the disabled
state of the Continue / Submit button.

Auth session state is intentionally **not** React state - it's read
lazily from `localStorage` via `useAuthSession(kind)`, which re-renders on
the `keja-auth-change` event fired by `setSession`/`clearSession`. This
lets any component (e.g. `AgentLayout`'s top bar) reflect login/logout
without prop drilling.

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

`isValid` is particularly important - without memoisation, every keystroke
in the phone field on step 5 would re-evaluate validation for all 5 steps.

### useCallback

`toggleArea` and `handleNext` in `RequestPage` are stable references across
renders. This prevents unnecessary re-renders of any child that accepts
these functions as props or uses them as `useEffect` dependencies.

### useTransition

Step navigation in `RequestPage` wraps `setStep` in `startTransition`.
React treats the step change as non-urgent - if the user is typing or
tapping when the transition fires, their input is processed first.

### TanStack Query - Polling Efficiency

`staleTime` is set 1 s below `refetchInterval` for each query:
- Status: `staleTime: 4_000`, `refetchInterval: 5_000`
- Notifications: `staleTime: 7_000`, `refetchInterval: 8_000`

This prevents the StrictMode double-invoke (which mounts → unmounts →
remounts components) from triggering two back-to-back fetches.

`placeholderData: (prev) => prev` on the notifications query means the UI
never flickers to empty between polls - the previous data stays visible
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
| `--teal` | `#00897B` | 1.93:1 ✗ FAIL | **Structure/fill only** - chip BGs, borders, icon containers. NEVER text |
| `--accent` | `#00E5FF` | - | Availability dots, live indicators only - keep minimal |
| `--gold` / `--amber` | `#F5A623` | 8.20:1 ✓ AAA | Agent CTA, urgency, ratings |
| `--whatsapp` | `#25D366` | - | WhatsApp buttons only - fixed brand colour |
| `--background` | `#0A0F1E` | - | Page background (deep navy) |
| `--card` | `#141C1A` | - | Card surface (warm teal-dark) |
| `--foreground` | `#E8E6E1` | 16:1 ✓ AAA | Primary text (warm parchment) |
| `--muted-foreground` | `#7A7873` | - | Secondary text, labels, icons |

### Surface Elevation

```
Background  #0A0F1E  (deepest - page bg)
Card        #141C1A  (base surface - most cards)
Secondary   #1E2725  (elevated - selected state BG, info chips)
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
- `tabular-nums` only on **animating** numbers (budget slider) or **stacked** price lists - never on static stats
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
| Avatars / success state | varies | - | `rounded-full` | - |
| Inline with text (h-4 = 16 px) | none | `h-4 w-4` | - | 1.5 |
| Navigation chrome (h-5 = 20 px) | `h-11 w-11` touch zone | `h-5 w-5` | - | 2 |
| CTA button trailing arrow | none | `h-4 w-4` | - | 1.5 |

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

Class component (required - hooks cannot catch render errors).
- `getDerivedStateFromError` captures the error into state
- `componentDidCatch` logs to console (swap for Sentry/Datadog)
- Renders a branded recovery UI with a "Try again" reset button
- Accepts an optional `fallback` render prop for custom error UIs

### `RequireAuth`

```tsx
<RequireAuth kind="agent" roles={['AGENT']}>
  <AgentDashboardPage />
</RequireAuth>
```

Presence/role gate - `<Navigate to={`/${kind}/login`} replace />` if no
session exists for `kind`, or if `roles` is given and the session's role
isn't in it. Does not decode JWT expiry (see `api.ts` in §4).

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

Passive scroll listener - never blocks the main thread. Used by `Navbar`
to add the border + blur shadow once the user starts scrolling.

### `useIsMobile()`

```ts
const isMobile = useIsMobile()  // true below 768 px
```

Uses `window.matchMedia` - no `resize` polling. Initialises synchronously
on mount so there is no flash of incorrect layout.

### `useAuthSession(kind)`

```ts
const session = useAuthSession('renter')  // AuthSession | null
```

Reads the stored session for that kind and re-renders on the
`keja-auth-change` event (fired by `setSession`/`clearSession` anywhere in
the app, including other components).

### `useCreateRequest()`

TanStack Query mutation. Returns `{ mutateAsync, isPending, isError, error }`.
Calls `createRequest()` - `POST /requests` with the authenticated renter's
session attached.

### `useRequestRenterOtp()` / `useVerifyRenterOtp()`
### `useRequestAgentOtp()` / `useVerifyAgentOtp()`

Mutations wrapping the respective `request-otp`/`verify-otp` service calls.
The agent variant's verify result additionally includes `hasProfile`.

### `useRequestResults(token)`

```ts
const { data, error, isLoading } = useRequestResults(token)
```

Polls `GET /results/:token` every 5 seconds (public - no auth). `data` is
`RequestResult | undefined`. Disabled when `token` is falsy.

### `useAgentProfile()` / `useApplyAsAgent()` / `useUpdateAgentProfile()`

Profile query + apply/update mutations. `useApplyAsAgent`/
`useUpdateAgentProfile` write their result straight into the profile query's
cache on success (`setQueryData`) rather than refetching.

### `useAgentLeads()` / `useAcceptLead()` / `useDeclineLead()`

`useAgentLeads` polls every 15 seconds. Accept/decline mutations invalidate
the leads query on success so the list reflects the new status immediately.

### `useAdminLogin()` / `useVerifyAdmin2fa()`

Two-step admin login mutations.

### `useAdminAgents(params)` / `useAdminAgent(id)` / `useSuspendAgent()` / `useUnsuspendAgent()`
### `useAdminAppeals()` / `useEscalateAppeal()` / `useResolveAppeal()`
### `useVerificationsQueue()` / `useVerificationDetail(agentId)` / `useApproveVerification()` / `useRejectVerification()`

Admin queries/mutations - every mutation invalidates the relevant list
and/or detail query on success (e.g. approving a verification invalidates
both the verifications queue and the agents list, since both reflect
`verificationStatus`).

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
There is no `postcss.config.mjs`. Do not create one - it will conflict.

---

## 12. Environment Variables

| Variable | Required | Description |
|---|---|---|
| `VITE_API_BASE_URL` | No | Base URL of the backend API. Local dev: `http://localhost:4000`. Docker: `http://localhost:3000`. Omit to run in mock mode. |

All `VITE_` prefixed variables are inlined at build time by Vite and
accessible via `import.meta.env.VITE_*`.

**Mock mode** is active when `VITE_API_BASE_URL` is empty or absent. Every
service function returns realistic fake data with simulated delays - OTP
codes accept `123456`, requests get a fake `magicLink`, agent/admin lists
are seeded with a couple of representative records. The UI is fully
functional without a backend.

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
4. If it needs auth, wrap the element in `<RequireAuth kind="..." roles={[...]}>`
5. Add the route inside `<Suspense>` in `App.tsx`

### New API resource

1. Add types - cross-feature shapes go in `src/types/index.ts`; feature-only
   shapes go in `src/features/<name>/types.ts` (see `agent/types.ts` /
   `admin/types.ts` for the pattern)
2. Add service functions to `src/services/` (new file or existing)
   - Always implement a mock branch guarded by `if (isMockMode)`
   - Pass the right `auth` kind (`'renter' | 'agent' | 'admin'`) to `api.*`
     calls that need a bearer token; omit it for public endpoints
3. Add TanStack Query hooks to a `use*Query.ts` file matching the service
   - Use `useQuery` for reads (set `refetchInterval` if real-time)
   - Use `useMutation` for writes; invalidate related query keys on success
4. Export from `src/hooks/index.ts`

### New UI component

1. Create `src/components/ui/MyComponent.tsx`
2. Export from `src/components/ui/index.ts`
3. Follow icon system rules (see §7) and use `cn()` for class merging
4. Wrap with `React.memo` if it is a pure display component used in lists

---

*Last updated: 2026-07-27 · KejaLink v1.1.0 · Nguvu Group*
