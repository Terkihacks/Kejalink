import { memo, useMemo, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, fadeUp } from '@/lib/motion'
import { Link, useParams } from 'react-router-dom'
import {
  CheckCircle,
  MapPin,
  Clock,
  MessageCircle,
  Share2,
  Eye,
  Home,
  Calendar,
  Edit2,
  Bell,
  Smartphone,
  BadgeCheck,
  Shield,
  Zap,
  ArrowLeft,
  Phone,
  Loader2,
  AlertCircle,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KejaLinkIcon } from '@/components/Logo'
import { useRequestResults } from '@/hooks'
import { ApiError } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-messages'
import { HOUSE_TYPES, BEDROOMS_BY_HOUSE_TYPE, MOVE_TIMELINES } from '@/features/request/constants'
import type { RequestMatch, MatchStatus, RequestTimeline } from '@/types'

/* ─── Local helpers ──────────────────────────────────────────────── */

function bedroomsLabel(bedrooms: number): string {
  const entry = HOUSE_TYPES.find(t => BEDROOMS_BY_HOUSE_TYPE[t.id] === bedrooms)
  return entry?.label ?? `${bedrooms} bedroom${bedrooms === 1 ? '' : 's'}`
}

function timelineLabel(timeline: RequestTimeline): string {
  return MOVE_TIMELINES.find(t => t.id === timeline)?.label ?? timeline
}

/** Requests are matched against at most 2 verified agents (primary + secondary rank). */
const MAX_EXPECTED_AGENTS = 2

const MATCH_STATUS_CONFIG: Record<MatchStatus, { label: string; badgeClass: string; showContact: boolean }> = {
  NOTIFIED: { label: 'Reviewing your request',   badgeClass: 'border-gold/30 bg-gold/15 text-gold',                      showContact: true },
  ACCEPTED: { label: 'Accepted - ready to help', badgeClass: 'border-primary/30 bg-primary/15 text-primary',             showContact: true },
  DECLINED: { label: 'Not available',            badgeClass: 'border-border/60 bg-muted/60 text-muted-foreground',       showContact: false },
  EXPIRED:  { label: 'No longer responding',     badgeClass: 'border-border/60 bg-muted/60 text-muted-foreground',       showContact: false },
}

/* ─── Local sub-components ────────────────────────────────────────── */

/** Generic card shell used across all status page sections. */
const Card = memo(function Card({ children, className }: { children: ReactNode; className?: string }) {
  return (
    <div className={cn('overflow-hidden rounded-2xl border border-border/60 bg-card shadow-sm', className)}>
      {children}
    </div>
  )
})

/** Small two-column chip showing an icon + label in the request summary grid. */
const InfoChip = memo(function InfoChip({ icon, label }: { icon: ReactNode; label: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl bg-secondary/60 px-3 py-2.5">
      <span className="shrink-0">{icon}</span>
      <span className="truncate text-sm text-foreground">{label}</span>
    </div>
  )
})

/** Individual matched-agent row - status drives badge copy and whether contact actions show. */
const MatchCard = memo(function MatchCard({ match }: { match: RequestMatch }) {
  const config  = MATCH_STATUS_CONFIG[match.status]
  const waLink  = `https://wa.me/${match.agent.phone}`
  const telLink = `tel:+${match.agent.phone}`

  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4 transition-all',
        config.showContact ? 'border-primary/30 bg-primary/5' : 'border-border/50 bg-secondary/40 opacity-70',
      )}
    >
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_12px_rgba(0,206,146,0.3)]">
        {match.agent.name.charAt(0)}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-foreground">{match.agent.name}</p>
          <span className={cn('shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', config.badgeClass)}>
            {config.label}
          </span>
        </div>
        {match.agent.bio && (
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{match.agent.bio}</p>
        )}

        {config.showContact && (
          <div className="mt-3 flex gap-2">
            <a
              href={telLink}
              className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
            >
              <Phone className="h-3.5 w-3.5" strokeWidth={1.5} />
              Call
            </a>
            <a
              href={waLink}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 rounded-full bg-whatsapp px-3 py-1.5 text-xs font-medium text-white transition-colors hover:bg-whatsapp/90"
            >
              <MessageCircle className="h-3.5 w-3.5" strokeWidth={1.5} />
              WhatsApp
            </a>
          </div>
        )}
      </div>
    </div>
  )
})

