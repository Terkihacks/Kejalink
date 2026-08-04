import { useState, useMemo, useCallback, useEffect, useTransition, type ReactNode } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { slideRight } from '@/lib/motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Check, Loader2, MapPin, Home, Calendar, Phone, Zap, CalendarDays } from 'lucide-react'
import { type LucideIcon } from 'lucide-react'
import { Input } from '@/components/ui'
import { Slider } from '@/components/ui'
import { KejaLinkIcon } from '@/components/Logo'
import { cn } from '@/lib/utils'
import { useCreateRequest, useRequestRenterOtp, useVerifyRenterOtp, useSlowRequestNotice } from '@/hooks'
import { getSession, setSession } from '@/lib/auth-storage'
import { ApiError } from '@/lib/api'
import { getErrorMessage } from '@/lib/error-messages'
import { extractMagicLinkToken } from '@/lib/magic-link'
import type { RequestTimeline } from '@/types'
import {
  AREAS,
  HOUSE_TYPES,
  BEDROOMS_BY_HOUSE_TYPE,
  MOVE_TIMELINES,
  TOTAL_STEPS,
  BUDGET_MIN,
  BUDGET_MAX,
  BUDGET_STEP,
  BUDGET_MIN_DEFAULT,
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
 *  1. Location  — single area select
 *  2. Budget    — KES min/max range (two sliders)
 *  3. House type — card selection (mapped to `bedrooms` at submit time)
 *  4. Timeline  — card list (id is the exact API enum value)
 *  5. Phone verification — phone entry, then inline OTP entry (same step,
 *     two phases) before the actual POST /requests call fires
 *
 * On final submit → verify OTP → create request → navigate to the
 * magic-link results page.
 */
const TIMELINE_ICONS: Record<string, LucideIcon> = {
  'ASAP':              Zap,
  'WITHIN_1_MONTH':    Calendar,
  'WITHIN_3_MONTHS':   CalendarDays,
}

const RESEND_COOLDOWN_SECONDS = 60

export function RequestPage() {
  const navigate = useNavigate()

  const requestOtp    = useRequestRenterOtp()
  const verifyOtp     = useVerifyRenterOtp()
  const createRequest = useCreateRequest()

  const [step,         setStep]         = useState(1)
  const [selectedArea, setSelectedArea] = useState('')
  const [budgetMin,    setBudgetMin]    = useState([BUDGET_MIN_DEFAULT])
  const [budgetMax,    setBudgetMax]    = useState([BUDGET_DEFAULT])
  const [houseType,    setHouseType]    = useState('')
  const [moveTimeline, setMoveTimeline] = useState('')
  const [phone,        setPhone]        = useState('')

  const [otpPhase,        setOtpPhase]        = useState<'phone' | 'otp'>('phone')
  const [otpCode,         setOtpCode]         = useState('')
  const [resendCooldown,  setResendCooldown]  = useState(0)

  const isVerifying  = verifyOtp.isPending
  const isCreating   = createRequest.isPending
  const isSubmitting = isVerifying || isCreating

  const isOtpSlow        = useSlowRequestNotice(requestOtp.isPending)
  const isSubmittingSlow = useSlowRequestNotice(isSubmitting)

  // useTransition: marks step changes as non-urgent so React can keep
  // the current step's inputs responsive while the next step renders.
  const [, startTransition] = useTransition()

  // Resend-code cooldown ticker.
  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1_000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const handleMinChange = useCallback(([v]: number[]) => {
    setBudgetMin([Math.min(v, budgetMax[0] - BUDGET_STEP)])
  }, [budgetMax])

  const handleMaxChange = useCallback(([v]: number[]) => {
    setBudgetMax([Math.max(v, budgetMin[0] + BUDGET_STEP)])
  }, [budgetMin])

  // useMemo: recomputes only when the relevant step's field changes,
  // not on every render.
  const isValid = useMemo(() => {
    switch (step) {
      case 1: return selectedArea !== ''
      case 2: return budgetMin[0] > 0 && budgetMin[0] < budgetMax[0]
      case 3: return houseType !== ''
      case 4: return moveTimeline !== ''
      case 5: return otpPhase === 'phone' ? phone.length >= 9 : otpCode.length === 6
      default: return false
    }
  }, [step, selectedArea, budgetMin, budgetMax, houseType, moveTimeline, phone, otpPhase, otpCode])

  const fullPhone = `+254${phone}`

  const handleSendOtp = useCallback(() => {
    requestOtp.mutate(fullPhone, {
      onSuccess: () => {
        setOtpPhase('otp')
        setOtpCode('')
        setResendCooldown(RESEND_COOLDOWN_SECONDS)
      },
    })
  }, [requestOtp, fullPhone])

  const handleVerifyAndSubmit = useCallback(async () => {
    try {
      // If a prior attempt already verified the OTP but createRequest failed,
      // a stored session lets us retry submission without re-verifying.
      let session = getSession('renter')

      if (!session) {
        const authResult = await verifyOtp.mutateAsync({ phone: fullPhone, code: otpCode })
        session = {
          accessToken:  authResult.accessToken,
          refreshToken: authResult.refreshToken,
          user:         authResult.user,
        }
        setSession('renter', session)
      }

      const result = await createRequest.mutateAsync({
        area:      selectedArea,
        budgetMin: budgetMin[0],
        budgetMax: budgetMax[0],
        bedrooms:  BEDROOMS_BY_HOUSE_TYPE[houseType],
        timeline:  moveTimeline as RequestTimeline,
      })

      const token = extractMagicLinkToken(result.magicLink)
      navigate(token ? `/results/${token}` : '/results')
    } catch (err) {
      if (err instanceof ApiError && err.code === 'OTP_ATTEMPTS_EXCEEDED') {
        setOtpPhase('phone')
        setOtpCode('')
      }
    }
  }, [verifyOtp, createRequest, fullPhone, otpCode, selectedArea, budgetMin, budgetMax, houseType, moveTimeline, navigate])

  // useCallback: stable reference for the submit/next handler.
  const handleNext = useCallback(() => {
    if (step < TOTAL_STEPS) {
      startTransition(() => setStep(s => s + 1))
      return
    }

    if (otpPhase === 'phone') {
      handleSendOtp()
      return
    }

    handleVerifyAndSubmit()
  }, [step, otpPhase, handleSendOtp, handleVerifyAndSubmit])

  const handleBack = useCallback(() => {
    if (step === TOTAL_STEPS && otpPhase === 'otp') {
      setOtpPhase('phone')
      setOtpCode('')
      return
    }
    setStep(s => s - 1)
  }, [step, otpPhase])

  const ctaLabel = step < TOTAL_STEPS
    ? 'Continue'
    : otpPhase === 'phone' ? 'Send Verification Code' : 'Verify & Submit'

  return (
    <div className="min-h-screen bg-background">
      {/* ── Sticky header ── */}
      {step <= TOTAL_STEPS && (
        <header className="sticky top-0 z-50 border-b border-border/50 bg-background/95 backdrop-blur-md">
          <div className="flex items-center justify-between px-4 py-3.5">
            {step > 1 && !isSubmitting ? (
              <button
                type="button"
                onClick={handleBack}
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
              <p>Select an area in Nairobi</p>
            </StepHeading>

            <div className="flex flex-wrap gap-3">
              {AREAS.map(area => (
                <button
                  key={area}
                  type="button"
                  onClick={() => setSelectedArea(area)}
                  className={cn(
                    'rounded-full border-2 px-4 py-2 text-sm font-medium transition-all duration-150',
                    selectedArea === area
                      ? 'border-primary bg-primary text-primary-foreground shadow-[0_0_14px_rgba(0,206,146,0.3)]'
                      : 'border-border/60 bg-card text-foreground hover:border-primary/50 hover:bg-muted/40',
                  )}
                >
                  {area}
                </button>
              ))}
            </div>
          </motion.div>
        )}

        {/* ── Step 2: Budget ── */}
        {step === 2 && (
          <motion.div key="step-2" variants={slideRight} initial="hidden" animate="visible" exit="exit">
            <StepHeading icon={<span className="text-xl font-black text-primary">KES</span>}>
              <h1>What&apos;s your budget range?</h1>
              <p>Drag to set your monthly rent range</p>
            </StepHeading>

            <div className="rounded-2xl border border-border/60 bg-card p-8">
              <div className="mb-8 text-center">
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  KES / month
                </p>
                <span className="font-display text-3xl font-black leading-none tracking-[-0.02em] tabular-nums text-primary">
                  {budgetMin[0].toLocaleString()} – {budgetMax[0].toLocaleString()}
                </span>
              </div>

              <div className="space-y-6">
                <div>
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Minimum</span>
                    <span className="tabular-nums font-medium text-foreground">KES {budgetMin[0].toLocaleString()}</span>
                  </div>
                  <Slider value={budgetMin} onValueChange={handleMinChange} min={BUDGET_MIN} max={BUDGET_MAX} step={BUDGET_STEP} />
                </div>
                <div>
                  <div className="mb-2 flex justify-between text-xs text-muted-foreground">
                    <span>Maximum</span>
                    <span className="tabular-nums font-medium text-foreground">KES {budgetMax[0].toLocaleString()}</span>
                  </div>
                  <Slider value={budgetMax} onValueChange={handleMaxChange} min={BUDGET_MIN} max={BUDGET_MAX} step={BUDGET_STEP} />
                </div>
              </div>

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

            <div className="flex flex-col gap-3">
              {MOVE_TIMELINES.map(t => {
                const Icon = TIMELINE_ICONS[t.id]
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setMoveTimeline(t.id)}
                    className={cn(
                      'flex items-center gap-4 rounded-2xl border-2 p-5 text-left transition-all duration-150',
                      moveTimeline === t.id
                        ? 'border-primary bg-primary/8 shadow-[0_0_20px_rgba(0,206,146,0.1)]'
                        : 'border-border/60 bg-card hover:border-primary/40 hover:bg-muted/20',
                    )}
                  >
                    <div className={cn(
                      'flex h-12 w-12 shrink-0 items-center justify-center rounded-xl border transition-colors',
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
                    {moveTimeline === t.id && (
                      <Check className="ml-auto h-5 w-5 shrink-0 text-primary" strokeWidth={2} />
                    )}
                  </button>
                )
              })}
            </div>
          </motion.div>
        )}

        {/* ── Step 5: Phone + OTP verification ── */}
        {step === 5 && !isSubmitting && (
          <motion.div key="step-5" variants={slideRight} initial="hidden" animate="visible" exit="exit">
            {otpPhase === 'phone' ? (
              <>
                <StepHeading icon={<Phone className="h-6 w-6 text-primary" />}>
                  <h1>Enter your phone number</h1>
                  <p>We&apos;ll text you a verification code</p>
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

                {requestOtp.isError && (
                  <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
                    <p className="text-sm font-medium text-destructive">{getErrorMessage(requestOtp.error)}</p>
                  </div>
                )}
              </>
            ) : (
              <>
                <StepHeading icon={<Phone className="h-6 w-6 text-primary" />}>
                  <h1>Enter verification code</h1>
                  <p>We sent a 6-digit code to +254{phone}</p>
                </StepHeading>

                <div className="rounded-2xl border border-border/60 bg-card p-6">
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                    Verification code
                  </label>
                  <Input
                    type="text"
                    placeholder="123456"
                    value={otpCode}
                    onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="text-center text-2xl tracking-[0.5em]"
                    maxLength={6}
                    inputMode="numeric"
                    autoComplete="one-time-code"
                    aria-invalid={verifyOtp.isError || createRequest.isError}
                  />

                  <button
                    type="button"
                    onClick={handleSendOtp}
                    disabled={resendCooldown > 0 || requestOtp.isPending}
                    className="mt-4 text-sm text-primary underline-offset-2 hover:underline disabled:cursor-not-allowed disabled:text-muted-foreground disabled:no-underline"
                  >
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend code'}
                  </button>
                </div>

                {(verifyOtp.isError || createRequest.isError) && (
                  <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
                    <p className="text-sm font-medium text-destructive">
                      {getErrorMessage(verifyOtp.error ?? createRequest.error)}
                    </p>
                  </div>
                )}
              </>
            )}
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
            <h1 className="font-display text-2xl font-bold text-foreground">
              {isVerifying ? 'Verifying your number…' : 'Matching you with agents…'}
            </h1>
            <p className="mt-3 text-muted-foreground">
              {isSubmittingSlow ? 'The server is waking up from idle — this can take up to a minute' : 'This usually takes under 30 seconds'}
            </p>
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

        </AnimatePresence>

        {/* ── Continue / Submit CTA ── */}
        {step <= TOTAL_STEPS && !isSubmitting && (
          <div className="mt-10">
            <button
              type="button"
              onClick={handleNext}
              disabled={!isValid || requestOtp.isPending}
              className={cn(
                'w-full rounded-full py-4 text-base font-semibold transition-all duration-200',
                isValid && !requestOtp.isPending
                  ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(0,206,146,0.3)] hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(0,206,146,0.45)]'
                  : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
              )}
            >
              {requestOtp.isPending ? (isOtpSlow ? 'Waking up the server…' : 'Sending code…') : ctaLabel}
            </button>
          </div>
        )}
      </main>
    </div>
  )
}
