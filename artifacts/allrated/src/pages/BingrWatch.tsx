import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useGetTitleDetail } from '@workspace/api-client-react';
import {
  ArrowLeft,
  Captions,
  ChevronUp,
  CircleAlert,
  FastForward,
  Loader2,
  Maximize,
  Pause,
  Play,
  Rewind,
  Settings2,
  Volume2,
  VolumeX,
  X,
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

function ServerIcon({ kind }: { kind: 'logo' | 'us' | 'in' }) {
  if (kind === 'logo') {
    return <img alt="Bingr" src="/brand/logo.png" className="h-[14px] w-5 shrink-0 rounded-[2px] object-contain scale-[1.7]" />;
  }
  if (kind === 'in') {
    return (
      <span className="relative block h-[14px] w-5 shrink-0 overflow-hidden rounded-[2px]" aria-hidden="true">
        <span className="absolute inset-x-0 top-0 h-1/3 bg-[#ff6820]" />
        <span className="absolute inset-x-0 top-1/3 h-1/3 bg-white" />
        <span className="absolute inset-x-0 bottom-0 h-1/3 bg-[#046a38]" />
        <span className="absolute left-1/2 top-1/2 h-[6px] w-[6px] -translate-x-1/2 -translate-y-1/2 rounded-full border border-[#07038d]" />
      </span>
    );
  }
  return (
    <span className="relative block h-[14px] w-5 shrink-0 overflow-hidden rounded-[2px] bg-white" aria-hidden="true">
      <span className="absolute inset-x-0 top-0 h-[1.75px] bg-[#d80027]" />
      <span className="absolute inset-x-0 top-[3.5px] h-[1.75px] bg-[#d80027]" />
      <span className="absolute inset-x-0 top-[7px] h-[1.75px] bg-[#d80027]" />
      <span className="absolute inset-x-0 top-[10.5px] h-[1.75px] bg-[#d80027]" />
      <span className="absolute left-0 top-0 h-[8px] w-[10px] bg-[#2e52b2]" />
    </span>
  );
}

function SettingButton({ selected, children, onClick, subtitle }: { selected: boolean; children: React.ReactNode; onClick: () => void; subtitle?: string }) {
  return (
    <button onClick={onClick} className="flex items-start gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10">
      <span className="mt-0.5 w-4 shrink-0 text-blue-400" style={{ opacity: selected ? 1 : 0 }}>✓</span>
      <div>
        <div className="font-semibold text-[15px] leading-tight">{children}</div>
        {subtitle ? <div className="mt-0.5 text-[13px] text-white/50">{subtitle}</div> : null}
      </div>
    </button>
  );
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
  const [fullscreen, setFullscreen] = useState(false);
  const [moreLike, setMoreLike] = useState(false);
  const [audio, setAudio] = useState('English');
  const [subtitle, setSubtitle] = useState('Off');
  const [showVolume, setShowVolume] = useState(false);
  const [loading, setLoading] = useState(false);

  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const fatalRef = useRef<(() => void) | null>(null);
  const restoreTimeRef = useRef(0);
  const firstSourceRef = useRef(true);

  const { data: title } = useGetTitleDetail(mediaType, tmdbId, { query: { enabled: Number.isFinite(tmdbId) } });
  const titleName = title?.title || title?.name || '';
  const year = (title?.release_date || title?.first_air_date || '').slice(0, 4);
  const { sources, subtitles, loading: sourceLoading } = useBingrSources(serverId, mediaType, tmdbId, titleName, year, 1, 1);

  const quality = QUALITIES.find((q) => q.id === qualityId) || QUALITIES[0];
  const selectedSource = useMemo(() => {
    if (!sources.length) return null;
    const ranked = sources
      .map((source) => ({ source, rank: qualityRank(source.quality) }))
      .filter(({ rank }) => rank > 0 && rank <= quality.cap)
      .sort((a, b) => b.rank - a.rank);
    return ranked[0]?.source || sources[0];
  }, [sources, quality.cap]);

  const resetControls = useCallback(() => {
    setControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => {
      if (!menu && !moreLike && !loading) setControls(false);
    }, 3200);
  }, [loading, menu, moreLike]);

  const handleFatal = useCallback(() => setLoading(false), []);
  useEffect(() => { fatalRef.current = handleFatal; }, [handleFatal]);
  const { load } = useHlsPlayer(videoRef, fatalRef);

  useEffect(() => {
    if (!selectedSource) return;
    const video = videoRef.current;
    restoreTimeRef.current = video?.currentTime || 0;
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
    const onProgress = () => {
      if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
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

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => {
      document.removeEventListener('fullscreenchange', onFs);
      document.removeEventListener('webkitfullscreenchange', onFs);
    };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.querySelectorAll('track').forEach((track) => track.remove());
    subtitles.forEach((sub) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = sub.url;
      track.label = sub.label;
      track.srclang = sub.language.slice(0, 2);
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
    if (video.paused) video.play().catch(() => undefined);
    else video.pause();
    resetControls();
  };

  const seek = (delta: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta));
    resetControls();
  };

  const seekPointer = (event: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    const rect = event.currentTarget.getBoundingClientRect();
    video.currentTime = Math.max(0, Math.min(duration, ((event.clientX - rect.left) / rect.width) * duration));
  };

  const changeVolume = (value: number) => {
    const video = videoRef.current;
    if (!video) return;
    const next = Math.max(0, Math.min(1, value));
    video.volume = next;
    video.muted = next === 0;
    setVolume(next);
    setMuted(next === 0);
  };

  const toggleMute = () => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  };

  const toggleFullscreen = async () => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      await document.exitFullscreen?.();
      return;
    }
    const root = rootRef.current;
    if (root?.requestFullscreen) await root.requestFullscreen();
    else await (root as any)?.webkitRequestFullscreen?.();
  };

  const selectQuality = (id: (typeof QUALITIES)[number]['id']) => {
    if (id === qualityId) {
      setMenu(null);
      return;
    }
    restoreTimeRef.current = videoRef.current?.currentTime || 0;
    setQualityId(id);
    setMenu(null);
    resetControls();
  };

  const selectServer = (id: string) => {
    if (id === serverId) {
      setMenu(null);
      return;
    }
    restoreTimeRef.current = videoRef.current?.currentTime || 0;
    setServerId(id);
    setMenu(null);
    resetControls();
  };

  if (!Number.isFinite(tmdbId)) return <div className="min-h-screen bg-black" />;

  const progress = duration ? Math.min(100, Math.max(0, currentTime / duration * 100)) : 0;
  const bufferedProgress = duration ? Math.min(100, Math.max(0, buffered / duration * 100)) : 0;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] overflow-hidden select-none bg-black"
      style={{ cursor: controls || menu || moreLike ? 'default' : 'none' }}
      onMouseMove={resetControls}
      onTouchStart={resetControls}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full cursor-pointer object-contain bg-black"
        crossOrigin="anonymous"
        playsInline
        onClick={togglePlay}
      />

      <div className={`absolute inset-0 z-[210] bg-gradient-to-b from-black/70 via-transparent to-black/90 transition-opacity duration-300 ${controls || menu || moreLike ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
        <div className="absolute inset-x-0 top-0 flex items-start gap-3 px-4 py-4 md:px-8 md:py-6">
          <button onClick={() => navigate(`/title/${mediaType}/${tmdbId}`)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/5 bg-white/10 text-white backdrop-blur-md transition-all hover:bg-white/20 md:h-11 md:w-11" aria-label="Back">
            <ArrowLeft className="h-6 w-6 md:h-7 md:w-7" />
          </button>
          <div className="pt-1 text-lg font-bold leading-tight tracking-wide text-white md:text-xl">{titleName}</div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 md:px-8 md:pb-6">
          <div className="flex items-center justify-center pb-3 md:justify-end md:gap-4">
            <div className="flex items-center gap-1 rounded-full border border-white/15 bg-white/10 p-1 shadow-sm backdrop-blur-md">
              <button onClick={() => selectServer('s11')} className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${serverId === 's11' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Server 1</button>
              <button onClick={() => selectServer('s40')} className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide transition-colors ${serverId === 's40' ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>Server 2</button>
            </div>
            <button onClick={() => setMoreLike(true)} className="flex items-center gap-1.5 rounded-full border border-white/10 bg-black/60 px-4 py-1.5 text-xs font-semibold tracking-wide text-white/90 shadow-lg backdrop-blur-md transition-all hover:text-white md:hidden">
              <span>More Like This</span><ChevronUp className="h-3.5 w-3.5" />
            </button>
          </div>

          <div className="relative mb-2 flex items-center gap-2 md:gap-3">
            <div className="group/seek relative h-5 flex-1 cursor-pointer" onPointerDown={seekPointer}>
              <div className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25 transition-all duration-150">
                <div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white/40" style={{ transform: `scaleX(${bufferedProgress / 100})` }} />
                <div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${progress / 100})` }} />
              </div>
              <div className="absolute left-0 top-1/2 z-10 h-4 w-4 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow-lg" style={{ left: `${progress}%` }} />
            </div>
            <span className="mr-2 shrink-0 text-xs font-semibold tabular-nums text-white md:text-sm">{formatTime(duration)}</span>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => seek(-10)} className="relative flex select-none items-center justify-center px-2 py-2 text-white/90 transition-opacity hover:text-white" aria-label="Rewind 10 seconds">
                <Rewind className="h-5 w-5 -scale-x-100 md:h-6 md:w-6" /><span className="ml-0.5 text-sm font-semibold leading-none md:text-base">10</span>
              </button>
              <button onClick={togglePlay} className="flex items-center justify-center p-2 text-white" aria-label={playing ? 'Pause' : 'Play'}>
                {playing ? <Pause className="h-8 w-8 md:h-10 md:w-10" /> : <Play className="h-8 w-8 fill-current md:h-10 md:w-10" />}
              </button>
              <button onClick={() => seek(10)} className="relative flex select-none items-center justify-center px-2 py-2 text-white/90 transition-opacity hover:text-white" aria-label="Forward 10 seconds">
                <span className="mr-0.5 text-sm font-semibold leading-none md:text-base">10</span><FastForward className="h-5 w-5 md:h-6 md:w-6" />
              </button>
              <div className="flex items-center" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}>
                <button onClick={toggleMute} className="flex items-center justify-center p-1.5 text-white" aria-label="Volume">
                  {muted || volume === 0 ? <VolumeX className="h-6 w-6 md:h-7 md:w-7" /> : <Volume2 className="h-6 w-6 md:h-7 md:w-7" />}
                </button>
                <div className={`overflow-hidden transition-all duration-200 ${showVolume ? 'w-24 opacity-100' : 'w-0 opacity-0'}`}>
                  <div className="relative mx-2 flex h-5 w-20 items-center">
                    <input min="0" max="100" step="1" type="range" value={Math.round(volume * 100)} onChange={(e) => changeVolume(Number(e.target.value) / 100)} className="absolute inset-0 z-10 h-full w-full cursor-pointer opacity-0" aria-label="Volume level" />
                    <div className="relative h-1 w-full overflow-hidden rounded-full bg-white/25"><div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${volume})` }} /></div>
                    <div className="pointer-events-none absolute left-0 top-1/2 h-3 w-3 -translate-x-1/2 -translate-y-1/2 rounded-full bg-white shadow" style={{ left: `${volume * 100}%` }} />
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute left-1/2 hidden -translate-x-1/2 items-center md:flex">
              <button onClick={() => setMoreLike(true)} className="relative flex items-center justify-center gap-1.5 px-2 py-2 text-base font-semibold text-white/90 transition-opacity hover:text-white">
                <span>More Like This</span><ChevronUp className="mt-0.5 h-4 w-4" />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
              <div className="relative">
                <button onClick={() => setMenu(menu === 'quality' ? null : 'quality')} className="flex items-center gap-2 rounded-lg p-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white">
                  <Settings2 className="h-6 w-6" />
                  <span className="hidden md:inline">Quality</span>
                  <span className="hidden font-normal opacity-50 md:inline">{selectedSource?.quality || '1080p'}</span>
                </button>
                {menu === 'quality' ? (
                  <div className="fixed left-1/2 top-[66px] z-50 min-w-[14rem] max-w-[calc(100vw-1rem)] -translate-x-1/2 origin-top transition-all duration-200 md:absolute md:left-auto md:right-0 md:top-full md:translate-x-0 md:pt-2 md:origin-top-right">
                    <div className="flex w-max max-w-[calc(100vw-1rem)] flex-col rounded-xl border border-white/10 bg-black/50 py-2 text-sm text-white shadow-2xl backdrop-blur-2xl">
                      <div className="flex">
                        <div className="flex-1 py-2">
                          <div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Quality</div>
                          <div className="flex max-h-[250px] flex-col overflow-y-auto">
                            {QUALITIES.map((q) => (
                              <SettingButton key={q.id} selected={qualityId === q.id} onClick={() => selectQuality(q.id)} subtitle={`Up to ${q.cap}p`}>{q.label}</SettingButton>
                            ))}
                          </div>
                        </div>
                        <div className="flex-1 border-l border-white/10 py-2">
                          <div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Server</div>
                          <div className="flex max-h-[250px] flex-col overflow-y-auto">
                            {SERVERS.map((server) => (
                              <button key={server.id} onClick={() => selectServer(server.id)} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10">
                                <span className="w-4 shrink-0 text-blue-400" style={{ opacity: serverId === server.id ? 1 : 0 }}>✓</span>
                                <ServerIcon kind={server.icon} />
                                <div className="flex-1 font-semibold text-[15px]">{server.name}</div>
                              </button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mx-4 my-1 h-px bg-white/10" />
                      <button className="flex items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white/60 transition-colors hover:text-white"><CircleAlert className="h-4 w-4" />Report an Issue</button>
                    </div>
                  </div>
                ) : null}
              </div>

              <div className="relative">
                <button onClick={() => setMenu(menu === 'audio' ? null : 'audio')} className="flex items-center gap-2 rounded-lg p-2 text-sm font-semibold text-white/90 transition-all hover:bg-white/10 hover:text-white">
                  <Captions className="h-6 w-6" /><span className="hidden md:inline">Audio &amp; Subtitles</span>
                </button>
                {menu === 'audio' ? (
                  <div className="fixed left-1/2 top-[66px] z-50 w-[340px] max-w-[calc(100vw-1rem)] -translate-x-1/2 origin-top transition-all duration-200 md:absolute md:left-auto md:right-0 md:top-full md:translate-x-0 md:pt-2 md:origin-top-right">
                    <div className="rounded-xl border border-white/10 bg-black/50 py-2 text-sm text-white shadow-2xl backdrop-blur-2xl">
                      <div className="flex">
                        <div className="flex-1 py-2">
                          <div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Audio</div>
                          <div className="flex max-h-[250px] flex-col overflow-y-auto">
                            <button onClick={() => { setAudio('Hindi'); setMenu(null); }} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 text-blue-400" style={{ opacity: audio === 'Hindi' ? 1 : 0 }}>✓</span><span className="text-sm">🇮🇳</span><div className="flex-1"><div className="font-semibold text-[15px] leading-tight">Hindi</div><div className="mt-0.5 text-[13px] text-white/50">Original</div></div></button>
                            <button onClick={() => { setAudio('English'); setMenu(null); }} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 text-blue-400" style={{ opacity: audio === 'English' ? 1 : 0 }}>✓</span><span className="text-sm">🇺🇸</span><div className="flex-1"><div className="font-semibold text-[15px] leading-tight">English</div></div></button>
                          </div>
                        </div>
                        <div className="flex-1 border-l border-white/10 py-2">
                          <div className="mb-2 px-5 text-[11px] font-bold uppercase tracking-wider text-white/50">Subtitles</div>
                          <div className="flex max-h-[250px] flex-col overflow-y-auto">
                            <button onClick={() => { setSubtitle('Off'); setMenu(null); }} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 text-blue-400" style={{ opacity: subtitle === 'Off' ? 1 : 0 }}>✓</span><div className="font-semibold text-[15px]">Off</div></button>
                            {subtitles.map((sub, index) => (
                              <button key={`${sub.label}-${index}`} onClick={() => { setSubtitle(sub.label); setMenu(null); }} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="w-4 text-blue-400" style={{ opacity: subtitle === sub.label ? 1 : 0 }}>✓</span><div className="font-semibold text-[15px]">{sub.label}</div></button>
                            ))}
                          </div>
                        </div>
                      </div>
                      <div className="mx-4 my-1 h-px bg-white/10" />
                      <button className="flex w-full items-center justify-center gap-2 px-4 py-3 text-xs font-semibold text-white/60 transition-colors hover:text-white"><CircleAlert className="h-4 w-4" />Report an Issue</button>
                    </div>
                  </div>
                ) : null}
              </div>

              <button onClick={toggleFullscreen} className="p-2 text-white/90 transition-opacity hover:text-white" aria-label="Fullscreen"><Maximize className="h-6 w-6 md:h-7 md:w-7" /></button>
            </div>
          </div>
        </div>

        {moreLike ? (
          <div className="absolute inset-0 z-[220] flex flex-col overflow-hidden bg-black/80 text-white backdrop-blur-md">
            <div className="flex shrink-0 items-center justify-between px-6 py-5 md:px-10">
              <div className="flex min-w-0 items-baseline gap-4"><h2 className="text-2xl font-bold tracking-wide md:text-[26px]">More Like This</h2><span className="line-clamp-1 text-sm font-medium text-white/40 md:text-lg">{titleName}</span></div>
              <button onClick={() => setMoreLike(false)} className="rounded-full p-2.5 transition-colors hover:bg-white/10" aria-label="Close"><X className="h-7 w-7" /></button>
            </div>
            <div className="mx-6 h-px shrink-0 bg-white/10 md:mx-10" />
            <div className="flex-1 overflow-y-auto px-6 pb-32 pt-4 md:px-10 md:pt-6">
              <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 md:gap-6 lg:grid-cols-5">
                {(((title as any)?.similar?.results || (title as any)?.recommendations?.results || []) as any[]).slice(0, 20).map((item: any) => (
                  <a key={item.id} href={`/title/${item.media_type || mediaType}/${item.id}`} className="group flex w-full flex-col gap-2 transition-all duration-200">
                    <div className="relative aspect-video w-full overflow-hidden rounded-xl border border-white/10 bg-white/5 shadow-[0_4px_20px_rgba(0,0,0,0.3)]">
                      <img alt={item.title || item.name || ''} loading="lazy" src={item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : ''} className="absolute inset-0 z-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" />
                      <div className="absolute inset-0 z-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent opacity-80 transition-opacity duration-300 group-hover:opacity-60" />
                      <div className="absolute bottom-1.5 left-1.5 right-1.5 z-10 flex items-end justify-between gap-2 sm:bottom-2 sm:left-2 sm:right-2">
                        {item.vote_average ? <div className="rounded bg-black/60 px-1 py-0.5 text-[9px] font-bold text-white backdrop-blur-md sm:px-1.5 sm:text-[11px]">★ {Number(item.vote_average).toFixed(1)}</div> : <span />}
                        <div className="flex h-6 w-6 translate-y-2 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white opacity-0 backdrop-blur-md transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 sm:h-7 sm:w-7"><Play className="h-3 w-3 fill-current" /></div>
                      </div>
                    </div>
                    <div className="flex flex-col px-0.5"><h3 className="truncate text-[12px] font-medium leading-snug text-white/90 transition-colors duration-200 group-hover:text-white sm:text-[14px]">{item.title || item.name}</h3><div className="mt-1 truncate text-[9px] font-medium leading-none text-white/50 sm:text-[11px]">{String(item.release_date || item.first_air_date || '').slice(0, 4)}<span className="mx-1">•</span><span className="uppercase tracking-wider">{String(item.media_type || mediaType)}</span></div></div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        ) : null}
      </div>

      {sourceLoading || loading ? <div className="pointer-events-none absolute inset-0 z-[230] flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white/70" /></div> : null}
    </div>
  );
}
