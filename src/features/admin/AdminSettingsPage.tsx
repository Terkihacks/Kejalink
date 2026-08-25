import { useState } from 'react'
import { ShieldCheck, ShieldOff, KeyRound } from 'lucide-react'
import { Button, ConfirmDialog, useToast } from '@/components/ui'
import { useAuthSession, useSetupAdmin2fa, useDisableAdmin2fa } from '@/hooks'
import { getErrorMessage } from '@/lib/error-messages'

export function AdminSettingsPage() {
  const session = useAuthSession('admin')
  const setup2fa = useSetupAdmin2fa()
  const disable2fa = useDisableAdmin2fa()
  const { show } = useToast()

  const [disableDialogOpen, setDisableDialogOpen] = useState(false)

  const handleSetup = () => {
    const email = session?.user.email
    if (!email) return
    setup2fa.mutate(email)
  }

  const handleDisable = () => {
    disable2fa.mutate(undefined, {
      onSuccess: () => {
        show('2FA disabled.')
        setDisableDialogOpen(false)
        setup2fa.reset()
      },
    })
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="font-display text-2xl font-bold text-foreground">Settings</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">Manage your account and two-factor authentication.</p>
      </div>

      <div className="mb-6 rounded-2xl border border-border/60 bg-card p-5">
        <p className="text-sm text-muted-foreground">Signed in as</p>
        <p className="font-medium text-foreground">{session?.user.name ?? session?.user.email}</p>
        <p className="text-sm text-muted-foreground">{session?.user.email}</p>
      </div>

      <div className="rounded-2xl border border-border/60 bg-card p-5">
        <div className="flex items-center gap-2">
          <KeyRound className="h-5 w-5 text-muted-foreground" strokeWidth={1.5} />
          <h2 className="font-semibold text-foreground">Two-Factor Authentication</h2>
        </div>

        {setup2fa.data ? (
          <div className="mt-4">
            <p className="text-sm text-muted-foreground">Scan this code with your authenticator app:</p>
            <img
              src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(setup2fa.data.qrCodeUri)}`}
              alt="2FA setup QR code"
              className="mt-3 rounded-lg border border-border/60"
              width={200}
              height={200}
            />
            <p className="mt-3 text-xs text-muted-foreground">Or enter this secret manually:</p>
            <code className="mt-1 block rounded-lg bg-muted/40 px-3 py-2 text-sm text-foreground">{setup2fa.data.secret}</code>
          </div>
        ) : (
          <div className="mt-4">
            {setup2fa.isError && (
              <p className="mb-3 text-sm font-medium text-destructive">{getErrorMessage(setup2fa.error)}</p>
            )}
            <div className="flex flex-wrap gap-3">
              <Button onClick={handleSetup} disabled={setup2fa.isPending}>
                <ShieldCheck className="h-4 w-4" strokeWidth={1.5} />
                {setup2fa.isPending ? 'Setting up…' : 'Set Up 2FA'}
              </Button>
              <Button variant="destructive" onClick={() => setDisableDialogOpen(true)}>
                <ShieldOff className="h-4 w-4" strokeWidth={1.5} />
                Disable 2FA
              </Button>
            </div>
          </div>
        )}
      </div>

      <ConfirmDialog
        open={disableDialogOpen}
        onClose={() => setDisableDialogOpen(false)}
        title="Disable Two-Factor Authentication?"
        description="This removes the second factor from your login. You can set it up again at any time."
        confirmLabel="Disable 2FA"
        confirmVariant="destructive"
        onConfirm={handleDisable}
        isConfirming={disable2fa.isPending}
      />
      {disable2fa.isError && (
        <p className="mt-3 text-sm font-medium text-destructive">{getErrorMessage(disable2fa.error)}</p>
      )}
    </div>
  )
}
