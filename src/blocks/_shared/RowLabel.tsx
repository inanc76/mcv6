'use client'
import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

/**
 * Shared RowLabel for every array field across the GoWay blocks.
 * Surfaces the row's primary content field so admins see "Plug & Play
 * Integration" instead of "Item 01". Order = priority.
 */
export const RowLabel: React.FC<RowLabelProps> = () => {
  const row = useRowLabel<Record<string, unknown>>()
  const data = (row?.data || {}) as Record<string, unknown>

  const candidate =
    (data.title as string) ||
    (data.name as string) ||
    (data.heading as string) ||
    (data.question as string) ||
    (data.label as string) ||
    ((data.link as { label?: string })?.label as string) ||
    ''

  const fallback = `Item ${(row.rowNumber ?? 0) + 1}`
  return <div>{candidate || fallback}</div>
}
