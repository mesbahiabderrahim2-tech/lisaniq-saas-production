import type { Metadata } from 'next'

export const metadata: Metadata = { title: 'Settings' }

export default function SettingsPage() {
  return (
    <div className="p-6 lg:p-10">
      <div className="mb-8">
        <h1
          className="font-display text-2xl lg:text-3xl mb-1"
          style={{ color: 'var(--platinum)' }}
        >
          Settings
        </h1>
        <p className="text-sm" style={{ color: 'var(--silver)' }}>
          Account and workspace preferences.
        </p>
      </div>

      <div
        className="rounded-xl border p-12 text-center"
        style={{ background: 'var(--surface-2)', borderColor: 'var(--line-1)' }}
      >
        <p className="text-sm" style={{ color: 'var(--slate)' }}>
          Settings UI — coming in Production Task #3.
        </p>
      </div>
    </div>
  )
}
