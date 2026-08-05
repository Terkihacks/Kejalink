import { useState } from 'react'
import { MapPin, Calendar, ShieldCheck, Clock, Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useAgentProfile, useAgentLeads, useAcceptLead, useDeclineLead } from '@/hooks'
import { getErrorMessage } from '@/lib/error-messages'
import { MOVE_TIMELINES } from '@/features/request/constants'
import type { AgentLead, LeadStatus } from './types'

const LEAD_STATUS_CONFIG: Record<LeadStatus, { label: string; badgeClass: string }> = {
  NOTIFIED: { label: 'New',      badgeClass: 'border-gold/30 bg-gold/15 text-gold' },
  ACCEPTED: { label: 'Accepted', badgeClass: 'border-primary/30 bg-primary/15 text-primary' },
  DECLINED: { label: 'Declined', badgeClass: 'border-border/60 bg-muted/60 text-muted-foreground' },
  EXPIRED:  { label: 'Expired',  badgeClass: 'border-border/60 bg-muted/60 text-muted-foreground' },
}

function timelineLabel(timeline: string): string {
  return MOVE_TIMELINES.find(t => t.id === timeline)?.label ?? timeline
}

function LeadCard({ lead }: { lead: AgentLead }) {
  const acceptLead  = useAcceptLead()
  const declineLead = useDeclineLead()
  const [rematchMessage, setRematchMessage] = useState<string | null>(null)

  const config = LEAD_STATUS_CONFIG[lead.status]
  const isActionable = lead.status === 'NOTIFIED'
  const isPending = acceptLead.isPending || declineLead.isPending

  return (
    <div className="rounded-2xl border border-border/60 bg-card p-5">
      <div className="mb-3 flex items-start justify-between gap-2">
        <div>
          <p className="font-semibold text-foreground">{lead.request.area}</p>
          <p className="text-sm text-muted-foreground">
            KES {lead.request.budgetMin.toLocaleString()} – {lead.request.budgetMax.toLocaleString()} / mo
          </p>
        </div>
        <span className={cn('shrink-0 whitespace-nowrap rounded-full border px-2 py-0.5 text-[10px] font-semibold uppercase tracking-wide', config.badgeClass)}>
          {config.label}
        </span>
      </div>

      <div className="mb-4 flex flex-wrap gap-4 text-xs text-muted-foreground">
        <span className="flex items-center gap-1.5">
          <MapPin className="h-3.5 w-3.5" strokeWidth={1.5} />
          Rank {lead.rank}
        </span>
        <span className="flex items-center gap-1.5">
          <Calendar className="h-3.5 w-3.5" strokeWidth={1.5} />
          {timelineLabel(lead.request.timeline)}
        </span>
      </div>

      {isActionable && (
        <div className="flex gap-2">
          <button
            type="button"
            disabled={isPending}
            onClick={() => acceptLead.mutate(lead.id)}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full bg-primary py-2.5 text-sm font-semibold text-primary-foreground transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Check className="h-4 w-4" strokeWidth={1.5} />
            Accept
          </button>
          <button
            type="button"
            disabled={isPending}
            onClick={() => declineLead.mutate(lead.id, {
              onSuccess: result => setRematchMessage(result.rematch),
            })}
            className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border/60 py-2.5 text-sm font-semibold text-foreground transition-all hover:border-destructive/40 hover:text-destructive disabled:cursor-not-allowed disabled:opacity-60"
          >
            <X className="h-4 w-4" strokeWidth={1.5} />
            Decline
          </button>
        </div>
      )}

      {rematchMessage && (
        <p className="mt-3 text-xs text-muted-foreground">
          {rematchMessage === 'next agent notified' ? 'The next agent in line has been notified.' : 'No other agents are available for this request.'}
        </p>
      )}

      {(acceptLead.isError || declineLead.isError) && (
        <p className="mt-3 text-xs font-medium text-destructive">
          {getErrorMessage(acceptLead.error ?? declineLead.error)}
        </p>
      )}
    </div>
  )
}

export function AgentDashboardPage() {
  const { data: profile } = useAgentProfile()
  const { data: leads = [], isLoading } = useAgentLeads()

  const notVerified = profile && profile.verificationStatus !== 'VERIFIED'

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Your Leads</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Matched rental requests appear here as they come in.</p>
      </div>

      {notVerified && (
        <div className="mb-6 flex items-center gap-3 rounded-2xl border border-gold/30 bg-gold/10 p-4">
          <ShieldCheck className="h-5 w-5 shrink-0 text-gold" />
          <div>
            <p className="text-sm font-medium text-foreground">
              Verification {profile.verificationStatus === 'REJECTED' ? 'was rejected' : 'in progress'}
            </p>
            <p className="text-xs text-muted-foreground">
              {profile.verificationStatus === 'REJECTED'
                ? 'You can resubmit your application after 7 days.'
                : "You'll start receiving leads once your profile is verified (usually 24–48 hours)."}
            </p>
          </div>
        </div>
      )}

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => (
            <div key={i} className="animate-pulse rounded-2xl border border-border/60 bg-card p-5">
              <div className="h-4 w-1/3 rounded bg-muted/60" />
              <div className="mt-2 h-3 w-1/2 rounded bg-muted/60" />
            </div>
          ))}
        </div>
      ) : leads.length > 0 ? (
        <div className="space-y-3">
          {leads.map(lead => <LeadCard key={lead.id} lead={lead} />)}
        </div>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-8 text-center">
          <Clock className="mx-auto mb-3 h-8 w-8 text-muted-foreground" strokeWidth={1.5} />
          <p className="text-sm text-muted-foreground">No leads yet - new matches will show up here.</p>
        </div>
      )}
    </div>
  )
}
