import { Outlet, useNavigate, Link, NavLink } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { KejaLinkIcon } from '@/components/Logo'
import { useAuthSession } from '@/hooks'
import { clearSession } from '@/lib/auth-storage'
import { cn } from '@/lib/utils'

const NAV_ITEMS = [
  { to: '/admin/verifications', label: 'Verifications' },
  { to: '/admin/agents',        label: 'Agents' },
  { to: '/admin/appeals',       label: 'Appeals' },
]

/**
 * Slim internal-tool shell for the Admin section. There is no
 * POST /auth/admin/logout endpoint in the API - logout here is purely
 * client-side (clear the stored session).
 */
export function AdminLayout() {
  const navigate = useNavigate()
  const session = useAuthSession('admin')

  const handleLogout = () => {
    clearSession('admin')
    navigate('/admin/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3.5">
          <div className="flex items-center gap-6">
            <Link to="/" className="flex items-center gap-2">
              <KejaLinkIcon size={24} />
              <span className="font-display text-base font-black">
                <span className="text-foreground">Keja</span>
                <span className="text-primary">Link</span>
              </span>
              <span className="ml-1 rounded-full border border-accent/30 bg-accent/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-accent">
                Admin
              </span>
            </Link>

            <nav className="hidden items-center gap-1 md:flex">
              {NAV_ITEMS.map(item => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    'rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                    isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
                  )}
                >
                  {item.label}
                </NavLink>
              ))}
            </nav>
          </div>

          {session && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{session.user.name ?? session.user.email}</span>
              <button
                type="button"
                onClick={handleLogout}
                className="flex h-9 w-9 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Log out"
              >
                <LogOut className="h-4 w-4" strokeWidth={1.5} />
              </button>
            </div>
          )}
        </div>

        <nav className="flex items-center gap-1 overflow-x-auto px-4 pb-3 md:hidden">
          {NAV_ITEMS.map(item => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) => cn(
                'shrink-0 rounded-lg px-3 py-1.5 text-sm font-medium transition-colors',
                isActive ? 'bg-primary/10 text-primary' : 'text-muted-foreground hover:bg-muted/60 hover:text-foreground',
              )}
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
      </header>

      <main className="container mx-auto max-w-4xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
