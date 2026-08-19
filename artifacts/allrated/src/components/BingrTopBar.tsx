import { Search, UserRound, Bell, Sparkles } from "lucide-react";
import { Link, useLocation } from "wouter";
import { useState } from "react";
import { useProfiles } from "@/hooks/useProfiles";

export function BingrTopBar() {
  const [location, navigate] = useLocation();
  const { activeProfile } = useProfiles();
  const [query, setQuery] = useState("");
  const submit = () => {
    const value = query.trim();
    navigate(value ? `/explore?q=${encodeURIComponent(value)}` : "/explore");
  };
  const onKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") submit();
  };
  if (location.startsWith("/login") || location.startsWith("/register") || location.startsWith("/profiles")) return null;
  return (
    <header className="rr-topbar fixed left-0 right-0 top-0 z-[45] hidden md:flex items-center justify-between gap-6 px-6 lg:px-10 py-4 pl-[104px] pointer-events-none">
      <div className="pointer-events-auto flex min-w-0 flex-1 items-center gap-3">
        <div className="rr-search-shell flex h-11 w-full max-w-[560px] items-center gap-3 rounded-2xl border border-white/[0.08] bg-black/35 px-4 backdrop-blur-xl">
          <Search className="h-4 w-4 shrink-0 text-white/45" />
          <input
            aria-label="Search movies, shows and anime"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            onKeyDown={onKeyDown}
            placeholder="Search movies, shows, anime and more..."
            className="min-w-0 flex-1 bg-transparent text-sm text-white outline-none placeholder:text-white/35"
          />
          <button type="button" onClick={submit} className="rounded-xl bg-white/[0.07] px-3 py-1.5 text-[11px] font-semibold text-white/65 transition hover:bg-white/10 hover:text-white">
            Search
          </button>
        </div>
        <Link href="/categories" className="hidden lg:inline-flex h-11 items-center gap-2 rounded-2xl border border-white/[0.06] bg-black/25 px-4 text-xs font-semibold text-white/60 backdrop-blur-xl transition hover:bg-white/[0.06] hover:text-white">
          <Sparkles className="h-3.5 w-3.5" /> Explore
        </Link>
      </div>
      <div className="pointer-events-auto flex items-center gap-2">
        <button type="button" aria-label="Notifications" className="hidden lg:flex h-11 w-11 items-center justify-center rounded-2xl border border-white/[0.06] bg-black/25 text-white/55 backdrop-blur-xl transition hover:bg-white/[0.06] hover:text-white">
          <Bell className="h-4 w-4" />
        </button>
        <Link href={activeProfile ? "/space" : "/profiles"} aria-label={activeProfile ? "Open My Space" : "Choose profile"} className="flex h-11 items-center gap-2 rounded-2xl border border-white/[0.07] bg-black/30 px-2 pr-3 backdrop-blur-xl transition hover:bg-white/[0.06]">
          {activeProfile ? <img src={activeProfile.avatar} alt="" className="h-8 w-8 rounded-full object-cover ring-1 ring-white/15" /> : <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/10"><UserRound className="h-4 w-4 text-white/60" /></span>}
          <span className="hidden lg:block max-w-28 truncate text-xs font-semibold text-white/75">{activeProfile?.name || "Profile"}</span>
        </Link>
      </div>
    </header>
  );
}
