import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: { default: 'Sign In', template: '%s — LisanIQ' },
}

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen bg-surface-0 flex flex-col items-center justify-center p-4">
      {/* Background glow */}
      <div
        aria-hidden="true"
        className="fixed inset-0 pointer-events-none overflow-hidden"
      >
        <div className="absolute top-1/3 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[400px] rounded-full opacity-20"
          style={{ background: 'radial-gradient(ellipse, #3d6fe8, transparent 65%)' }}
        />
      </div>

      {/* Brand mark */}
      <div className="flex items-center gap-3 mb-10">
        <svg width="36" height="36" viewBox="0 0 36 36" fill="none" aria-hidden="true">
          <rect width="36" height="36" rx="8" fill="#0d1628"/>
          <rect x="1" y="1" width="34" height="34" rx="7" stroke="#243050" strokeWidth="1"/>
          <rect x="8" y="9" width="3.5" height="14" rx="1" fill="#3d6fe8"/>
          <rect x="8" y="20" width="9" height="3" rx="1" fill="#3d6fe8"/>
          <rect x="20" y="9" width="3.5" height="14" rx="1" fill="#c9a84c"/>
          <circle cx="26.5" cy="19.5" r="4" stroke="#c9a84c" strokeWidth="2.5"/>
          <line x1="29" y1="22" x2="31" y2="24.5" stroke="#c9a84c" strokeWidth="2.5" strokeLinecap="round"/>
        </svg>
        <div>
          <div className="font-display text-xl text-platinum leading-none">
            Lisan<span className="text-sapphire">IQ</span>
          </div>
          <div className="font-data text-[9px] tracking-[2px] text-slate uppercase mt-1">
            Executive Marketing Intelligence
          </div>
        </div>
      </div>

      {/* Page content */}
      <div className="w-full max-w-md">
        {children}
      </div>
    </div>
  )
}
