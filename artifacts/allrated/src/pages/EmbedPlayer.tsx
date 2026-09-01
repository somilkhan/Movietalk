import { useMemo, useState } from 'react';
import { ArrowLeft, ChevronDown, Loader2 } from 'lucide-react';
import { useLocation, useParams } from 'wouter';
import { useGetTitleDetail } from '@workspace/api-client-react';
import { BINGR_SOURCES, buildEmbedUrl } from '@/lib/streamingProviders';

const playableSources = BINGR_SOURCES;

export default function EmbedPlayer() {
  const params = useParams<{ mediaType: string; id: string; season?: string; episode?: string }>();
  const [, navigate] = useLocation();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const tmdbId = Number(params.id);
  const season = params.season ? Number(params.season) : undefined;
  const episode = params.episode ? Number(params.episode) : undefined;
  const [serverId, setServerId] = useState(playableSources[0]?.id ?? 'vidrift');
  const [loading, setLoading] = useState(true);

  const { data: title } = useGetTitleDetail(mediaType, tmdbId, { query: { enabled: Number.isFinite(tmdbId) } });
  const titleName = title?.title || title?.name || '';

  const embedUrl = useMemo(
    () => buildEmbedUrl(mediaType, tmdbId, serverId, season, episode),
    [mediaType, tmdbId, serverId, season, episode],
  );

  if (!Number.isFinite(tmdbId)) return <div className="min-h-screen bg-black" />;

  return (
    <div className="fixed inset-0 z-[200] bg-black text-white">
      <div className="absolute inset-x-0 top-0 z-20 flex items-center gap-3 bg-gradient-to-b from-black/90 to-transparent px-4 pb-10 pt-4 md:px-7">
        <button
          type="button"
          onClick={() => navigate(`/title/${mediaType}/${tmdbId}`)}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full border border-white/10 bg-black/45 backdrop-blur-xl"
          aria-label="Back"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="min-w-0 flex-1">
          <div className="truncate text-sm font-semibold md:text-base">{titleName}</div>
          {mediaType === 'tv' && season && episode ? (
            <div className="text-xs text-white/50">S{season} · E{episode}</div>
          ) : null}
        </div>
        <label className="relative shrink-0">
          <span className="sr-only">Streaming source</span>
          <select
            value={serverId}
            onChange={(event) => {
              setLoading(true);
              setServerId(event.target.value);
            }}
            className="h-10 appearance-none rounded-full border border-white/10 bg-black/60 py-0 pl-4 pr-9 text-xs font-semibold outline-none backdrop-blur-xl"
          >
            {playableSources.map((source) => (
              <option key={source.id} value={source.id}>{source.name}</option>
            ))}
          </select>
          <ChevronDown className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/50" />
        </label>
      </div>

      {embedUrl ? (
        <iframe
          key={embedUrl}
          src={embedUrl}
          title={`${titleName || 'Video'} player`}
          className="absolute inset-0 h-full w-full border-0 bg-black"
          allow="autoplay; fullscreen; encrypted-media; picture-in-picture"
          allowFullScreen
          referrerPolicy="origin"
          onLoad={() => setLoading(false)}
        />
      ) : (
        <div className="absolute inset-0 grid place-items-center px-6 text-center">
          <div>
            <div className="text-sm font-semibold">This source is not available for this episode.</div>
            <div className="mt-2 text-xs text-white/45">Choose another source from the selector above.</div>
          </div>
        </div>
      )}

      {loading && embedUrl ? (
        <div className="pointer-events-none absolute inset-0 grid place-items-center bg-black/30">
          <Loader2 className="h-7 w-7 animate-spin text-white/70" />
        </div>
      ) : null}
    </div>
  );
}
