import { useState, useEffect, useRef } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { Seo } from '@/components/Seo';
import { Play, Star, Clock, Layers, Bookmark, BookmarkCheck, X, Share2, Plus, Check, Download, Pause } from 'lucide-react';
import { LoginDialog } from '@/components/LoginDialog';
import { useAuth } from '@/hooks/useAuth';
import { useAnalytics } from '@/hooks/useAnalytics';
import { ErrorState } from '@/components/ErrorState';
import { useGetTitleDetail, getGetTitleDetailQueryKey } from '@workspace/api-client-react';
import {
  useTitleRating,
  useRateMutation,
  useUnrateMutation,
  useWatchlistStatus,
  useWatchlistMutation,
  useUnwatchlistMutation,
} from '@/hooks/useUserData';
import type { TitleSnapshot } from '@/lib/userApi';
import { getGenreNames } from '@/lib/tmdbGenres';
import { Row } from '@/components/Row';

const BASE = import.meta.env.BASE_URL.replace(/\/$/, '');

function StarRatingPanel({
  current,
  onRate,
  onClear,
  disabled,
}: {
  current: number | null;
  onRate: (r: number) => void;
  onClear: () => void;
  disabled: boolean;
}) {
  const [hovered, setHovered] = useState<number | null>(null);

  return (
    <div className="flex flex-col items-start gap-2">
      <div className="flex items-center gap-1">
        {Array.from({ length: 10 }, (_, i) => i + 1).map((n) => {
          const filled = (hovered ?? current ?? 0) >= n;
          return (
            <button
              key={n}
              disabled={disabled}
              onMouseEnter={() => setHovered(n)}
              onMouseLeave={() => setHovered(null)}
              onClick={() => onRate(n)}
              className="p-0.5 transition disabled:opacity-40"
              aria-label={`Rate ${n}`}
            >
              <Star
                className={`h-5 w-5 md:h-6 md:w-6 transition-colors ${
                  filled ? 'fill-amber-400 text-amber-400' : 'text-white/30'
                }`}
              />
            </button>
          );
        })}
        {current !== null && (
          <button
            onClick={onClear}
            disabled={disabled}
            className="ml-2 text-white/40 hover:text-white transition"
            title="Remove rating"
          >
            <X className="h-4 w-4" />
          </button>
        )}
      </div>
      <p className="text-xs text-white/40">
        {hovered
          ? ['', 'Awful', 'Very bad', 'Bad', 'Poor', 'Mediocre', 'Decent', 'Good', 'Great', 'Excellent', 'Masterpiece'][hovered]
          : current
          ? `Your rating: ${current}/10`
          : 'Tap a star to rate'}
      </p>
    </div>
  );
}

