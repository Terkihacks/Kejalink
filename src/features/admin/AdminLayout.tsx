import { useState, useEffect } from 'react'
import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom'
import {
  LayoutDashboard, ShieldCheck, Users, Inbox, Gavel, ScrollText, UserCog, Settings,
  LogOut, Menu, X,
} from 'lucide-react'
import { KejaLinkIcon } from '@/components/Logo'
import { NotificationBell } from '@/components/NotificationBell'
import { Badge, ToastProvider } from '@/components/ui'
import { useAuthSession, useAdminStats } from '@/hooks'
import { clearSession } from '@/lib/auth-storage'
import { cn } from '@/lib/utils'

interface NavItem {
  to: string
  label: string
  icon: typeof LayoutDashboard
  badge?: number
  superAdminOnly?: boolean
}

function buildNavItems(pendingVerification: number, pendingAppeals: number): NavItem[] {
  return [
    { to: '/admin',               label: 'Dashboard',        icon: LayoutDashboard },
    { to: '/admin/verifications', label: 'Verifications',    icon: ShieldCheck, badge: pendingVerification },
    { to: '/admin/agents',        label: 'Agents',           icon: Users },
    { to: '/admin/requests',      label: 'Requests',         icon: Inbox },
    { to: '/admin/appeals',       label: 'Appeals',          icon: Gavel, badge: pendingAppeals },
    { to: '/admin/audit-logs',    label: 'Audit Logs',       icon: ScrollText },
    { to: '/admin/management',    label: 'Admin Management', icon: UserCog, superAdminOnly: true },
    { to: '/admin/settings',      label: 'Settings',         icon: Settings },
  ]
}

/**
 * Real sidebar shell for the Admin section - desktop fixed sidebar, mobile
 * slide-over drawer copying Navbar.tsx's mechanics (backdrop + role="dialog"
 * panel + translate-x transition + body-scroll-lock). There is no
 * POST /auth/admin/logout endpoint in the API - logout here is purely
 * client-side (clear the stored session).
 */
export function AdminLayout() {
  const navigate = useNavigate()
  const session = useAuthSession('admin')
  const { data: stats } = useAdminStats()
  const [mobileOpen, setMobileOpen] = useState(false)

  const isSuperAdmin = session?.user.role === 'SUPER_ADMIN'
  // Filtered out entirely for non-SUPER_ADMIN sessions - defense in depth on top of the route guard.
  const navItems = buildNavItems(stats?.agents.pendingVerification ?? 0, stats?.appeals.pending ?? 0)
    .filter(item => !item.superAdminOnly || isSuperAdmin)

  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  const handleLogout = () => {
    clearSession('admin')
    navigate('/admin/login')
  }

  const navLinkClass = ({ isActive }: { isActive: boolean }) => cn(
    'flex items-center justify-between gap-3 rounded-xl px-3 py-2.5 text-sm font-medium transition-colors',
    isActive
      ? 'bg-sidebar-accent text-sidebar-accent-foreground'
      : 'text-sidebar-foreground/70 hover:bg-sidebar-accent/60 hover:text-sidebar-foreground',
  )

  function renderNavItems(onNavigate?: () => void) {
    return (
      <nav className="flex flex-col gap-1 p-3">
        {navItems.map(item => (
          <NavLink key={item.to} to={item.to} end={item.to === '/admin'} className={navLinkClass} onClick={onNavigate}>
            <span className="flex items-center gap-3">
              <item.icon className="h-4 w-4" strokeWidth={1.5} />
              {item.label}
            </span>
            {!!item.badge && (
              <span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-sidebar-primary/20 px-1.5 text-[11px] font-semibold text-sidebar-primary">
                {item.badge}
              </span>
            )}
          </NavLink>
        ))}
      </nav>
    )
  }

  return (
    <ToastProvider>
      <div className="min-h-screen bg-background md:pl-64">
        {/* Desktop sidebar */}
        <aside className="fixed inset-y-0 left-0 z-40 hidden w-64 flex-col border-r border-sidebar-border bg-sidebar md:flex">
          <Link to="/" className="flex items-center gap-2 px-4 py-4">
            <KejaLinkIcon size={26} />
            <span className="font-display text-base font-black text-sidebar-foreground">
              Keja<span className="text-sidebar-primary">Link</span>
            </span>
            <span className="ml-auto rounded-full border border-sidebar-primary/30 bg-sidebar-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-sidebar-primary">
              Admin
            </span>
          </Link>
          <div className="flex-1 overflow-y-auto">{renderNavItems()}</div>
        </aside>

        {/* Mobile drawer backdrop */}
        <div
          aria-hidden="true"
          className={cn(
            'fixed inset-0 z-40 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden',
            mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
          )}
          onClick={() => setMobileOpen(false)}
        />

        {/* Mobile drawer panel */}
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Admin navigation"
          className={cn(
            'fixed inset-y-0 left-0 z-40 w-72 border-r border-sidebar-border bg-sidebar shadow-2xl',
            'transition-transform duration-300 ease-out md:hidden',
            mobileOpen ? 'translate-x-0' : '-translate-x-full',
          )}
        >
          <div className="flex items-center justify-between px-4 py-4">
            <Link to="/" onClick={() => setMobileOpen(false)} className="flex items-center gap-2">
              <KejaLinkIcon size={26} />
              <span className="font-display text-base font-black text-sidebar-foreground">
                Keja<span className="text-sidebar-primary">Link</span>
              </span>
            </Link>
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              aria-label="Close navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-sidebar-foreground/70 transition-colors hover:bg-sidebar-accent hover:text-sidebar-foreground"
            >
              <X className="h-5 w-5" />
            </button>
          </div>
          {renderNavItems(() => setMobileOpen(false))}
        </div>

        {/* Header */}
        <header className="sticky top-0 z-30 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3.5">
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              aria-label="Open navigation menu"
              className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground md:hidden"
            >
              <Menu className="h-5 w-5" />
            </button>

            <div className="ml-auto flex items-center gap-3">
              <NotificationBell />
              {session && (
                <>
                  <span className="hidden text-sm text-muted-foreground sm:inline">{session.user.name ?? session.user.email}</span>
                  <Badge tone={isSuperAdmin ? 'info' : 'neutral'}>{session.user.role.replace('_', ' ')}</Badge>
                </>
              )}
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          </div>
        </header>

        <main className="mx-auto max-w-6xl px-4 py-8">
          <Outlet />
        </main>
      </div>
    </ToastProvider>
  )
}
