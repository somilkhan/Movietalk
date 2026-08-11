// Bingr — Full-page error state
// Shows what users see when a page fails to load (network error, server down, etc.)

function AlertCircle({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="12" cy="12" r="10" />
      <line x1="12" y1="8" x2="12" y2="12" />
      <line x1="12" y1="16" x2="12.01" y2="16" />
    </svg>
  );
}

function RotateCcw({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
      <polyline points="1 4 1 10 7 10" />
      <path d="M3.51 15a9 9 0 1 0 .49-3.38" />
    </svg>
  );
}

export function ErrorFull() {
  return (
    <div className="min-h-screen bg-[#0f1014] flex flex-col">
      {/* Sidebar stub */}
      <div className="fixed left-0 top-0 bottom-0 w-[80px] bg-[#0f1014]/80 border-r border-white/5 flex flex-col items-center justify-center gap-6 py-8 z-50">
        {/* Logo */}
        <div className="w-9 h-9 rounded-xl bg-[#f5c518] mb-4" />
        {[0,1,2,3,4].map(i => (
          <div key={i} className="w-6 h-6 rounded bg-white/10" />
        ))}
      </div>

      {/* Main content */}
      <div className="ml-[80px] flex flex-col min-h-screen">
        {/* Hero backdrop remnant (faded) */}
        <div className="relative h-64 bg-gradient-to-b from-[#1a1c24] to-[#0f1014] overflow-hidden">
          {/* Blurred bg suggestion */}
          <div className="absolute inset-0 opacity-20" style={{
            background: 'radial-gradient(ellipse at 40% 50%, #2a3050 0%, transparent 70%)',
          }} />
        </div>

        {/* Error state — centered */}
        <div className="flex-1 flex flex-col items-center justify-center py-16 px-6 -mt-32">
          {/* Icon */}
          <div className="w-20 h-20 rounded-full bg-[#ffffff0d] border border-[#ffffff0a] flex items-center justify-center mb-6 shadow-xl">
            <AlertCircle className="w-10 h-10 text-[#ffffff40]" />
          </div>

          {/* Heading */}
          <h2 className="text-2xl font-bold text-[#ffffffe6] mb-3 text-center">Something went wrong</h2>

          {/* Message */}
          <p className="text-[#ffffff4d] text-sm text-center max-w-md mb-8 leading-relaxed">
            Could not load title details. The server may be unavailable or your connection may have dropped.
          </p>

          {/* Actions */}
          <div className="flex items-center gap-3">
            <button className="flex items-center gap-2 px-6 py-3 rounded-full bg-[#f5c518] text-black font-bold text-sm hover:bg-[#e5b518] transition-all shadow-lg shadow-[#f5c518]/20">
              <RotateCcw className="w-4 h-4" />
              Try Again
            </button>
            <button className="flex items-center gap-2 px-5 py-3 rounded-full bg-[#ffffff0d] text-[#ffffffb3] font-medium text-sm hover:bg-[#ffffff1a] transition-all border border-[#ffffff0d]">
              ← Back to Home
            </button>
          </div>
        </div>

        {/* Bottom decoration — faint similar titles placeholder */}
        <div className="px-12 pb-16 opacity-30">
          <div className="h-px bg-white/5 mb-8" />
          <div className="h-4 w-32 bg-white/10 rounded mb-4" />
          <div className="flex gap-3">
            {[...Array(5)].map((_, i) => (
              <div key={i} className="w-[130px] aspect-[2/3] rounded-lg bg-[#16181f]" />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
