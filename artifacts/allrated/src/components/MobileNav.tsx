import { useState, useEffect, useCallback, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { Home, Search, Tv, Bookmark, Zap, LayoutGrid } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/hooks/useAuth';

interface MobileNavProps {
  watchlistCount?: number;
}

export function MobileNav({ watchlistCount = 0 }: MobileNavProps) {
  const [location, setLocation] = useLocation();
  const { isLoggedIn } = useAuth();
  const [hidden, setHidden] = useState(false);
  const [toastLabel, setToastLabel] = useState<string | null>(null);
  const toastTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastScrollY = useRef(0);
  const touchStartX = useRef(0);

  // Show toast label above nav
  const showToast = useCallback((label: string) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToastLabel(label);
    toastTimer.current = setTimeout(() => {
      setToastLabel(null);
    }, 1500);
  }, []);

  // Scroll hide/show — throttled to 100ms for performance
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

  // Gesture swipe between tabs
  const handleTouchStart = useCallback((e: React.TouchEvent) => {
    touchStartX.current = e.touches[0].clientX;
  }, []);

  const handleTouchEnd = useCallback((e: React.TouchEvent) => {
    const deltaX = e.changedTouches[0].clientX - touchStartX.current;
    const SWIPE_THRESHOLD = 80;

    if (Math.abs(deltaX) < SWIPE_THRESHOLD) return;

    const tabs = ['/home', '/explore', '/tv', '/space', '/sports', '/categories'];
    const currentIndex = tabs.findIndex((t) => location.startsWith(t));
    if (currentIndex === -1) return;

    if (deltaX < 0 && currentIndex < tabs.length - 1) {
      setLocation(tabs[currentIndex + 1]);
    } else if (deltaX > 0 && currentIndex > 0) {
      setLocation(tabs[currentIndex - 1]);
    }
  }, [location]);

  const tabs = [
    { href: '/home', icon: Home, label: 'Home', badge: 0 },
    { href: '/explore', icon: Search, label: 'Search', badge: 0 },
    { href: '/tv', icon: Tv, label: 'TV', badge: 0 },
    { href: '/space', icon: Bookmark, label: 'Watchlist', badge: isLoggedIn ? watchlistCount : 0 },
    { href: '/sports', icon: Zap, label: 'Sports', badge: 0 },
    { href: '/categories', icon: LayoutGrid, label: 'Categories', badge: 0 },
  ];

  return (
    <>
      {/* Toast Label */}
      {toastLabel && (
        <div
          className={cn(
            "fixed bottom-[88px] left-1/2 -translate-x-1/2 z-[10000]",
            "px-4 py-1.5 rounded-full",
            "text-xs font-semibold text-white whitespace-nowrap",
            "pointer-events-none",
            /* Liquid glass toast */
            "bg-white/[0.08] backdrop-blur-[40px] saturate-[1.5]",
            "border border-white/15",
            "shadow-[0_8px_24px_rgba(0,0,0,0.4),inset_0_1px_1px_rgba(255,255,255,0.2)]",
            "animate-toast-in"
          )}
        >
          {toastLabel}
          {/* Arrow */}
          <span className="absolute -bottom-[4px] left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white/[0.08] border-r border-b border-white/15" />
        </div>
      )}

      {/* Liquid Glass Floating Nav */}
      <nav
        className={cn(
          "fixed bottom-5 left-1/2 -translate-x-1/2 z-[9999]",
          "flex items-center gap-[2px] p-[5px] rounded-[32px]",
          "md:hidden",
          /* Liquid glass body */
          "bg-white/[0.01] backdrop-blur-[80px] saturate-[2] brightness-[1.2]",
          "border border-white/15",
          "shadow-[0_25px_80px_rgba(0,0,0,0.5),0_10px_30px_rgba(0,0,0,0.3),inset_0_1px_1px_rgba(255,255,255,0.2),inset_0_-1px_1px_rgba(0,0,0,0.1)]",
          "transition-all duration-500",
          hidden ? "translate-y-[140px] scale-90 opacity-0" : ""
        )}
        style={{
          transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
        }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        aria-label="Mobile navigation"
        data-testid="nav-mobile"
      >
        {/* Specular highlight */}
        <span
          className="absolute top-[1px] left-[20%] right-[20%] h-[1px] rounded-full pointer-events-none"
          style={{
            background: 'linear-gradient(90deg, transparent, rgba(255,255,255,0.5), rgba(255,255,255,0.3), transparent)',
            filter: 'blur(0.5px)',
          }}
        />

        {tabs.map(({ href, icon: Icon, label, badge }) => {
          const isActive = location === href || location.startsWith(href);
          return (
            <Link key={href} href={href}>
              <button
                className={cn(
                  "relative flex items-center justify-center",
                  "h-12 rounded-[24px] border-none",
                  "text-white/30 cursor-pointer",
                  "min-w-[48px] overflow-visible",
                  "transition-all duration-[400ms]",
                  "-webkit-tap-highlight-color-transparent",
                  isActive && "text-white px-[18px] min-w-0"
                )}
                style={{
                  transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                }}
                onClick={() => showToast(label)}
                aria-label={label}
                aria-current={isActive ? 'page' : undefined}
                data-testid={`link-mobile-nav-${label.toLowerCase().replace(' ', '-')}`}
              >
                {/* Active background bubble */}
                <span
                  className={cn(
                    "absolute inset-0 rounded-[24px] transition-all duration-[400ms]",
                    isActive
                      ? "bg-gradient-to-b from-white/[0.15] to-white/[0.05] shadow-[inset_0_1px_2px_rgba(255,255,255,0.3),inset_0_-1px_1px_rgba(0,0,0,0.1),0_2px_20px_rgba(255,255,255,0.08)] border border-white/20"
                      : "bg-transparent"
                  )}
                  style={{
                    transitionTimingFunction: 'cubic-bezier(0.22, 1, 0.36, 1)',
                  }}
                />

                {/* Icon */}
                <span className="relative z-[1] flex items-center justify-center">
                  <Icon
                    className={cn(
                      "w-5 h-5 transition-all duration-350",
                      isActive && "drop-shadow-[0_0_10px_rgba(255,255,255,0.4)]"
                    )}
                    strokeWidth={isActive ? 2 : 1.7}
                  />
                </span>

                {/* Badge */}
                {badge > 0 && (
                  <span
                    className={cn(
                      "absolute top-[3px] right-[3px] z-[2]",
                      "min-w-[18px] h-[18px] px-[5px]",
                      "bg-[#ff2357] text-white text-[10px] font-bold rounded-[9px]",
                      "flex items-center justify-center",
                      "border-2 border-black/30",
                      "shadow-[0_2px_10px_rgba(255,35,87,0.4)]",
                      "transition-transform duration-300",
                      isActive && "scale-110 border-white/15"
                    )}
                    style={{
                      transitionTimingFunction: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
                    }}
                  >
                    {badge > 99 ? '99+' : badge}
                  </span>
                )}
              </button>
            </Link>
          );
        })}
      </nav>
    </>
  );
}
