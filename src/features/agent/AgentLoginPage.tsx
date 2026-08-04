import { useState, useCallback, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { slideRight } from '@/lib/motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, Phone, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui'
import { KejaLinkIcon } from '@/components/Logo'
import { useRequestAgentOtp, useVerifyAgentOtp } from '@/hooks'
import { setSession } from '@/lib/auth-storage'
import { getErrorMessage } from '@/lib/error-messages'
import { cn } from '@/lib/utils'

const RESEND_COOLDOWN_SECONDS = 60

/**
 * Agent phone/OTP login. On success, routes to /agent/apply if the agent
 * hasn't submitted a profile yet (hasProfile: false), otherwise /agent/dashboard.
 */
export function AgentLoginPage() {
  const navigate = useNavigate()
  const requestOtp = useRequestAgentOtp()
  const verifyOtp  = useVerifyAgentOtp()

  const [phase,          setPhase]          = useState<'phone' | 'otp'>('phone')
  const [phone,          setPhone]          = useState('')
  const [otpCode,        setOtpCode]        = useState('')
  const [resendCooldown, setResendCooldown] = useState(0)

  useEffect(() => {
    if (resendCooldown <= 0) return
    const t = setTimeout(() => setResendCooldown(c => c - 1), 1_000)
    return () => clearTimeout(t)
  }, [resendCooldown])

  const fullPhone = `+254${phone}`

  const handleSendOtp = useCallback(() => {
    requestOtp.mutate(fullPhone, {
      onSuccess: () => {
        setPhase('otp')
        setOtpCode('')
        setResendCooldown(RESEND_COOLDOWN_SECONDS)
      },
    })
  }, [requestOtp, fullPhone])

  const handleVerify = useCallback(() => {
    verifyOtp.mutate({ phone: fullPhone, code: otpCode }, {
      onSuccess: result => {
        setSession('agent', {
          accessToken:  result.accessToken,
          refreshToken: result.refreshToken,
          user:         result.user,
        })
        navigate(result.hasProfile ? '/agent/dashboard' : '/agent/apply')
      },
    })
  }, [verifyOtp, fullPhone, otpCode, navigate])

  const isValid = phase === 'phone' ? phone.length >= 9 : otpCode.length === 6
  const isPending = requestOtp.isPending || verifyOtp.isPending

  return (
    <div className="min-h-screen bg-background">
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
          <div className="h-11 w-11" />
        </div>
      </header>

      <main className="container mx-auto max-w-md px-4 py-16">
        <AnimatePresence mode="wait">
          {phase === 'phone' ? (
            <motion.div key="phone" variants={slideRight} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Agent Login</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Enter your phone number to continue</p>
              </div>

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
              </div>

              {requestOtp.isError && (
                <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
                  <p className="text-sm font-medium text-destructive">{getErrorMessage(requestOtp.error)}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="otp" variants={slideRight} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-primary/20 bg-primary/10">
                  <Phone className="h-6 w-6 text-primary" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Enter verification code</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">We sent a 6-digit code to +254{phone}</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <Input
                  type="text"
                  placeholder="123456"
                  value={otpCode}
                  onChange={e => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em]"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-invalid={verifyOtp.isError}
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

              {verifyOtp.isError && (
                <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
                  <p className="text-sm font-medium text-destructive">{getErrorMessage(verifyOtp.error)}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10">
          <button
            type="button"
            onClick={phase === 'phone' ? handleSendOtp : handleVerify}
            disabled={!isValid || isPending}
            className={cn(
              'w-full rounded-full py-4 text-base font-semibold transition-all duration-200',
              isValid && !isPending
                ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(0,206,146,0.3)] hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(0,206,146,0.45)]'
                : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
            )}
          >
            {isPending ? <Loader2 className="mx-auto h-5 w-5 animate-spin" /> : phase === 'phone' ? 'Send Verification Code' : 'Verify & Continue'}
          </button>
        </div>
      </main>
    </div>
  )
}
