'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateInput, RegisterSchema, type RegisterInput } from '@/lib/validators/schemas'

export default function RegisterPage() {
  const router = useRouter()
  const [fullName, setFullName] = useState('')
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [done,     setDone]     = useState(false)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = validateInput(RegisterSchema, { email, password, full_name: fullName })
    if (result.error || !result.data) { setError(result.error ?? 'Invalid input.'); return }
    const input: RegisterInput = result.data

    startTransition(async () => {
      const supabase = createClient()
      const appUrl   = process.env.NEXT_PUBLIC_APP_URL ?? window.location.origin

      const { error: signUpError } = await supabase.auth.signUp({
        email:    input.email,
        password: input.password,
        options:  {
          data:         { full_name: input.full_name },
          emailRedirectTo: `${appUrl}/auth/callback`,
        },
      })

      if (signUpError) {
        if (signUpError.message.includes('already registered')) {
          setError('An account with this email already exists. Sign in instead.')
        } else {
          setError(signUpError.message)
        }
        return
      }

      setDone(true)
    })
  }

  if (done) {
    return (
      <div
        className="rounded-2xl border p-8 text-center"
        style={{ background: 'var(--surface-1)', borderColor: 'var(--line-2)' }}
      >
        <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(31,187,138,.12)', border: '1px solid rgba(31,187,138,.3)' }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#1fbb8a" strokeWidth="2.2" strokeLinecap="round">
            <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/>
          </svg>
        </div>
        <h2 className="text-xl font-semibold text-platinum mb-2">Check your email</h2>
        <p className="text-sm mb-6" style={{ color: 'var(--silver)' }}>
          We sent a confirmation link to <strong className="text-platinum">{email}</strong>.
          Click it to activate your account.
        </p>
        <button
          onClick={() => router.push('/login')}
          className="text-sm font-medium"
          style={{ color: 'var(--sapphire)' }}
        >
          Back to sign in
        </button>
      </div>
    )
  }

  const inputStyle = {
    background: 'var(--surface-2)',
    border:     '1px solid var(--line-2)',
    fontFamily: 'var(--font-data)',
  }

  const onFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--sapphire)'
    e.currentTarget.style.boxShadow   = '0 0 0 3px rgba(61,111,232,.12)'
  }
  const onBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    e.currentTarget.style.borderColor = 'var(--line-2)'
    e.currentTarget.style.boxShadow   = 'none'
  }

  return (
    <div
      className="rounded-2xl border p-8"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--line-2)' }}
    >
      <h1 className="text-2xl font-semibold text-platinum mb-1">Create your account</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--silver)' }}>
        Free plan — no credit card required
      </p>

      {error && (
        <div
          className="rounded-lg p-3.5 mb-6 text-sm flex items-start gap-2.5"
          style={{ background: 'rgba(220,75,75,.08)', border: '1px solid rgba(220,75,75,.25)', color: '#f4a9a9' }}
          role="alert"
        >
          <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="mt-0.5 flex-shrink-0">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-5" noValidate>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="fullName" className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--slate)', fontFamily: 'var(--font-data)' }}>
            Full name
          </label>
          <input
            id="fullName" type="text" autoComplete="name" required
            value={fullName} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
            placeholder="Alex Johnson" disabled={isPending}
            className="rounded-lg px-4 py-3 text-sm text-platinum placeholder-slate outline-none transition-all"
            style={inputStyle} onFocus={onFocus} onBlur={onBlur}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--slate)', fontFamily: 'var(--font-data)' }}>
            Work email
          </label>
          <input
            id="email" type="email" autoComplete="email" required
            value={email} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="you@company.com" disabled={isPending}
            className="rounded-lg px-4 py-3 text-sm text-platinum placeholder-slate outline-none transition-all"
            style={inputStyle} onFocus={onFocus} onBlur={onBlur}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <label htmlFor="password" className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--slate)', fontFamily: 'var(--font-data)' }}>
            Password
          </label>
          <input
            id="password" type="password" autoComplete="new-password" required
            value={password} onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="Min. 8 chars · uppercase · number · symbol"
            disabled={isPending}
            className="rounded-lg px-4 py-3 text-sm text-platinum placeholder-slate outline-none transition-all"
            style={inputStyle} onFocus={onFocus} onBlur={onBlur}
          />
          <p className="text-xs mt-1" style={{ color: 'var(--slate)' }}>
            Must include uppercase, a number, and a special character.
          </p>
        </div>

        <button
          type="submit" disabled={isPending}
          className="mt-1 py-3 px-6 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: 'var(--sapphire)', boxShadow: '0 2px 12px rgba(61,111,232,.3)' }}
        >
          {isPending ? 'Creating account…' : 'Create account'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--slate)' }}>
        Already have an account?{' '}
        <Link href="/login" className="font-medium" style={{ color: 'var(--sapphire)' }}>
          Sign in
        </Link>
      </p>
    </div>
  )
}
