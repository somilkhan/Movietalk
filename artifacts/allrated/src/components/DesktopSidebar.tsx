import { useState } from 'react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  {
    href: '/home',
    label: 'Home',
    svg: (
      <svg width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="w-6 h-6 md:w-7 md:h-7">
        <path d="M9 21H7C4.79086 21 3 19.2091 3 17V10.7076C3 9.30887 3.73061 8.01175 4.92679 7.28679L9.92679 4.25649C11.2011 3.48421 12.7989 3.48421 14.0732 4.25649L19.0732 7.28679C20.2694 8.01175 21 9.30887 21 10.7076V17C21 19.2091 19.2091 21 17 21H15M9 21V17C9 15.3431 10.3431 14 12 14V14C13.6569 14 15 15.3431 15 17V21M9 21H15" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/explore',
    label: 'Search',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" strokeWidth="1.5" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="w-6 h-6 md:w-7 md:h-7">
        <path d="M17 17L21 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M3 11C3 15.4183 6.58172 19 11 19C13.213 19 15.2161 18.1015 16.6644 16.6493C18.1077 15.2022 19 13.2053 19 11C19 6.58172 15.4183 3 11 3C6.58172 3 3 6.58172 3 11Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
  {
    href: '/tv',
    label: 'TV',
    svg: (
      <svg width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="w-6 h-6 md:w-7 md:h-7">
        <path d="M7 21L17 21" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M2 16.4V3.6C2 3.26863 2.26863 3 2.6 3H21.4C21.7314 3 22 3.26863 22 3.6V16.4C22 16.7314 21.7314 17 21.4 17H2.6C2.26863 17 2 16.7314 2 16.4Z" stroke="currentColor" strokeWidth="1.5"/>
      </svg>
    ),
  },
  {
    href: '/anime',
    label: 'Anime',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 192 192" fill="none" className="w-6 h-6 md:w-7 md:h-7">
        <path fill="currentColor" d="M163.649 83.141a6 6 0 0 0 11.591-3.105l-11.591 3.105Zm-11.909-33.41 4.379-4.102-4.379 4.102ZM51.343 41.498l-3.653-4.76 3.653 4.76ZM22.16 105.905l5.987-.392-5.987.392Zm11.149 34.7 5.095-3.168-5.095 3.168Zm23.19 30.543a6 6 0 1 0 6-10.392l-6 10.392Zm118.74-91.112a81.002 81.002 0 0 0-19.121-34.407l-8.758 8.203a69.009 69.009 0 0 1 16.288 29.31l11.591-3.106Zm-19.121-34.407a81.004 81.004 0 0 0-33.082-21.33l-3.858 11.363a69.004 69.004 0 0 1 28.182 18.17l8.758-8.203Zm-33.082-21.33a81 81 0 0 0-39.232-3.217l1.955 11.84a68.999 68.999 0 0 1 33.419 2.74l3.858-11.363Zm-39.232-3.217A81 81 0 0 0 47.69 36.738l7.306 9.52A69 69 0 0 1 85.76 32.923l-1.955-11.84ZM47.69 36.738a80.999 80.999 0 0 0-24.47 30.833l10.93 4.952A69 69 0 0 1 54.996 46.26l-7.306-9.52ZM23.22 67.571a81 81 0 0 0-7.047 38.727l11.975-.785a69.001 69.001 0 0 1 6.002-32.99l-10.93-4.952Zm-7.047 38.727a80.994 80.994 0 0 0 12.042 37.475l10.19-6.336a69 69 0 0 1-10.257-31.924l-11.975.785Zm12.042 37.475A80.998 80.998 0 0 0 56.5 171.148l6-10.392a69.003 69.003 0 0 1-24.095-23.319l-10.19 6.336Z"/>
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" d="M154.201 99.466a51.502 51.502 0 0 1-26.891 54.699 51.497 51.497 0 0 1-69.453-69.519 51.5 51.5 0 0 1 54.725-26.839"/>
        <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="12" d="M154.125 99.377a29.502 29.502 0 0 1-39.486-2.02 29.498 29.498 0 0 1-2.013-39.486"/>
      </svg>
    ),
  },
  {
    href: '/movies',
    label: 'Movies',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" fill="currentColor" viewBox="0 0 256 256" className="w-6 h-6 md:w-[26px] md:h-[26px]">
        <path d="M229.52,74.21a8,8,0,0,0-7.13-2A44,44,0,0,0,168,41.67a44,44,0,0,0-80,0,44,44,0,0,0-54.4,30.51,8,8,0,0,0-9.4,9.65L54.76,211.67A16,16,0,0,0,70.34,224H185.66a16,16,0,0,0,15.58-12.33L231.79,81.83A8,8,0,0,0,229.52,74.21ZM76,56a27.68,27.68,0,0,1,13.11,3.26,8,8,0,0,0,11.56-5.34,28,28,0,0,1,54.66,0,8,8,0,0,0,11.56,5.34A28,28,0,0,1,207,76.54l-38.56,11-34.49-13.8a16,16,0,0,0-11.88,0L87.57,87.56,49,76.54A28,28,0,0,1,76,56ZM70.34,208,42.91,91.44l37.85,10.81L94.86,208ZM145,208H111L96.75,101.12,128,88.62l31.25,12.5Zm40.66,0H161.14l14.1-105.75,37.85-10.81Z"/>
      </svg>
    ),
  },
  {
    href: '/sports',
    label: 'Sports',
    svg: (
      <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 256 256" className="w-6 h-6 md:w-7 md:h-7">
        <rect width="256" height="256" fill="none"/>
        <circle cx="128" cy="128" r="96" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <line x1="167.52" y1="40.48" x2="40.48" y2="167.52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <line x1="195.88" y1="60.12" x2="60.12" y2="195.88" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
        <line x1="215.52" y1="88.48" x2="88.48" y2="215.52" fill="none" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="16"/>
      </svg>
    ),
  },
  {
    href: '/spark',
    label: 'Spark',
    svg: (
      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-6 h-6 md:w-7 md:h-7">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/>
      </svg>
    ),
  },
  {
    href: '/space',
    label: 'My Space',
    svg: (
      <svg width="24" height="24" strokeWidth="1.5" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" color="currentColor" className="w-6 h-6 md:w-7 md:h-7">
        <path d="M5 20V19C5 15.134 8.13401 12 12 12C15.866 12 19 15.134 19 19V20" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
        <path d="M12 12C14.2091 12 16 10.2091 16 8C16 5.79086 14.2091 4 12 4C9.79086 4 8 5.79086 8 8C8 10.2091 9.79086 12 12 12Z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
      </svg>
    ),
  },
];

