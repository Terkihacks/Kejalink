import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Menu, X } from 'lucide-react'
import { KejaLinkWordmark } from '@/components/Logo'
import { ThemeToggle } from '@/components/ui'
import { useScrolled } from '@/hooks'

/**
 * Sticky top navigation bar.
 *
 * - Gains a border + blur shadow once the page scrolls past 8 px
 * - Desktop: inline navigation links
 * - Mobile: slide-over drawer (no Radix, no library dependency — pure CSS transitions)
 *
 * Internal routes use React Router `<Link to="…">`.
 * Hash anchors (`#agents`, `#faq`) remain plain `<a>` elements.
 */
export function Navbar() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const scrolled = useScrolled()

  // Prevent body scroll while the mobile drawer is open
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? 'hidden' : ''
    return () => { document.body.style.overflow = '' }
  }, [mobileOpen])

  return (
    <>
      <header
        className={[
          'sticky top-0 z-50 w-full transition-all duration-300',
          scrolled
            ? 'border-b border-border/60 bg-background/95 backdrop-blur-md shadow-[0_1px_20px_rgba(0,0,0,0.4)]'
            : 'border-b border-transparent bg-background/80 backdrop-blur-sm',
        ].join(' ')}
      >
        <div className="container mx-auto flex h-16 items-center justify-between px-4">
          {/* Logo */}
          <Link to="/" aria-label="KejaLink home">
            <KejaLinkWordmark />
          </Link>

          {/* Desktop nav */}
          <nav className="hidden items-center gap-2 md:flex">
            <ThemeToggle />
            <Link
              to="/request"
              className="rounded-full border border-border/60 bg-muted/30 px-5 py-2 text-sm font-medium text-foreground/80 transition-all hover:border-primary/40 hover:bg-muted/60 hover:text-foreground"
            >
              Request a House
            </Link>
            <a
              href="#agents"
              className="rounded-full bg-primary px-5 py-2 text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(0,206,146,0.25)] transition-all hover:bg-primary/90 hover:shadow-[0_0_30px_rgba(0,206,146,0.4)]"
            >
              Become an Agent
            </a>
          </nav>

          {/* Mobile: theme toggle + hamburger */}
          <div className="flex items-center gap-1 md:hidden">
            <ThemeToggle />
            <button
              type="button"
              onClick={() => setMobileOpen(true)}
              className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
              aria-label="Open navigation menu"
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>
        </div>
      </header>

      {/* ── Mobile drawer backdrop ── */}
      <div
        aria-hidden="true"
        className={[
          'fixed inset-0 z-50 bg-black/70 backdrop-blur-sm transition-opacity duration-300 md:hidden',
          mobileOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
        ].join(' ')}
        onClick={() => setMobileOpen(false)}
      />

      {/* ── Mobile drawer panel ── */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Navigation menu"
        className={[
          'fixed inset-y-0 right-0 z-50 w-75 border-l border-border bg-card shadow-2xl',
          'transition-transform duration-300 ease-out md:hidden',
          mobileOpen ? 'translate-x-0' : 'translate-x-full',
        ].join(' ')}
      >
        <div className="flex h-16 items-center justify-between border-b border-border/50 px-4">
          <Link to="/" onClick={() => setMobileOpen(false)} aria-label="KejaLink home">
            <KejaLinkWordmark />
          </Link>
          <button
            onClick={() => setMobileOpen(false)}
            className="flex h-11 w-11 items-center justify-center rounded-lg text-foreground/70 transition-colors hover:bg-muted/60 hover:text-foreground"
            aria-label="Close navigation menu"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <nav className="flex flex-col gap-3 p-5">
          <Link
            to="/request"
            onClick={() => setMobileOpen(false)}
            className="flex h-12 items-center justify-center rounded-xl border border-border/60 bg-muted/30 text-sm font-medium text-foreground/80 transition-all hover:border-primary/40 hover:text-foreground"
          >
            Request a House
          </Link>
          <a
            href="#agents"
            onClick={() => setMobileOpen(false)}
            className="flex h-12 items-center justify-center rounded-xl bg-primary text-sm font-semibold text-primary-foreground shadow-[0_0_20px_rgba(0,206,146,0.25)] transition-all hover:bg-primary/90"
          >
            Become an Agent
          </a>
        </nav>

        <p className="absolute bottom-8 left-0 right-0 text-center text-xs font-medium uppercase tracking-[2px] text-muted-foreground">
          Connect · Verify · Move In
        </p>
      </div>
    </>
  )
}
