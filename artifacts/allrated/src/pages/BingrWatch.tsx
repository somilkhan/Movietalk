import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useGetTitleDetail } from '@workspace/api-client-react';
import {
  ArrowLeft, ChevronDown, ChevronUp, CircleAlert, Expand, FastForward, Gauge,
  Loader2, Maximize, Pause, Play, Rewind, Settings2, Volume2, VolumeX, X,
} from 'lucide-react';
import { useBingrSources } from '@/hooks/useBingrSources';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';

const SERVERS = [
  { id: 's11', name: 'Sirius', cc: 'GL' },
  { id: 's40', name: 'DarkMatter', cc: 'GL' },
  { id: 's12', name: 'Quasar', cc: 'GL' },
  { id: 's30', name: 'Apollo', cc: 'US' },
  { id: 's1', name: 'Miller', cc: 'US' },
  { id: 's2', name: 'Mann', cc: 'US' },
  { id: 's3', name: 'Edmunds', cc: 'US' },
  { id: 's4', name: 'Luna', cc: 'US' },
  { id: 's5', name: 'Aditya', cc: 'IN' },
] as const;

const QUALITIES = [
  { id: 'cinematic', label: 'Cinematic', cap: 1080 },
  { id: 'theatrical', label: 'Theatrical', cap: 720 },
  { id: 'smooth', label: 'Smooth', cap: 480 },
] as const;

