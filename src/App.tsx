import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, Outlet } from 'react-router-dom'
import { Navbar, Footer } from '@/components/layout'
import { HomePage } from '@/features/home'
import { ErrorBoundary } from '@/components/ui'
import { RequireAuth } from '@/components/RequireAuth'

/**
 * Route-level code splitting.
 *
 * RequestPage and StatusPage are loaded only when the user navigates to
 * them, keeping the initial JS bundle (~home page only) as small as possible.
 * The `.then(m => ({ default: m.X }))` adapter bridges named exports to the
 * default export required by React.lazy.
 */
const RequestPage = lazy(() =>
  import('@/features/request').then(m => ({ default: m.RequestPage })),
)

const StatusPage = lazy(() =>
  import('@/features/status').then(m => ({ default: m.StatusPage })),
)

const AgentLayout = lazy(() =>
  import('@/features/agent').then(m => ({ default: m.AgentLayout })),
)
const AgentLoginPage = lazy(() =>
  import('@/features/agent').then(m => ({ default: m.AgentLoginPage })),
)
const AgentApplyPage = lazy(() =>
  import('@/features/agent').then(m => ({ default: m.AgentApplyPage })),
)
const AgentDashboardPage = lazy(() =>
  import('@/features/agent').then(m => ({ default: m.AgentDashboardPage })),
)

const AdminLayout = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminLayout })),
)
const AdminLoginPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminLoginPage })),
)
const VerificationsQueuePage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.VerificationsQueuePage })),
)
const VerificationDetailPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.VerificationDetailPage })),
)
const AdminAgentsListPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminAgentsListPage })),
)
const AdminAgentDetailPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminAgentDetailPage })),
)
const AdminAppealsPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminAppealsPage })),
)
const AdminDashboardPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminDashboardPage })),
)
const AdminRequestsPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminRequestsPage })),
)
const AdminAuditLogPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminAuditLogPage })),
)
const AdminManagementPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminManagementPage })),
)
const AdminSettingsPage = lazy(() =>
  import('@/features/admin').then(m => ({ default: m.AdminSettingsPage })),
)

const DOT_DELAYS = [0, 0.15, 0.3]

/** Full-page skeleton shown while a lazy route chunk is loading. */
function PageLoader() {
  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex items-center gap-2">
        {DOT_DELAYS.map((delay, i) => (
          <motion.span
            key={i}
            className="h-1.5 w-1.5 rounded-full bg-primary"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 0.6, repeat: Infinity, delay, ease: 'easeInOut' }}
          />
        ))}
      </div>
    </div>
  )
}

/**
 * Layout wrapper used by pages that share the main navigation and footer.
 * The request and status pages manage their own sticky headers and are
 * excluded from this layout intentionally.
 */
function RootLayout() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <Navbar />
      <main className="flex-1">
        <Outlet />
      </main>
      <Footer />
    </div>
  )
}

/**
 * Application route tree.
 *
 * Route map:
 *   /                 → HomePage            (eager - part of initial bundle)
 *   /request          → RequestPage         (lazy - own chunk)
 *   /results/:token   → StatusPage          (lazy - own chunk, public magic link)
 *   /agent/login              → AgentLoginPage            (lazy - own header, unauthenticated)
 *   /agent/apply              → AgentApplyPage            (lazy - AgentLayout, guarded)
 *   /agent/dashboard          → AgentDashboardPage        (lazy - AgentLayout, guarded)
 *   /admin/login              → AdminLoginPage            (lazy - own header, unauthenticated)
 *   /admin/verifications      → VerificationsQueuePage    (lazy - AdminLayout, guarded)
 *   /admin/verifications/:id  → VerificationDetailPage    (lazy - AdminLayout, guarded)
 *   /admin/agents             → AdminAgentsListPage       (lazy - AdminLayout, guarded)
 *   /admin/agents/:id         → AdminAgentDetailPage      (lazy - AdminLayout, guarded)
 *   /admin/appeals            → AdminAppealsPage          (lazy - AdminLayout, guarded; resolve gated to SUPER_ADMIN)
 *   /admin                    → AdminDashboardPage        (lazy - AdminLayout, guarded)
 *   /admin/requests           → AdminRequestsPage         (lazy - AdminLayout, guarded)
 *   /admin/audit-logs         → AdminAuditLogPage         (lazy - AdminLayout, guarded)
 *   /admin/management         → AdminManagementPage       (lazy - AdminLayout, guarded, roles=[SUPER_ADMIN])
 *   /admin/settings           → AdminSettingsPage         (lazy - AdminLayout, guarded)
 */
export function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          <Route element={<RootLayout />}>
            <Route path="/" element={<HomePage />} />
          </Route>
          <Route
            path="/request"
            element={
              <ErrorBoundary>
                <RequestPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/results/:token"
            element={
              <ErrorBoundary>
                <StatusPage />
              </ErrorBoundary>
            }
          />
          <Route
            path="/agent/login"
            element={
              <ErrorBoundary>
                <AgentLoginPage />
              </ErrorBoundary>
            }
          />
          <Route
            element={
              <ErrorBoundary>
                <AgentLayout />
              </ErrorBoundary>
            }
          >
            <Route
              path="/agent/apply"
              element={
                <RequireAuth kind="agent">
                  <AgentApplyPage />
                </RequireAuth>
              }
            />
            <Route
              path="/agent/dashboard"
              element={
                <RequireAuth kind="agent">
                  <AgentDashboardPage />
                </RequireAuth>
              }
            />
          </Route>
          <Route
            path="/admin/login"
            element={
              <ErrorBoundary>
                <AdminLoginPage />
              </ErrorBoundary>
            }
          />
          <Route
            element={
              <ErrorBoundary>
                <AdminLayout />
              </ErrorBoundary>
            }
          >
            <Route
              path="/admin"
              element={
                <RequireAuth kind="admin">
                  <AdminDashboardPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/verifications"
              element={
                <RequireAuth kind="admin">
                  <VerificationsQueuePage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/verifications/:agentId"
              element={
                <RequireAuth kind="admin">
                  <VerificationDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/agents"
              element={
                <RequireAuth kind="admin">
                  <AdminAgentsListPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/agents/:id"
              element={
                <RequireAuth kind="admin">
                  <AdminAgentDetailPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/appeals"
              element={
                <RequireAuth kind="admin">
                  <AdminAppealsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/requests"
              element={
                <RequireAuth kind="admin">
                  <AdminRequestsPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/audit-logs"
              element={
                <RequireAuth kind="admin">
                  <AdminAuditLogPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/management"
              element={
                <RequireAuth kind="admin" roles={['SUPER_ADMIN']}>
                  <AdminManagementPage />
                </RequireAuth>
              }
            />
            <Route
              path="/admin/settings"
              element={
                <RequireAuth kind="admin">
                  <AdminSettingsPage />
                </RequireAuth>
              }
            />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
