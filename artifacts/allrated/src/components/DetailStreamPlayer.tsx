import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { AlertCircle, Check, ChevronDown, Loader2, Play, X } from 'lucide-react';
import { useGetTitleDetail } from '@workspace/api-client-react';
import { BINGR_SOURCES } from '@/lib/streamingProviders';
import { useRabbitSources } from '@/hooks/useRabbitSources';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';

interface DetailStreamPlayerProps {
  mediaType: 'movie' | 'tv';
  id: number;
  season?: number;
  episode?: number;
  onClose: () => void;
}

export default function DetailStreamPlayer({ mediaType, id, season, episode, onClose }: DetailStreamPlayerProps) {
  const { data: title } = useGetTitleDetail(mediaType, id, { query: { enabled: Number.isFinite(id) } });
  const titleName = title?.title || '';
  const year = (title?.release_date || title?.first_air_date || '').slice(0, 4);
  const [sourceId, setSourceId] = useState(BINGR_SOURCES[0]?.id ?? '');
  const [sourceMenuOpen, setSourceMenuOpen] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const fatalRef = useRef<(() => void) | null>(null);
  const { sources, subtitles, loading, error } = useRabbitSources(sourceId, mediaType, id, titleName, year, season, episode);
  const selectedSource = useMemo(() => {
    if (!sources.length) return null;
    return [...sources].sort((a, b) => Number(b.quality.replace(/\D/g, '') || 0) - Number(a.quality.replace(/\D/g, '') || 0))[0] ?? null;
  }, [sources]);
  const { load, audioTracks, selectAudioTrack } = useHlsPlayer(videoRef, fatalRef);

  const handleFatal = useCallback(() => {
    setPlaying(false);
    setNotice('Playback failed on this source. Try another source.');
  }, []);

  useEffect(() => { fatalRef.current = handleFatal; }, [handleFatal]);

  useEffect(() => {
    if (!selectedSource) return;
    setNotice(null);
    load(selectedSource.url, selectedSource.type);
  }, [load, selectedSource?.url, selectedSource?.type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => setPlaying(true);
    const onPause = () => setPlaying(false);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    return () => { video.removeEventListener('play', onPlay); video.removeEventListener('pause', onPause); };
  }, []);

  useEffect(() => {
    if (!audioTracks.length) return;
    const preferred = audioTracks.find((track) => /english|en/i.test(`${track.label} ${track.language}`)) ?? audioTracks[0];
    selectAudioTrack(preferred.id);
  }, [audioTracks, selectAudioTrack]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) void video.play().catch(() => setNotice('Playback could not start. Try another source.'));
    else video.pause();
  };

  const selectSource = (id: string) => {
    if (id === sourceId) return;
    setSourceId(id);
    setSourceMenuOpen(false);
    setNotice(null);
  };

  return (
    <section className="w-full bg-black py-4 md:py-6" aria-label="Watch">
      <div className="mx-auto w-full max-w-[1400px] px-4 md:px-8">
        <div className="overflow-hidden rounded-xl border border-white/10 bg-[#080808] shadow-2xl">
          <div className="flex items-center justify-between border-b border-white/8 px-3 py-2 md:px-4">
            <div className="min-w-0">
              <p className="truncate text-xs font-semibold text-white/85">{titleName || 'Watch'}</p>
              {mediaType === 'tv' && season && episode ? <p className="text-[10px] text-white/40">S{String(season).padStart(2, '0')} · E{String(episode).padStart(2, '0')}</p> : null}
            </div>
            <button type="button" onClick={onClose} className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-white/50 transition hover:bg-white/10 hover:text-white" aria-label="Close player"><X className="h-4 w-4" /></button>
          </div>

          <div className="relative aspect-video w-full bg-black">
            <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain" playsInline controls={false} onClick={togglePlay} />
            {(loading || !selectedSource) && !error && !notice ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 text-white/60">
                <Loader2 className="h-6 w-6 animate-spin" />
                <span className="text-xs">Loading source…</span>
              </div>
            ) : null}
            {error && !loading ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black px-5 text-center">
                <AlertCircle className="h-6 w-6 text-white/50" />
                <p className="text-sm font-medium text-white/75">Source unavailable</p>
                <p className="max-w-md text-xs text-white/40">Choose another source below.</p>
              </div>
            ) : null}
            {notice ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-black/80 px-5 text-center">
                <AlertCircle className="h-6 w-6 text-white/55" />
                <p className="max-w-md text-sm text-white/75">{notice}</p>
              </div>
            ) : null}
            {!loading && !error && !notice && selectedSource && !playing ? (
              <button type="button" onClick={togglePlay} className="absolute left-1/2 top-1/2 flex h-12 w-12 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-white text-black shadow-xl transition hover:scale-105" aria-label="Play"><Play className="ml-0.5 h-5 w-5 fill-current" /></button>
            ) : null}
          </div>

          <div className="flex items-center gap-2 border-t border-white/8 px-3 py-2 md:px-4">
            <span className="shrink-0 text-[10px] font-medium uppercase tracking-wider text-white/35">Source</span>
            <div className="relative min-w-0 flex-1">
              <button type="button" onClick={() => setSourceMenuOpen((open) => !open)} className="flex h-8 max-w-full items-center gap-1.5 rounded-md border border-white/10 bg-white/[0.04] px-2.5 text-xs text-white/80 transition hover:bg-white/[0.08]" aria-expanded={sourceMenuOpen}>
                <span className="max-w-[120px] truncate">{BINGR_SOURCES.find((source) => source.id === sourceId)?.name ?? sourceId}</span>
                <ChevronDown className={`h-3 w-3 text-white/40 transition-transform ${sourceMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {sourceMenuOpen ? (
                <div className="absolute bottom-10 left-0 z-30 max-h-56 w-48 overflow-y-auto rounded-lg border border-white/10 bg-[#101010] p-1 shadow-2xl">
                  {BINGR_SOURCES.map((source) => (
                    <button type="button" key={source.id} onClick={() => selectSource(source.id)} className={`flex w-full items-center justify-between rounded-md px-2.5 py-2 text-left text-xs transition ${source.id === sourceId ? 'bg-white text-black' : 'text-white/70 hover:bg-white/10 hover:text-white'}`}>
                      <span>{source.name}</span>{source.id === sourceId ? <Check className="h-3 w-3" /> : null}
                    </button>
                  ))}
                </div>
              ) : null}
            </div>
            {selectedSource?.quality ? <span className="shrink-0 text-[10px] text-white/35">{selectedSource.quality}</span> : null}
          </div>
          {subtitles.length ? <div className="px-3 pb-2 text-[10px] text-white/25 md:px-4">{subtitles.length} subtitle track{subtitles.length === 1 ? '' : 's'} available</div> : null}
        </div>
      </div>
    </section>
  );
}
