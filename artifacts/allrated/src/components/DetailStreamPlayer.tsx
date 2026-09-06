import { useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Loader2, X } from 'lucide-react';
import { useGetTitleDetail } from '@workspace/api-client-react';
import { BINGR_SOURCES, buildEmbedUrl } from '@/lib/streamingProviders';
import { getAccessToken, getAnonymousDeviceId } from '@/lib/supabase';

interface DetailStreamPlayerProps {
  mediaType: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
  onClose: () => void;
}

const LOCAL_PROGRESS_KEY = 'rabbitrip.watch-progress.v2';
const PROGRESS_FALLBACK_SECONDS = 5;

function readLocalProgress(): Record<string, Record<string, unknown>> {
  try {
    return JSON.parse(localStorage.getItem(LOCAL_PROGRESS_KEY) || '{}') as Record<string, Record<string, unknown>>;
  } catch {
    return {};
  }
}

function writeLocalProgress(item: Record<string, unknown>) {
  try {
    const all = readLocalProgress();
    const key = `${item.mediaType}:${item.id}:${item.season ?? 0}:${item.episode ?? 0}`;
    all[key] = { ...item, saved_at: Date.now() };
    localStorage.setItem(LOCAL_PROGRESS_KEY, JSON.stringify(all));
  } catch {
    // Local storage is only a resilience cache; playback must not fail because it is unavailable.
  }
}

const PLAYER_ORIGINS = new Set([
  'https://embed.vidrift.in',
  'https://vidsrc2.ru',
  'https://vidcore.org',
  'https://multiembed.mov',
  'https://player.videasy.net',
  'https://embed.filmu.in',
  'https://flix.screenscape.me',
  'https://vixsrc.to',
  'https://www.vidking.net',
]);

function numeric(...values: unknown[]) {
  for (const value of values) {
    const number = Number(value);
    if (Number.isFinite(number) && number >= 0) return number;
  }
  return 0;
}

