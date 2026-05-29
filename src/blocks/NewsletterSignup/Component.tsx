'use client'
import React, { useState } from 'react'

type Props = {
  title?: string
  subtitle?: string
  placeholder?: string
  buttonLabel: string
  submitUrl: string
  successMessage?: string
  consentText?: string
}

export const NewsletterSignupBlock: React.FC<Props> = ({
  title,
  subtitle,
  placeholder = 'email@example.com',
  buttonLabel,
  submitUrl,
  successMessage,
  consentText,
}) => {
  const [email, setEmail] = useState('')
  const [state, setState] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle')
  const [errorMsg, setErrorMsg] = useState<string | null>(null)

  const onSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setState('submitting')
    setErrorMsg(null)
    try {
      const res = await fetch(submitUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email }),
      })
      if (!res.ok) throw new Error(`${res.status} ${res.statusText}`)
      setState('success')
      setEmail('')
    } catch (err: unknown) {
      setState('error')
      setErrorMsg(err instanceof Error ? err.message : 'Submit failed')
    }
  }

  return (
    <section data-block="newsletter-signup">
      {title && <h2>{title}</h2>}
      {subtitle && <p>{subtitle}</p>}
      {state === 'success' ? (
        <p data-success>{successMessage || 'Thanks!'}</p>
      ) : (
        <form onSubmit={onSubmit}>
          <input
            type="email"
            required
            value={email}
            placeholder={placeholder}
            onChange={(e) => setEmail(e.target.value)}
            disabled={state === 'submitting'}
          />
          <button type="submit" disabled={state === 'submitting'}>
            {state === 'submitting' ? '...' : buttonLabel}
          </button>
          {state === 'error' && <p data-error>{errorMsg}</p>}
        </form>
      )}
      {consentText && <small>{consentText}</small>}
    </section>
  )
}
