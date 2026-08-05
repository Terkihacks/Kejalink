import { useState, useCallback, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { Loader2 } from 'lucide-react'
import { Input } from '@/components/ui'
import { cn } from '@/lib/utils'
import { useApplyAsAgent } from '@/hooks'
import { getErrorMessage } from '@/lib/error-messages'
import { AREAS } from '@/lib/constants'
import { PROPERTY_TYPES, PROPERTY_TYPE_LABELS } from './constants'

/**
 * One-time agent profile submission (POST /agents/apply). Photo/video/ID
 * document uploads aren't wired up yet (no file storage configured in this
 * pass) - those fields are optional on the backend, so the form only
 * collects what's required plus the two plain-text optional fields.
 */
export function AgentApplyPage() {
  const navigate = useNavigate()
  const applyAsAgent = useApplyAsAgent()

  const [name,          setName]          = useState('')
  const [bio,           setBio]           = useState('')
  const [serviceAreas,  setServiceAreas]  = useState<string[]>([])
  const [propertyTypes, setPropertyTypes] = useState<string[]>([])
  const [ecitizenId,    setEcitizenId]    = useState('')
  const [socialMedia,   setSocialMedia]   = useState('')

  const toggleArea = useCallback((area: string) => {
    setServiceAreas(prev => prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area])
  }, [])

  const toggleType = useCallback((type: string) => {
    setPropertyTypes(prev => prev.includes(type) ? prev.filter(t => t !== type) : [...prev, type])
  }, [])

  const isValid = useMemo(
    () => name.trim() !== '' && serviceAreas.length > 0 && propertyTypes.length > 0,
    [name, serviceAreas, propertyTypes],
  )

  const handleSubmit = useCallback(() => {
    applyAsAgent.mutate(
      {
        name:              name.trim(),
        bio:               bio.trim() || undefined,
        serviceAreas,
        propertyTypes,
        ecitizenIdNumber:  ecitizenId.trim() || undefined,
        socialMediaUrl:    socialMedia.trim() || undefined,
      },
      { onSuccess: () => navigate('/agent/dashboard') },
    )
  }, [applyAsAgent, name, bio, serviceAreas, propertyTypes, ecitizenId, socialMedia, navigate])

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Complete Your Agent Profile</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">
          Submit your details for verification - this is a one-time application. Once verified you&apos;ll start receiving matched leads.
        </p>
      </div>

      <div className="space-y-6">
        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Full Name</label>
          <Input value={name} onChange={e => setName(e.target.value)} placeholder="Jane Mwangi" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Bio (optional)</label>
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            placeholder="Experienced agent specialising in Kilimani apartments…"
            rows={3}
            className="w-full rounded-md border border-input bg-transparent px-3 py-2 text-sm shadow-xs outline-none transition-colors focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50"
          />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Service Areas</label>
          <div className="flex flex-wrap gap-2">
            {AREAS.map(area => (
              <button
                key={area}
                type="button"
                onClick={() => toggleArea(area)}
                className={cn(
                  'rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all duration-150',
                  serviceAreas.includes(area)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40',
                )}
              >
                {area}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Property Types</label>
          <div className="flex flex-wrap gap-2">
            {PROPERTY_TYPES.map(type => (
              <button
                key={type}
                type="button"
                onClick={() => toggleType(type)}
                className={cn(
                  'rounded-full border-2 px-3 py-1.5 text-sm font-medium transition-all duration-150',
                  propertyTypes.includes(type)
                    ? 'border-primary bg-primary text-primary-foreground'
                    : 'border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40',
                )}
              >
                {PROPERTY_TYPE_LABELS[type]}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">eCitizen ID Number (optional)</label>
          <Input value={ecitizenId} onChange={e => setEcitizenId(e.target.value)} placeholder="KE-A123456" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Social Media URL (optional)</label>
          <Input value={socialMedia} onChange={e => setSocialMedia(e.target.value)} placeholder="https://www.instagram.com/janeagent" />
        </div>
      </div>

      {applyAsAgent.isError && (
        <div className="mt-6 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
          <p className="text-sm font-medium text-destructive">{getErrorMessage(applyAsAgent.error)}</p>
        </div>
      )}

      <div className="mt-8">
        <button
          type="button"
          onClick={handleSubmit}
          disabled={!isValid || applyAsAgent.isPending}
          className={cn(
            'w-full rounded-full py-4 text-base font-semibold transition-all duration-200',
            isValid && !applyAsAgent.isPending
              ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(0,206,146,0.3)] hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(0,206,146,0.45)]'
              : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
          )}
        >
          {applyAsAgent.isPending ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : 'Submit Application'}
        </button>
      </div>
    </div>
  )
}