export default function DetailStreamPlayer({ mediaType, id, season, episode, onClose }: DetailStreamPlayerProps) {
  const { data: title } = useGetTitleDetail(mediaType, id, { query: { enabled: Number.isFinite(id) } });
  const titleName = title?.title || title?.name || '';
  const [sourceId, setSourceId] = useState(BINGR_SOURCES[0]?.id ?? '');
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [loading, setLoading] = useState(true);
  const [failed, setFailed] = useState(false);
  const latestProgress = useRef({ position: 0, duration: 0 });

  const selectedSource = useMemo(
    () => BINGR_SOURCES.find((source) => source.id === sourceId) ?? BINGR_SOURCES[0],
    [sourceId],
  );
  const embedUrl = useMemo(
    () => selectedSource ? buildEmbedUrl(mediaType, id, selectedSource.id, season, episode) : null,
    [mediaType, id, selectedSource?.id, season, episode],
  );

  useEffect(() => {
    setLoading(Boolean(embedUrl));
    setFailed(!embedUrl);
    latestProgress.current = { position: 0, duration: 0 };
  }, [embedUrl]);

  useEffect(() => {
    if (!Number.isFinite(id)) return;

    const deviceId = getAnonymousDeviceId();
    if (!deviceId) return;

    let savedAt = 0;
    let fallbackTimer: ReturnType<typeof setTimeout> | undefined;

    const saveProgress = async (position: number, duration = 0, completed = false) => {
      const safePosition = numeric(position);
      const safeDuration = numeric(duration);
      if (safePosition <= 0 && !completed) return;

      latestProgress.current = { position: safePosition, duration: safeDuration };
      const item = {
        id,
        mediaType,
        season: season ?? null,
        episode: episode ?? null,
        position_seconds: safePosition,
        duration_seconds: safeDuration,
        title: titleName || null,
        poster_path: title?.posterPath || null,
        backdrop_path: title?.backdropPath || null,
        completed,
      };

      writeLocalProgress(item);
      window.dispatchEvent(new Event('rabbitrip:progress-updated'));

      const now = Date.now();
      if (!completed && now - savedAt < 3000) return;
      savedAt = now;

      try {
        const token = getAccessToken();
        const headers: Record<string, string> = {
          'Content-Type': 'application/json',
          'X-Device-Id': deviceId,
        };
        if (token) headers.Authorization = `Bearer ${token}`;
        await fetch('/api/progress', {
          method: 'POST',
          headers,
          body: JSON.stringify({
            id,
            mediaType,
            season: season ?? null,
            episode: episode ?? null,
            position: safePosition,
            duration: safeDuration,
            title: titleName || null,
            posterPath: title?.posterPath || null,
            backdropPath: title?.backdropPath || null,
            completed,
          }),
          keepalive: true,
        });
      } catch {
        // The local cache already contains the progress and will be reconciled on the next home refresh.
      }
    };

    const onMessage = (event: MessageEvent) => {
      if (event.origin !== window.location.origin && !PLAYER_ORIGINS.has(event.origin)) return;

      const data = event.data;
      if (!data || typeof data !== 'object') return;

      const payload = data.data && typeof data.data === 'object' ? data.data : data;
      const position = numeric(
        payload.position,
        payload.currentTime,
        payload.current_time,
        payload.player_progress,
        data.position,
        data.currentTime,
      );
      const duration = numeric(
        payload.duration,
        payload.duration_seconds,
        payload.player_duration,
        data.duration,
      );

      if (position > 0 || duration > 0) latestProgress.current = { position, duration };

      const type = String(data.type || payload.type || '').toLowerCase();
      const status = String(data.status || payload.player_status || '').toLowerCase();
      const completed = status === 'completed' || type.includes('ended') || type.includes('complete');

      if (completed) {
        void saveProgress(position || duration, duration, true);
      } else if (position > 0 && (status === 'playing' || status === 'paused' || status === 'seeked' || type.includes('progress') || type === 'player_event')) {
        void saveProgress(position, duration);
      }
    };

    const onIframeLoad = () => {
      setLoading(false);
      setFailed(false);
      fallbackTimer = setTimeout(() => {
        if (latestProgress.current.position <= 0) void saveProgress(PROGRESS_FALLBACK_SECONDS, latestProgress.current.duration);
      }, PROGRESS_FALLBACK_SECONDS * 1000);
    };

    const onUnload = () => {
      const position = latestProgress.current.position || PROGRESS_FALLBACK_SECONDS;
      void saveProgress(position, latestProgress.current.duration);
    };

    window.addEventListener('message', onMessage);
    window.addEventListener('rabbitrip:stream-loaded', onIframeLoad as EventListener);
    window.addEventListener('pagehide', onUnload);

    return () => {
      if (fallbackTimer) clearTimeout(fallbackTimer);
      window.removeEventListener('message', onMessage);
      window.removeEventListener('rabbitrip:stream-loaded', onIframeLoad as EventListener);
      window.removeEventListener('pagehide', onUnload);
      onUnload();
    };
  }, [id, mediaType, season, episode, titleName, title?.posterPath, title?.backdropPath]);

  const selectSource = (nextId: string) => {
    if (nextId === sourceId) {
      setSourceMenuOpen(false);
      return;
    }
    setSourceId(nextId);
    setSourceMenuOpen(false);
    setLoading(true);
    setFailed(false);
  };

  return (
    <section className="w-full bg-black py-4 md:py-6" aria-label="Watch">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080808] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/8 px-3 py-2 md:px-4">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/85">{titleName || 'Watch'}</p>
              {mediaType === 'tv' && season && episode ? (
                <p className="text-[10px] text-white/40">S{String(season).padStart(2, '0')} · E{String(episode).padStart(2, '0')}</p>
              ) : null}
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close player">
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="relative aspect-video w-full bg-black">
            {embedUrl && !failed ? (
              <iframe
                key={embedUrl}
                src={embedUrl}
                title={`${titleName || 'Title'} — ${selectedSource?.name || 'Source'}`}
                className="absolute inset-0 h-full w-full border-0 bg-black"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                referrerPolicy="strict-origin-when-cross-origin"
                onLoad={() => {
                  setLoading(false);
                  setFailed(false);
                  window.dispatchEvent(new Event('rabbitrip:stream-loaded'));
                }}
                onError={() => {
                  setLoading(false);
                  setFailed(true);
                }}
              />
            ) : null}
            {loading && embedUrl && !failed ? (
              <div className="pointer-events-none absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black text-white/60">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Loading {selectedSource?.name || 'source'}…</span>
              </div>
            ) : null}
            {failed || !embedUrl ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-5 text-center">
                <AlertCircle className="h-6 w-6 text-white/50" />
                <p className="text-sm font-medium text-white/75">Source unavailable</p>
                <p className="max-w-md text-xs text-white/40">Choose another source below or configure the player base URL.</p>
              </div>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-t border-white/8 px-3 py-2 md:px-4">
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/35">Source</span>
            <div className="relative min-w-0 flex-1">
              <button type="button" onClick={() => setSourceMenuOpen((open) => !open)} className="flex h-8 max-w-full items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs text-white/80" aria-expanded={sourceMenuOpen}>
                <span className="max-w-[120px] truncate">{selectedSource?.name ?? 'Select source'}</span>
                <ChevronDown className={`h-3 w-3 text-white/40 ${sourceMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {sourceMenuOpen ? (
                <div className="absolute bottom-10 left-0 z-30 max-h-56 w-48 overflow-y-auto rounded-lg border border-white/10 bg-[#101010] p-1 shadow-2xl">
                  {BINGR_SOURCES.map((source) => (
                    <button type="button" key={source.id} onClick={() => selectSource(source.id)} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs ${source.id === sourceId ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                      <span>{source.name}</span>
                      {source.id === sourceId ? <Check className="h-3 w-3" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
