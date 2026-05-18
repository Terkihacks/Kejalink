import { useState, useMemo, useCallback, useTransition, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { slideRight } from '@/lib/motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, MapPin, Home, Calendar, Phone, Zap, CalendarDays, Clock } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui'
import { Slider } from '@/components/ui'
import { KejaLinkIcon } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { useSubmitRequest } from '@/hooks'
import {
  AREAS,
  HOUSE_TYPES,
  MOVE_TIMELINES,
  TOTAL_STEPS,
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
  BUDGET_DEFAULT,
} from './constants'

/* ─── Local helpers ──────────────────────────────────────────────── */

/**
 * Renders the icon + title + subtitle block at the top of each step.
 * Uses CSS child selectors so callers pass plain `<h1>` / `<p>` elements
 * without needing to specify classNames.
 */
function StepHeading({ icon, children }: { icon: ReactNode; children: ReactNode }) {
  return (
    <div className="mb-8 text-center">
      <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
        {icon}
      </div>
      <div
        className="[&_h1]:font-display [&_h1]:text-2xl [&_h1]:font-bold [&_h1]:text-foreground
                   [&_p]:mt-1.5 [&_p]:text-sm [&_p]:text-muted-foreground"
      >
        {children}
      </div>
    </div>
  )
}

/* ─── Page ───────────────────────────────────────────────────────── */

/**
 * Multi-step house request form.
 *
 * Steps:
 *  1. Location  — area pills (multi-select)
 *  2. Budget    — KES range slider
 *  3. House type — card selection
 *  4. Timeline  — 2×2 grid
 *  5. Phone and name      — tel input with +254 prefix
 *
 * On final submit → 2.8 s loading screen → `/request/status`
 */
const TIMELINE_ICONS: Record<string, LucideIcon> = {
  'immediately': Zap,
  'this-week':   Calendar,
  'this-month':  CalendarDays,
  'flexible':    Clock,
}

export function RequestPage() {
  const navigate       = useNavigate()
  const submitRequest  = useSubmitRequest()

  const [step,          setStep]          = useState(1)
  const [selectedAreas, setSelectedAreas] = useState<string[]>([])
  const [budget,        setBudget]        = useState([BUDGET_DEFAULT])
  const [houseType,     setHouseType]     = useState('')
  const [moveTimeline,  setMoveTimeline]  = useState('')
  const [phone,         setPhone]         = useState('')

  const isSubmitting = submitRequest.isPending

  // useTransition: marks step changes as non-urgent so React can keep
  // the current step's inputs responsive while the next step renders.
  const [, startTransition] = useTransition()

  // useCallback: stable reference — prevents child re-renders that depend
  // on this function as a prop or dependency.
  const toggleArea = useCallback((area: string) =>
    setSelectedAreas(prev =>
      prev.includes(area) ? prev.filter(a => a !== area) : [...prev, area],
    ), [])

  // useMemo: recomputes only when the relevant step's field changes,
  // not on every render.
  const isValid = useMemo(() => {
    switch (step) {
      case 1: return selectedAreas.length > 0
      case 2: return budget[0] > 0
      case 3: return houseType !== ''
      case 4: return moveTimeline !== ''
      case 5: return phone.length >= 9
      default: return false
    }
  }, [step, selectedAreas, budget, houseType, moveTimeline, phone])

  // useCallback: stable reference for the submit/next handler.
  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      startTransition(() => setStep(s => s + 1))
      return
    }

    submitRequest.mutate(
      {
        areas:        selectedAreas,
        maxBudget:    budget[0],
        houseType,
        moveTimeline,
        phone:        `+254${phone}`,
      },
      {
        onSuccess: (record) => {
          navigate('/request/status', { state: { requestId: record.id } })
        },
      },
    )
  }, [step, selectedAreas, budget, houseType, moveTimeline, phone, submitRequest, navigate])


  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ── */}
      {step <= TOTAL_STEPS && (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3.5">
            {step > 1 && !isSubmitting ? (
              <button
                type="button"
                onClick={() => setStep(s => s - 1)}
                className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Go back"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
            ) : (
              <Link
                to="/"
                className="flex h-11 w-11 items-center justify-center rounded-lg text-muted-foreground transition-colors hover:bg-muted/60 hover:text-foreground"
                aria-label="Back to home"
              >
                <ArrowLeft className="h-5 w-5" />
              </Link>
            )}

            <Link to="/" className="flex items-center gap-2">
              <KejaLinkIcon size={24} />
              <span className="font-display text-base font-black">
                <span className="text-foreground">Keja</span>
                <span className="text-primary">Link</span>
              </span>
            </Link>

            {!isSubmitting && (
              <span className="tabular-nums text-xs font-medium tracking-wide text-muted-foreground">
                {step} / {TOTAL_STEPS}
              </span>
            )}
          </div>

          {!isSubmitting && (
            <div className="h-0.5 bg-muted/40">
              <div
                className="h-full bg-primary transition-all duration-500 ease-out"
                style={{ width: `${(step / TOTAL_STEPS) * 100}%` }}
              />
            </div>
          )}
        </header>
      )}

      <main className="container mx-auto max-w-lg px-4 py-10">

        <AnimatePresence mode="wait">
        {/* ── Step 1: Location ── */}
        {step === 1 && (
          <motion.div key="step-1" variants={slideRight} initial="hidden" animate="visible" exit="exit">
            <StepHeading icon={<MapPin className="h-6 w-6 text-primary" />}>
              <h1>Where do you want to live?</h1>
              <p>Select one or more areas in Nairobi</p>
            </StepHeading>

            <div className="flex flex-wrap gap-3">
              {AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => toggleArea(area)}
                  className={cn(
                    'rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-150',
                    selectedAreas.includes(area)
                      ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_14px_rgba(0,206,146,0.3)]'
                      : 'border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40',
                  )}
                >
                  {area}
                </button>
              ))}
            </div>

            {selectedAreas.length > 0 && (
              <p className="mt-4 text-sm text-muted-foreground">
                {selectedAreas.length} area{selectedAreas.length > 1 ? 's' : ''} selected
              </p>
            )}
          </motion.div>
        )}

        {/* ── Step 2: Budget ── */}
        {step === 2 && (
          <motion.div key="step-2" variants={slideRight} initial="hidden" animate="visible" exit="exit">
            <StepHeading icon={<span className="text-xl font-black text-primary">KES</span>}>
              <h1>What&apos;s your monthly budget?</h1>
              <p>Drag to set your maximum rent</p>
            </StepHeading>

            <div className="rounded-2xl border border-border/60 bg-card p-8">
              <div className="mb-10 text-center">
                {/* KES label: smaller + muted so the number reads first */}
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  KES
                </p>
                <span className="font-display text-5xl font-black leading-none tracking-[-0.02em] tabular-nums text-primary">
                  {budget[0].toLocaleString()}
                </span>
                <p className="mt-2 text-xs text-muted-foreground">/ month</p>
              </div>

              <Slider
                value={budget}
                onValueChange={setBudget}
                min={BUDGET_MIN}
                max={BUDGET_MAX}
                step={BUDGET_STEP}
                className="w-full"
              />
              <div className="mt-4 flex justify-between text-xs text-muted-foreground">
                <span>KES {BUDGET_MIN.toLocaleString()}</span>
                <span>KES {BUDGET_MAX.toLocaleString()}</span>
              </div>
            </div>
          </motion.div>
        )}

        {/* ── Step 3: House Type ── */}
        {step === 3 && (
          <motion.div key="step-3" variants={slideRight} initial="hidden" animate="visible" exit="exit">
            <StepHeading icon={<Home className="h-6 w-6 text-primary" />}>
              <h1>What type of house?</h1>
              <p>Select your preferred option</p>
            </StepHeading>

            <div className="flex flex-col gap-3">
              {HOUSE_TYPES.map(type => (
                <button
                  key={type.id}
                  type="button"
                  onClick={() => setHouseType(type.id)}
                  className={cn(
                    'flex items-center justify-between rounded-2xl border-2 p-5 text-left transition-all duration-150',
                    houseType === type.id
                      ? 'border-primary bg-primary/8 shadow-[0_0_20px_rgba(0,206,146,0.1)]'
                      : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20',
                  )}
                >
                  <div>
                    <span className="block text-base font-semibold text-foreground">{type.label}</span>
                    <span className="text-sm text-muted-foreground">{type.sub}</span>
                  </div>
                  {houseType === type.id && (
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary shadow-[0_0_12px_rgba(0,206,146,0.4)]">
                      <Check className="h-4 w-4 text-primary-foreground" strokeWidth={1.5} />
                    </div>
                  )}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 4: Move Timeline ── */}
        {step === 4 && (
          <motion.div key="step-4" variants={slideRight} initial="hidden" animate="visible" exit="exit">
            <StepHeading icon={<Calendar className="h-6 w-6 text-primary" />}>
              <h1>When do you want to move?</h1>
              <p>Helps agents prioritise your request</p>
            </StepHeading>

            <div className="grid grid-cols-2 gap-3">
              {MOVE_TIMELINES.map(t => {
                const Icon = TIMELINE_ICONS[t.id]
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMoveTimeline(t.id)}
                    className={cn(
                      'flex flex-col items-center gap-3 rounded-2xl border-2 p-5 text-center transition-all duration-150',
                      moveTimeline === t.id
                        ? 'border-primary bg-primary/8 shadow-[0_0_20px_rgba(0,206,146,0.1)]'
                        : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20',
                    )}
                  >
                    <div className={cn(
                      'flex h-12 w-12 items-center justify-center rounded-xl border transition-colors',
                      moveTimeline === t.id
                        ? 'border-primary/30 bg-primary/15'
                        : 'border-border/50 bg-secondary/60',
                    )}>
                      <Icon className={cn(
                        'h-6 w-6 transition-colors',
                        moveTimeline === t.id ? 'text-primary' : 'text-muted-foreground',
                      )} strokeWidth={2} />
                    </div>
                    <span className="font-semibold text-foreground">{t.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Step 5: Phone ── */}
        {step === 5 && !isSubmitting && (
          <motion.div key="step-5" variants={slideRight} initial="hidden" animate="visible" exit="exit">
        
            <StepHeading icon={<Phone className="h-6 w-6 text-primary" />}>
              <h1>Enter your phone number</h1>
              <p>Agents will contact you via WhatsApp or call</p>
            </StepHeading>

            <div className="rounded-2xl border border-border/60 bg-card p-6">
              <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Kenya (+254)
              </label>
              <div className="flex items-center gap-3 rounded-xl border border-border/60 bg-background px-4 py-3 transition-all focus-within:border-primary/60 focus-within:shadow-[0_0_0_3px_rgba(0,206,146,0.1)]">
                <span className="shrink-0 text-base font-semibold text-muted-foreground">+254</span>
                <div className="h-5 w-px bg-border/60" />
                <Input
                  type="tel"
                  placeholder="712 345 678"
                  value={phone}
                  onChange={e => setPhone(e.target.value.replace(/\D/g, ''))}
                  className="border-0 bg-transparent p-0 text-lg shadow-none focus-visible:ring-0"
                  maxLength={10}
                  inputMode="tel"
                  autoComplete="tel-national"
                />
              </div>
              <p className="mt-3 text-xs text-muted-foreground">
                We&apos;ll only share this with agents who accept your request.
              </p>
            </div>
          </motion.div>
        )}

        {/* ── Submitting / matching loader ── */}
        {isSubmitting && (
          <motion.div
            key="submitting"
            variants={slideRight}
            initial="hidden"
            animate="visible"
            exit="exit"
            className="flex min-h-[60vh] flex-col items-center justify-center text-center"
          >
            <div className="relative mb-8">
              <div className="h-20 w-20 rounded-full border-2 border-primary/20" />
              <Loader2 className="absolute inset-0 m-auto h-10 w-10 animate-spin text-primary" strokeWidth={1.5} />
              <div className="absolute inset-0 animate-ping rounded-full bg-primary/10" />
            </div>
            <h1 className="font-display text-2xl font-bold text-foreground">Matching you with agents…</h1>
            <p className="mt-3 text-muted-foreground">This usually takes under 30 seconds</p>
            <div className="mt-6 flex items-center gap-2">
              {[0, 0.15, 0.3].map((delay, i) => (
                <motion.span
                  key={i}
                  className="h-1.5 w-1.5 rounded-full bg-primary"
                  animate={{ y: [0, -6, 0] }}
                  transition={{ duration: 0.6, repeat: Infinity, delay, ease: 'easeInOut' }}
                />
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Submission error ── */}
        {submitRequest.isError && !isSubmitting && (
          <div className="mt-6 rounded-2xl border border-destructive/40 bg-destructive/10 p-5 text-center">
            <p className="text-sm font-medium text-destructive">
              Something went wrong. Please try again.
            </p>
            <button
              type="button"
              onClick={() => submitRequest.reset()}
              className="mt-3 text-sm text-primary underline-offset-2 hover:underline"
            >
              Retry
            </button>
          </div>
        )}

        </AnimatePresence>

        {/* ── Continue / Submit CTA ── */}
        {step <= TOTAL_STEPS && !isSubmitting && (
          <div className="mt-10">
            <button
              type="button"
              onClick={handleNext}
              disabled={!isValid}
              className={cn(
                'w-full rounded-full py-4 text-base font-semibold transition-all duration-200',
                isValid
                  ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(0,206,146,0.3)] hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(0,206,146,0.45)]'
                  : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
              )}
            >
              {step === TOTAL_STEPS ? 'Submit Request' : 'Continue'}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
