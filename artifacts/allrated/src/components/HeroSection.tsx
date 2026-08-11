import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { getGenreNames } from '@/lib/tmdbGenres';

export function HeroSection({ titles }: { titles: Title[] | undefined }) {
  const [index, setIndex] = useState(0);
  const featured = Array.isArray(titles) ? titles.slice(0, 8) : [];

  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [backdropError, setBackdropError] = useState(false);

  const title = featured?.[index];

  // Fetch logo for the title
  useEffect(() => {
    setLogoPath(null);
    setBackdropError(false);
    if (!title) return;

    const ctrl = new AbortController();
    fetch(`/api/catalog/title/${title.mediaType}/${title.id}/logo`, { signal: ctrl.signal })
      .then(r => r.ok ? r.json() : null)
      .then(data => data?.logoPath ? setLogoPath(data.logoPath) : null)
      .catch(() => {});

    return () => ctrl.abort();
  }, [title?.id, title?.mediaType]);

  if (!title) {
    return <div className="relative w-full h-[75vh] md:aspect-video max-h-[85vh] overflow-hidden bg-[#0f1014] animate-pulse" />;
  }

  const genres = getGenreNames(title.genreIds ?? [], 4);
  const backdropUrl = title.backdropPath || title.posterPath;

  return (
    <section className="relative w-full h-[75vh] md:h-auto md:aspect-video max-h-[85vh] overflow-hidden group" data-testid="hero-section">
      {/* Backdrop image */}
      {backdropUrl && !backdropError && (
        <img
          src={backdropUrl}
          alt={title.title}
          className="absolute inset-0 h-full w-full object-cover z-0"
          onError={() => setBackdropError(true)}
        />
      )}

      {/* Fallback gradient */}
      {(!backdropUrl || backdropError) && (
        <div className="absolute inset-0 bg-gradient-to-br from-[#1a1c24] via-[#0f1014] to-[#0a0a0f] z-0" />
      )}

      {/* Gradient overlays */}
      <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent pointer-events-none z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-transparent to-transparent pointer-events-none z-[1]" />

      {/* Bingr logo - top left */}
      <div className="absolute top-5 left-5 z-20">
        <svg width="28" height="28" viewBox="0 0 24 24" fill="white" className="drop-shadow-lg">
          <path d="M12 0L14.59 9.41L24 12L14.59 14.59L12 24L9.41 14.59L0 12L9.41 9.41L12 0Z"/>
        </svg>
      </div>

      {/* TAP TO ENTER badge */}
      <div className="absolute top-5 right-5 z-20">
        <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-lg px-3 py-1.5">
          <span className="text-white text-xs font-bold tracking-wider">TAP TO ENTER</span>
        </div>
      </div>

      {/* Content */}
      <div className="absolute inset-0 flex flex-col justify-end px-6 pb-28 md:pb-16 md:pl-[100px] lg:pl-[120px] pointer-events-none z-10">
        <div className="flex flex-col items-start text-left pointer-events-auto max-w-xl">
          {/* Title logo or text */}
          <div className="mb-3 min-h-[50px] md:min-h-[70px] flex items-end">
            {logoPath ? (
              <img
                src={logoPath}
                alt={title.title}
                className="max-h-[50px] md:max-h-[70px] w-auto object-contain drop-shadow-2xl"
                onError={() => setLogoPath(null)}
              />
            ) : (
              <h1
                className="text-white leading-[0.92] drop-shadow-2xl"
                style={{
                  fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif",
                  fontSize: 'clamp(2rem, 5vw, 4rem)',
                  letterSpacing: '0.02em',
                  fontWeight: 400,
                }}
              >
                {title.title}
              </h1>
            )}
          </div>

          {/* Metadata row - white star, year, genres */}
          <div className="flex items-center flex-wrap gap-y-1 text-[13px] md:text-[14px] font-medium text-white/80 mb-3">
            <span className="flex items-center gap-1">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
              </svg>
              {title.voteAverage?.toFixed(1)}
            </span>
            {title.year && (
              <>
                <span className="text-white/40 mx-2">·</span>
                <span>{title.year}</span>
              </>
            )}
            {genres.length > 0 && (
              <>
                <span className="text-white/40 mx-2">·</span>
                <span className="text-white/70">{genres.join(" · ")}</span>
              </>
            )}
          </div>

          {/* Synopsis */}
          {title.overview && (
            <p className="text-white/60 text-sm md:text-base line-clamp-3 mb-5 leading-relaxed">
              {title.overview}
            </p>
          )}

          {/* Action buttons */}
          <div className="flex items-center gap-3">
            <Link
              href={`/title/${title.mediaType}/${title.id}`}
              className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-white text-black flex items-center justify-center hover:bg-white/90 transition active:scale-95 shadow-lg"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="translate-x-[1px]">
                <path d="M6 4l15 8-15 8z"/>
              </svg>
            </Link>

            <Link
              href={`/title/${title.mediaType}/${title.id}`}
              className="inline-flex items-center justify-center gap-2.5 px-5 py-2.5 md:py-3 rounded-full border border-white/20 bg-black/40 backdrop-blur-md text-white font-semibold text-[13px] md:text-[14px] hover:bg-white/10 transition active:scale-95"
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                <circle cx="12" cy="12" r="10"/>
                <line x1="12" y1="16" x2="12" y2="12"/>
                <line x1="12" y1="8" x2="12.01" y2="8"/>
              </svg>
              See More
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
}
