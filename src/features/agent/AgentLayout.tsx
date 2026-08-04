import { Outlet, useNavigate, Link } from 'react-router-dom'
import { LogOut } from 'lucide-react'
import { KejaLinkIcon } from '@/components/Logo'
import { useAuthSession } from '@/hooks'
import { clearSession } from '@/lib/auth-storage'
import { logoutAgent } from '@/services/agentAuth'

/**
 * Slim internal-tool shell for the Agent section — no public Navbar/Footer,
 * just a top bar with the logo, the logged-in agent's name, and logout.
 */
export function AgentLayout() {
  const navigate = useNavigate()
  const session = useAuthSession('agent')

  const handleLogout = async () => {
    if (session) {
      // Agent logout has no Authorization-header fallback — refreshToken
      // must always be sent in the body.
      await logoutAgent(session.refreshToken).catch(() => {})
    }
    clearSession('agent')
    navigate('/agent/login')
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
        <div className="container mx-auto flex items-center justify-between px-4 py-3.5">
          <Link to="/" className="flex items-center gap-2">
            <KejaLinkIcon size={24} />
            <span className="font-display text-base font-black">
              <span className="text-foreground">Keja</span>
              <span className="text-primary">Link</span>
            </span>
            <span className="ml-1 rounded-full border border-primary/30 bg-primary/10 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide text-primary">
              Agent
            </span>
          </Link>

          {session && (
            <div className="flex items-center gap-3">
              <span className="text-sm text-muted-foreground">{session.user.name ?? session.user.phone}</span>
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
      </header>

      <main className="container mx-auto max-w-2xl px-4 py-8">
        <Outlet />
      </main>
    </div>
  )
}
