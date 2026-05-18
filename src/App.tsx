import { lazy, Suspense } from 'react'
import { motion } from 'framer-motion'
import { Routes, Route, Outlet } from 'react-router-dom'
import { Navbar, Footer } from '@/components/layout'
import { HomePage } from '@/features/home'
import { ErrorBoundary } from '@/components/ui'

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
 *   /                → HomePage        (eager — part of initial bundle)
 *   /request         → RequestPage     (lazy — own chunk)
 *   /request/status  → StatusPage      (lazy — own chunk)
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
            path="/request/status"
            element={
              <ErrorBoundary>
                <StatusPage />
              </ErrorBoundary>
            }
          />
        </Routes>
      </Suspense>
    </ErrorBoundary>
  )
}
