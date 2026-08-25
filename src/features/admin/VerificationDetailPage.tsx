import { useState, useMemo } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { ArrowLeft, Check, X, Loader2, ExternalLink } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useVerificationDetail, useApproveVerification, useRejectVerification } from '@/hooks'
import { getErrorMessage } from '@/lib/error-messages'

const CHECKLIST_ITEMS = [
  { key: 'isIdReadable',        label: 'ID document is clear and readable',                     required: true },
  { key: 'isFaceMatching',      label: 'Face in liveness video matches ID photo',                required: true },
  { key: 'isLivenessConfirmed', label: 'Liveness check confirmed (not a photo/video replay)',    required: true },
  { key: 'isEcitizenVerified',  label: 'eCitizen ID number verified',                            required: true },
  { key: 'isSocialMediaValid',  label: 'Social media presence verified (optional)',              required: false },
] as const

export function VerificationDetailPage() {
  const { agentId } = useParams<{ agentId: string }>()
  const navigate = useNavigate()
  const { data, isLoading } = useVerificationDetail(agentId)
  const approve = useApproveVerification()
  const reject  = useRejectVerification()

  const [checklist, setChecklist] = useState<Record<string, boolean>>({})
  const [rejectReason, setRejectReason] = useState('')
  const [showReject, setShowReject] = useState(false)

  const allChecked = useMemo(
    () => CHECKLIST_ITEMS.filter(item => item.required).every(item => checklist[item.key] === true),
    [checklist],
  )

  if (isLoading) {
    return <Loader2 className="h-6 w-6 animate-spin text-primary" strokeWidth={1.5} />
  }

  if (!data) return null

  const docs = [
    { label: 'ID Front',        url: data.agent.idFrontPhotoUrl },
    { label: 'ID Back',         url: data.agent.idBackPhotoUrl },
    { label: 'Liveness Video',  url: data.agent.livenessVideoUrl },
  ].filter(d => d.url)

  const handleApprove = () => {
    if (!agentId || !allChecked) return
    approve.mutate(
      {
        agentId,
        checklist: {
          isIdReadable: true, isFaceMatching: true, isLivenessConfirmed: true, isEcitizenVerified: true,
          ...(checklist.isSocialMediaValid ? { isSocialMediaValid: true } : {}),
        },
      },
      { onSuccess: () => navigate('/admin/verifications') },
    )
  }

  const handleReject = () => {
    if (!agentId || rejectReason.trim().length < 10) return
    reject.mutate(
      { agentId, reason: rejectReason.trim() },
      { onSuccess: () => navigate('/admin/verifications') },
    )
  }

  return (
    <div>
      <Link to="/admin/verifications" className="mb-6 flex items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
        <ArrowLeft className="h-4 w-4" strokeWidth={1.5} />
        Back to queue
      </Link>

      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">{data.agent.name}</h1>
        <p className="mt-1 text-sm text-muted-foreground">{data.agent.phone}</p>
      </div>

      <div className="mb-6 rounded-2xl border border-border/60 bg-card p-5">
        <h3 className="mb-3 font-semibold text-foreground">Submitted Documents</h3>
        {docs.length > 0 ? (
          <div className="flex flex-wrap gap-2">
            {docs.map(doc => (
              <a
                key={doc.label}
                href={doc.url!}
                target="_blank"
                rel="noreferrer"
                className="flex items-center gap-1.5 rounded-full border border-border/60 px-3 py-1.5 text-xs font-medium text-foreground transition-colors hover:border-primary/40 hover:text-primary"
              >
                {doc.label}
                <ExternalLink className="h-3 w-3" strokeWidth={1.5} />
              </a>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">No documents submitted.</p>
        )}
        {data.agent.ecitizenIdNumber && (
          <p className="mt-3 text-sm text-muted-foreground">eCitizen ID: {data.agent.ecitizenIdNumber}</p>
        )}
      </div>

      {!showReject ? (
        <>
          <div className="mb-6 rounded-2xl border border-border/60 bg-card p-5">
            <h3 className="mb-4 font-semibold text-foreground">Verification Checklist</h3>
            <div className="space-y-3">
              {CHECKLIST_ITEMS.map(item => (
                <label key={item.key} className="flex items-center gap-3 text-sm text-foreground">
                  <input
                    type="checkbox"
                    checked={checklist[item.key] === true}
                    onChange={e => setChecklist(prev => ({ ...prev, [item.key]: e.target.checked }))}
                    className="h-4 w-4 rounded border-border/60 accent-primary"
                  />
                  {item.label}
                </label>
              ))}
            </div>
          </div>

          {(approve.isError || reject.isError) && (
            <div className="mb-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
              <p className="text-sm font-medium text-destructive">{getErrorMessage(approve.error ?? reject.error)}</p>
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={handleApprove}
              disabled={!allChecked || approve.isPending}
              className={cn(
                'flex flex-1 items-center justify-center gap-1.5 rounded-full py-3 text-sm font-semibold transition-all',
                allChecked && !approve.isPending
                  ? 'bg-primary text-primary-foreground hover:bg-primary/90'
                  : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
              )}
            >
              <Check className="h-4 w-4" strokeWidth={1.5} />
              Approve
            </button>
            <button
              type="button"
              onClick={() => setShowReject(true)}
              className="flex flex-1 items-center justify-center gap-1.5 rounded-full border border-border/60 py-3 text-sm font-semibold text-foreground transition-all hover:border-destructive/40 hover:text-destructive"
            >
              <X className="h-4 w-4" strokeWidth={1.5} />
              Reject
            </button>
          </div>
        </>
      ) : (
        <div className="rounded-2xl border border-border/60 bg-card p-5">
          <h3 className="mb-3 font-semibold text-foreground">Rejection Reason</h3>
          <textarea
            value={rejectReason}
            onChange={e => setRejectReason(e.target.value)}
            placeholder="Explain why this application is being rejected (min 10 characters)…"
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />

          {reject.isError && (
            <p className="mt-3 text-sm font-medium text-destructive">{getErrorMessage(reject.error)}</p>
          )}

          <div className="mt-4 flex gap-3">
            <button
              type="button"
              onClick={handleReject}
              disabled={rejectReason.trim().length < 10 || reject.isPending}
              className={cn(
                'flex-1 rounded-full py-3 text-sm font-semibold transition-all',
                rejectReason.trim().length >= 10 && !reject.isPending
                  ? 'bg-destructive text-destructive-foreground hover:bg-destructive/90'
                  : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
              )}
            >
              Confirm Rejection
            </button>
            <button
              type="button"
              onClick={() => setShowReject(false)}
              className="flex-1 rounded-full border border-border/60 py-3 text-sm font-semibold text-foreground transition-all hover:bg-muted/40"
            >
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
