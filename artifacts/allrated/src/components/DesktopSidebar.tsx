import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-7 md:h-7"><path d="M9 21H7C4.79 21 3 19.21 3 17v-6.29c0-1.4.73-2.7 1.93-3.42l5-3.03a4 4 0 0 1 4.15 0l5 3.03A4 4 0 0 1 21 10.71V17c0 2.21-1.79 4-4 4h-2v-4a3 3 0 0 0-6 0v4Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/explore', label: 'Search', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-7 md:h-7"><circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="1.5"/><path d="m17 17 4 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
  { href: '/tv', label: 'TV', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-7 md:h-7"><rect x="2" y="3" width="20" height="14" rx="1.6" stroke="currentColor" strokeWidth="1.5"/><path d="M7 21h10M9 3l3 3 3-3" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/anime', label: 'Anime', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-7 md:h-7"><circle cx="12" cy="12" r="9" stroke="currentColor" strokeWidth="1.6"/><path d="M15.5 8.5c-1.5 1.1-2.5 2.5-2.8 4M8.5 15.5c1.3-.3 2.5-1 3.4-2" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round"/></svg> },
  { href: '/movies', label: 'Movies', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-[26px] md:h-[26px]"><path d="M4 5h16v14H4zM8 5l3 4-3 4 3 4M16 5l-3 4 3 4-3 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg> },
  { href: '/categories', label: 'Categories', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-7 md:h-7"><rect x="4" y="4" width="6" height="16" rx="1" stroke="currentColor" strokeWidth="1.5"/><circle cx="17" cy="8" r="3" stroke="currentColor" strokeWidth="1.5"/><rect x="14" y="14" width="6" height="6" rx="1" stroke="currentColor" strokeWidth="1.5"/></svg> },
  { href: '/space', label: 'My Space', svg: <svg width="24" height="24" viewBox="0 0 24 24" fill="none" className="w-6 h-6 md:w-7 md:h-7"><circle cx="12" cy="8" r="4" stroke="currentColor" strokeWidth="1.5"/><path d="M5 20a7 7 0 0 1 14 0" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/></svg> },
];

export function DesktopSidebar() {
  const [location] = useLocation();
  const [expanded, setExpanded] = useState(false);

  return (
    <aside
      className="hidden md:flex group flex-col justify-center fixed left-0 top-0 bottom-0 z-50 w-[80px]"
      onMouseEnter={() => setExpanded(true)}
      onMouseLeave={() => setExpanded(false)}
      onFocus={() => setExpanded(true)}
      onBlur={(event) => {
        if (!event.currentTarget.contains(event.relatedTarget as Node | null)) setExpanded(false);
      }}
      aria-label="Main navigation"
    >
      <div className="absolute left-0 top-0 bottom-0 w-[120px] bg-gradient-to-r from-black/80 to-transparent pointer-events-none -z-20" />
      <div className={cn("absolute left-0 top-0 bottom-0 w-[350px] lg:w-[450px] bg-gradient-to-r from-black/95 via-black/70 to-transparent transition-opacity duration-300 pointer-events-none -z-10", expanded ? 'opacity-100' : 'opacity-0')} />
      <div className="absolute top-8 left-0 w-[80px] flex justify-center z-[60]">
        <Link href="/home" aria-label="RabbitRip home" className="flex items-center justify-center rounded-full transition-transform hover:scale-105 focus-visible:outline-none">
          <img alt="" className="w-[60px] h-[60px] object-contain drop-shadow-lg" src="/brand/logo.png" onError={(e) => { (e.target as HTMLImageElement).style.display = 'none'; }} />
        </Link>
      </div>
      <nav className="flex flex-col py-10 w-full z-10" aria-label="Primary">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href === '/home' && location === '/');
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-current={isActive ? 'page' : undefined}
              className="group/item relative flex min-h-14 items-center px-8 py-3 rounded-xl focus-visible:outline-none"
            >
              <span className={cn('flex-shrink-0 flex items-center justify-center rounded-full transition-transform duration-200 w-6 h-6 md:w-[22px] md:h-[22px]', isActive ? 'text-white scale-110' : 'text-[#8f98a2] group-hover/item:text-white group-hover/item:scale-105')}>
                {item.svg}
              </span>
              <span className={cn('ml-6 text-[15px] tracking-wide whitespace-nowrap transition-all duration-200', isActive ? 'font-bold text-white' : 'font-semibold text-[#8f98a2] group-hover/item:text-white', expanded ? 'opacity-100 translate-x-0' : 'opacity-0 -translate-x-3 pointer-events-none')}>
                {item.label}
              </span>
              {isActive && <span className="absolute left-2 h-7 w-0.5 rounded-full bg-[#4752c4]" aria-hidden="true" />}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