export default function TitleDetail() {
  const params = useParams<{ mediaType: string; id: string }>();
  const [, navigate] = useLocation();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const id = Number(params.id);

  const { data: title, isLoading, isError } = useGetTitleDetail(mediaType, id, {
    query: { enabled: Number.isFinite(id), queryKey: getGetTitleDetailQueryKey(mediaType, id) },
  });

  const { data: myRating } = useTitleRating(mediaType, id);
  const { data: inWatchlist } = useWatchlistStatus(mediaType, id);
  const rateMut = useRateMutation(mediaType, id);
  const unrateMut = useUnrateMutation(mediaType, id);
  const watchlistAdd = useWatchlistMutation(mediaType, id);
  const watchlistRemove = useUnwatchlistMutation(mediaType, id);

  // Fetch trailer key separately (not in generated schema)
  const [trailerKey, setTrailerKey] = useState<string | null>(null);
  const [logoPath, setLogoPath] = useState<string | null>(null);
  const [videoPhase, setVideoPhase] = useState<'idle' | 'visible'>('idle');
  const [muted, setMuted] = useState(true);
  const [trailerPlaying, setTrailerPlaying] = useState(true);
  const iframeRef = useRef<HTMLIFrameElement>(null);

  // Auth — must be before any early returns (Rules of Hooks)
  const { isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    setTrailerKey(null);
    setVideoPhase('idle');
    setMuted(true);
    if (!Number.isFinite(id)) return;
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const res = await fetch(`${BASE}/api/catalog/title/${mediaType}/${id}/videos`, { signal: ctrl.signal });
        if (!res.ok) return;
        const data: { key: string | null } = await res.json().catch(() => ({ key: null }));
        if (data.key) setTrailerKey(data.key);
      } catch { /* abort or network error */ }
    }, 2500);
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [mediaType, id]);

  const handleIframeLoad = () => {
    setTimeout(() => setVideoPhase('visible'), 800);
  };

  const toggleMute = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      const cmd = muted ? 'unMute' : 'mute';
      win.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
    }
    setMuted((m) => !m);
  };

  const toggleTrailerPlay = () => {
    const win = iframeRef.current?.contentWindow;
    if (win) {
      const cmd = trailerPlaying ? 'pauseVideo' : 'playVideo';
      win.postMessage(JSON.stringify({ event: 'command', func: cmd, args: '' }), '*');
    }
    setTrailerPlaying((p) => !p);
  };

  // Fetch title logo
  useEffect(() => {
    if (!Number.isFinite(id)) return;
    const ctrl = new AbortController();
    fetch(`${BASE}/api/catalog/title/${mediaType}/${id}/logo`, { signal: ctrl.signal })
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json().catch(() => null);
      })
      .then((d: { logoPath: string | null } | null) => setLogoPath(d?.logoPath ?? null))
      .catch(() => {});
    return () => ctrl.abort();
  }, [mediaType, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black pb-24 md:pb-0" data-testid="page-title-detail">
        {/* Shimmer skeleton for hero */}
        <div className="relative min-h-[520px] w-full overflow-hidden md:min-h-[640px] animate-shimmer" />
        <div className="px-6 pt-8 md:px-12 space-y-6">
          <div className="animate-shimmer h-12 w-2/3 rounded-xl" />
          <div className="flex gap-3">
            {[60, 50, 80, 70].map((w, i) => (
              <div key={i} className="animate-shimmer h-5 rounded" style={{ width: w }} />
            ))}
          </div>
          <div className="flex gap-2">
            {[64, 48, 56].map((w, i) => (
              <div key={i} className="animate-shimmer h-6 rounded-full" style={{ width: w }} />
            ))}
          </div>
          <div className="space-y-2 max-w-xl">
            <div className="animate-shimmer h-4 w-full rounded" />
            <div className="animate-shimmer h-4 w-5/6 rounded" />
            <div className="animate-shimmer h-4 w-3/4 rounded" />
          </div>
          <div className="flex gap-3 pt-2">
            <div className="animate-shimmer h-12 w-28 rounded-full" />
            <div className="animate-shimmer h-12 w-24 rounded-full" />
            <div className="animate-shimmer h-10 w-24 rounded-full" />
          </div>
        </div>
      </div>
    );
  }

  if (isError || !title) {
    return (
      <div className="min-h-screen bg-black pb-24 md:pb-0" data-testid="page-title-detail">
        <div className="pt-24 md:pt-32 px-6 md:px-20">
          <ErrorState
            message="Could not load title details. The server may be unavailable."
            onRetry={() => window.location.reload()}
          />
        </div>
      </div>
    );
  }

  const snapshot: TitleSnapshot = {
    title: title.title,
    posterPath: title.posterPath,
    backdropPath: title.backdropPath,
    year: title.year,
    voteAverage: title.voteAverage,
    mediaType,
  };

  const handleRate = (rating: number) => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    trackEvent('rate_title', { id: String(id), mediaType, rating });
    rateMut.mutate({ rating, snapshot });
  };
  const handleClearRating = () => unrateMut.mutate();
  const handleWatchlist = () => {
    if (!isLoggedIn) {
      setShowLogin(true);
      return;
    }
    trackEvent('watchlist_toggle', { id: String(id), mediaType, action: inWatchlist ? 'remove' : 'add' });
    if (inWatchlist) watchlistRemove.mutate();
    else watchlistAdd.mutate({ snapshot });
  };

  const handleShare = () => {
    if (navigator.share) {
      trackEvent('share_title', { id: String(id), mediaType, method: 'native' });
      navigator.share({ title: title.title, text: title.overview, url: window.location.href });
    }
  };


  const genres: { id: number; name: string }[] = title.genres.length > 0
    ? title.genres
    : getGenreNames(title.genreIds ?? [], 5).map((name, i) => ({ id: i, name }));

  // cast & similar are passed through from API but not in generated type
  const cast = ((title as any).cast ?? []) as Array<{
    id: number; name: string; character: string; profilePath: string | null;
  }>;
  const similar = ((title as any).similar ?? []) as import('@workspace/api-client-react').Title[];

  return (
    <div className="min-h-screen pb-24 md:pb-0" data-testid="page-title-detail">
      <Seo title={title.title || 'Details'} />

      {/* Hero backdrop — full viewport height */}
      <div className="relative h-[100dvh] w-full overflow-hidden bg-black">
        {/* Backdrop image — fades out when video becomes visible */}
        {title.backdropPath && (
          <img
            src={title.backdropPath}
            alt={title.title}
            className={`absolute inset-0 h-full w-full object-cover transition-opacity duration-1000 ${videoPhase === 'visible' ? 'opacity-0' : 'opacity-100'}`}
            style={{ transform: 'scale(1.35)' }}
          />
        )}
        {/* YouTube trailer — cover-fills the section */}
        {trailerKey && (
          <div className={`absolute inset-0 z-[1] transition-opacity duration-1000 ${videoPhase === 'visible' ? 'opacity-100' : 'opacity-0'}`}>
            <iframe
              ref={iframeRef}
              src={`https://www.youtube.com/embed/${trailerKey}?autoplay=1&mute=1&loop=1&playlist=${trailerKey}&controls=0&modestbranding=1&rel=0&showinfo=0&iv_load_policy=3&fs=0&disablekb=1&cc_load_policy=0`}
              title="Trailer"
              className="absolute inset-0 h-full w-full"
              style={{ transform: 'scale(1.35)', pointerEvents: 'none' }}
              allow="autoplay; encrypted-media"
              onLoad={handleIframeLoad}
            />
          </div>
        )}
        {/* Gradient overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent z-[2]" />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/50 to-transparent w-[50%] md:w-[65%] z-[2]" />

        {/* Bottom content — single flex column at bottom of hero */}
        <div className="absolute inset-x-0 bottom-6 md:bottom-8 z-10 px-6 md:px-12">
          {/* Title/logo — stays visible, slides down when trailer plays */}
          <div className={`mb-2 min-h-[60px] md:min-h-[80px] flex items-end justify-start w-full transition-all duration-1000 ease-out ${videoPhase === 'visible' ? 'translate-y-10 md:translate-y-12' : 'translate-y-0'}`}>
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
                className="font-display max-w-2xl leading-tight tracking-wide text-white"
                style={{ fontSize: 'clamp(24px, 5vw, 72px)' }}
              >
                {title.title}
              </h1>
            )}
          </div>

          {/* Metadata, genres, overview — fade out + collapse height when trailer plays */}
          <div className={`transition-all duration-1000 ease-out overflow-hidden ${videoPhase === 'visible' ? 'opacity-0 pointer-events-none max-h-0 translate-y-2' : 'opacity-100 max-h-[300px] translate-y-0'}`}>
            {/* Metadata row — bingr.one style */}
            <div className="mt-2 flex flex-wrap items-center gap-x-2 gap-y-1 text-sm font-semibold text-white/80">
              <span className="flex items-center gap-1 text-white">
                <Star className="h-4 w-4 fill-white" />
                {title.voteAverage.toFixed(1)}
              </span>
              {title.year && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/80">{title.year}</span>
                </>
              )}
              {(title as any).certification && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/80">{(title as any).certification}</span>
                </>
              )}
              {title.runtimeMinutes != null && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/80">
                    {(() => {
                      const h = Math.floor(title.runtimeMinutes / 60);
                      const m = title.runtimeMinutes % 60;
                      return h > 0 ? `${h}h ${m > 0 ? `${m}m` : ''}` : `${m}m`;
                    })()}
                  </span>
                </>
              )}
              {title.numberOfSeasons != null && (
                <>
                  <span className="text-white/40">•</span>
                  <span className="text-white/80">{title.numberOfSeasons} Season{title.numberOfSeasons === 1 ? '' : 's'}</span>
                </>
              )}
            </div>

            {/* Genres — pipe-separated text links */}
            {genres.length > 0 && (
              <div className="mt-2 flex flex-wrap items-center gap-x-1 text-sm font-medium text-white/70">
                {genres.map((g, i) => (
                  <span key={g.id} className="flex items-center">
                    {i > 0 && <span className="mx-2 text-white/30">|</span>}
                    <Link href={`/category/${encodeURIComponent(g.name)}`}>
                      <span className="hover:text-white transition-colors cursor-pointer">{g.name}</span>
                    </Link>
                  </span>
                ))}
              </div>
            )}

            {title.overview && (
              <p className="mt-2 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base line-clamp-3">
                {title.overview}
              </p>
            )}
          </div>

          {/* Action buttons — always visible */}
          <div className="flex items-center justify-between mt-4">
            {/* Left side */}
            <div className="flex items-center gap-4">
              {/* Play */}
              <button
                onClick={() => {
                  trackEvent('play_title', { id: String(id), mediaType, title: title.title });
                  navigate(`/watch/${mediaType}/${id}`);
                }}
                className="w-12 h-12 md:w-14 md:h-14 shrink-0 rounded-full bg-[#f9f9f9] text-black flex items-center justify-center hover:bg-white transition-all duration-300 active:scale-95 hover:shadow-[0_0_20px_rgba(255,255,255,0.5)] focus:outline-none"
                data-testid="button-play"
              >
                <svg width="24" height="24" viewBox="0 0 24 24" fill="currentColor" className="translate-x-[2px] w-5 h-5 md:w-6 md:h-6">
                  <path d="M6 4l15 8-15 8z"/>
                </svg>
              </button>

              {/* Watchlist */}
              <button
                onClick={handleWatchlist}
                disabled={watchlistAdd.isPending || watchlistRemove.isPending}
                aria-pressed={inWatchlist}
                aria-label={inWatchlist ? 'Remove from watchlist' : 'Add to watchlist'}
                className={`flex items-center justify-center w-12 h-12 md:w-[50px] md:h-[50px] backdrop-blur-md border rounded-full transition-all duration-200 hover:scale-105 active:scale-95 ${
                  inWatchlist
                    ? 'bg-white/20 border-white/20 text-white'
                    : 'bg-white/10 hover:bg-white/20 border-white/10 text-white'
                }`}
                data-testid="button-watchlist"
              >
                {inWatchlist ? (
                  <Check className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                ) : (
                  <Plus className="w-5 h-5 md:w-[22px] md:h-[22px]" strokeWidth={2.5} />
                )}
              </button>

              {/* Download — movies only */}
              {mediaType === 'movie' && (
                <button
                  onClick={() => trackEvent('download_title', { id: String(id), mediaType })}
                  className="w-12 h-12 md:w-[50px] md:h-[50px] shrink-0 rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label="Download"
                >
                  <Download className="w-[22px] h-[22px]" strokeWidth={2.5} />
                </button>
              )}
            </div>

            {/* Right side — media controls when trailer plays */}
            {videoPhase === 'visible' && (
              <div className="flex items-center gap-3">
                <button
                  onClick={toggleMute}
                  className="w-12 h-12 md:w-[50px] md:h-[50px] rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label={muted ? 'Unmute trailer' : 'Mute trailer'}
                >
                  {muted ? (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <line x1="23" y1="9" x2="17" y2="15"/>
                      <line x1="17" y1="9" x2="23" y2="15"/>
                    </svg>
                  ) : (
                    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                      <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/>
                      <path d="M15.54 8.46a5 5 0 0 1 0 7.07"/>
                      <path d="M19.07 4.93a10 10 0 0 1 0 14.14"/>
                    </svg>
                  )}
                </button>
                <button
                  onClick={toggleTrailerPlay}
                  className="w-12 h-12 md:w-[50px] md:h-[50px] rounded-full bg-white/10 text-white flex items-center justify-center border border-white/10 backdrop-blur-sm hover:bg-white/20 transition-all duration-300 hover:scale-105 active:scale-95"
                  aria-label={trailerPlaying ? 'Pause trailer' : 'Play trailer'}
                >
                  {trailerPlaying ? (
                    <Pause className="w-5 h-5" strokeWidth={2.5} />
                  ) : (
                    <Play className="w-5 h-5 fill-white" strokeWidth={0} />
                  )}
                </button>
              </div>
            )}
          </div>
        </div>
      </div>      {/* Below-hero sections */}
      <div className="px-6 py-6 md:px-12 space-y-8 bg-black">

        {/* Rating panel */}
        <div>
          <h2 className="mb-4 text-sm font-semibold uppercase tracking-widest text-white/40">
            Your Rating
          </h2>
          <StarRatingPanel
            current={myRating ?? null}
            onRate={handleRate}
            onClear={handleClearRating}
            disabled={rateMut.isPending || unrateMut.isPending}
          />
        </div>

        {/* Trailer */}
        {trailerKey && (
          <div>
            <h3 className="text-lg font-semibold text-[#ffffffe6] mb-3">Trailer</h3>
            <div className="relative aspect-video rounded-xl overflow-hidden bg-[#252830] max-w-3xl">
              <iframe
                src={`https://www.youtube.com/embed/${trailerKey}`}
                title="Trailer"
                className="w-full h-full"
                allowFullScreen
                loading="lazy"
              />
            </div>
          </div>
        )}

        {/* Cast grid — bingr.one style */}
        {cast.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center justify-between gap-4 mb-5">
              <h2 className="heading-trail text-xl md:text-2xl font-semibold text-white min-w-0 truncate">Actors</h2>
            </div>
            <div className="grid gap-3 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4">
              {cast.map((person) => (
                <div
                  key={person.id}
                  className="group flex items-center gap-3 p-3 rounded-[14px] border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.05] hover:border-white/40 transition-all duration-200"
                >
                  <div className="relative flex-shrink-0">
                    {person.profilePath ? (
                      <img
                        src={person.profilePath}
                        alt={person.name}
                        className="object-cover w-14 h-14 rounded-full ring-1 ring-white/[0.08] group-hover:ring-white/40 transition-all duration-200"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="w-14 h-14 rounded-full bg-white/[0.05] ring-1 ring-white/[0.08] flex items-center justify-center">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-white/30"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-col min-w-0">
                    <p className="font-medium text-white text-sm leading-tight line-clamp-1 transition-colors duration-200 group-hover:text-white/80">{person.name}</p>
                    <p className="text-white/50 text-xs leading-snug line-clamp-1 mt-0.5">{person.character}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Similar titles — full-width row outside the padded section */}
      {similar.length > 0 && (
        <div className="mb-10">
          <Row heading="More Like This" titles={similar} />
        </div>
      )}

      <LoginDialog open={showLogin} onOpenChange={setShowLogin} />
    </div>
  );
}
