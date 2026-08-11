import { useState, useEffect } from 'react';
import { useParams, useLocation, Link } from 'wouter';
import { Seo } from '@/components/Seo';
import { Play, Star, Clock, Layers, Bookmark, BookmarkCheck, X, Share2 } from 'lucide-react';
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

  // Auth — must be before any early returns (Rules of Hooks)
  const { isLoggedIn } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const { trackEvent } = useAnalytics();

  useEffect(() => {
    if (!Number.isFinite(id)) return;
    fetch(`${BASE}/api/catalog/title/${mediaType}/${id}/videos`)
      .then(async (r) => {
        if (!r.ok) return null;
        return r.json().catch(() => null);
      })
      .then((d: { key: string | null } | null) => setTrailerKey(d?.key ?? null))
      .catch(() => {});
  }, [mediaType, id]);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#07070b] pb-24 md:pb-0" data-testid="page-title-detail">
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
      <div className="min-h-screen bg-[#07070b] pb-24 md:pb-0" data-testid="page-title-detail">
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

      {/* Hero backdrop */}
      <div className="relative min-h-[520px] w-full overflow-hidden md:min-h-[640px]">
        {title.backdropPath && (
          <img
            src={title.backdropPath}
            alt={title.title}
            className="absolute inset-0 h-full w-full object-cover"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background/80 via-transparent to-transparent" />

        {/* Back button removed per user request */}

        <div className="relative z-10 flex h-full flex-col justify-end px-6 pb-8 pt-24 md:px-12">
          <h1
            className="font-display max-w-2xl leading-tight tracking-wide text-white"
            style={{ fontSize: 'clamp(24px, 5vw, 72px)' }}
          >
            {title.title}
          </h1>

          <div className="mt-4 flex flex-wrap items-center gap-3 text-sm font-semibold text-white/80">
            <span className="flex items-center gap-1 text-amber-400">
              <Star className="h-4 w-4 fill-amber-400" />
              {title.voteAverage.toFixed(1)}
            </span>
            {title.year && <span className="text-white/60">{title.year}</span>}
            {title.runtimeMinutes != null && (
              <span className="flex items-center gap-1 text-white/60">
                <Clock className="h-3.5 w-3.5" />{title.runtimeMinutes} min
              </span>
            )}
            {title.numberOfSeasons != null && (
              <span className="flex items-center gap-1 text-white/60">
                <Layers className="h-3.5 w-3.5" />{title.numberOfSeasons} season{title.numberOfSeasons === 1 ? '' : 's'}
              </span>
            )}
            <span className="rounded border border-white/20 px-1.5 py-0.5 text-xs uppercase text-white/50">
              {mediaType === 'movie' ? 'Movie' : 'Series'}
            </span>
          </div>

          {/* Clickable genre chips */}
          {genres.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2">
              {genres.map((g) => (
                <Link key={g.id} href={`/category/${encodeURIComponent(g.name)}`}>
                  <span className="rounded-full bg-[#ffffff0d] px-3 py-1 text-xs font-medium text-[#ffffffb3] hover:bg-[#ffffff1a] transition-bingr cursor-pointer">
                    {g.name}
                  </span>
                </Link>
              ))}
            </div>
          )}

          {title.overview && (
            <p className="mt-4 max-w-2xl text-sm leading-relaxed text-white/60 md:text-base">
              {title.overview}
            </p>
          )}

          {/* Primary action buttons */}
          <div className="mt-6 flex flex-wrap items-center gap-3">
            <button
              onClick={() => { trackEvent('play_title', { id: String(id), mediaType, title: title.title }); navigate(`/watch/${mediaType}/${id}`); }}
              className="flex items-center gap-2 rounded-full bg-white px-6 py-3 text-sm font-bold text-black hover:bg-white/90 transition"
              data-testid="button-play"
            >
              <Play className="h-4 w-4 fill-black" />
              Play
            </button>

            <button
              onClick={handleWatchlist}
              disabled={watchlistAdd.isPending || watchlistRemove.isPending}
              className={`flex items-center gap-2 rounded-full px-5 py-3 text-sm font-semibold transition ${
                inWatchlist
                  ? 'bg-white/20 text-white'
                  : 'bg-white/10 text-white/80 hover:bg-white/20'
              }`}
              data-testid="button-watchlist"
            >
              {inWatchlist ? (
                <><BookmarkCheck className="h-4 w-4" /> Saved</>
              ) : (
                <><Bookmark className="h-4 w-4" /> Save</>
              )}
            </button>

            {/* Share */}
            <button
              onClick={handleShare}
              className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#ffffff0d] hover:bg-[#ffffff1a] text-[#ffffffb3] transition-bingr text-sm font-medium"
              aria-label="Share"
            >
              <Share2 className="h-4 w-4" />
              Share
            </button>


          </div>
        </div>
      </div>

      {/* Below-hero sections */}
      <div className="px-6 py-8 md:px-12 space-y-10">

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

        {/* Cast carousel */}
        {cast.length > 0 && (
          <div>
            <h3 className="text-lg font-semibold text-[#ffffffe6] mb-3">Cast</h3>
            <div className="flex gap-4 overflow-x-auto no-scrollbar snap-x snap-proximity pb-2">
              {cast.map((person) => (
                <div
                  key={person.id}
                  className="snap-start flex-none w-[90px] text-center"
                >
                  <div className="w-[90px] h-[90px] rounded-full overflow-hidden bg-[#252830] mb-2 ring-1 ring-white/10 flex items-center justify-center">
                    {person.profilePath ? (
                      <img
                        src={person.profilePath}
                        alt={person.name}
                        className="w-full h-full object-cover"
                        loading="lazy"
                        onError={(e) => {
                          (e.target as HTMLImageElement).style.display = 'none';
                        }}
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center text-white/30">
                        <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
                      </div>
                    )}
                  </div>
                  <p className="text-[#ffffffe6] text-xs font-medium line-clamp-1">{person.name}</p>
                  <p className="text-[#ffffff4d] text-[11px] line-clamp-1">{person.character}</p>
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
