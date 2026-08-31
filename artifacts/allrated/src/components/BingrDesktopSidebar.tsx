import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";

const ITEMS = [
  ["/home", "Home", "M4 10.5 12 4l8 6.5v7.5a2 2 0 0 1-2 2h-3v-5h-6v5H6a2 2 0 0 1-2-2z"],
  ["/explore", "Search", "m21 21-4.3-4.3M10.8 18a7.2 7.2 0 1 1 0-14.4 7.2 7.2 0 0 1 0 14.4Z"],
  ["/tv", "TV", "M3 5h18v13H3zM8 21h8"],
  ["/anime", "Anime", "M4 8.5C4 6 6 4 8.5 4h7C18 4 20 6 20 8.5v7c0 2.5-2 4.5-4.5 4.5h-7C6 20 4 18 4 15.5zM8 10h.01M16 10h.01M9 15c2 1.5 4 1.5 6 0"],
  ["/movies", "Movies", "M4 7h16v13H4zM7 7l2-4h6l2 4M8 11h8M8 15h5"],
  ["/sports", "Sports", "M4 5h16v14H4zM8 9h8M8 13h5"],
  ["/sparks", "Sparks", "m13 2-9 11h7l-1 9 9-12h-7z"],
  ["/categories", "Categories", "M4 4h6v16H4zM14 4h6v6h-6zM14 14h6v6h-6z"],
  ["/space", "My Space", "M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 21a7 7 0 0 1 14 0"],
] as const;

function Icon({ path }: { path: string }) {
  return <svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true"><path d={path} /></svg>;
}

export function BingrDesktopSidebar() {
  const [location] = useLocation();
  return (
    <aside className="hidden md:flex fixed inset-y-0 left-0 z-50 w-[80px] flex-col items-center bg-transparent" aria-label="Main navigation">
      <Link href="/home" className="mt-4 flex h-[55px] w-[55px] items-center justify-center transition-transform hover:scale-105" aria-label="Bingr home">
        <img src="https://bingr.one/brand/logo.png" alt="Bingr Logo" className="h-[55px] w-[55px] object-contain drop-shadow-lg" />
      </Link>
      <nav className="mt-auto mb-8 flex w-full flex-col items-center gap-1">
        {ITEMS.map(([href, label, path]) => {
          const active = location === href || (href === "/home" && location === "/");
          return (
            <Link key={href} href={href} title={label} className="group flex w-full items-center justify-center py-2">
              <span className={cn("flex h-11 w-11 items-center justify-center rounded-full transition-colors", active ? "bg-white/10 text-white" : "text-white/55 hover:bg-white/5 hover:text-white")}>
                <Icon path={path} />
              </span>
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