function formatTime(value: number) {
  if (!Number.isFinite(value) || value < 0) return '0:00';
  const h = Math.floor(value / 3600);
  const m = Math.floor((value % 3600) / 60);
  const s = Math.floor(value % 60);
  return h > 0 ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`;
}

function qualityRank(q: string) {
  const m = q.match(/(2160|1080|720|480|360|240)/);
  return m ? Number(m[1]) : 0;
}

function serverIcon(cc: string) {
  return cc === 'IN' ? '🇮🇳' : cc === 'US' ? '🇺🇸' : '◈';
}

export default function BingrWatch() {
  const params = useParams<{ mediaType: string; id: string }>();
  const [, navigate] = useLocation();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const tmdbId = Number(params.id);
  const [serverId, setServerId] = useState('s11');
  const [qualityId, setQualityId] = useState<(typeof QUALITIES)[number]['id']>('cinematic');
  const [menu, setMenu] = useState<'quality' | 'audio' | null>(null);
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

  const { data: title } = useGetTitleDetail(mediaType, tmdbId, { query: { enabled: Number.isFinite(tmdbId) } });
  const titleName = title?.title || title?.name || '';
  const year = (title?.release_date || title?.first_air_date || '').slice(0, 4);
  const { sources, subtitles, loading: sourceLoading } = useBingrSources(serverId, mediaType, tmdbId, titleName, year, 1, 1);

  const quality = QUALITIES.find((q) => q.id === qualityId)!;
  const selectedSource = useMemo(() => {
    if (!sources.length) return null;
    const withinCap = sources.filter((s) => qualityRank(s.quality) <= quality.cap && qualityRank(s.quality) > 0);
    return (withinCap.sort((a, b) => qualityRank(b.quality) - qualityRank(a.quality))[0] || sources[0]);
  }, [sources, quality.cap]);

  const resetControls = useCallback(() => {
    setControls(true);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => setControls(false), 3200);
  }, []);

  const handleFatal = useCallback(() => {
    setLoading(false);
  }, []);
  useEffect(() => { fatalRef.current = handleFatal; }, [handleFatal]);
  const { load } = useHlsPlayer(videoRef, fatalRef);

  useEffect(() => {
    if (!selectedSource) return;
    setLoading(true);
    load(selectedSource.url, selectedSource.type);
  }, [load, selectedSource?.url, selectedSource?.type]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => { setPlaying(true); setLoading(false); resetControls(); };
    const onPause = () => setPlaying(false);
    const onTime = () => setCurrentTime(video.currentTime || 0);
    const onDuration = () => setDuration(video.duration || 0);
    const onProgress = () => {
      if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1));
    };
    const onWaiting = () => setLoading(true);
    const onPlaying = () => setLoading(false);
    video.addEventListener('play', onPlay); video.addEventListener('pause', onPause);
    video.addEventListener('timeupdate', onTime); video.addEventListener('durationchange', onDuration);
    video.addEventListener('progress', onProgress); video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    return () => {
      video.removeEventListener('play', onPlay); video.removeEventListener('pause', onPause);
      video.removeEventListener('timeupdate', onTime); video.removeEventListener('durationchange', onDuration);
      video.removeEventListener('progress', onProgress); video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
    };
  }, [resetControls]);

  useEffect(() => () => { if (timerRef.current) clearTimeout(timerRef.current); }, []);

  useEffect(() => {
    const onFs = () => setFullscreen(Boolean(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onFs);
    document.addEventListener('webkitfullscreenchange', onFs);
    return () => { document.removeEventListener('fullscreenchange', onFs); document.removeEventListener('webkitfullscreenchange', onFs); };
  }, []);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    video.querySelectorAll('track').forEach((el) => el.remove());
    subtitles.forEach((sub) => {
      const t = document.createElement('track');
      t.kind = 'subtitles'; t.src = sub.url; t.label = sub.label; t.srclang = sub.language.slice(0, 2);
      video.appendChild(t);
    });
  }, [subtitles]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    Array.from(video.textTracks).forEach((t) => { t.mode = 'disabled'; });
    if (subtitle !== 'Off') {
      const track = Array.from(video.textTracks).find((t) => t.label === subtitle);
      if (track) track.mode = 'showing';
    }
  }, [subtitle, subtitles]);

  const togglePlay = () => {
    const video = videoRef.current; if (!video) return;
    if (video.paused) video.play().catch(() => {}); else video.pause();
    resetControls();
  };
  const seek = (delta: number) => {
    const video = videoRef.current; if (!video) return;
    video.currentTime = Math.max(0, Math.min(video.duration || 0, video.currentTime + delta)); resetControls();
  };
  const seekPointer = (e: React.PointerEvent<HTMLDivElement>) => {
    const video = videoRef.current, el = e.currentTarget;
    if (!video || !duration) return;
    const rect = el.getBoundingClientRect();
    video.currentTime = ((e.clientX - rect.left) / rect.width) * duration;
  };
  const changeVolume = (v: number) => {
    const video = videoRef.current; if (!video) return;
    const clamped = Math.max(0, Math.min(1, v)); video.volume = clamped; video.muted = clamped === 0;
    setVolume(clamped); setMuted(clamped === 0);
  };
  const toggleMute = () => {
    const video = videoRef.current; if (!video) return;
    video.muted = !video.muted; setMuted(video.muted);
  };
  const toggleFullscreen = async () => {
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      await document.exitFullscreen?.(); return;
    }
    const root = rootRef.current;
    if (root?.requestFullscreen) await root.requestFullscreen();
    else (root as any)?.webkitRequestFullscreen?.();
  };
  const switchQuality = (id: (typeof QUALITIES)[number]['id']) => {
    setQualityId(id); setMenu(null); resetControls();
  };

  if (!Number.isFinite(tmdbId)) return <div className="min-h-screen bg-black" />;

  return (
    <div
      ref={rootRef}
      className="fixed inset-0 z-[200] bg-black overflow-hidden select-none"
      onMouseMove={resetControls}
      onTouchStart={resetControls}
      style={{ cursor: controls ? 'default' : 'none' }}
    >
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-contain bg-black cursor-pointer"
        playsInline
        crossOrigin="anonymous"
        onClick={togglePlay}
      />

      <div className={`absolute inset-0 z-[210] bg-gradient-to-b from-black/70 via-transparent to-black/90 transition-opacity duration-300 ${controls || menu || moreLike ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
        <div className="absolute inset-x-0 top-0 flex items-start gap-3 px-4 py-4 md:px-8 md:py-6">
          <button onClick={() => navigate(`/title/${mediaType}/${tmdbId}`)} className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 backdrop-blur-md border border-white/5 text-white transition hover:bg-white/20" aria-label="Back">
            <ArrowLeft className="h-6 w-6" />
          </button>
          <div className="pt-1 text-lg md:text-xl font-bold leading-tight tracking-wide text-white">{titleName}</div>
        </div>

        <div className="absolute inset-x-0 bottom-0 px-4 pb-4 md:px-8 md:pb-6">
          <div className="flex items-center justify-center pb-3 md:justify-end">
            <div className="flex items-center gap-1 rounded-full bg-white/10 p-1 shadow-sm backdrop-blur-md border border-white/15">
              <button className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${serverId === 's11' ? 'bg-white text-black' : 'text-white/70'}`} onClick={() => setServerId('s11')}>Server 1</button>
              <button className={`rounded-full px-3 py-1 text-[11px] font-semibold uppercase tracking-wide ${serverId === 's40' ? 'bg-white text-black' : 'text-white/70'}`} onClick={() => setServerId('s40')}>Server 2</button>
            </div>
          </div>

          <div className="relative mb-2 flex items-center gap-2 md:gap-3">
            <div className="group/seek relative h-5 flex-1 cursor-pointer" onPointerDown={seekPointer}>
              <div className="absolute left-0 right-0 top-1/2 h-[6px] -translate-y-1/2 overflow-hidden rounded-full bg-white/25">
                <div className="absolute inset-y-0 left-0 rounded-full bg-white/40 origin-left" style={{ width: `${duration ? Math.min(100, buffered / duration * 100) : 0}%` }} />
                <div className="absolute inset-y-0 left-0 rounded-full bg-white origin-left" style={{ width: `${duration ? Math.min(100, currentTime / duration * 100) : 0}%` }} />
              </div>
              <div className="absolute top-1/2 h-4 w-4 -translate-y-1/2 -translate-x-1/2 rounded-full bg-white shadow-lg" style={{ left: `${duration ? Math.min(100, currentTime / duration * 100) : 0}%` }} />
            </div>
            <span className="mr-2 shrink-0 text-xs font-semibold tabular-nums text-white md:text-sm">{formatTime(duration)}</span>
          </div>

          <div className="relative flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button className="relative flex items-center justify-center px-2 py-2 text-white/90 hover:text-white" onClick={() => seek(-10)} aria-label="Rewind 10 seconds"><Rewind className="h-5 w-5 md:h-6 md:w-6"/><span className="ml-0.5 text-sm md:text-base font-semibold">10</span></button>
              <button className="p-2 text-white" onClick={togglePlay} aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="h-8 w-8 md:h-10 md:w-10"/> : <Play className="h-8 w-8 md:h-10 md:w-10 fill-current"/>}</button>
              <button className="relative flex items-center justify-center px-2 py-2 text-white/90 hover:text-white" onClick={() => seek(10)} aria-label="Forward 10 seconds"><span className="mr-0.5 text-sm md:text-base font-semibold">10</span><FastForward className="h-5 w-5 md:h-6 md:w-6"/></button>
              <div className="flex items-center">
                <button className="p-1.5 text-white" onClick={toggleMute} onMouseEnter={() => setShowVolume(true)} aria-label="Volume">{muted || volume === 0 ? <VolumeX className="h-6 w-6 md:h-7 md:w-7"/> : <Volume2 className="h-6 w-6 md:h-7 md:w-7"/>}</button>
                <div className={`overflow-hidden transition-all duration-200 ${showVolume ? 'w-24 opacity-100' : 'w-0 opacity-0'}`} onMouseLeave={() => setShowVolume(false)}>
                  <input className="mx-2 w-20 accent-white" type="range" min="0" max="100" value={Math.round(volume * 100)} onChange={(e) => changeVolume(Number(e.target.value) / 100)} />
                </div>
              </div>
            </div>

            <div className="hidden md:flex absolute left-1/2 -translate-x-1/2 items-center">
              <button onClick={() => setMoreLike(true)} className="relative flex items-center justify-center gap-1.5 px-2 py-2 text-base font-semibold text-white/90 hover:text-white">
                <span>More Like This</span><ChevronUp className="h-4 w-4 mt-0.5" />
              </button>
            </div>

            <div className="flex items-center gap-2 md:gap-3">
              <div className="relative">
                <button className="flex items-center gap-2 rounded-lg p-2 text-white/90 transition hover:bg-white/10 hover:text-white" onClick={() => setMenu(menu === 'quality' ? null : 'quality')}>
                  <Settings2 className="h-6 w-6" /><span className="hidden md:inline">Quality</span><span className="hidden md:inline opacity-50 font-normal">{selectedSource?.quality || `${quality.cap}p`}</span>
                </button>
                {menu === 'quality' && (
                  <div className="fixed left-1/2 top-[66px] z-50 -translate-x-1/2 min-w-[14rem] max-w-[calc(100vw-1rem)] origin-top md:absolute md:left-auto md:right-0 md:top-full md:translate-x-0 md:pt-2 md:origin-top-right">
                    <div className="bg-black/50 backdrop-blur-2xl border border-white/10 text-white rounded-xl shadow-2xl py-2 text-sm flex flex-col w-max max-w-[calc(100vw-1rem)]">
                      <div className="flex">
                        <div className="flex-1 py-2">
                          <div className="text-white/50 text-[11px] font-bold px-5 mb-2 uppercase tracking-wider">Quality</div>
                          <div className="flex flex-col max-h-[250px] overflow-y-auto">
                            {QUALITIES.map((q) => <button key={q.id} onClick={() => switchQuality(q.id)} className="flex items-start gap-3 px-5 py-2.5 hover:bg-white/10 text-left transition-colors"><span className="text-blue-400 w-4 mt-0.5" style={{ opacity: qualityId === q.id ? 1 : 0 }}>✓</span><div><div className="font-semibold text-[15px]">{q.label}</div><div className="text-white/50 text-xs">Up to {q.cap}p</div></div></button>)}
                          </div>
                        </div>
                        <div className="flex-1 py-2 border-l border-white/10">
                          <div className="text-white/50 text-[11px] font-bold px-5 mb-2 uppercase tracking-wider">Server</div>
                          <div className="flex flex-col max-h-[250px] overflow-y-auto">
                            {SERVERS.map((s) => <button key={s.id} onClick={() => { setServerId(s.id); setMenu(null); }} className="flex items-center gap-3 px-5 py-2.5 text-left transition-colors hover:bg-white/10"><span className="text-blue-400 w-4" style={{ opacity: serverId === s.id ? 1 : 0 }}>✓</span><span style={{ width: 20, display: 'inline-flex', justifyContent: 'center' }}>{serverIcon(s.cc)}</span><div className="font-semibold text-[15px] flex-1">{s.name}</div></button>)}
                          </div>
                        </div>
                      </div>
                      <div className="h-px bg-white/10 my-1 mx-4" />
                      <button className="flex items-center justify-center gap-2 px-4 py-3 text-white/60 hover:text-white transition-colors text-xs font-semibold"><CircleAlert className="h-4 w-4" />Report an Issue</button>
                    </div>
                  </div>
                )}
              </div>

              <div className="relative">
                <button className="flex items-center gap-2 rounded-lg p-2 text-white/90 transition hover:bg-white/10" onClick={() => setMenu(menu === 'audio' ? null : 'audio')}>
                  <Gauge className="h-6 w-6" /><span className="hidden md:inline">Audio &amp; Subtitles</span>
                </button>
                {menu === 'audio' && (
                  <div className="fixed left-1/2 top-[66px] z-50 w-[340px] max-w-[calc(100vw-1rem)] -translate-x-1/2 origin-top md:absolute md:left-auto md:right-0 md:top-full md:translate-x-0 md:pt-2 md:origin-top-right">
                    <div className="bg-black/50 backdrop-blur-2xl border border-white/10 text-white rounded-xl shadow-2xl py-2 text-sm">
                      <div className="flex">
                        <div className="flex-1 py-2"><div className="text-white/50 text-[11px] font-bold px-5 mb-2 uppercase tracking-wider">Audio</div><div className="flex flex-col max-h-[250px] overflow-y-auto">
                          {['Hindi', 'English'].map((a) => <button key={a} onClick={() => { setAudio(a); setMenu(null); }} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/10 text-left transition-colors"><span className="text-blue-400 w-4" style={{ opacity: audio === a ? 1 : 0 }}>✓</span><span className="w-5 text-center">{a === 'Hindi' ? '🇮🇳' : '🇺🇸'}</span><div className="flex-1"><div className="font-semibold text-[15px] leading-tight">{a}</div>{a === 'Hindi' && <div className="text-white/50 text-[13px] mt-0.5">Original</div>}</div></button>)}
                        </div></div>
                        <div className="flex-1 py-2 border-l border-white/10"><div className="text-white/50 text-[11px] font-bold px-5 mb-2 uppercase tracking-wider">Subtitles</div><div className="flex flex-col max-h-[250px] overflow-y-auto">
                          {[{ label: 'Off', url: '' }, ...subtitles].map((s, i) => <button key={`${s.label}-${i}`} onClick={() => { setSubtitle(s.label); setMenu(null); }} className="flex items-center gap-3 px-5 py-2.5 hover:bg-white/10 text-left transition-colors"><span className="text-blue-400 w-4" style={{ opacity: subtitle === s.label ? 1 : 0 }}>✓</span><div className="font-semibold text-[15px]">{s.label}</div></button>)}
                        </div></div>
                      </div>
                      <div className="h-px bg-white/10 my-1 mx-4" /><button className="flex items-center justify-center gap-2 px-4 py-3 text-white/60 hover:text-white transition-colors text-xs font-semibold w-full"><CircleAlert className="h-4 w-4" />Report an Issue</button>
                    </div>
                  </div>
                )}
              </div>

              <button onClick={toggleFullscreen} className="p-2 text-white/90 hover:text-white" aria-label="Fullscreen">{fullscreen ? <X className="h-6 w-6 md:h-7 md:w-7"/> : <Maximize className="h-6 w-6 md:h-7 md:w-7"/>}</button>
            </div>
          </div>
        </div>

        {moreLike && (
          <div className="absolute inset-0 z-[220] bg-black/80 backdrop-blur-md text-white flex flex-col overflow-hidden">
            <div className="flex items-center justify-between px-6 md:px-10 py-5 shrink-0"><div className="flex items-baseline gap-4"><h2 className="text-2xl md:text-[26px] font-bold tracking-wide">More Like This</h2><span className="text-white/40 font-medium text-sm md:text-lg line-clamp-1">{titleName}</span></div><button onClick={() => setMoreLike(false)} className="p-2.5 rounded-full hover:bg-white/10" aria-label="Close"><X className="w-7 h-7"/></button></div>
            <div className="h-px bg-white/10 mx-6 md:mx-10 shrink-0" />
            <div className="flex-1 overflow-y-auto px-6 md:px-10 pb-32 pt-4 md:pt-6"><div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4 md:gap-6 mt-4">
              {(((title as any)?.similar?.results || (title as any)?.recommendations?.results || []) as any[]).slice(0, 20).map((item: any) => <a key={item.id} href={`/title/${item.media_type || (mediaType === 'tv' ? 'tv' : 'movie')}/${item.id}`} className="group flex flex-col gap-2"><div className="relative aspect-video w-full overflow-hidden rounded-xl bg-white/5 border border-white/10 shadow-[0_4px_20px_rgba(0,0,0,0.3)]"><img src={item.backdrop_path ? `https://image.tmdb.org/t/p/w780${item.backdrop_path}` : item.poster_path ? `https://image.tmdb.org/t/p/w780${item.poster_path}` : ''} alt="" className="absolute inset-0 h-full w-full object-cover transition-transform duration-500 ease-out group-hover:scale-105" loading="lazy"/><div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"/><div className="absolute bottom-2 left-2 right-2"><div className="truncate text-[12px] sm:text-[14px] font-medium text-white/90 group-hover:text-white">{item.title || item.name}</div><div className="mt-1 text-[9px] sm:text-[11px] text-white/50">{String(item.release_date || item.first_air_date || '').slice(0,4)}<span className="mx-1">•</span>{String(item.media_type || mediaType).toUpperCase()}</div></div></div></a>)}
            </div></div>
          </div>
        )}
      </div>

      {sourceLoading || loading ? <div className="absolute inset-0 z-[230] flex items-center justify-center pointer-events-none"><Loader2 className="h-8 w-8 animate-spin text-white/70" /></div> : null}
    </div>
  );
}
