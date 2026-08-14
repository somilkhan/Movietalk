import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent, type ReactNode } from 'react';
import { useLocation, useParams } from 'wouter';
import { useGetTitleDetail } from '@workspace/api-client-react';
import {
  ArrowLeft, Captions, ChevronUp, CircleAlert, ChevronsLeft, ChevronsRight,
  Loader2, Maximize, Pause, Play, Settings2, Volume2, VolumeX, X,
} from 'lucide-react';
import { useBingrSources } from '@/hooks/useBingrSources';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';

const SERVERS = [
  { id: 's11', name: 'Sirius', icon: 'logo' },
  { id: 's40', name: 'DarkMatter', icon: 'logo' },
  { id: 's12', name: 'Quasar', icon: 'logo' },
  { id: 's30', name: 'Apollo', icon: 'us' },
  { id: 's1', name: 'Miller', icon: 'us' },
  { id: 's2', name: 'Mann', icon: 'us' },
  { id: 's3', name: 'Edmunds', icon: 'us' },
  { id: 's4', name: 'Luna', icon: 'us' },
  { id: 's5', name: 'Aditya', icon: 'in' },
] as const;

const QUALITIES = [
  { id: 'cinematic', label: 'Cinematic', cap: 1080 },
  { id: 'theatrical', label: 'Theatrical', cap: 720 },
  { id: 'smooth', label: 'Smooth', cap: 480 },
] as const;

type Menu = 'quality' | 'audio' | null;
type SimilarTitle = {
  id: number;
  mediaType?: 'movie' | 'tv';
  title?: string;
  name?: string;
  posterPath?: string | null;
  backdropPath?: string | null;
  voteAverage?: number;
  year?: string | null;
};

