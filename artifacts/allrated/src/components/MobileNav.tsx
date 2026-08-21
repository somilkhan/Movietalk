import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useProfiles } from "@/hooks/useProfiles";

export function MobileNav() {
  const [location] = useLocation();
  const { activeProfile } = useProfiles();

  const navItems = [
    { href: "/home", label: "Home", icon: "home" },
    { href: "/explore", label: "Search", icon: "search" },
    { href: "/tv", label: "TV", icon: "tv" },
    { href: "/anime", label: "Anime", icon: "anime" },
    { href: "/movies", label: "Movies", icon: "movies" },
    { href: "/categories", label: "Categories", icon: "categories" },
    { href: "/space", label: "Space", icon: "avatar", isAvatar: true },
  ];

  return (
    <nav
      className="md:hidden fixed left-1/2 -translate-x-1/2 z-[60] bottom-3 w-[calc(100%-1rem)] max-w-[520px]"
      aria-label="Primary navigation"
    >
      <div
        className={cn(
          "flex items-center justify-center gap-1.5 rounded-2xl",
          "bg-[#0f1014]/95 backdrop-blur-xl border border-white/10",
          "px-2.5 pt-2.5 pb-[calc(.625rem+env(safe-area-inset-bottom))] shadow-2xl"
        )}
      >
        {navItems.map((item) => {
          const isActive = location === item.href || (item.href === "/home" && location === "/");
          return (
            <Link
              key={item.href}
              href={item.href}
              aria-label={item.label}
              aria-current={isActive ? "page" : undefined}
              className={cn(
                "flex min-w-0 flex-1 items-center justify-center rounded-xl p-1.5",
                "transition-colors duration-200 focus-visible:outline-none",
                isActive ? "bg-white/12 text-white" : "text-white/55 hover:bg-white/6 hover:text-white"
              )}
            >
              <span
                className={cn(
                  "flex h-10 w-10 items-center justify-center rounded-xl",
                  isActive ? "bg-white/10" : "bg-transparent"
                )}
              >
                {item.isAvatar ? (
                  <img
                    src={activeProfile?.avatar || "https://img1.hotstarext.com/image/upload/w_200,h_200,c_fill/v1/feature/profile/25.png"}
                    alt=""
                    className="h-7 w-7 rounded-full object-cover"
                  />
                ) : (
                  <NavIcon name={item.icon} />
                )}
              </span>
              <span className="sr-only">{item.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}

function NavIcon({ name }: { name: string }) {
  const common = {
    width: 20,
    height: 20,
    viewBox: "0 0 24 24",
    fill: "none",
    stroke: "currentColor",
    strokeWidth: 1.7,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    "aria-hidden": true,
  };

  switch (name) {
    case "home":
      return <svg {...common}><path d="M3 10.8 12 4l9 6.8" /><path d="M5 10v9h14v-9" /><path d="M9 19v-5h6v5" /></svg>;
    case "search":
      return <svg {...common}><circle cx="11" cy="11" r="7" /><path d="m20 20-4-4" /></svg>;
    case "tv":
      return <svg {...common}><rect x="2.5" y="5" width="19" height="14" rx="2" /><path d="m8 2 4 3 4-3" /></svg>;
    case "anime":
      return <svg {...common}><circle cx="12" cy="12" r="8.5" /><path d="M15 8.5c-1.2 1.1-2.1 2.5-2.5 4.1" /><path d="M9 15.5c1.1-.3 2.2-.9 3.1-1.8" /></svg>;
    case "movies":
      return <svg {...common}><path d="M4 5h16v14H4z" /><path d="m8 5 3 4-3 4 3 4" /><path d="m16 5-3 4 3 4-3 4" /></svg>;
    default:
      return <svg {...common}><rect x="4" y="4" width="6" height="16" rx="1" /><circle cx="17" cy="8" r="3" /><rect x="14" y="14" width="6" height="6" rx="1" /></svg>;
  }
}
