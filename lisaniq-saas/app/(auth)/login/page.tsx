'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { validateInput, LoginSchema, type LoginInput } from '@/lib/validators/schemas'

export default function LoginPage() {
  const router = useRouter()
  const [email,    setEmail]    = useState('')
  const [password, setPassword] = useState('')
  const [error,    setError]    = useState<string | null>(null)
  const [isPending, startTransition] = useTransition()

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)

    const result = validateInput(LoginSchema, { email, password })
    if (result.error || !result.data) { setError(result.error ?? 'Invalid input.'); return }
    const input: LoginInput = result.data

    startTransition(async () => {
      const supabase = createClient()
      const { error: authError } = await supabase.auth.signInWithPassword({
        email:    input.email,
        password: input.password,
      })

      if (authError) {
        setError(
          authError.message.includes('Invalid login credentials')
            ? 'Incorrect email or password. Check your details and try again.'
            : authError.message
        )
        return
      }

      router.push('/dashboard')
      router.refresh()
    })
  }

  return (
    <div
      className="rounded-2xl border p-8"
      style={{ background: 'var(--surface-1)', borderColor: 'var(--line-2)' }}
    >
      <h1 className="text-2xl font-semibold text-platinum mb-1">Welcome back</h1>
      <p className="text-sm mb-8" style={{ color: 'var(--silver)' }}>
        Sign in to your LisanIQ account
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
          <label htmlFor="email" className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--slate)', fontFamily: 'var(--font-data)' }}>
            Email address
          </label>
          <input
            id="email"
            type="email"
            autoComplete="email"
            required
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            placeholder="you@company.com"
            disabled={isPending}
            className="rounded-lg px-4 py-3 text-sm text-platinum placeholder-slate outline-none transition-all focus:ring-1"
            style={{
              background:   'var(--surface-2)',
              border:       '1px solid var(--line-2)',
              fontFamily:   'var(--font-data)',
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'var(--sapphire)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,111,232,.12)' }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'var(--line-2)';   e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <div className="flex flex-col gap-1.5">
          <div className="flex items-center justify-between">
            <label htmlFor="password" className="text-xs font-medium uppercase tracking-widest" style={{ color: 'var(--slate)', fontFamily: 'var(--font-data)' }}>
              Password
            </label>
            <Link href="/reset-password" className="text-xs transition-colors" style={{ color: 'var(--sapphire)' }}>
              Forgot password?
            </Link>
          </div>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            required
            value={password}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setPassword(e.target.value)}
            placeholder="••••••••"
            disabled={isPending}
            className="rounded-lg px-4 py-3 text-sm text-platinum placeholder-slate outline-none transition-all"
            style={{
              background: 'var(--surface-2)',
              border:     '1px solid var(--line-2)',
              fontFamily: 'var(--font-data)',
            }}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'var(--sapphire)'; e.currentTarget.style.boxShadow = '0 0 0 3px rgba(61,111,232,.12)' }}
            onBlur={(e: React.FocusEvent<HTMLInputElement>) => { e.currentTarget.style.borderColor = 'var(--line-2)';   e.currentTarget.style.boxShadow = 'none' }}
          />
        </div>

        <button
          type="submit"
          disabled={isPending}
          className="mt-1 py-3 px-6 rounded-lg text-sm font-semibold text-white transition-all disabled:opacity-40 disabled:cursor-not-allowed"
          style={{ background: isPending ? 'var(--sapphire-dim)' : 'var(--sapphire)', boxShadow: '0 2px 12px rgba(61,111,232,.3)' }}
        >
          {isPending ? 'Signing in…' : 'Sign in'}
        </button>
      </form>

      <p className="text-center text-sm mt-6" style={{ color: 'var(--slate)' }}>
        No account?{' '}
        <Link href="/register" className="font-medium transition-colors" style={{ color: 'var(--sapphire)' }}>
          Create one free
        </Link>
      </p>
    </div>
  )
}
