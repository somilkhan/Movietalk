import { useRef, useEffect, useState } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { buildImageUrl } from '@/lib/imageUrl';
import { TitleCard, NumberedTitleCard } from './TitleCard';

export function Row({
  heading,
  titles,
  numbered = false,
  loading = false,
  viewAllHref,
  refetch,
}: {
  heading: string;
  titles: Title[] | undefined;
  numbered?: boolean;
  loading?: boolean;
  viewAllHref?: string;
  refetch?: () => void;
}) {
  const scroller = useRef<HTMLDivElement>(null);
  const rowRef = useRef<HTMLElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [hasError, setHasError] = useState(false);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(true);

  useEffect(() => {
    if (!rowRef.current) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
          observer.disconnect();
        }
      },
      { rootMargin: '200px 0px' }
    );
    observer.observe(rowRef.current);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible || !Array.isArray(titles)) return;
    titles.slice(0, 3).forEach((t) => {
      const url = buildImageUrl(t.posterPath, 'w200');
      if (url) {
        const img = new Image();
        img.src = url;
      }
    });
  }, [isVisible, titles]);

  useEffect(() => {
    const el = scroller.current;
    if (!el) return;
    updateScrollState();
    el.addEventListener('scroll', updateScrollState, { passive: true });
    return () => el.removeEventListener('scroll', updateScrollState);
  }, [titles]);

  function updateScrollState() {
    const el = scroller.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 2);
    setCanScrollRight(el.scrollLeft + el.clientWidth < el.scrollWidth - 2);
  }

  function scroll(dir: "left" | "right") {
    const cardWidth = (scroller.current?.firstElementChild as HTMLElement)?.offsetWidth || 185;
    const gap = 12;
    scroller.current?.scrollBy({
      left: dir === "left" ? -(cardWidth + gap) : cardWidth + gap,
      behavior: "smooth",
    });
    setTimeout(updateScrollState, 350);
  }

  return (
    <section ref={rowRef} className="px-6 lg:px-20 pt-8 group/row" data-testid={`row-${heading.toLowerCase().replace(/\s+/g, '-')}`}>
      {!isVisible ? (
        <>
          <h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90 mb-4">{heading}</h2>
          <div className="flex gap-3 overflow-hidden pt-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className={`flex-shrink-0 animate-pulse rounded-lg bg-[#1a1c24] ${numbered ? 'h-[240px] w-[160px]' : 'aspect-[2/3] w-[130px] md:w-[160px] lg:w-[185px]'}`} />
            ))}
          </div>
        </>
      ) : hasError ? (
        <>
          <h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90 mb-4">{heading}</h2>
          <div className="flex items-center justify-center py-12 bg-[#1a1c24]/50 rounded-lg">
            <div className="text-center">
              <p className="text-white/40 text-sm mb-3">Failed to load {heading}</p>
              <button onClick={() => { setHasError(false); refetch?.(); }} className="px-4 py-2 bg-white/10 text-white text-sm font-semibold rounded-full hover:bg-white/20 transition-colors">Retry</button>
            </div>
          </div>
        </>
      ) : (
        <>
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[17px] lg:text-[19px] font-semibold text-white/90">{heading}</h2>
            {viewAllHref && (
              <Link href={viewAllHref} className="flex items-center gap-1 text-[12px] font-semibold text-white/50 bg-white/5 hover:bg-white/10 px-3 py-1.5 rounded-full transition">
                View All
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </Link>
            )}
          </div>

          <div className="relative group/scroller">
            {canScrollLeft && (
              <button onClick={() => scroll('left')} className="absolute left-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-r from-black to-transparent flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition pointer-events-none group-hover/scroller:pointer-events-auto" aria-label="Scroll left">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M15 18l-6-6 6-6"/></svg>
              </button>
            )}

            <div ref={scroller} className="bingr-row-scroller flex gap-3 overflow-x-auto scroll-smooth snap-x snap-proximity pt-4" style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
              {loading && Array.from({ length: 8 }).map((_, i) => (
                <div key={i} className={`snap-start flex-shrink-0 animate-pulse rounded-lg bg-[#1a1c24] ${numbered ? 'h-[240px] w-[160px]' : 'aspect-[2/3] w-[130px] md:w-[160px] lg:w-[185px]'}`} />
              ))}
              {!loading && Array.isArray(titles) && titles.map((title, i) => numbered ? (
                <div key={title.id} className="snap-start flex-shrink-0"><NumberedTitleCard title={title} index={i} /></div>
              ) : (
                <div key={title.id} className="snap-start flex-shrink-0"><TitleCard title={title} index={i} /></div>
              ))}
              {!loading && titles?.length === 0 && <p className="py-8 text-sm text-white/40">Nothing here yet.</p>}
            </div>

            {canScrollRight && (
              <button onClick={() => scroll('right')} className="absolute right-0 top-0 bottom-0 z-30 w-12 bg-gradient-to-l from-black to-transparent flex items-center justify-center opacity-0 group-hover/scroller:opacity-100 transition pointer-events-none group-hover/scroller:pointer-events-auto" aria-label="Scroll right">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round"><path d="M9 18l6-6-6-6"/></svg>
              </button>
            )}
          </div>
          <style>{`.bingr-row-scroller::-webkit-scrollbar{display:none;width:0;height:0}`}</style>
        </>
      )}
    </section>
  );
}
