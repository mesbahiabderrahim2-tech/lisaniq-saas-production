'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import { validateInput, ResetPasswordSchema, type ResetPasswordInput } from '@/lib/validators/schemas'

export default function ResetPasswordPage() {
  const [email,    setEmail]   = useState('')
  const [sent,     setSent]    = useState(false)
  const [error,    setError]   = useState<string | null>(null)
  const [isPending, start]     = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = validateInput(ResetPasswordSchema, { email })
    if (result.error || !result.data) { setError(result.error ?? 'Invalid input.'); return }
    const input: ResetPasswordInput = result.data

    start(async () => {
      const supabase = createClient()
      const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

      const { error: resetError } = await supabase.auth.resetPasswordForEmail(
        input.email,
        { redirectTo: `${appUrl}/auth/callback?next=/settings` }
      )

      if (resetError) { setError(resetError.message); return }
      setSent(true)
    })
  }

  if (sent) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--line-2)' }}
      >
        <div
          className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(31,187,138,.12)', border: '1px solid rgba(31,187,138,.3)' }}
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none"
            stroke="#1fbb8a" strokeWidth="2.2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
            <polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold mb-2" style={{ color: 'var(--platinum)' }}>
          Check your email
        </h2>
        <p className="text-sm mb-6" style={{ color: 'var(--silver)' }}>
          We sent a reset link to <strong style={{ color: 'var(--platinum)' }}>{email}</strong>.
        </p>
        <Link href="/login" className="text-sm font-medium" style={{ color: 'var(--sapphire)' }}>
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <div
      className="rounded-2xl border p-8"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--line-2)' }}
    >
      <h1 className="text-2xl font-semibold mb-1" style={{ color: 'var(--platinum)' }}>
        Reset password
      </h1>
      <p className="text-sm mb-8" style={{ color: 'var(--silver)' }}>
        Enter your email and we&apos;ll send a reset link.
      </p>

      {error && (
        <div
          className="rounded-lg p-3.5 mb-6 text-sm"
          style={{
            background: 'rgba(220,75,75,.08)',
            border:     '1px solid rgba(220,75,75,.25)',
            color:      '#f4a9a9',
          }}
          role="alert"
        >
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label
            htmlFor="email"
            className="text-xs font-medium uppercase tracking-widest"
            style={{ color: 'var(--slate)', fontFamily: 'var(--font-data)' }}
          >
            Email address
          </label>
          <input
            id="email" type="email" autoComplete="email" required
            value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="you@company.com" disabled={isPending}
            className="rounded-lg px-4 py-3 text-sm outline-none transition-all"
            style={{
              background:  'var(--surface-2)',
              border:      '1px solid var(--line-2)',
              color:       'var(--platinum)',
              fontFamily:  'var(--font-data)',
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = 'var(--sapphire)'
              e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(61,111,232,.12)'
            }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => {
              e.currentTarget.style.borderColor = 'var(--line-2)'
              e.currentTarget.style.boxShadow   = 'none'
            }}
          />
        </div>

        <button
          type="submit" disabled={isPending}
          className="py-3 px-6 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--sapphire)', boxShadow: '0 2px 12px rgba(61,111,232,.3)' }}
        >
          {isPending ? 'Sending…' : 'Send reset link'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--slate)' }}>
        <Link href="/login" className="font-medium" style={{ color: 'var(--sapphire)' }}>
          Back to sign in
        </Link>
      </p>
    </div>
  )
}
