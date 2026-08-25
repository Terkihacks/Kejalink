import { motion, useReducedMotion } from 'framer-motion'
import { Link } from 'react-router-dom'
import { Users, ShieldCheck, Ban, Clock, UserRound, Shield, Inbox, PackageSearch, Gavel, ArrowRight } from 'lucide-react'
import { StatCard } from '@/components/ui'
import { useAdminStats } from '@/hooks'
import { fadeUp, staggerContainer } from '@/lib/motion'
import type { AdminStats } from './types'

interface Card {
  icon:  React.ReactNode
  label: string
  value: number | undefined
  tone:  'success' | 'warning' | 'danger' | 'neutral' | 'info'
  attention?: boolean
}

function buildCards(stats: AdminStats | undefined): Card[] {
  return [
    { icon: <Users className="h-5 w-5" strokeWidth={1.5} />,       label: 'Total Agents',          value: stats?.agents.total,               tone: 'neutral' },
    { icon: <ShieldCheck className="h-5 w-5" strokeWidth={1.5} />, label: 'Verified Agents',        value: stats?.agents.verified,            tone: 'success' },
    { icon: <Clock className="h-5 w-5" strokeWidth={1.5} />,       label: 'Pending Verification',   value: stats?.agents.pendingVerification, tone: 'warning', attention: !!stats?.agents.pendingVerification },
    { icon: <Ban className="h-5 w-5" strokeWidth={1.5} />,         label: 'Suspended Agents',       value: stats?.agents.suspended,           tone: 'danger' },
    { icon: <UserRound className="h-5 w-5" strokeWidth={1.5} />,   label: 'Total Renters',          value: stats?.renters.total,              tone: 'info' },
    { icon: <Shield className="h-5 w-5" strokeWidth={1.5} />,      label: 'Total Admins',           value: stats?.admins.total,               tone: 'neutral' },
    { icon: <Inbox className="h-5 w-5" strokeWidth={1.5} />,       label: 'Active Requests',        value: stats?.requests.active,            tone: 'info' },
    { icon: <PackageSearch className="h-5 w-5" strokeWidth={1.5} />, label: 'Pending Supply',       value: stats?.requests.pendingSupply,     tone: 'warning' },
    { icon: <Gavel className="h-5 w-5" strokeWidth={1.5} />,       label: 'Pending Appeals',        value: stats?.appeals.pending,            tone: 'danger', attention: !!stats?.appeals.pending },
  ]
}

export function AdminDashboardPage() {
  const { data: stats, isLoading } = useAdminStats()
  const reducedMotion = useReducedMotion()
  const cards = buildCards(stats)

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Dashboard</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">An overview of platform activity.</p>
      </div>

      {(!!stats?.agents.pendingVerification || !!stats?.appeals.pending) && (
        <div className="mb-6 flex flex-wrap gap-3">
          {!!stats?.agents.pendingVerification && (
            <Link
              to="/admin/verifications"
              className="flex items-center gap-2 rounded-full border border-gold/30 bg-gold/10 px-4 py-2 text-sm font-medium text-gold transition-all hover:bg-gold/20"
            >
              {stats.agents.pendingVerification} agent{stats.agents.pendingVerification === 1 ? '' : 's'} awaiting verification
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
          {!!stats?.appeals.pending && (
            <Link
              to="/admin/appeals"
              className="flex items-center gap-2 rounded-full border border-destructive/30 bg-destructive/10 px-4 py-2 text-sm font-medium text-destructive transition-all hover:bg-destructive/20"
            >
              {stats.appeals.pending} pending appeal{stats.appeals.pending === 1 ? '' : 's'}
              <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          )}
        </div>
      )}

      <motion.div
        variants={reducedMotion ? undefined : staggerContainer()}
        initial={reducedMotion ? undefined : 'hidden'}
        animate={reducedMotion ? undefined : 'visible'}
        className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3"
      >
        {cards.map(card => (
          <motion.div key={card.label} variants={reducedMotion ? undefined : fadeUp}>
            <StatCard
              icon={card.icon}
              label={card.label}
              value={card.value ?? 0}
              tone={card.tone}
              attention={card.attention}
              isLoading={isLoading}
            />
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
