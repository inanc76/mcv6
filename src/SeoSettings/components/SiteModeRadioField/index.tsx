'use client'

import React from 'react'
import { useField, useTranslation } from '@payloadcms/ui'

type Props = { path: string }

const LIVE_COLOR = '#16a34a'
const DEV_COLOR = '#dc2626'

const SiteModeRadioField: React.FC<Props> = ({ path }) => {
  const { value, setValue } = useField<string>({ path })
  const { i18n } = useTranslation()
  const lang: 'tr' | 'en' = i18n?.language === 'en' ? 'en' : 'tr'

  const labels =
    lang === 'tr'
      ? { live: 'YAYIN', development: 'GELİŞTİRME' }
      : { live: 'Live', development: 'Development' }

  const title = lang === 'tr' ? 'Site Modu' : 'Site Mode'

  return (
    <div className="field-type radio-group-field">
      <label
        className="field-label"
        style={{
          display: 'block',
          fontSize: 13,
          fontWeight: 600,
          marginBottom: 8,
        }}
      >
        <span>{title}</span>
        <span style={{ color: DEV_COLOR, marginLeft: 4 }}>*</span>
      </label>
      <div style={{ display: 'inline-flex', gap: 24, alignItems: 'center' }}>
        <RadioOption
          name={path}
          value="live"
          label={labels.live}
          color={LIVE_COLOR}
          checked={value === 'live'}
          onChange={() => setValue('live')}
        />
        <RadioOption
          name={path}
          value="development"
          label={labels.development}
          color={DEV_COLOR}
          checked={value === 'development'}
          onChange={() => setValue('development')}
        />
      </div>
    </div>
  )
}

type OptionProps = {
  name: string
  value: string
  label: string
  color: string
  checked: boolean
  onChange: () => void
}

const RadioOption: React.FC<OptionProps> = ({ name, value, label, color, checked, onChange }) => (
  <label
    style={{
      display: 'inline-flex',
      alignItems: 'center',
      gap: 8,
      cursor: 'pointer',
      userSelect: 'none',
    }}
  >
    <input
      type="radio"
      name={name}
      value={value}
      checked={checked}
      onChange={onChange}
      style={{ cursor: 'pointer', accentColor: color }}
    />
    <span
      style={{
        color,
        fontSize: 14,
        fontWeight: checked ? 700 : 500,
        letterSpacing: 0.3,
        transition: 'font-weight 120ms ease',
      }}
    >
      {label}
    </span>
  </label>
)

export default SiteModeRadioField