/* ─── Page ────────────────────────────────────────────────────────── */

/**
 * Request status tracking page (`/results/:token`).
 *
 * `token` is the magic-link token returned by POST /requests - this route
 * is PUBLIC (no auth) so the link can be bookmarked/shared and keeps
 * working even after the renter's short-lived access token expires.
 */
export function StatusPage() {
  const { token } = useParams<{ token: string }>()
  const { data, error, isLoading } = useRequestResults(token)

  const activeMatches = useMemo(
    () => data?.matches.filter(m => m.status !== 'DECLINED' && m.status !== 'EXPIRED') ?? [],
    [data],
  )
  const agentsReviewing = activeMatches.length
  const newCount = useMemo(
    () => data?.matches.filter(m => m.status === 'ACCEPTED').length ?? 0,
    [data],
  )

  const location       = data?.area ?? '…'
  const budgetLabel     = data ? `${(data.budgetMin / 1000).toFixed(0)}k – ${(data.budgetMax / 1000).toFixed(0)}k` : '…'
  const houseTypeLabel = data ? bedroomsLabel(data.bedrooms) : '…'
  const moveTimelineLbl = data ? timelineLabel(data.timeline) : '…'

  const header = (
    <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
      <div className="flex items-center justify-between px-4 py-3.5">
        <Link
          to="/"
          className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label="Back to home"
        >
          <ArrowLeft className="h-5 w-5" />
        </Link>

        <Link to="/" className="flex items-center gap-2">
          <KejaLinkIcon size={24} />
          <span className="font-display text-base font-black">
            <span className="text-foreground">Keja</span>
            <span className="text-primary">Link</span>
          </span>
        </Link>

        <button
          type="button"
          className="relative flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
          aria-label={`${newCount} new notifications`}
        >
          <Bell className="h-5 w-5" />
          {newCount > 0 && (
            <span className="absolute right-1.5 top-1.5 flex h-2.5 w-2.5 items-center justify-center rounded-full bg-primary ring-2 ring-background">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
            </span>
          )}
        </button>
      </div>
    </header>
  )

  // ── Loading (first fetch, no cached data yet) ──
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background">
        {header}
        <div className="flex min-h-[70vh] flex-col items-center justify-center text-center">
          <Loader2 className="h-8 w-8 animate-spin text-primary" strokeWidth={1.5} />
          <p className="mt-4 text-sm text-muted-foreground">Loading your request…</p>
        </div>
      </div>
    )
  }

  // ── Error - magic link invalid/expired/revoked, or the request wasn't found ──
  if (error) {
    const code       = error instanceof ApiError ? error.code : undefined
    const isRevoked  = code === 'MAGIC_LINK_REVOKED'
    const heading    = isRevoked ? 'This request has been closed' : 'This link is no longer valid'
    const body       = isRevoked
      ? 'The renter closed or cancelled this request, so it&apos;s no longer active.'
      : getErrorMessage(error)

    return (
      <div className="min-h-screen bg-background">
        {header}
        <main className="container mx-auto flex max-w-lg flex-col items-center px-4 py-16 text-center">
          <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full border border-destructive/30 bg-destructive/10">
            <AlertCircle className="h-8 w-8 text-destructive" strokeWidth={1.5} />
          </div>
          <h1 className="font-display text-xl font-bold text-foreground">{heading}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{body}</p>
          <Link
            to="/request"
            className="mt-8 rounded-full bg-primary px-8 py-3 text-sm font-semibold text-primary-foreground shadow-[0_0_30px_rgba(0,206,146,0.3)] transition-all hover:bg-primary/90"
          >
            Submit a New Request
          </Link>
        </main>
      </div>
    )
  }

  if (!data) return null

  return (
    <div className="min-h-screen bg-background">
      {header}

      <main className="container mx-auto max-w-lg space-y-4 px-4 py-8">

        {/* ── Success header ── */}
        <motion.div
          className="mb-2 text-center"
          variants={fadeUp}
          initial="hidden"
          animate="visible"
        >
          <motion.div
            variants={scaleIn}
            className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-primary shadow-[0_0_40px_rgba(0,206,146,0.4)]"
          >
            <CheckCircle className="h-8 w-8 text-primary-foreground" strokeWidth={1.5} />
          </motion.div>
          <h1 className="font-display text-2xl font-bold text-foreground">Request Submitted!</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            We&apos;re matching you with verified agents in {location}.
          </p>
        </motion.div>

        {data.status === 'PENDING_SUPPLY' ? (
          /* ── No agents cover this area yet ── */
          <Card className="p-6 text-center">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full border border-gold/20 bg-gold/10">
              <Clock className="h-7 w-7 text-gold" />
            </div>
            <h2 className="font-semibold text-foreground">No agents available yet</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              We don&apos;t have a verified agent covering {location} right now. We&apos;ll notify you
              the moment one becomes available - check back soon.
            </p>
          </Card>
        ) : (
          <>
            {/* ── Live matching card ── */}
            <Card>
              <div className="flex items-center gap-3 border-b border-border/50 bg-primary/5 px-5 py-4">
                <div className="relative flex items-center">
                  <div className="h-2.5 w-2.5 rounded-full bg-primary" />
                  <div className="absolute h-2.5 w-2.5 animate-ping rounded-full bg-primary opacity-75" />
                </div>
                <span className="font-semibold text-foreground">Matching you with agents…</span>
              </div>

              <div className="space-y-4 p-5">
                <div className="flex items-center gap-3 rounded-xl bg-secondary/60 p-4">
                  <Eye className="h-5 w-5 shrink-0 text-primary" />
                  <p className="font-medium text-foreground">
                    <span className="font-semibold text-primary">{agentsReviewing}</span>{' '}
                    agent{agentsReviewing !== 1 ? 's' : ''} reviewing your request
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2.5">
                  <InfoChip icon={<MapPin className="h-4 w-4 text-primary" strokeWidth={1.5} />}    label={location} />
                  <InfoChip
                    icon={<span className="text-xs font-bold text-primary">KES</span>}
                    label={budgetLabel}
                  />
                  <InfoChip icon={<Home className="h-4 w-4 text-primary" strokeWidth={1.5} />}     label={houseTypeLabel} />
                  <InfoChip icon={<Calendar className="h-4 w-4 text-primary" strokeWidth={1.5} />} label={moveTimelineLbl} />
                </div>

                <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
                  <div
                    className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                    style={{ width: `${Math.min((agentsReviewing / MAX_EXPECTED_AGENTS) * 100, 100)}%` }}
                  />
                </div>
              </div>
            </Card>

            {/* ── Response time ── */}
            <Card className="flex items-center gap-4 p-4">
              <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-gold/20 bg-gold/10">
                <Clock className="h-5 w-5 text-gold" />
              </div>
              <div>
                <p className="font-medium text-foreground">Average response time</p>
                <p className="text-sm text-muted-foreground">3–5 minutes</p>
              </div>
            </Card>

            {/* ── WhatsApp CTA ── */}
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-whatsapp/10">
                  <MessageCircle className="h-6 w-6 text-whatsapp" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-foreground">Stay Updated Instantly</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Get notified immediately when agents respond.
                  </p>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full bg-whatsapp py-3 text-sm font-semibold text-white shadow-[0_0_20px_rgba(37,211,102,0.2)] transition-all hover:bg-whatsapp/90 hover:shadow-[0_0_30px_rgba(37,211,102,0.35)]"
                  >
                    <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
                    Get Updates on WhatsApp
                  </button>
                </div>
              </div>
            </Card>

            {/* ── Push notifications ── */}
            <Card className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-primary/10">
                  <Smartphone className="h-6 w-6 text-primary" />
                </div>
                <div className="min-w-0 flex-1">
                  <h2 className="font-semibold text-foreground">Enable Push Notifications</h2>
                  <p className="mt-1 text-sm text-muted-foreground">
                    Never miss an update from your agents.
                  </p>
                  <button
                    type="button"
                    className="mt-4 flex w-full items-center justify-center gap-2 rounded-full border border-primary/50 py-3 text-sm font-semibold text-primary transition-all hover:bg-primary/8"
                  >
                    <Bell className="h-4 w-4" strokeWidth={1.5} />
                    Enable Notifications
                  </button>
                </div>
              </div>
            </Card>
          </>
        )}

        {/* ── Request details ── */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-semibold text-foreground">Your Request Details</h2>
            {/* Editing means starting a brand-new request/OTP flow - there's
                no PATCH endpoint for an existing request. */}
            <Link
              to="/request"
              className="flex items-center gap-1 rounded-lg px-2 py-1 text-sm text-primary transition-colors hover:bg-primary/8"
            >
              <Edit2 className="h-3.5 w-3.5" strokeWidth={1.5} />
              Edit
            </Link>
          </div>

          <div className="divide-y divide-border/50">
            {[
              { icon: <MapPin className="h-4 w-4" strokeWidth={1.5} />,    label: 'Location',      value: location },
              { icon: <span className="text-xs font-bold">KES</span>,      label: 'Budget Range',  value: `${budgetLabel} / mo` },
              { icon: <Home className="h-4 w-4" strokeWidth={1.5} />,      label: 'House Type',    value: houseTypeLabel },
              { icon: <Calendar className="h-4 w-4" strokeWidth={1.5} />,  label: 'Move Timeline', value: moveTimelineLbl },
            ].map(row => (
              <div key={row.label} className="flex items-center justify-between py-3">
                <div className="flex items-center gap-2.5 text-muted-foreground">
                  {row.icon}
                  <span className="text-sm">{row.label}</span>
                </div>
                <span className="text-sm font-medium text-foreground">{row.value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* ── Agent responses ── */}
        {data.status === 'MATCHED' && (
          <Card className="p-5">
            <div className="mb-4 flex items-center justify-between">
              <h2 className="font-semibold text-foreground">Agent Responses</h2>
              {newCount > 0 && (
                <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                  {newCount} new
                </span>
              )}
            </div>

            {data.matches.length > 0 ? (
              <div className="space-y-3">
                <AnimatePresence initial={false}>
                {data.matches.map(m => (
                  <motion.div
                    key={m.id}
                    variants={fadeUp}
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                    layout
                  >
                    <MatchCard match={m} />
                  </motion.div>
                ))}
                </AnimatePresence>
              </div>
            ) : (
              <div className="space-y-3">
                {[1, 2].map(i => (
                  <div key={i} className="animate-pulse rounded-xl bg-secondary/60 p-4">
                    <div className="flex gap-3">
                      <div className="h-10 w-10 rounded-full bg-muted/60" />
                      <div className="flex-1 space-y-2">
                        <div className="h-4 w-3/4 rounded-lg bg-muted/60" />
                        <div className="h-3 w-full rounded-lg bg-muted/60" />
                      </div>
                    </div>
                  </div>
                ))}
                <p className="text-center text-sm text-muted-foreground">
                  Agents will appear here once they accept your request.
                </p>
              </div>
            )}
          </Card>
        )}

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-2 gap-3">
          <button
            type="button"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition-all hover:border-primary/40 hover:bg-muted/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <Home className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">Browse Houses</span>
          </button>
          <button
            type="button"
            className="flex flex-col items-center gap-3 rounded-2xl border border-border/60 bg-card p-5 text-center transition-all hover:border-primary/40 hover:bg-muted/20"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
              <MapPin className="h-6 w-6 text-primary" />
            </div>
            <span className="text-sm font-medium text-foreground">View Nearby Areas</span>
          </button>
        </div>

        {/* ── Share ── */}
        <Card className="flex items-center gap-4 p-5">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-border/60 bg-secondary/60">
            <Share2 className="h-5 w-5 text-foreground/70" />
          </div>
          <div className="min-w-0 flex-1">
            <h2 className="font-semibold text-foreground">Know someone looking?</h2>
            <p className="mt-0.5 text-sm text-muted-foreground">Share KejaLink with friends</p>
          </div>
          <button
            type="button"
            className="flex shrink-0 items-center gap-1.5 rounded-full border border-border/60 px-4 py-2 text-sm font-medium text-foreground transition-all hover:border-primary/40 hover:text-primary"
          >
            <MessageCircle className="h-4 w-4" strokeWidth={1.5} />
            Share
          </button>
        </Card>

        {/* ── Trust reassurance ── */}
        <Card className="p-5">
          <div className="grid gap-3">
            {[
              { Icon: BadgeCheck, text: 'Verified agents only - no unvetted contacts' },
              { Icon: Shield,     text: 'No fake listings - every property is checked' },
              { Icon: Zap,        text: 'Fast response - average 3–5 minutes' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg border border-primary/15 bg-primary/10">
                  <Icon className="h-4 w-4 text-primary" strokeWidth={1.5} />
                </div>
                <span className="text-sm text-muted-foreground">{text}</span>
              </div>
            ))}
          </div>
        </Card>
      </main>
    </div>
  )
}
