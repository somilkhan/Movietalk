import { Home, Search, Tv, LayoutGrid } from 'lucide-react';
import { Link, useLocation } from 'wouter';
import { useProfiles } from '@/hooks/useProfiles';

const items = [
  { href: '/home', label: 'Home', icon: Home },
  { href: '/explore', label: 'Search', icon: Search },
  { href: '/tv', label: 'TV', icon: Tv },
  { href: '/categories', label: 'Categories', icon: LayoutGrid },
] as const;

export function MobileNav() {
  const [location] = useLocation();
  const { activeProfile } = useProfiles();
  const isActive = (href: string) => location === href || (href === '/home' && location === '/');
  return (
    <div className="md:hidden">
      <nav className="rr-mobile-nav" aria-label="Mobile navigation">
        {items.map(({ href, label, icon: Icon }) => (
          <Link key={href} href={href} aria-label={label} data-active={isActive(href)}>
            <span className="rr-nav-button"><Icon className="rr-nav-icon h-[20px] w-[20px]" strokeWidth={1.8} /></span>
          </Link>
        ))}
        <Link href="/space" aria-label="My Space" data-active={location === '/space'}>
          <span className="rr-nav-button">
            <img className="rr-avatar" src={activeProfile?.avatar || 'https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/25.png'} alt="" />
          </span>
        </Link>
      </nav>
    </div>
  );
}