type Feedback = 'play' | 'pause' | 'back' | 'forward' | null;

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = Math.floor(value % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

function qualityRank(q: string) {
  const match = q.match(/(2160|1080|720|480|360|240)/);
  return match ? Number(match[1]) : 0;
}

function proxiedUrl(url: string) {
  if (!url) return url;
  if (url.startsWith('/') || url.startsWith(window.location.origin)) return url;
  return `/api/proxy?url=${encodeURIComponent(url)}`;
}

function ServerIcon({ kind }: { kind: 'logo' | 'us' | 'in' }) {
  if (kind === 'logo') return <img alt="Allrated" src="/brand/logo.png" className="h-[14px] w-5 shrink-0 rounded-[2px] object-contain scale-[1.7]" />;
  if (kind === 'in') return <span className="relative block h-[14px] w-5 shrink-0 overflow-hidden rounded-[2px]" aria-hidden="true"><span className="absolute inset-x-0 top-0 h-1/3 bg-[#ff6820]" /><span className="absolute inset-x-0 top-1/3 h-1/3 bg-white" /><span className="absolute inset-x-0 bottom-0 h-1/3 bg-[#046a38]" /><span className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#07038d]" /></span>;
  return <span className="relative block h-[14px] w-5 shrink-0 overflow-hidden rounded-[2px] bg-white" aria-hidden="true"><span className="absolute inset-x-0 top-0 h-[1.75px] bg-[#d80027]" /><span className="absolute inset-x-0 top-[3.5px] h-[1.75px] bg-[#d80027]" /><span className="absolute inset-x-0 top-[7px] h-[1.75px] bg-[#d80027]" /><span className="absolute inset-x-0 top-[10.5px] h-[1.75px] bg-[#d80027]" /><span className="absolute left-0 top-0 h-[8px] w-[10px] bg-[#2e52b2]" /></span>;
}

function SettingButton({ selected, children, onClick, subtitle }: { selected: boolean; children: ReactNode; onClick: () => void; subtitle?: string }) {
  return <button type="button" onClick={onClick} className="flex items-start gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="mt-0.5 w-4 shrink-0 text-blue-400" style={{ opacity: selected ? 1 : 0 }}>✓</span><div><div className="font-semibold text-[15px] leading-tight">{children}</div>{subtitle ? <div className="mt-0.5 text-[13px] text-white/50">{subtitle}</div> : null}</div></button>;
}

export default function BingrWatch() {
  const params = useParams<{ mediaType: string; id: string }>();
  const [, navigate] = useLocation();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const tmdbId = Number(params.id);
  const [serverId, setServerId] = useState('s11');
  const [qualityId, setQualityId] = useState<(typeof QUALITIES)[number]['id']>('cinematic');
  const [menu, setMenu] = useState<Menu>(null);
  const [playing, setPlaying] = useState(false);
  const [controls, setControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [moreLike, setMoreLike] = useState(false);
  const [similarTitles, setSimilarTitles] = useState<SimilarTitle[]>([]);
  const [similarLoading, setSimilarLoading] = useState(false);
  const [audio, setAudio] = useState('');
  const [subtitle, setSubtitle] = useState('Off');
  const [showVolume, setShowVolume] = useState(false);
  const [loading, setLoading] = useState(false);
  const [notice, setNotice] = useState('');
  const [feedback, setFeedback] = useState<Feedback>(null);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const feedbackRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fatalRef = useRef<(() => void) | null>(null);
  const restoreTimeRef = useRef(0);
  const firstSourceRef = useRef(true);
  const playingRef = useRef(false);
  const menuRef = useRef<Menu>(null);
  const moreLikeRef = useRef(false);
  const loadingRef = useRef(false);

  const { data: title } = useGetTitleDetail(mediaType, tmdbId, { query: { enabled: Number.isFinite(tmdbId) } });
  const titleName = title?.title || title?.name || '';
  const year = (title?.release_date || title?.first_air_date || '').slice(0, 4);
  const genreSource = (title as any)?.genres ?? (title as any)?.genre_names ?? [];
  const genres = Array.isArray(genreSource)
    ? genreSource.map((genre: any) => typeof genre === 'string' ? genre : genre?.name).filter(Boolean).slice(0, 3).join(' • ')
    : '';
  const { sources, subtitles, loading: sourceLoading } = useBingrSources(serverId, mediaType, tmdbId, titleName, year, 1, 1);
  const quality = QUALITIES.find((q) => q.id === qualityId) || QUALITIES[0];
  const selectedSource = useMemo(() => {
    if (!sources.length) return null;
    const ranked = sources.map((source) => ({ source, rank: qualityRank(source.quality) }))
      .filter(({ rank }) => rank > 0 && rank <= quality.cap)
      .sort((a, b) => b.rank - a.rank);
    return ranked[0]?.source || sources[0];
  }, [sources, quality.cap]);

  const scheduleHide = useCallback(() => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (!playingRef.current || menuRef.current || moreLikeRef.current || loadingRef.current) return;
    timerRef.current = setTimeout(() => setControls(false), 3200);
  }, []);

  const resetControls = useCallback(() => {
    setControls(true);
    scheduleHide();
  }, [scheduleHide]);

  const showNotice = useCallback((message: string) => {
    setNotice(message);
    if (noticeRef.current) clearTimeout(noticeRef.current);
    noticeRef.current = setTimeout(() => setNotice(''), 2600);
  }, []);

  const showFeedback = useCallback((next: Feedback) => {
    setFeedback(next);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
    feedbackRef.current = setTimeout(() => setFeedback(null), 520);
  }, []);

  const handleFatal = useCallback(() => setLoading(false), []);
  useEffect(() => { fatalRef.current = handleFatal; }, [handleFatal]);
  const { load, audioTracks, selectAudioTrack } = useHlsPlayer(videoRef, fatalRef);

  useEffect(() => { playingRef.current = playing; scheduleHide(); }, [playing, scheduleHide]);
  useEffect(() => { menuRef.current = menu; scheduleHide(); }, [menu, scheduleHide]);
  useEffect(() => { moreLikeRef.current = moreLike; scheduleHide(); }, [moreLike, scheduleHide]);
  useEffect(() => { loadingRef.current = loading; scheduleHide(); }, [loading, scheduleHide]);

  useEffect(() => {
    if (!moreLike || !Number.isFinite(tmdbId)) return;
    let cancelled = false;
    setSimilarLoading(true);
    setSimilarTitles([]);
    fetch(`/api/catalog/title/${mediaType}/${tmdbId}/similar`, { headers: { Accept: 'application/json' } })
      .then((response) => { if (!response.ok) throw new Error(`HTTP ${response.status}`); return response.json(); })
      .then((data) => { if (!cancelled) setSimilarTitles(Array.isArray(data?.results) ? data.results : []); })
      .catch(() => { if (!cancelled) setSimilarTitles([]); })
      .finally(() => { if (!cancelled) setSimilarLoading(false); });
    return () => { cancelled = true; };
  }, [moreLike, mediaType, tmdbId]);

  useEffect(() => {
    if (!audioTracks.length) { setAudio(''); return; }
    const preferred = audioTracks.find((track) => /english|en/i.test(`${track.label} ${track.language}`)) || audioTracks[0];
    setAudio(preferred.label);
    selectAudioTrack(preferred.id);
  }, [audioTracks, selectAudioTrack]);

  useEffect(() => {
    if (!selectedSource) return;
    restoreTimeRef.current = videoRef.current?.currentTime || 0;
    setLoading(true);
    load(selectedSource.url, selectedSource.type);
  }, [load, selectedSource?.url, selectedSource?.type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onLoadedMetadata = () => {
      setDuration(video.duration || 0);
      if (!firstSourceRef.current && restoreTimeRef.current > 0 && Number.isFinite(video.duration)) {
        video.currentTime = Math.min(restoreTimeRef.current, Math.max(0, video.duration - 0.5));
      }
      firstSourceRef.current = false;
    };
    const onPlay = () => { setPlaying(true); setLoading(false); resetControls(); };
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onDuration = () => setDuration(video.duration || 0);
    const onProgress = () => { if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1)); };
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    video.addEventListener('loadedmetadata', onLoadedMetadata);
    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTime);
    video.addEventListener('durationchange', onDuration);
    video.addEventListener('progress', onProgress);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    return () => {
      video.removeEventListener('loadedmetadata', onLoadedMetadata);
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTime);
      video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('progress', onProgress);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, [resetControls]);

  useEffect(() => () => {
    if (timerRef.current) clearTimeout(timerRef.current);
    if (noticeRef.current) clearTimeout(noticeRef.current);
    if (feedbackRef.current) clearTimeout(feedbackRef.current);
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.querySelectorAll('track').forEach((track) => track.remove());
    subtitles.forEach((sub) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = proxiedUrl(sub.url);
      track.label = sub.label;
      track.srclang = (sub.language || 'en').slice(0, 2).toLowerCase();
      video.appendChild(track);
    });
  }, [subtitles]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    Array.from(video.textTracks).forEach((track) => { track.mode = 'disabled'; });
    if (subtitle !== 'Off') {
      const track = Array.from(video.textTracks).find((item) => item.label === subtitle);
      if (track) track.mode = 'showing';
    }
  }, [subtitle, subtitles]);

  const togglePlay = () => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) {
      video.play().catch(() => undefined);
      showFeedback('play');
    } else {
      video.pause();
      showFeedback('pause');
    }
    resetControls();
  };

  const seek = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
    showFeedback(delta < 0 ? 'back' : 'forward');
    resetControls();
  };

  const seekPointer = (event: PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    video.currentTime = Math.max(0, Math.min(duration, ((event.clientX - rect.left) / rect.width) * duration));
    resetControls();
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.max(0, Math.min(1, value));
    video.volume = next;
    video.muted = next === 0;
    setVolume(next);
    setMuted(next === 0);
    resetControls();
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
    resetControls();
  };

  const toggleFullscreen = async () => {
    const active = document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
    const orientation = screen.orientation as ScreenOrientation & { lock?: (orientation: OrientationLockType) => Promise<void>; unlock?: () => void };
    if (active) {
      try { await document.exitFullscreen?.(); } catch { /* browser already exited */ }
      try { orientation.unlock?.(); } catch { /* unsupported */ }
      return;
    }

    const root = rootRef.current;
    if (!root) return;
    try {
      if (root.requestFullscreen) await root.requestFullscreen({ navigationUI: 'hide' });
      else await (root as HTMLDivElement & { webkitRequestFullscreen?: () => Promise<void> }).webkitRequestFullscreen?.();
      try { await orientation.lock?.('landscape'); } catch { /* orientation lock is browser/device dependent */ }
    } catch {
      showNotice('Fullscreen is not available in this browser.');
    }
  };

  useEffect(() => {
    const onFullscreenChange = () => {
      const active = document.fullscreenElement || (document as Document & { webkitFullscreenElement?: Element }).webkitFullscreenElement;
      if (!active) {
        try { (screen.orientation as ScreenOrientation & { unlock?: () => void }).unlock?.(); } catch { /* unsupported */ }
      }
    };
    document.addEventListener('fullscreenchange', onFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', onFullscreenChange);
  }, []);

  const selectQuality = (id: (typeof QUALITIES)[number]['id']) => {
    restoreTimeRef.current = videoRef.current?.currentTime || 0;
    setQualityId(id);
    setMenu(null);
    resetControls();
  };

  const selectServer = (id: string) => {
    restoreTimeRef.current = videoRef.current?.currentTime || 0;
    setServerId(id);
    setMenu(null);
    resetControls();
  };

  const selectAudio = (label: string, id: number) => {
    if (selectAudioTrack(id)) {
      setAudio(label);
      setMenu(null);
      resetControls();
    } else showNotice('This stream has no selectable audio track.');
  };

  const handleReport = async () => {
    const report = `Bingr player issue\nTitle: ${titleName}\nTMDB: ${tmdbId}\nServer: ${serverId}\nURL: ${window.location.href}`;
    try {
      if (navigator.share) await navigator.share({ title: 'Bingr Player Issue', text: report });
      else if (navigator.clipboard) { await navigator.clipboard.writeText(report); showNotice('Issue details copied'); }
      else showNotice('Unable to open report tools');
    } catch { /* cancelled */ }
  };

  const openMoreLike = () => { setMoreLike(true); setMenu(null); setControls(true); };
  const closeMoreLike = () => { setMoreLike(false); setControls(true); resetControls(); };

  if (!Number.isFinite(tmdbId)) return <div className="min-h-screen bg-black" />;
  const progress = duration ? Math.min(100, Math.max(0, currentTime / duration * 100)) : 0;
  const bufferedProgress = duration ? Math.min(100, Math.max(0, buffered / duration * 100)) : 0;
  const recommendations = similarTitles;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] overflow-hidden select-none bg-black"
      style={{ cursor: controls || menu || moreLike ? 'default' : 'none' }}
      onPointerMove={() => { if (!controls) resetControls(); }}
    >
      <style>{`@keyframes playerFeedback{0%{opacity:0;transform:scale(.82)}18%{opacity:1;transform:scale(1)}78%{opacity:1;transform:scale(1)}100%{opacity:0;transform:scale(1.05)}}@keyframes playerMenu{0%{opacity:0;transform:translateY(-5px) scale(.97)}100%{opacity:1;transform:translateY(0) scale(1)}}@keyframes playerMore{0%{opacity:0}100%{opacity:1}}`}</style>
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full cursor-pointer object-contain bg-black"
        crossOrigin="anonymous"
        playsInline
        onClick={togglePlay}
      />

      <div className={`absolute inset-0 z-[210] bg-gradient-to-b from-black/65 via-transparent to-black/90 transition-opacity duration-300 ${controls || menu || moreLike ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 px-4 py-4 md:px-8 md:py-6">
          <div className="flex min-w-0 items-start gap-3">
            <button type="button" onClick={() => navigate(`/title/${mediaType}/${tmdbId}`)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 md:h-11 md:w-11" aria-label="Back"><ArrowLeft className="h-6 w-6 md:h-7 md:w-7" /></button>
            <div className="min-w-0 max-w-[62vw] pt-0.5 md:max-w-[70vw]">
              <div className="truncate text-lg font-bold leading-tight tracking-wide text-white md:text-xl">{titleName}</div>
              {genres ? <div className="mt-1 truncate text-[11px] font-medium tracking-wide text-white/55 md:text-xs">{genres}</div> : null}
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-1 md:gap-2">
            <div className="relative">
              <button type="button" onClick={() => setMenu(menu === 'quality' ? null : 'quality')} className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white md:text-sm" aria-label="Quality"><Settings2 className="h-5 w-5 md:h-6 md:w-6" /><span className="hidden sm:inline">Quality</span><span className="hidden font-normal text-white/50 sm:inline">{selectedSource?.quality || '1080p'}</span></button>
              {menu === 'quality' ? <div className="absolute right-0 top-full z-[240] pt-2" style={{ animation: 'playerMenu 180ms ease-out both' }}><div className="flex w-max max-w-[calc(100vw-1rem)] flex-col rounded-xl border border-white/10 bg-black/55 py-2 text-sm text-white shadow-2xl backdrop-blur-2xl"><div className="flex"><div className="flex-1 py-2"><div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Quality</div><div className="flex max-h-[250px] flex-col overflow-y-auto">{QUALITIES.map((q) => <SettingButton key={q.id} selected={qualityId === q.id} onClick={() => selectQuality(q.id)} subtitle={`Up to ${q.cap}p`}>{q.label}</SettingButton>)}</div></div><div className="flex-1 border-l border-white/10 py-2"><div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Server</div><div className="flex max-h-[250px] flex-col overflow-y-auto">{SERVERS.map((server) => <button type="button" key={server.id} onClick={() => selectServer(server.id)} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 shrink-0 text-blue-400" style={{ opacity: serverId === server.id ? 1 : 0 }}>✓</span><ServerIcon kind={server.icon} /><div className="flex-1 font-semibold text-[15px]">{server.name}</div></button>)}</div></div></div><div className="mx-4 my-1 h-px bg-white/10" /><button type="button" onClick={handleReport} className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white/60 transition-colors hover:text-white"><CircleAlert className="h-4 w-4" />Report an Issue</button></div></div> : null}
            </div>
            <div className="relative">
              <button type="button" onClick={() => setMenu(menu === 'audio' ? null : 'audio')} className="flex items-center gap-1.5 rounded-lg p-2 text-xs font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white md:text-sm" aria-label="Audio and subtitles"><Captions className="h-5 w-5 md:h-6 md:w-6" /><span className="hidden sm:inline">Audio &amp; Subtitles</span></button>
              {menu === 'audio' ? <div className="absolute right-0 top-full z-[240] pt-2" style={{ animation: 'playerMenu 180ms ease-out both' }}><div className="w-[340px] max-w-[calc(100vw-1rem)] rounded-xl border border-white/10 bg-black/55 py-2 text-sm text-white shadow-2xl backdrop-blur-2xl"><div className="flex"><div className="flex-1 py-2"><div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Audio</div><div className="flex max-h-[250px] flex-col overflow-y-auto">{audioTracks.length ? audioTracks.map((track) => <button type="button" key={track.id} onClick={() => selectAudio(track.label, track.id)} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 text-blue-400" style={{ opacity: audio === track.label ? 1 : 0 }}>✓</span><span className="text-sm">{/hindi|hi/i.test(`${track.label} ${track.language}`) ? '🇮🇳' : '🇺🇸'}</span><div className="flex-1"><div className="font-semibold text-[15px] leading-tight">{track.label}</div></div></button>) : <div className="px-5 py-3 text-[13px] text-white/45">No alternate audio tracks</div>}</div></div><div className="flex-1 border-l border-white/10 py-2"><div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Subtitles</div><div className="flex max-h-[250px] flex-col overflow-y-auto"><button type="button" onClick={() => { setSubtitle('Off'); setMenu(null); resetControls(); }} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 text-blue-400" style={{ opacity: subtitle === 'Off' ? 1 : 0 }}>✓</span><div className="font-semibold text-[15px]">Off</div></button>{subtitles.map((sub, index) => <button type="button" key={`${sub.label}-${index}`} onClick={() => { setSubtitle(sub.label); setMenu(null); resetControls(); }} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 text-blue-400" style={{ opacity: subtitle === sub.label ? 1 : 0 }}>✓</span><div className="font-semibold text-[15px]">{sub.label}</div></button>)}</div></div></div><div className="mx-4 my-1 h-px bg-white/10" /><button type="button" onClick={handleReport} className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white/60 transition-colors hover:text-white"><CircleAlert className="h-4 w-4" />Report an Issue</button></div></div> : null}
            </div>
          </div>
        </div>

        <img src="/brand/logo.svg" alt="Allrated" className="pointer-events-none absolute bottom-28 left-4 h-6 w-auto opacity-55 drop-shadow-lg transition-opacity duration-300 md:bottom-32 md:left-8 md:h-7" />

        <div className="pointer-events-none absolute inset-0 flex items-center justify-center">
          {feedback === 'play' ? <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm md:h-20 md:w-20" style={{ animation: 'playerFeedback 520ms ease-out both' }}><Play className="ml-1 h-8 w-8 fill-current md:h-10 md:w-10" /></div> : null}
          {feedback === 'pause' ? <div className="flex h-16 w-16 items-center justify-center rounded-full bg-black/45 text-white backdrop-blur-sm md:h-20 md:w-20" style={{ animation: 'playerFeedback 520ms ease-out both' }}><Pause className="h-8 w-8 md:h-10 md:w-10" /></div> : null}
          {feedback === 'back' ? <div className="flex items-center gap-1 rounded-full bg-black/45 px-4 py-3 text-white backdrop-blur-sm" style={{ animation: 'playerFeedback 520ms ease-out both' }}><ChevronsLeft className="h-6 w-6" /><span className="text-sm font-bold">10</span></div> : null}
          {feedback === 'forward' ? <div className="flex items-center gap-1 rounded-full bg-black/45 px-4 py-3 text-white backdrop-blur-sm" style={{ animation: 'playerFeedback 520ms ease-out both' }}><span className="text-sm font-bold">10</span><ChevronsRight className="h-6 w-6" /></div> : null}
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 md:px-8 md:pb-6">
          <div className="flex items-center justify-center pb-4"><div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 shadow-sm backdrop-blur-md"><button type="button" onClick={() => selectServer('s11')} className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${serverId === 's11' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Server 1</button><button type="button" onClick={() => selectServer('s40')} className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${serverId === 's40' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Server 2</button></div></div>
          <div className="flex justify-center pb-3"><button type="button" onClick={openMoreLike} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/55 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 shadow-lg backdrop-blur-md transition-all duration-200 hover:scale-[1.02] hover:text-white md:px-6 md:py-2 md:text-base"><span>More Like This</span><ChevronUp className="h-3.5 w-3.5 md:h-4 md:w-4" /></button></div>
          <div className="relative mb-2 flex items-center gap-2 md:gap-3"><div className="relative h-5 flex-1 cursor-pointer touch-none" onPointerDown={seekPointer}><div className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25"><div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white/40" style={{ transform: `scaleX(${bufferedProgress / 100})` }} /><div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${progress / 100})` }} /></div><div className="absolute left-0 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg transition-transform duration-100" style={{ left: `${progress}%` }} /></div><span className="mr-2 shrink-0 text-xs font-semibold tabular-nums text-white md:text-sm">{formatTime(duration)}</span></div>
          <div className="relative flex items-center justify-between"><div className="flex items-center gap-2"><button type="button" onClick={() => seek(-10)} className="flex select-none items-center justify-center gap-1 px-2 py-2 text-white/90 transition-transform duration-150 hover:scale-105 hover:text-white" aria-label="Rewind 10 seconds"><ChevronsLeft className="h-5 w-5 md:h-6 md:w-6" /><span className="text-sm font-semibold leading-none md:text-base">10</span></button><button type="button" onClick={togglePlay} className="flex items-center justify-center p-2 text-white transition-transform duration-150 active:scale-90" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="h-8 w-8 md:h-10 md:w-10" /> : <Play className="h-8 w-8 fill-current md:h-10 md:w-10" />}</button><button type="button" onClick={() => seek(10)} className="flex select-none items-center justify-center gap-1 px-2 py-2 text-white/90 transition-transform duration-150 hover:scale-105 hover:text-white" aria-label="Forward 10 seconds"><span className="text-sm font-semibold leading-none md:text-base">10</span><ChevronsRight className="h-5 w-5 md:h-6 md:w-6" /></button><div className="flex items-center" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}><button type="button" onClick={toggleMute} className="flex items-center justify-center p-1.5 text-white transition-transform duration-150 active:scale-90" aria-label="Volume">{muted || volume === 0 ? <VolumeX className="h-6 w-6 md:h-7 md:w-7" /> : <Volume2 className="h-6 w-6 md:h-7 md:w-7" />}</button><div className={`overflow-hidden transition-all duration-200 ${showVolume ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}><div className="relative mx-2 flex h-5 w-20 items-center"><input min="0" max="100" step="1" type="range" value={Math.round(volume * 100)} onChange={(e) => changeVolume(Number(e.target.value) / 100)} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" aria-label="Volume level" /><div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25"><div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${volume})` }} /></div><div className="pointer-events-none absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${volume * 100}%` }} /></div></div></div></div><div className="flex items-center"><button type="button" onClick={toggleFullscreen} className="p-2 text-white/90 transition-transform duration-150 hover:scale-105 hover:text-white" aria-label="Fullscreen"><Maximize className="h-6 w-6 md:h-7 md:w-7" /></button></div></div>
        </div>

        {moreLike ? <div className="absolute inset-0 z-[250] flex flex-col overflow-hidden bg-black/85 text-white backdrop-blur-md" style={{ animation: 'playerMore 180ms ease-out both' }}><div className="flex shrink-0 items-center justify-between px-6 py-5 md:px-10"><div className="flex min-w-0 items-baseline gap-4"><h2 className="text-2xl font-bold tracking-wide md:text-[26px]">More Like This</h2><span className="line-clamp-1 text-sm font-medium text-white/40 md:text-lg">{titleName}</span></div><button type="button" onClick={closeMoreLike} className="rounded-full p-2.5 transition-transform duration-150 hover:scale-105 hover:bg-white/10" aria-label="Close"><X className="h-7 w-7" /></button></div><div className="mx-6 h-px shrink-0 bg-white/10 md:mx-10" /><div className="flex-1 overflow-y-auto px-6 pb-32 pt-4 md:px-10 md:pt-6"><div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5">{similarLoading ? <div className="col-span-full flex min-h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-white/60" /></div> : recommendations.length ? recommendations.slice(0, 20).map((item) => <button type="button" key={`${item.mediaType || mediaType}-${item.id}`} onClick={() => { setMoreLike(false); navigate(`/title/${item.mediaType || mediaType}/${item.id}`); }} className="group flex w-full flex-col gap-2 text-left transition-transform duration-200 hover:-translate-y-0.5"><div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"><img alt={item.title || item.name || ''} loading="lazy" src={item.backdropPath || item.posterPath || ''} className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" /><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80" /><div className="absolute bottom-1.5 left-1.5 z-10">{item.voteAverage ? <div className="rounded bg-black/60 px-1.5 py-0.5 text-[10px] font-bold text-white backdrop-blur-md sm:text-[11px]">★ {Number(item.voteAverage).toFixed(1)}</div> : null}</div></div><div className="flex flex-col px-0.5"><h3 className="truncate text-[12px] font-medium leading-snug text-white/90 sm:text-[14px]">{item.title || item.name}</h3><div className="mt-1 truncate text-[9px] font-medium leading-none text-white/50 sm:text-[11px]">{item.year || ''}<span className="mx-1">•</span><span className="uppercase tracking-wider">{String(item.mediaType || mediaType)}</span></div></div></button>) : <div className="col-span-full py-16 text-center text-sm text-white/45">No recommendations found.</div>}</div></div></div> : null}
      </div>

      {notice ? <div className="pointer-events-none absolute left-1/2 top-16 z-[300] -translate-x-1/2 rounded-full border border-white/10 bg-black/75 px-4 py-2 text-xs font-semibold text-white shadow-xl backdrop-blur-md">{notice}</div> : null}
      {sourceLoading || loading ? <div className="pointer-events-none absolute inset-0 z-[230] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white/70" /></div> : null}
    </div>
  );
}
