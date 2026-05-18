import { memo, useMemo, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { scaleIn, fadeUp } from '@/lib/motion'
import { Link, useLocation } from 'react-router-dom'
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
  ChevronRight,
  BadgeCheck,
  Shield,
  Zap,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { KejaLinkIcon } from '@/components/Logo'
import { useRequestStatus, useNotifications } from '@/hooks'
import type { AgentNotification } from '@/types'

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

/** Individual agent notification row inside the Agent Responses card. */
const NotificationCard = memo(function NotificationCard({ notification }: { notification: AgentNotification }) {
  return (
    <div
      className={cn(
        'flex gap-3 rounded-xl border p-4 transition-all',
        notification.isNew
          ? 'border-primary/30 bg-primary/5'
          : 'border-border/50 bg-secondary/40',
      )}
    >
      {/* Avatar */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-primary text-sm font-bold text-primary-foreground shadow-[0_0_12px_rgba(0,206,146,0.3)]">
        {notification.avatar}
      </div>

      <div className="min-w-0 flex-1">
        <div className="flex items-start justify-between gap-2">
          <p className="text-sm font-medium leading-snug text-foreground">{notification.title}</p>
          {notification.isNew && (
            <span className="mt-0.5 h-2 w-2 shrink-0 rounded-full bg-primary" />
          )}
        </div>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">{notification.message}</p>
        <div className="mt-2">
          <span className="text-xs text-muted-foreground/60">{notification.time}</span>
        </div>
      </div>

      <ChevronRight className="mt-0.5 h-4 w-4 shrink-0 text-muted-foreground/50" strokeWidth={1.5} />
    </div>
  )
})

/* ─── Page ────────────────────────────────────────────────────────── */

/**
 * Request status tracking page (`/request/status`).
 *
 * Reads `requestId` from React Router location state (passed by RequestPage
 * on successful submission). Falls back to mock data via the service layer
 * when no backend is configured (VITE_API_BASE_URL not set).
 */
export function StatusPage() {
  const { state } = useLocation()
  const requestId = (state as { requestId?: string } | null)?.requestId ?? 'mock-req-001'

  const { data: requestData }       = useRequestStatus(requestId)
  const { data: notifications = [] } = useNotifications(requestId)

  const agentsReviewing = requestData?.agentsReviewing ?? 0
  const location        = requestData?.areas[0]         ?? '…'
  const maxBudget       = requestData?.maxBudget         ?? 0
  const houseTypeLabel  = requestData?.houseTypeLabel    ?? '…'
  const timelineLabel   = requestData?.moveTimelineLabel ?? '…'

  // useMemo: recomputes only when the notifications array reference changes
  const newCount = useMemo(
    () => notifications.filter(n => n.isNew).length,
    [notifications],
  )

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ── */}
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
                label={`up to ${(maxBudget / 1000).toFixed(0)}k`}
              />
              <InfoChip icon={<Home className="h-4 w-4 text-primary" strokeWidth={1.5} />}     label={houseTypeLabel} />
              <InfoChip icon={<Calendar className="h-4 w-4 text-primary" strokeWidth={1.5} />} label={timelineLabel} />
            </div>

            <div className="h-1.5 overflow-hidden rounded-full bg-muted/60">
              <div
                className="h-full rounded-full bg-primary transition-all duration-1000 ease-out"
                style={{ width: `${Math.min(agentsReviewing * 18, 85)}%` }}
              />
            </div>
          </div>
        </Card>

        {/* ── Response time ── */}
        <Card className="flex items-center gap-4 p-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-gold/10 border border-gold/20">
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
              <h3 className="font-semibold text-foreground">Stay Updated Instantly</h3>
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
              <h3 className="font-semibold text-foreground">Enable Push Notifications</h3>
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

        {/* ── Request details ── */}
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Your Request Details</h3>
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
              { icon: <span className="text-xs font-bold">KES</span>,      label: 'Max Budget',    value: `${maxBudget.toLocaleString()} / mo` },
              { icon: <Home className="h-4 w-4" strokeWidth={1.5} />,      label: 'House Type',    value: houseTypeLabel },
              { icon: <Calendar className="h-4 w-4" strokeWidth={1.5} />,  label: 'Move Timeline', value: timelineLabel },
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
        <Card className="p-5">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="font-semibold text-foreground">Agent Responses</h3>
            {newCount > 0 && (
              <span className="rounded-full bg-primary px-2.5 py-0.5 text-xs font-semibold text-primary-foreground">
                {newCount} new
              </span>
            )}
          </div>

          {notifications.length > 0 ? (
            <div className="space-y-3">
              <AnimatePresence initial={false}>
              {notifications.map(n => (
                <motion.div
                  key={n.id}
                  variants={fadeUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, height: 0, transition: { duration: 0.2 } }}
                  layout
                >
                  <NotificationCard notification={n} />
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
            <h3 className="font-semibold text-foreground">Know someone looking?</h3>
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
              { Icon: BadgeCheck, text: 'Verified agents only — no unvetted contacts' },
              { Icon: Shield,     text: 'No fake listings — every property is checked' },
              { Icon: Zap,        text: 'Fast response — average 3–5 minutes' },
            ].map(({ Icon, text }) => (
              <div key={text} className="flex items-center gap-3">
                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 border border-primary/15">
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
