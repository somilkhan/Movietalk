import { Home, Search, Tv, Sparkles, Film, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useProfiles } from '@/hooks/useProfiles';

const items = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Search', icon: Search },
  { href: '/tv', label: 'TV', icon: Tv },
  { href: '/anime', label: 'Anime', icon: Sparkles },
  { href: '/movies', label: 'Movies', icon: Film },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
] as const;

export function MobileNav() {
  const [location] = useLocation();
  const { activeProfile } = useProfiles();
  const isActive = (href: string) => location === href || location.startsWith(`${href}/`);

  return (
    <nav
      className="rr-mobile-nav md:hidden fixed bottom-4 left-1/2 z-[100] -translate-x-1/2 flex items-center gap-2 rounded-full border border-white/10 bg-[#0f1014]/90 px-2 py-2 shadow-2xl backdrop-blur-md"
      aria-label="Mobile navigation"
    >
      {items.map(({ href, label, icon: Icon }) => (
        <Link key={href} href={href} aria-label={label} title={label}>
          <span
            className={`rr-nav-button flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
              isActive(href) ? 'bg-[#1a1a1a] text-white' : 'text-white/50 hover:bg-white/[0.05] hover:text-white/85'
            }`}
          >
            <Icon className="rr-nav-icon h-5 w-5" strokeWidth={1.7} />
          </span>
        </Link>
      ))}
      <Link href="/space" aria-label="My Space" title="My Space">
        <span
          className={`rr-nav-button flex h-10 w-10 items-center justify-center overflow-hidden rounded-full border transition-colors ${
            isActive('/space') ? 'border-white/40 bg-[#1a1a1a]' : 'border-white/10 bg-[#1a1a1a] hover:border-white/20'
          }`}
        >
          <img
            className="h-full w-full object-cover"
            src={activeProfile?.avatar || '/brand/logo.png'}
            alt=""
          />
        </span>
      </Link>
    </nav>
  );
}
