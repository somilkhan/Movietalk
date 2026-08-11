// Bingr — Compact / inline error states
// Shows the error states within rows and data sections (non-full-page errors)

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function Section({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-8">
      <p className="text-xs font-semibold uppercase tracking-widest text-white/25 mb-3">{label}</p>
      <div className="rounded-xl border border-white/5 bg-[#16181f] overflow-hidden">
        {children}
      </div>
    </div>
  );
}

export function ErrorCompact() {
  return (
    <div className="min-h-screen bg-[#0f1014] p-10 font-sans">
      <h1 className="text-2xl font-bold text-white mb-1">Inline Error States</h1>
      <p className="text-[#ffffff4d] text-sm mb-10">Compact errors used within rows, cards, and data sections.</p>

      {/* Row-level error */}
      <Section label="Row — failed to load">
        <div className="px-6 py-3">
          <p className="text-base font-semibold text-white/80 mb-1">New Movies</p>
          <div className="flex items-center gap-2 text-[#ffffff4d] text-sm py-3">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Failed to load content</span>
            <button className="text-[#f5c518] hover:underline ml-2 text-sm font-medium">Retry</button>
          </div>
        </div>
      </Section>

      {/* Search error */}
      <Section label="Search — no results / API error">
        <div className="px-6 py-5">
          <p className="text-xs text-[#ffffff4d] mb-1">Results for "glorp xyzzy"</p>
          <div className="flex items-center gap-2 text-[#ffffff4d] text-sm">
            <AlertCircle className="w-4 h-4" />
            <span>Search service unavailable.</span>
            <button className="text-[#f5c518] hover:underline ml-2">Retry</button>
          </div>
        </div>
      </Section>

      {/* Stream source error */}
      <Section label="Stream — all providers failed">
        <div className="bg-[#0a0a0a] px-6 py-6 flex flex-col items-center text-center gap-3">
          <div className="w-10 h-10 rounded-full bg-[#ffffff0a] flex items-center justify-center">
            <AlertCircle className="w-5 h-5 text-red-400" />
          </div>
          <div>
            <p className="text-sm font-semibold text-white">No working streams found</p>
            <p className="text-xs text-white/40 mt-1">All 14 sources failed</p>
          </div>
          <button className="flex items-center gap-1.5 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-sm font-medium text-white transition">
            Try again
          </button>
        </div>
      </Section>

      {/* Cast fetch error */}
      <Section label="Cast / Trailer — section-level error">
        <div className="px-6 py-4">
          <p className="text-base font-semibold text-white/80 mb-2">Cast</p>
          <div className="flex items-center gap-2 text-[#ffffff4d] text-sm py-2">
            <AlertCircle className="w-4 h-4 flex-shrink-0" />
            <span>Cast information unavailable</span>
          </div>
        </div>
      </Section>

      {/* Genre chips error */}
      <Section label="API offline — 503 response handling">
        <div className="px-6 py-5 flex flex-col items-center text-center gap-4">
          <AlertCircle className="w-8 h-8 text-[#ffffff40]" />
          <div>
            <p className="text-sm font-semibold text-[#ffffffe6]">Stream service offline</p>
            <p className="text-xs text-white/40 mt-1 max-w-xs">CinePro Core isn't responding. Make sure it's running on port 3001.</p>
          </div>
          <button className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-sm font-medium text-white transition">
            Retry
          </button>
        </div>
      </Section>
    </div>
  );
}
