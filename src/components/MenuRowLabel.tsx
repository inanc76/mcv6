'use client'

import React from 'react'

import { RowLabelProps, useRowLabel } from '@payloadcms/ui'

type LinkRow = {
  link?: {
    label?: string | null
    type?: 'reference' | 'custom' | 'group' | null
  } | null
}

export const MenuRowLabel: React.FC<RowLabelProps> = () => {
  const ctx = useRowLabel<LinkRow>()
  const label = ctx?.data?.link?.label?.trim()
  const type = ctx?.data?.link?.type

  if (label) {
    const suffix = type === 'group' ? ' (grup)' : type === 'custom' ? ' (external)' : ''
    return <div>{`${label}${suffix}`}</div>
  }

  const idx = (ctx?.rowNumber ?? 0) + 1
  return <div style={{ opacity: 0.6 }}>— öğe {idx} (boş)</div>
}
