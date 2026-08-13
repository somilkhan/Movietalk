import { useState } from "react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useProfiles } from "@/hooks/useProfiles";

const NAV_ITEMS = [
  {
    href: "/home",
    label: "Home",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M9 21H7C4.79086 21 3 19.2091 3 17V10.7076C3 9.30887 3.73061 8.01175 4.92679 7.28679L9.92679 4.25649C11.2011 3.48421 12.7989 3.48421 14.0732 4.25649L19.0732 7.28679C20.2694 8.01175 21 9.30887 21 10.7076V17C21 19.2091 19.2091 21 17 21H15M9 21V17C9 15.3431 10.3431 14 12 14V14C13.6569 14 15 15.3431 15 17V21M9 21H15" />
      </svg>
    ),
  },
  {
    href: "/explore",
    label: "Search",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M17 17L21 21" />
        <path d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z" />
      </svg>
    ),
  },
  {
    href: "/tv",
    label: "TV",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 21L17 21" />
        <path d="M2 16.4V3.6C2 3.26863 2.26863 3 2.6 3H21.4C21.7314 3 22 3.26863 22 3.6V16.4C22 16.7314 21.7314 17 21.4 17H2.6C2.26863 17 2 16.7314 2 16.4Z" />
      </svg>
    ),
  },
  {
    href: "/history",
    label: "History",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
        <path d="M3 3v5h5" />
        <path d="M12 7v5l4 2" />
      </svg>
    ),
  },
  {
    href: "/watchlist",
    label: "Watchlist",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <path d="M7 2v11h3v9l7-12h-4l4-8z" />
      </svg>
    ),
  },
  {
    href: "/categories",
    label: "Browse",
    svg: (
      <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
        <rect width="7" height="7" x="3" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="3" rx="1" />
        <rect width="7" height="7" x="14" y="14" rx="1" />
        <rect width="7" height="7" x="3" y="14" rx="1" />
      </svg>
    ),
  },
  {
    href: "/space",
    label: "My Space",
    isAvatar: true,
  },
];

export function MobileBottomNav() {
  const [location] = useLocation();
  const { activeProfile } = useProfiles();
  const [pressed, setPressed] = useState<string | null>(null);

  return (
    <nav
      className="md:hidden fixed bottom-0 left-0 right-0 z-[100]"
      style={{
        background: "linear-gradient(to top, rgba(0,0,0,0.95) 0%, rgba(0,0,0,0.85) 60%, transparent 100%)",
      }}
    >
      <div className="flex items-center justify-around px-1 pb-[env(safe-area-inset-bottom,0px)] pt-3">
        {NAV_ITEMS.map((item) => {
          const isActive = location === item.href || (item.href !== "/home" && location.startsWith(item.href));
          return (
            <Link key={item.href} href={item.href}>
              <button
                className="flex flex-col items-center justify-center gap-1 min-w-[44px] py-1 px-1 rounded-lg transition-colors relative"
                onPointerDown={() => setPressed(item.href)}
                onPointerUp={() => setPressed(null)}
                onPointerCancel={() => setPressed(null)}
              >
                {item.isAvatar ? (
                  <div
                    className={cn(
                      "w-[22px] h-[22px] rounded-full overflow-hidden transition-all",
                      isActive ? "ring-1 ring-white" : "opacity-70"
                    )}
                  >
                    <img
                      src={activeProfile?.avatar || "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/1.png"}
                      alt="Profile"
                      className="w-full h-full object-cover"
                    />
                  </div>
                ) : (
                  <span
                    className={cn(
                      "transition-colors duration-200",
                      isActive ? "text-white" : "text-white/50"
                    )}
                  >
                    {item.svg}
                  </span>
                )}
                <span
                  className={cn(
                    "text-[9px] font-medium transition-colors duration-200",
                    isActive ? "text-white" : "text-white/40"
                  )}
                >
                  {item.label}
                </span>
                {isActive && (
                  <span className="absolute -bottom-0.5 left-1/2 -translate-x-1/2 w-1 h-1 rounded-full bg-white/80" />
                )}
              </button>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
