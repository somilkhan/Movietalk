import { Home, Search, Tv, History, Bookmark, Zap, LayoutGrid, UserRound } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { cn } from '@/lib/utils';

const NAV_ITEMS = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Search', icon: Search },
  { href: '/tv', label: 'TV', icon: Tv },
  { href: '/history', label: 'History', icon: History },
  { href: '/watchlist', label: 'Watchlist', icon: Bookmark },
  { href: '/sports', label: 'Sports', icon: Zap },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
  { href: '/space', label: 'My Space', icon: UserRound },
] as const;

export function DesktopSidebar() {
  const [location] = useLocation();
  return (
    <aside className="rr-desktop-sidebar hidden md:flex fixed left-0 top-0 bottom-0 z-50 w-[60px] flex-col items-center bg-[#07070b]" aria-label="Main navigation">
      <Link href="/home" className="rr-sidebar-logo mt-5 mb-8 flex h-[34px] w-[34px] items-center justify-center rounded-xl transition-transform duration-300 hover:scale-105" aria-label="Home">
        <img src="/brand/logo.png" alt="RabbitRip" className="rr-sidebar-logo h-[34px] w-[34px] object-contain" />
      </Link>
      <nav className="flex w-full flex-1 flex-col items-center">
        <div className="flex w-full flex-col items-center gap-1">
          {NAV_ITEMS.map(({ href, label, icon: Icon }, index) => {
            const isActive = location === href || (href === '/home' && location === '/');
            const spacer = index === NAV_ITEMS.length - 1;
            return (
              <Link key={href} href={href} title={label} aria-label={label} className={cn('group relative flex h-[52px] w-[60px] items-center justify-center', spacer && 'mt-auto mb-5')}>
                <span className={cn('absolute left-0 h-5 w-[3px] rounded-r-full bg-white transition-all duration-300', isActive ? 'opacity-100 scale-y-100' : 'opacity-0 scale-y-0')} />
                <span className={cn('flex h-10 w-10 items-center justify-center rounded-xl transition-all duration-300', isActive ? 'bg-white/[0.08] text-white' : 'text-white/45 group-hover:bg-white/[0.05] group-hover:text-white/85')}>
                  <Icon className="h-[21px] w-[21px]" strokeWidth={1.7} />
                </span>
              </Link>
            );
          })}
        </div>
      </nav>
    </aside>
  );
}
