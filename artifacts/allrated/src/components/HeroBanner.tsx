import { useEffect, useRef, useState } from 'react';
import { Link } from 'wouter';
import type { Title } from '@workspace/api-client-react';
import { getGenreNames } from '@/lib/tmdbGenres';

type VideoPhase = 'idle' | 'visible';

export function HeroBanner({ titles }: { titles: Title[] | undefined }) {
  const [index, setIndex] = useState(0);
  const filmRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const featured = Array.isArray(titles) ? titles.slice(0, 10) : [];

  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [videoPhase, setVideoPhase] = useState<VideoPhase>('idle');
  const [muted, setMuted] = useState(true);

  // ── Auto-rotate every 7s ──────────────────────────────────────────────────
  useEffect(() => {
    if (!featured || featured.length < 2) return;
    const id = setInterval(() => {
      setIndex((i) => (i + 1) % featured.length);
    }, 7000);
    return () => clearInterval(id);
  }, [featured?.length]);

  // ── Scroll filmstrip to keep active thumb visible ─────────────────────────
  useEffect(() => {
    const el = filmRef.current?.children[index] as HTMLElement | undefined;
    el?.scrollIntoView({ inline: 'nearest', behavior: 'smooth', block: 'nearest' });
  }, [index]);

  const title = featured?.[index];

  // ── Fetch trailer key + logo 2.5s after each title change ────────────────
  useEffect(() => {
    setTrailerKey(null);
    setLogoPath(null);
    setVideoPhase('idle');
    setMuted(true);
    if (!title) return;

    const ctrl = new AbortController();
    // Wait 2.5 s so backdrop image always shows first
    const timer = setTimeout(async () => {
      try {
        const [videoRes, logoRes] = await Promise.all([
          fetch(`/api/catalog/title/${title.mediaType}/${title.id}/videos`, { signal: ctrl.signal }),
          fetch(`/api/catalog/title/${title.mediaType}/${title.id}/logo`, { signal: ctrl.signal }),
        ]);
        if (videoRes.ok) {
          const data: { key: string | null } = await videoRes.json();
          if (data.key) setTrailerKey(data.key);
        }
        if (logoRes.ok) {
          const data: { logoPath: string | null } = await logoRes.json();
          if (data.logoPath) setLogoPath(data.logoPath);
        }
      } catch {
        // AbortError or network error — silently ignored
      }
    }, 2500);

    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [title?.id, title?.mediaType]);

  // ── When iframe loads, fade in video ─────────────────────────────────────
  const handleIframeLoad = () => {
    setTimeout(() => setVideoPhase('visible'), 800);
  };

  // ── Mute / unmute via YouTube postMessage ────────────────────────────────
  const toggleMute = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      const cmd = muted ? 'unMute' : 'mute';
      win.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
    }
    setMuted((m) => !m);
  };

  if (!title) {
    return <div className="relative min-h-screen w-full animate-pulse bg-[#07070b]" />;
  }

  const genres = getGenreNames(title.genreIds ?? [], 2);
  const isPlaying = videoPhase === 'visible';

  return (
    <section className="relative w-full h-[55vh] sm:h-[60vh] md:h-auto md:aspect-video max-h-[85vh] overflow-hidden group" data-testid="hero-banner">

      {/* ── Backdrop image — fades out when trailer becomes visible ────── */}
      {title.backdropPath && (
        <img
          key={`backdrop-${title.id}`}
          src={title.backdropPath}
          alt={title.title}
          className={`absolute inset-0 h-full w-full object-cover animate-in fade-in duration-700 transition-opacity duration-1000 z-0 ${
            isPlaying ? 'opacity-0' : 'opacity-100'
          }`}
        />
      )}

      {/* ── YouTube trailer — cover-fills the section ──────────────────── */}
      {trailerKey && (
        <div className={`absolute inset-0 z-0 overflow-hidden transition-opacity duration-1000 ${isPlaying ? 'opacity-100' : 'opacity-0'}`}>
          <iframe
            ref={iframeRef}
            key={trailerKey}
            src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&controls=0&playsinline=1&loop=1&playlist=${trailerKey}&rel=0&modestbranding=1&iv_load_policy=3&enablejsapi=1`}
            allow="autoplay; encrypted-media; picture-in-picture"
            onLoad={handleIframeLoad}
            title={`${title.title} trailer`}
            style={{
              border: 'none',
              position: 'absolute',
              top: '50%',
              left: '50%',
              /* Cover-fill: whichever dimension is larger wins */
              width: 'max(100%, calc(100vh * 16 / 9))',
              height: 'max(100%, calc(100vw * 9 / 16))',
              transform: 'translate(-50%, -50%)',
              pointerEvents: isPlaying ? 'auto' : 'none',
            }}
          />
        </div>
      )}

      {/* ── Gradient overlays (always on top of video) ─────────────────── */}
      <div className="absolute inset-0 bg-gradient-to-r from-black/95 via-black/50 to-transparent z-[1]" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#07070b] via-transparent to-black/30 z-[1]" />
      <div className="absolute bottom-0 left-0 right-0 h-[35vh] bg-gradient-to-t from-[#07070b] via-[#07070b]/60 to-transparent z-[1]" />

      {/* ── Left hero content — slides down slightly when trailer plays ── */}
      <div
        className={`absolute left-0 z-10 max-w-[600px] pl-6 lg:pl-20 pr-6 transition-[bottom] duration-700 ease-out ${
          isPlaying
            ? 'bottom-[108px] md:bottom-[200px]'
            : 'bottom-[140px] md:bottom-[240px]'
        }`}
      >
        {/* Title — show logo if available, else text */}
        <div className="mb-2 min-h-[60px] md:min-h-[80px] flex items-end justify-start w-full">
          {logoPath ? (
            <img
              src={logoPath}
              alt={title.title}
              className="max-h-[60px] md:max-h-[80px] w-auto object-contain drop-shadow-2xl"
              loading="eager"
              onError={() => setLogoPath(null)}
            />
          ) : (
            <h1
              className="text-white leading-[0.92] mb-4 md:mb-5 drop-shadow-2xl"
              style={{
                fontFamily: "'Bebas Neue', 'Anton', Impact, system-ui, sans-serif",
                fontSize: 'clamp(1.6rem, 4.5vw, 5rem)',
                letterSpacing: '0.02em',
                fontWeight: 400,
              }}
            >
              {title.title}
            </h1>
          )}
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-2 md:gap-3 text-xs md:text-base text-white/80 mb-3 md:mb-4 flex-wrap">
          <span className="flex items-center gap-1 text-[#00bb7f] font-semibold">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" className="md:w-4 md:h-4">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            {title.voteAverage?.toFixed(1)}
          </span>
          {title.year && (
            <>
              <span className="text-white/40 hidden sm:inline">•</span>
              <span>{title.year}</span>
            </>
          )}
          {genres.length > 0 && (
            <>
              <span className="text-white/40 hidden sm:inline">•</span>
              <span className="text-white/60 hidden sm:inline">{genres.slice(0, 3).join(", ")}</span>
            </>
          )}
        </div>

        {/* Overview */}
        {title.overview && (
          <p className="text-white/70 text-xs md:text-base line-clamp-2 md:line-clamp-3 mb-6 md:mb-8 max-w-lg leading-relaxed">
            {title.overview}
          </p>
        )}

        {/* Action buttons */}
        <div className="flex items-center gap-3 w-full mt-1">
          {/* Play */}
          <Link
            href={`/title/${title.mediaType}/${title.id}`}
            className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#f9f9f9] text-black flex items-center justify-center hover:bg-white transition active:scale-95 shadow-lg"
            data-testid="button-hero-play"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="currentColor" className="translate-x-[1px] md:w-6 md:h-6">
              <path d="M6 4l15 8-15 8z"/>
            </svg>
          </Link>

          {/* See More */}
          <Link
            href={`/title/${title.mediaType}/${title.id}`}
            className="inline-flex items-center justify-center gap-2.5 px-6 py-3 md:py-3.5 rounded-full border border-white/20 bg-[#07070b]/60 backdrop-blur-md text-[#f9f9f9] font-semibold text-[13px] md:text-[15px] hover:bg-white/10 transition active:scale-95"
            data-testid="button-hero-info"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
              <circle cx="12" cy="12" r="10"/>
              <line x1="12" y1="16" x2="12" y2="12"/>
              <line x1="12" y1="8" x2="12.01" y2="8"/>
            </svg>
            See More
          </Link>
        </div>
      </div>

      {/* ── Sound toggle — top-right, visible when trailer plays ─────────── */}
      {isPlaying && (
        <button
          onClick={toggleMute}
          className="absolute z-20 top-5 right-5 h-10 w-10 rounded-full border border-white/25 bg-black/40 backdrop-blur flex items-center justify-center text-white hover:bg-white/10 transition"
          aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}
        >
          {muted ? (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <line x1="23" y1="9" x2="17" y2="15"/>
              <line x1="17" y1="9" x2="23" y2="15"/>
            </svg>
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
              <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
              <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
            </svg>
          )}
        </button>
      )}

      {/* ── Right arrow ──────────────────────────────────────────────────── */}
      <button
        onClick={() => setIndex((i) => (i + 1) % (featured?.length ?? 1))}
        className="absolute right-6 top-1/2 -translate-y-1/2 z-10 hidden xl:flex h-12 w-12 items-center justify-center rounded-full border border-white/25 bg-black/20 backdrop-blur text-white hover:bg-white/10 transition"
        aria-label="Next"
      >
        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M9 18l6-6-6-6"/>
        </svg>
      </button>

      {/* ── Filmstrip — center-bottom, md+ ───────────────────────────────── */}
      <div className="absolute bottom-6 left-0 right-0 z-10 hidden md:flex items-center justify-center gap-2 px-20">
        {/* Prev */}
        <button
          onClick={() => setIndex((i) => (i - 1 + (featured?.length ?? 1)) % (featured?.length ?? 1))}
          className="flex-shrink-0 w-6 flex items-center justify-center text-white/40 hover:text-white transition"
          style={{ height: 80 }}
          aria-label="Previous hero"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M15 18l-6-6 6-6"/>
          </svg>
        </button>

        <div
          ref={filmRef}
          className="flex gap-2 overflow-x-hidden"
          style={{ maxWidth: 'calc(100% - 60px)' }}
        >
          {Array.isArray(featured) && featured.map((t, i) => (
            <button
              key={t.id}
              onClick={() => setIndex(i)}
              aria-label={`Show ${t.title}`}
              aria-current={i === index ? 'true' : undefined}
              className="relative flex-shrink-0 rounded-lg overflow-hidden transition-all duration-300 outline-none"
              style={{
                width: 140,
                height: 80,
                opacity: i === index ? 1 : 0.4,
              }}
              onMouseEnter={(e) => {
                if (i !== index) (e.currentTarget as HTMLElement).style.opacity = '0.7';
              }}
              onMouseLeave={(e) => {
                if (i !== index) (e.currentTarget as HTMLElement).style.opacity = '0.4';
              }}
            >
              {t.backdropPath ? (
                <img src={t.backdropPath} alt={t.title} className="w-full h-full object-cover" />
              ) : (
                <div className="w-full h-full bg-[#1a1c24]" />
              )}
              {i === index && (
                <div
                  className="absolute inset-0 rounded-lg pointer-events-none"
                  style={{ boxShadow: 'inset 0 0 0 2px #00bb7f' }}
                />
              )}
            </button>
          ))}
        </div>

        {/* Next */}
        <button
          onClick={() => setIndex((i) => (i + 1) % (featured?.length ?? 1))}
          className="flex-shrink-0 w-8 h-8 rounded-full bg-[#ffffff1a] backdrop-bingr flex items-center justify-center text-white hover:bg-[#ffffff26] transition-bingr"
          aria-label="Next hero"
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
            <path d="M9 18l6-6-6-6"/>
          </svg>
        </button>
      </div>

      {/* ── Mobile dot indicators ────────────────────────────────────────── */}
      {featured && featured.length > 1 && (
        <div className="absolute bottom-[84px] md:bottom-8 left-1/2 -translate-x-1/2 z-10 flex gap-1.5 md:hidden">
          {Array.isArray(featured) && featured.map((_, i) => (
            <button
              key={i}
              onClick={() => setIndex(i)}
              className={`h-1.5 rounded-full transition-all ${
                i === index ? 'w-5 bg-white' : 'w-1.5 bg-white/30'
              }`}
              aria-label={`Slide ${i + 1}`}
            />
          ))}
        </div>
      )}
    </section>
  );
}
