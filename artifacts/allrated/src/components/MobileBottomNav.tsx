import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const TABS = [
  {
    href: '/home',
    label: 'Home',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
        <polyline points="9 22 9 12 15 12 15 22"/>
      </svg>
    ),
  },
  {
    href: '/explore',
    label: 'Search',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="11" cy="11" r="8"/>
        <line x1="21" y1="21" x2="16.65" y2="16.65"/>
      </svg>
    ),
  },
  {
    href: '/tv',
    label: 'TV',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect x="2" y="7" width="20" height="15" rx="2" ry="2"/>
        <polyline points="17 2 12 7 7 2"/>
      </svg>
    ),
  },
  {
    href: '/spark',
    label: 'Spark',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/>
      </svg>
    ),
  },
  {
    href: '/movies',
    label: 'Movies',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M12 2a10 10 0 1 0 10 10A10 10 0 0 0 12 2zm0 18a8 8 0 1 1 8-8 8 8 0 0 1-8 8z"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    ),
  },
  {
    href: '/sports',
    label: 'Sports',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <circle cx="12" cy="12" r="10"/>
        <path d="M2 12h20"/>
        <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
      </svg>
    ),
  },
  {
    href: '/space',
    label: 'Profile',
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
        <circle cx="12" cy="7" r="4"/>
      </svg>
    ),
  },
];

export function MobileBottomNav() {
  const [location] = useLocation();
  const [hidden, setHidden] = useState(false);
  const lastScrollY = useRef(0);

  useEffect(() => {
    let ticking = false;
    const handleScroll = () => {
      if (ticking) return;
      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        if (currentY > lastScrollY.current && currentY > 100) {
          setHidden(true);
        } else {
          setHidden(false);
        }
        lastScrollY.current = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <nav
      className={cn(
        "md:hidden fixed left-1/2 -translate-x-1/2 z-[60]",
        "flex items-center justify-center",
        "h-[56px] px-1.5",
        "rounded-[20px] bg-[#0f1014]/95 backdrop-blur-xl border border-white/[0.06]",
        "shadow-[0_8px_32px_rgba(0,0,0,0.5)]",
        "transition-all duration-300 ease-out",
        hidden ? "translate-y-[120px] opacity-0" : "translate-y-0 opacity-100"
      )}
      style={{ bottom: 'calc(0.75rem + env(safe-area-inset-bottom, 0px))' }}
      aria-label="Mobile navigation"
    >
      {TABS.map(({ href, label, svg }) => {
        const isActive = location === href || (href === '/home' && (location === '/' || location === '/home'));
        return (
          <Link key={href} href={href}>
            <button
              className={cn(
                "relative flex items-center justify-center rounded-full transition-all duration-200 mx-0.5",
                isActive
                  ? "bg-white/[0.1] text-white"
                  : "text-white/40 hover:text-white/70"
              )}
              style={{ width: 40, height: 40 }}
              aria-label={label}
              aria-current={isActive ? 'page' : undefined}
            >
              {svg}
            </button>
          </Link>
        );
      })}
    </nav>
  );
}
