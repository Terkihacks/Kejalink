import { useState } from 'react'
import {
  Input, Table, Thead, Tbody, Tr, Th, Td, Skeleton, EmptyState,
  Accordion, AccordionItem, AccordionTrigger, AccordionContent,
} from '@/components/ui'
import { useAuditLog } from '@/hooks'

const LIMIT_OPTIONS = [25, 50, 100, 200] as const

export function AdminAuditLogPage() {
  const [action, setAction] = useState('')
  const [targetType, setTargetType] = useState('')
  const [limit, setLimit] = useState<number>(50)

  const { data: entries = [], isLoading } = useAuditLog({
    action:     action.trim() || undefined,
    targetType: targetType.trim() || undefined,
    limit,
  })

  return (
    <div>
      <div className="mb-6">
        <h1 className="font-display text-2xl font-bold text-foreground">Audit Log</h1>
        <p className="mt-1.5 text-sm text-muted-foreground">A record of administrative actions.</p>
      </div>

      <div className="mb-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <Input value={action} onChange={e => setAction(e.target.value)} placeholder="Filter by action…" className="sm:max-w-xs" />
        <Input value={targetType} onChange={e => setTargetType(e.target.value)} placeholder="Filter by target type…" className="sm:max-w-xs" />
        <select
          value={limit}
          onChange={e => setLimit(Number(e.target.value))}
          className="h-9 rounded-md border border-input bg-transparent px-3 text-sm text-foreground outline-none focus-visible:ring-[3px] focus-visible:ring-ring/50"
        >
          {LIMIT_OPTIONS.map(n => <option key={n} value={n}>{n} entries</option>)}
        </select>
      </div>

      {isLoading ? (
        <div className="space-y-3">
          {[1, 2, 3].map(i => <Skeleton key={i} className="h-14 w-full" />)}
        </div>
      ) : entries.length > 0 ? (
        <Table>
          <Thead>
            <Tr>
              <Th>Timestamp</Th>
              <Th>Actor</Th>
              <Th>Action</Th>
              <Th>Target</Th>
              <Th>Details</Th>
            </Tr>
          </Thead>
          <Tbody>
            {entries.map(entry => (
              <Tr key={entry.id}>
                <Td className="whitespace-nowrap text-xs text-muted-foreground">{new Date(entry.createdAt).toLocaleString()}</Td>
                <Td>
                  <p className="font-medium">{entry.actor.name ?? 'Unknown'}</p>
                  <p className="text-xs text-muted-foreground">{entry.actor.role}</p>
                </Td>
                <Td>{entry.action}</Td>
                <Td className="text-xs text-muted-foreground">{entry.targetType} · {entry.targetId}</Td>
                <Td>
                  {entry.metadata ? (
                    <Accordion type="single" collapsible>
                      <AccordionItem value={entry.id}>
                        <AccordionTrigger className="py-0 text-xs">View</AccordionTrigger>
                        <AccordionContent>
                          <pre className="whitespace-pre-wrap text-xs text-muted-foreground">{JSON.stringify(entry.metadata, null, 2)}</pre>
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  ) : (
                    <span className="text-xs text-muted-foreground">—</span>
                  )}
                </Td>
              </Tr>
            ))}
          </Tbody>
        </Table>
      ) : (
        <EmptyState title="No audit log entries" description="Try adjusting your filters." />
      )}
    </div>
  )
}
