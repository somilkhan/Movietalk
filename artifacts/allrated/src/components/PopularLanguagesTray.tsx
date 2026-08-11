import { useRef, useState, useEffect } from 'react';
import { cn } from '@/lib/utils';

const LANGUAGES = [
  { name: 'English', native: 'English', flag: '🇺🇸' },
  { name: 'Japanese', native: '日本', flag: '🇯🇵' },
  { name: 'Korean', native: '한국어', flag: '🇰🇷' },
  { name: 'Hindi', native: 'हिंदी', flag: '🇮🇳' },
  { name: 'Spanish', native: 'Español', flag: '🇪🇸' },
  { name: 'French', native: 'Français', flag: '🇫🇷' },
  { name: 'German', native: 'Deutsch', flag: '🇩🇪' },
  { name: 'Chinese', native: '中文', flag: '🇨🇳' },
];

export function PopularLanguagesTray() {
  const scrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const checkScroll = () => {
    const el = scrollRef.current;
    if (!el) return;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 10);
  };

  useEffect(() => {
    const el = scrollRef.current;
    if (!el) return;
    checkScroll();
    el.addEventListener('scroll', checkScroll, { passive: true });
    return () => el.removeEventListener('scroll', checkScroll);
  }, []);

  return (
    <section className="mb-8 md:mb-10">
      <div className="flex items-center justify-between mb-4 px-6 md:px-12 lg:px-16">
        <h2
          className="text-white font-bold text-[18px] md:text-[22px]"
          style={{ fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif", letterSpacing: '0.04em' }}
        >
          Popular Languages
        </h2>
        <span className="text-white/50 text-xs md:text-sm font-medium flex items-center gap-1 cursor-pointer hover:text-white transition-colors">
          View All
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </span>
      </div>

      <div className="relative group/tray">
        <div className={cn("absolute left-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-r from-black to-transparent z-10 pointer-events-none transition-opacity duration-300", canScrollLeft ? 'opacity-100' : 'opacity-0')} />
        <div className={cn("absolute right-0 top-0 bottom-0 w-12 md:w-20 bg-gradient-to-l from-black to-transparent z-10 pointer-events-none transition-opacity duration-300", canScrollRight ? 'opacity-100' : 'opacity-0')} />

        <div
          ref={scrollRef}
          className="flex gap-3 md:gap-4 overflow-x-auto no-scrollbar scroll-smooth snap-x snap-mandatory scroll-pl-6 md:scroll-pl-12 lg:scroll-pl-16 px-6 md:px-12 lg:px-16 pb-2"
        >
          {LANGUAGES.map((lang) => (
            <div
              key={lang.name}
              className="flex-shrink-0 snap-start w-[140px] md:w-[180px] aspect-[16/9] rounded-xl bg-[#1a1a1a] border border-white/5 flex flex-col items-center justify-center cursor-pointer hover:border-white/20 transition-all hover:scale-105"
            >
              <span className="text-2xl mb-1">{lang.flag}</span>
              <span className="text-white font-semibold text-sm">{lang.name}</span>
              <span className="text-white/40 text-xs">{lang.native}</span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
