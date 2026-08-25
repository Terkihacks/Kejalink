import { useState, type FormEvent } from 'react'
import { Plus } from 'lucide-react'
import { Button, Input, Badge, Table, Thead, Tbody, Tr, Th, Td, Skeleton, EmptyState, ConfirmDialog, useToast } from '@/components/ui'
import { useAdmins, useCreateAdmin } from '@/hooks'
import { getErrorMessage } from '@/lib/error-messages'

/** SUPER_ADMIN only - route-guarded in App.tsx via RequireAuth roles. Create-only, API has no edit/deactivate. */
export function AdminManagementPage() {
  const { data: admins = [], isLoading } = useAdmins()
  const createAdmin = useCreateAdmin()
  const { show } = useToast()

  const [dialogOpen, setDialogOpen] = useState(false)
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [name, setName] = useState('')

  const resetForm = () => {
    setEmail('')
    setPassword('')
    setName('')
  }

  const closeDialog = () => {
    setDialogOpen(false)
    resetForm()
    createAdmin.reset()
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    createAdmin.mutate(
      { email: email.trim(), password, name: name.trim() || undefined },
      {
        onSuccess: () => {
          show('Admin account created.')
          closeDialog()
        },
      },
    )
  }

  return (
    <div>
      <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-2xl font-bold text-foreground">Admin Management</h1>
          <p className="mt-1.5 text-sm text-muted-foreground">Create and review admin accounts.</p>
        </div>
        <Button onClick={() => setDialogOpen(true)}>
          <Plus className="h-4 w-4" strokeWidth={1.5} />
          New Admin
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2].map(i => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : admins.length > 0 ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Name</Th>
              <Th>Email</Th>
              <Th>Role</Th>
              <Th>Status</Th>
              <Th>Last Login</Th>
              <Th>Created</Th>
            </Tr>
          </Thead>
          <Tbody>
            {admins.map(admin => (
              <Tr key={admin.id}>
                <Td>{admin.user.name ?? '—'}</Td>
                <Td>{admin.email}</Td>
                <Td><Badge tone={admin.user.role === 'SUPER_ADMIN' ? 'info' : 'neutral'}>{admin.user.role.replace('_', ' ')}</Badge></Td>
                <Td><Badge tone={admin.user.isActive ? 'success' : 'danger'}>{admin.user.isActive ? 'Active' : 'Inactive'}</Badge></Td>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{admin.lastLoginAt ? new Date(admin.lastLoginAt).toLocaleString() : 'Never'}</Td>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(admin.createdAt).toLocaleDateString()}</Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <EmptyState title="No admin accounts yet" />
      )}

      <ConfirmDialog open={dialogOpen} onClose={closeDialog} title="New Admin Account" hideFooter>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label htmlFor="new-admin-name" className="mb-1.5 block text-sm font-medium text-foreground">Name (optional)</label>
            <Input id="new-admin-name" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
          </div>
          <div>
            <label htmlFor="new-admin-email" className="mb-1.5 block text-sm font-medium text-foreground">Email</label>
            <Input id="new-admin-email" type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@kejalink.co.ke" />
          </div>
          <div>
            <label htmlFor="new-admin-password" className="mb-1.5 block text-sm font-medium text-foreground">Password</label>
            <Input id="new-admin-password" type="password" required minLength={8} value={password} onChange={e => setPassword(e.target.value)} placeholder="At least 8 characters" />
          </div>

          {createAdmin.isError && (
            <p className="text-sm font-medium text-destructive">{getErrorMessage(createAdmin.error)}</p>
          )}

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="outline" onClick={closeDialog} disabled={createAdmin.isPending}>
              Cancel
            </Button>
            <Button type="submit" disabled={createAdmin.isPending || email.trim() === '' || password.length < 8}>
              {createAdmin.isPending ? 'Creating…' : 'Create Admin'}
            </Button>
          </div>
        </form>
      </ConfirmDialog>
    </div>
  )
}