export function DesktopSidebar() {
  const [location] = useLocation();
  const [hovered, setHovered] = useState(false);

  return (
    <aside
      className="hidden md:flex flex-col justify-center fixed left-0 top-0 bottom-0 z-50 transition-[width] duration-300 ease-in-out w-[80px]"
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      aria-label="Main navigation"
    >
      {/* Left edge gradient */}
      <div className="absolute left-0 top-0 bottom-0 w-[120px] bg-gradient-to-r from-black/80 to-transparent pointer-events-none z-[-2]" />

      {/* Expand gradient backdrop */}
      <div
        className={cn(
          "absolute left-0 top-0 bottom-0 w-[350px] lg:w-[450px] bg-gradient-to-r from-black/95 via-black/70 to-transparent transition-opacity duration-500 pointer-events-none z-[-1]",
          hovered ? 'opacity-100' : 'opacity-0'
        )}
      />

      {/* Logo */}
      <div className="absolute top-8 left-0 w-[80px] flex justify-center z-[60]">
        <Link href="/home" className="flex items-center justify-center transition-transform hover:scale-110">
          <img
            alt="Bingr Logo"
            className="w-[60px] h-[60px] object-contain drop-shadow-lg"
            src="/brand/logo.png"
            onError={(e) => {
              (e.target as HTMLImageElement).style.display = 'none';
            }}
          />
        </Link>
      </div>

      {/* Nav */}
      <nav className="flex flex-col py-10 w-full z-10">
        <div className="flex flex-col no-scrollbar">
          {NAV_ITEMS.map((item) => {
            const isActive =
              location === item.href ||
              (item.href === '/home' && location === '/');
            return (
              <Link
                key={item.href}
                href={item.href}
                className="group relative flex items-center px-8 py-4 cursor-pointer"
              >
                <span
                  className={cn(
                    "flex-shrink-0 flex items-center justify-center transition-all duration-300 rounded-full w-5 h-5 md:w-[22px] md:h-[22px]",
                    isActive
                      ? "text-white scale-125"
                      : "text-[#8f98a2] group-hover:text-white group-hover:scale-110"
                  )}
                >
                  {item.svg}
                </span>
                <span
                  className={cn(
                    "ml-6 text-[16px] tracking-wide whitespace-nowrap transition-all duration-300",
                    isActive
                      ? "font-extrabold text-white"
                      : "font-bold text-[#8f98a2] group-hover:text-white",
                    hovered ? 'opacity-100 translate-x-0 pointer-events-auto' : 'opacity-0 -translate-x-4 pointer-events-none'
                  )}
                >
                  {item.label}
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
