// Bingr — TitleDetail shimmer skeleton loading state
// Shown while the title detail API call is in-flight

const shimmer = `
@keyframes shimmer {
  0% { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
.shimmer {
  background: linear-gradient(
    90deg,
    #1a1c24 0%,
    #252830 40%,
    #1a1c24 80%
  );
  background-size: 200% 100%;
  animation: shimmer 1.6s ease-in-out infinite;
}
`;

function Shimmer({ className, style }: { className?: string; style?: React.CSSProperties }) {
  return <div className={`shimmer ${className ?? ''}`} />;
}

export function SkeletonDetail() {
  return (
    <>
      <style>{shimmer}</style>
      <div className="min-h-screen bg-[#0f1014] flex">
        {/* Sidebar stub */}
        <div className="hidden md:flex fixed left-0 top-0 bottom-0 w-[80px] bg-[#0f1014]/80 border-r border-white/5 flex-col items-center justify-center gap-5 py-8 z-50">
          <Shimmer className="w-9 h-9 rounded-xl mb-4" />
          {[0,1,2,3,4].map(i => <Shimmer key={i} className="w-6 h-6 rounded" />)}
        </div>

        {/* Main */}
        <div className="md:ml-[80px] flex-1">
          {/* Hero skeleton */}
          <div className="relative min-h-[540px] overflow-hidden">
            <Shimmer className="absolute inset-0" />
            {/* Gradient overlays */}
            <div className="absolute inset-0 bg-gradient-to-t from-[#0f1014] via-[#0f1014]/50 to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#0f1014]/70 via-transparent to-transparent" />

            {/* Back button stub */}
            <Shimmer className="absolute left-6 top-[68px] md:top-6 w-20 h-9 rounded-full" />

            {/* Content stubs */}
            <div className="relative z-10 flex flex-col justify-end px-6 pb-8 pt-24 h-full min-h-[540px] md:px-12">
              <Shimmer className="h-14 w-2/3 rounded-xl mb-5" />
              {/* Meta row */}
              <div className="flex items-center gap-3 mb-4">
                <Shimmer className="h-5 w-12 rounded" />
                <Shimmer className="h-5 w-12 rounded" />
                <Shimmer className="h-5 w-20 rounded" />
                <Shimmer className="h-5 w-14 rounded-full border border-white/5" />
              </div>
              {/* Genre chips */}
              <div className="flex gap-2 mb-4">
                {[80, 60, 72].map((w, i) => (
                  <Shimmer key={i} className="h-6 rounded-full" style={{ width: w }} />
                ))}
              </div>
              {/* Overview lines */}
              <Shimmer className="h-4 w-full max-w-xl rounded mb-2" />
              <Shimmer className="h-4 w-5/6 max-w-xl rounded mb-2" />
              <Shimmer className="h-4 w-2/3 max-w-xl rounded mb-6" />
              {/* Action buttons */}
              <div className="flex gap-3">
                <Shimmer className="h-12 w-28 rounded-full" />
                <Shimmer className="h-12 w-24 rounded-full" />
                <Shimmer className="h-10 w-24 rounded-full" />
                <Shimmer className="h-10 w-28 rounded-full" />
              </div>
            </div>
          </div>

          {/* Below-hero */}
          <div className="px-6 md:px-12 py-10 space-y-10">
            {/* Rating section */}
            <div>
              <Shimmer className="h-3 w-24 rounded mb-4" />
              <div className="flex gap-1.5">
                {[...Array(10)].map((_, i) => (
                  <Shimmer key={i} className="w-7 h-7 rounded" />
                ))}
              </div>
            </div>

            {/* Trailer section */}
            <div>
              <Shimmer className="h-5 w-20 rounded mb-3" />
              <Shimmer className="w-full max-w-3xl aspect-video rounded-xl" />
            </div>

            {/* Cast section */}
            <div>
              <Shimmer className="h-5 w-16 rounded mb-4" />
              <div className="flex gap-4 overflow-hidden">
                {[...Array(8)].map((_, i) => (
                  <div key={i} className="flex-none w-[90px] flex flex-col items-center gap-2">
                    <Shimmer className="w-[90px] h-[90px] rounded-full" />
                    <Shimmer className="h-3 w-16 rounded" />
                    <Shimmer className="h-2.5 w-12 rounded" />
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
