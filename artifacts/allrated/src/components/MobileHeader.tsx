import { useState } from "react";
import { Link, useLocation } from "wouter";
import { Search, X, ArrowLeft } from "lucide-react";
import { AnimatedCatLogo } from "./AnimatedCatLogo";

interface MobileHeaderProps {
  logoSmokePoof?: boolean;
}

export function MobileHeader({ logoSmokePoof = false }: MobileHeaderProps) {
  const [location] = useLocation();
  // Hide on watch, title detail, and home pages (bingr has no header on home)
  if (location.startsWith('/watch') || location.startsWith('/title') || location === '/' || location === '/home') return null;

  const [searchOpen, setSearchOpen] = useState(false);
  const [query, setQuery] = useState("");

  function closeSearch() {
    setSearchOpen(false);
    setQuery("");
  }

  return (
    <>
      {/* Header bar */}
      <header className="md:hidden fixed top-0 left-0 right-0 z-50 bg-[#07070b]/80 backdrop-blur-lg border-b border-[#ffffff0d] transition-all duration-300 safe-top mobile-header">
        <div className="flex items-center justify-between h-14 px-4">
          <Link href="/home">
            <AnimatedCatLogo size={32} autoPlay smokePoof={logoSmokePoof} />
          </Link>
          <button
            onClick={() => setSearchOpen(true)}
            className="w-10 h-10 flex items-center justify-center text-[#ffffff4d] hover:text-[#ffffffb3] transition-colors rounded-full hover:bg-[#ffffff0d]"
            aria-label="Open search"
          >
            <Search className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Search overlay — always rendered, visibility controlled by opacity+visibility */}
      <div
        className="md:hidden fixed inset-0 z-[60] bg-[#07070b] flex flex-col transition-all duration-300"
        style={{
          opacity: searchOpen ? 1 : 0,
          visibility: searchOpen ? 'visible' : 'hidden',
          pointerEvents: searchOpen ? 'auto' : 'none',
        }}
      >
        <div className="flex items-center gap-3 px-4 h-14 border-b border-[#ffffff0d]">
          <button
            onClick={closeSearch}
            className="w-10 h-10 flex items-center justify-center text-[#ffffffb3] hover:text-white transition-colors"
            aria-label="Close search"
          >
            <ArrowLeft className="w-5 h-5" />
          </button>

          <input
            autoFocus={searchOpen}
            type="text"
            placeholder="Search movies, shows, anime..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search query"
            className="flex-1 bg-transparent text-[#ffffffe6] text-base outline-none placeholder:text-[#ffffff4d]"
          />

          {query && (
            <button
              onClick={() => setQuery("")}
              className="w-8 h-8 flex items-center justify-center text-[#ffffff4d] hover:text-[#ffffffb3] transition-colors"
              aria-label="Clear search"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4">
          {query.trim() ? (
            <Link href={`/explore?q=${encodeURIComponent(query)}`}>
              <button
                onClick={closeSearch}
                className="w-full text-left px-4 py-3 rounded-lg bg-[#ffffff0d] text-[#ffffffb3] hover:bg-[#ffffff1a] transition-colors"
              >
                Search for "{query}"
              </button>
            </Link>
          ) : (
            <p className="text-[#ffffff4d] text-sm text-center mt-10">
              Type to search…
            </p>
          )}
        </div>
      </div>
    </>
  );
}
