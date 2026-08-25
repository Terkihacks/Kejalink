import { useState, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { slideRight } from '@/lib/motion'
import { Link, useNavigate } from 'react-router-dom'
import { ArrowLeft, ShieldCheck, Loader2 } from 'lucide-react'
import { Input } from '@/components/ui'
import { KejaLinkIcon } from '@/components/Logo'
import { useAdminLogin, useVerifyAdmin2fa, useSlowRequestNotice } from '@/hooks'
import { setSession } from '@/lib/auth-storage'
import { getErrorMessage } from '@/lib/error-messages'
import { cn } from '@/lib/utils'

export function AdminLoginPage() {
  const navigate = useNavigate()
  const login    = useAdminLogin()
  const verify2fa = useVerifyAdmin2fa()

  const [phase,     setPhase]     = useState<'credentials' | 'totp'>('credentials')
  const [email,     setEmail]     = useState('')
  const [password,  setPassword]  = useState('')
  const [sessionId, setSessionId] = useState('')
  const [totpCode,  setTotpCode]  = useState('')
  const [devOtpHint, setDevOtpHint] = useState<string | null>(null)

  const handleLogin = useCallback(() => {
    login.mutate({ email, password }, {
      onSuccess: result => {
        setSessionId(result.sessionId)
        setDevOtpHint(import.meta.env.DEV ? (result.otpCode ?? null) : null)
        setPhase('totp')
      },
    })
  }, [login, email, password])

  const handleVerify = useCallback(() => {
    verify2fa.mutate({ sessionId, code: totpCode }, {
      onSuccess: result => {
        setSession('admin', {
          accessToken:  result.accessToken,
          refreshToken: result.refreshToken,
          user:         result.user,
        })
        navigate('/admin')
      },
    })
  }, [verify2fa, sessionId, totpCode, navigate])

  const isValid = phase === 'credentials' ? email.trim() !== '' && password.length >= 8 : totpCode.length === 6
  const isPending = login.isPending || verify2fa.isPending
  const isSlow    = useSlowRequestNotice(isPending)

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
          {phase === 'credentials' ? (
            <motion.div key="credentials" variants={slideRight} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Admin Login</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Sign in with your admin credentials</p>
              </div>

              <div className="space-y-4 rounded-2xl border border-border/60 bg-card p-6">
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Email</label>
                  <Input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@kejalink.co.ke" autoComplete="email" />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium uppercase tracking-wider text-muted-foreground">Password</label>
                  <Input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" autoComplete="current-password" />
                </div>
              </div>

              {login.isError && (
                <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
                  <p className="text-sm font-medium text-destructive">{getErrorMessage(login.error)}</p>
                </div>
              )}
            </motion.div>
          ) : (
            <motion.div key="totp" variants={slideRight} initial="hidden" animate="visible" exit="exit">
              <div className="mb-8 text-center">
                <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl border border-accent/20 bg-accent/10">
                  <ShieldCheck className="h-6 w-6 text-accent" />
                </div>
                <h1 className="font-display text-2xl font-bold text-foreground">Two-Factor Code</h1>
                <p className="mt-1.5 text-sm text-muted-foreground">Enter the code from your authenticator app</p>
              </div>

              <div className="rounded-2xl border border-border/60 bg-card p-6">
                <Input
                  type="text"
                  placeholder="123456"
                  value={totpCode}
                  onChange={e => setTotpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                  className="text-center text-2xl tracking-[0.5em]"
                  maxLength={6}
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  aria-invalid={verify2fa.isError}
                />
                {devOtpHint && (
                  <p className="mt-3 text-center text-xs text-muted-foreground">
                    Dev hint (2FA not yet configured): <span className="font-mono text-foreground">{devOtpHint}</span>
                  </p>
                )}
              </div>

              {verify2fa.isError && (
                <div className="mt-4 rounded-xl border border-destructive/40 bg-destructive/10 p-4 text-center">
                  <p className="text-sm font-medium text-destructive">{getErrorMessage(verify2fa.error)}</p>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>

        <div className="mt-10">
          <button
            type="button"
            onClick={phase === 'credentials' ? handleLogin : handleVerify}
            disabled={!isValid || isPending}
            className={cn(
              'w-full rounded-full py-4 text-base font-semibold transition-all duration-200',
              isValid && !isPending
                ? 'bg-primary text-primary-foreground shadow-[0_0_30px_rgba(0,206,146,0.3)] hover:bg-primary/90 hover:shadow-[0_0_40px_rgba(0,206,146,0.45)]'
                : 'cursor-not-allowed bg-muted/60 text-muted-foreground',
            )}
          >
            {isPending
              ? (isSlow
                  ? 'Waking up the server…'
                  : <Loader2 className="mx-auto h-5 w-5 animate-spin" />)
              : phase === 'credentials' ? 'Continue' : 'Verify & Sign In'}
          </button>
          {isPending && isSlow && (
            <p className="mt-3 text-center text-xs text-muted-foreground">
              The server was idle and is spinning back up - this can take up to a minute.
            </p>
          )}
        </div>
      </main>
    </div>
  )
}
