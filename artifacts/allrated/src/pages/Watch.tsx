import { useState, useEffect, useRef, useCallback } from 'react';
import { cn } from '@/lib/utils';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useParams, useLocation } from 'wouter';
import { Seo } from '@/components/Seo';
import { useGetTitleDetail } from '@workspace/api-client-react';
import {
  ArrowLeft, Play, Pause, Volume2, VolumeX,
  Maximize, Minimize, RotateCcw, Loader2, AlertCircle,
  PictureInPicture2, Monitor, Gauge, Share2, SkipForward,
} from 'lucide-react';
import { toast } from 'sonner';
import { useStreamSources } from '@/hooks/useStreamSources';
import { useBingrSources } from '@/hooks/useBingrSources';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';
import { useTvSeason } from '@/hooks/useTvSeason';
import { BackendSelector, type Backend } from '@/components/watch/BackendSelector';
import { SourceSelector } from '@/components/watch/SourceSelector';
import { EpisodeList } from '@/components/watch/EpisodeList';

interface BingrServer {
  id: string;
  name: string;
  cc: string;
}

const BINGR_SERVERS: BingrServer[] = [
  { id: 's11', name: 'Sirius', cc: 'GL' },
  { id: 's40', name: 'DarkMatter', cc: 'GL' },
  { id: 's12', name: 'Quasar', cc: 'GL' },
  { id: 's30', name: 'Apollo', cc: 'US' },
  { id: 's1', name: 'Miller', cc: 'US' },
  { id: 's2', name: 'Mann', cc: 'US' },
  { id: 's3', name: 'Edmunds', cc: 'US' },
  { id: 's4', name: 'Luna', cc: 'US' },
  { id: 's5', name: 'Aditya', cc: 'IN' },
];

function fmtTime(s: number) {
  if (!isFinite(s)) return '0:00';
  const h = Math.floor(s / 3600), m = Math.floor((s % 3600) / 60), sec = Math.floor(s % 60);
  return h > 0 ? `${h}:${String(m).padStart(2,'0')}:${String(sec).padStart(2,'0')}` : `${m}:${String(sec).padStart(2,'0')}`;
}

export default function Watch() {
  const params = useParams<{ mediaType: string; id: string }>();
  const [, navigate] = useLocation();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const tmdbId = Number(params.id);

  const [backend, setBackend] = useState<Backend>('bingr');
  const [bingrServerId, setBingrServerId] = useState<string>('s11');
  const [season, setSeason] = useState(1);
  const [tvEpisode, setTvEpisode] = useState(1);
  const [sourceIdx, setSourceIdx] = useState(0);
  const sourceIdxRef = useRef(0);
  const failedRef = useRef(new Set<number>());
  const [autoSwitching, setAutoSwitching] = useState(false);
  const [allFailed, setAllFailed] = useState(false);

  useEffect(() => { sourceIdxRef.current = sourceIdx; }, [sourceIdx]);

  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const progressRef = useRef<HTMLDivElement>(null);
  const onFatalErrorRef = useRef<(() => void) | null>(null);

  const [playing, setPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [fullscreen, setFullscreen] = useState(false);
  const [videoLoading, setVideoLoading] = useState(false);
  const [playPulse, setPlayPulse] = useState<'play' | 'pause' | null>(null);
  const [showControls, setShowControls] = useState(true);
  const controlsTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [theatreMode, setTheatreMode] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);
  const [showSpeedMenu, setShowSpeedMenu] = useState(false);
  const [showVolumeSlider, setShowVolumeSlider] = useState(false);
  const [hoverTime, setHoverTime] = useState(0);
  const [showHoverTime, setShowHoverTime] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { data: title } = useGetTitleDetail(mediaType, tmdbId, {
    query: { enabled: Number.isFinite(tmdbId) },
  });

  // ---- Movietalk (CinePro) backend ----
  const { data: streamData, loading: mtLoading, error: mtError, refetch: mtRefetch } =
    useStreamSources(mediaType, tmdbId, season, tvEpisode);
  const movietalkSources = streamData?.sources ?? [];

  // ---- Bingr backend ----
  const titleName = title?.title || title?.name || '';
  const titleYear = (title?.release_date || title?.first_air_date || '').slice(0, 4);
  const {
    sources: bingrSources,
    subtitles: bingrSubtitles,
    loading: bingrLoading,
    error: bingrError,
    refetch: bingrRefetch,
  } = useBingrSources(bingrServerId, mediaType, tmdbId, titleName, titleYear, season, tvEpisode);

  const sourcesLoading = backend === 'movietalk' ? mtLoading : bingrLoading;
  const sourcesError = backend === 'movietalk' ? mtError : bingrError;

  const activeSource = backend === 'movietalk'
    ? (movietalkSources[sourceIdx] ?? null)
    : (bingrSources[sourceIdx] ?? null);

  const seasonList = Array.isArray(title?.seasons) ? title.seasons.map((s: { season_number: number }) => s.season_number) : [1];
  const { episodes, loading: epLoading } = useTvSeason(tmdbId, season, mediaType === 'tv');

  const handleFatalError = useCallback(() => {
    if (backend === 'movietalk') {
      const idx = sourceIdxRef.current;
      failedRef.current.add(idx);
      const next = movietalkSources.findIndex((_, i) => !failedRef.current.has(i));
      if (next !== -1) { setAutoSwitching(true); setSourceIdx(next); }
      else { setAllFailed(true); }
    } else {
      // Bingr: try next source within same server, then mark failed
      const idx = sourceIdxRef.current;
      failedRef.current.add(idx);
      const next = bingrSources.findIndex((_, i) => !failedRef.current.has(i));
      if (next !== -1) { setAutoSwitching(true); setSourceIdx(next); }
      else { setAllFailed(true); }
    }
  }, [backend, movietalkSources, bingrSources]);

  useEffect(() => {
    onFatalErrorRef.current = handleFatalError;
  }, [handleFatalError]);

  const { load: loadHls } = useHlsPlayer(videoRef, onFatalErrorRef);

  useEffect(() => {
    if (!activeSource) return;
    setVideoLoading(true);
    setAllFailed(false);
    setAutoSwitching(false);
    loadHls(activeSource.url, activeSource.type);
  }, [activeSource?.url, activeSource?.type, loadHls]);

  // Load Bingr subtitles when available
  useEffect(() => {
    if (backend !== 'bingr' || bingrSubtitles.length === 0) return;
    const video = videoRef.current;
    if (!video) return;

    // Remove existing text tracks
    const existingTracks = video.querySelectorAll('track');
    existingTracks.forEach(t => t.remove());

    // Add new tracks
    bingrSubtitles.forEach((sub) => {
      const track = document.createElement('track');
      track.kind = 'subtitles';
      track.src = sub.url;
      track.srclang = sub.language.slice(0, 2);
      track.label = sub.label;
      video.appendChild(track);
    });
  }, [backend, bingrSubtitles]);

  useEffect(() => {
    setSourceIdx(0);
    setBingrServerId('s11');
    failedRef.current = new Set();
    setAllFailed(false);
    setAutoSwitching(false);
    setCurrentTime(0);
    setDuration(0);
    setBuffered(0);
    const video = videoRef.current;
    if (video) { video.pause(); video.removeAttribute('src'); video.load(); }
  }, [backend]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    const onPlay = () => { setPlaying(true); setVideoLoading(false); };
    const onPause = () => setPlaying(false);
    const onWaiting = () => setVideoLoading(true);
    const onPlaying = () => setVideoLoading(false);
    const onTimeUpdate = () => { if (!isDragging) setCurrentTime(video.currentTime); };
    const onDurationChange = () => setDuration(video.duration || 0);
    const onProgress = () => { if (video.buffered.length > 0) setBuffered(video.buffered.end(video.buffered.length - 1)); };

    video.addEventListener('play', onPlay);
    video.addEventListener('pause', onPause);
    video.addEventListener('waiting', onWaiting);
    video.addEventListener('playing', onPlaying);
    video.addEventListener('timeupdate', onTimeUpdate);
    video.addEventListener('durationchange', onDurationChange);
    video.addEventListener('progress', onProgress);

    return () => {
      video.removeEventListener('play', onPlay);
      video.removeEventListener('pause', onPause);
      video.removeEventListener('waiting', onWaiting);
      video.removeEventListener('playing', onPlaying);
      video.removeEventListener('timeupdate', onTimeUpdate);
      video.removeEventListener('durationchange', onDurationChange);
      video.removeEventListener('progress', onProgress);
    };
  }, [isDragging]);

  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (controlsTimer.current) clearTimeout(controlsTimer.current);
    controlsTimer.current = setTimeout(() => setShowControls(false), 3000);
  }, []);

  useEffect(() => {
    resetControlsTimer();
    return () => { if (controlsTimer.current) clearTimeout(controlsTimer.current); };
  }, [resetControlsTimer]);

  useEffect(() => {
    const onFsChange = () => setFullscreen(!!(document.fullscreenElement || (document as any).webkitFullscreenElement));
    document.addEventListener('fullscreenchange', onFsChange);
    document.addEventListener('webkitfullscreenchange', onFsChange);
    return () => {
      document.removeEventListener('fullscreenchange', onFsChange);
      document.removeEventListener('webkitfullscreenchange', onFsChange);
    };
  }, []);

  useKeyboardShortcuts({
    onPlayPause: useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      if (video.paused) { video.play(); setPlayPulse('play'); }
      else { video.pause(); setPlayPulse('pause'); }
      setTimeout(() => setPlayPulse(null), 700);
    }, []),
    onFullscreen: useCallback(() => {
      const container = containerRef.current;
      const video = videoRef.current;
      if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
        document.exitFullscreen?.() || (document as any).webkitExitFullscreen?.();
      } else {
        container?.requestFullscreen?.() || (container as any)?.webkitRequestFullscreen?.() || video?.webkitEnterFullscreen?.();
      }
    }, []),
    onMute: useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      video.muted = !video.muted;
      setMuted(video.muted);
    }, []),
    onSeekForward: useCallback(() => {
      const video = videoRef.current;
      if (!video || !duration) return;
      video.currentTime = Math.min(duration, video.currentTime + 10);
    }, [duration]),
    onSeekBackward: useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      video.currentTime = Math.max(0, video.currentTime - 10);
    }, []),
    onVolumeUp: useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      const newVol = Math.min(1, video.volume + 0.1);
      video.volume = newVol;
      setVolume(newVol);
      video.muted = newVol === 0;
      setMuted(newVol === 0);
    }, []),
    onVolumeDown: useCallback(() => {
      const video = videoRef.current;
      if (!video) return;
      const newVol = Math.max(0, video.volume - 0.1);
      video.volume = newVol;
      setVolume(newVol);
      video.muted = newVol === 0;
      setMuted(newVol === 0);
    }, []),
  });

  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    if (video.paused) { video.play(); setPlayPulse('play'); }
    else { video.pause(); setPlayPulse('pause'); }
    setTimeout(() => setPlayPulse(null), 700);
  }, []);

  const toggleMute = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setMuted(video.muted);
  }, []);

  const handleVolumeChange = useCallback((val: number) => {
    const video = videoRef.current;
    if (!video) return;
    video.volume = val;
    setVolume(val);
    video.muted = val === 0;
    setMuted(val === 0);
  }, []);

  const seekTo = useCallback((time: number) => {
    const video = videoRef.current;
    if (!video || !duration) return;
    video.currentTime = Math.max(0, Math.min(duration, time));
    setCurrentTime(video.currentTime);
  }, [duration]);

  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const video = videoRef.current;
    if (document.fullscreenElement || (document as any).webkitFullscreenElement) {
      document.exitFullscreen?.() || (document as any).webkitExitFullscreen?.();
    } else {
      container?.requestFullscreen?.() || (container as any)?.webkitRequestFullscreen?.() || video?.webkitEnterFullscreen?.();
    }
  }, []);

  const togglePiP = useCallback(async () => {
    const video = videoRef.current;
    if (!video) return;
    try {
      if (document.pictureInPictureElement) await document.exitPictureInPicture();
      else await video.requestPictureInPicture();
    } catch { /* ignore */ }
  }, []);

  const changeSeason = useCallback((s: number) => {
    setSeason(s);
    setTvEpisode(1);
    setSourceIdx(0);
    failedRef.current = new Set();
    setAllFailed(false);
  }, []);

  const changeEpisode = useCallback((s: number, ep: number) => {
    setSeason(s);
    setTvEpisode(ep);
    setSourceIdx(0);
    failedRef.current = new Set();
    setAllFailed(false);
  }, []);

  const selectMovietalkSource = useCallback((idx: number) => {
    setSourceIdx(idx);
    failedRef.current.delete(idx);
    setAllFailed(false);
  }, []);

  const selectBingrServer = useCallback((id: string) => {
    setBingrServerId(id);
    setSourceIdx(0);
    failedRef.current = new Set();
    setAllFailed(false);
  }, []);

  const handleBackendChange = useCallback((b: Backend) => {
    setBackend(b);
  }, []);

  const handleProgressClick = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(pct * duration);
  }, [duration, seekTo]);

  const handleProgressMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setHoverTime(pct * duration);
    setShowHoverTime(true);
  }, [duration]);

  const handleProgressMouseDown = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    setIsDragging(true);
    const bar = progressRef.current;
    if (!bar || !duration) return;
    const rect = bar.getBoundingClientRect();
    const pct = (e.clientX - rect.left) / rect.width;
    seekTo(pct * duration);

    const onMove = (ev: MouseEvent) => {
      const r = bar.getBoundingClientRect();
      const p = Math.max(0, Math.min(1, (ev.clientX - r.left) / r.width));
      seekTo(p * duration);
    };
    const onUp = () => {
      setIsDragging(false);
      window.removeEventListener('mousemove', onMove);
      window.removeEventListener('mouseup', onUp);
    };
    window.addEventListener('mousemove', onMove);
    window.addEventListener('mouseup', onUp);
  }, [duration, seekTo]);

  const progressPercent = duration ? (currentTime / duration) * 100 : 0;
  const bufferedPercent = duration ? (buffered / duration) * 100 : 0;
  const speedOptions = [0.5, 0.75, 1, 1.25, 1.5, 2];
  const copyLink = useCallback(() => {
    navigator.clipboard.writeText(window.location.href);
    toast.success('Link copied to clipboard');
  }, []);

  return (
    <div className={cn("min-h-screen bg-black", theatreMode && "theatre-mode")}>
      <Seo
        title={title ? `Watch ${title.title || title.name} — Movietalk` : 'Watch — Movietalk'}
        description={title?.overview ?? ''}
        image={title?.backdrop || title?.poster}
      />

      <div ref={containerRef} className="relative w-full bg-black select-none group/player"
        style={{ aspectRatio: theatreMode ? 'auto' : '16/9' }}
        onMouseMove={resetControlsTimer} onTouchStart={resetControlsTimer}>

        <video ref={videoRef} className="absolute inset-0 w-full h-full object-contain bg-black"
          playsInline onClick={togglePlay} onDoubleClick={toggleFullscreen} />

        {videoLoading && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-14 h-14 border-4 border-white/20 border-t-white rounded-full animate-spin" />
          </div>
        )}

        {playPulse && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-30">
            <div className="w-20 h-20 rounded-full bg-black/40 backdrop-blur-sm flex items-center justify-center animate-ping-once">
              {playPulse === 'play'
                ? <Play className="w-10 h-10 text-white fill-white ml-1" />
                : <Pause className="w-10 h-10 text-white fill-white" />}
            </div>
          </div>
        )}

        {autoSwitching && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 z-30 flex items-center gap-2 px-4 py-2 rounded-full bg-black/60 backdrop-blur-md text-white text-sm">
            <Loader2 className="w-4 h-4 animate-spin" /> Switching source…
          </div>
        )}

        {/* Top Bar */}
        <div className={cn("absolute top-0 left-0 right-0 z-20 flex items-center gap-3 px-4 md:px-6 pt-4 md:pt-5 pb-16 bg-gradient-to-b from-black/80 via-black/20 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none")}>
          <button onClick={() => navigate(`/title/${mediaType}/${tmdbId}`)}
            className="flex shrink-0 items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all">
            <ArrowLeft className="w-5 h-5" />
          </button>
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {title?.logo && (
              <div className="h-8 md:h-10 w-auto max-w-[180px] shrink-0">
                <img src={title.logo} alt={title.title} className="h-full w-auto object-contain drop-shadow-lg" />
              </div>
            )}
            <div className="min-w-0">
              <div className="text-white font-bold text-sm md:text-base leading-tight truncate">
                {title?.title || title?.name || 'Loading…'}
              </div>
              {mediaType === 'tv' && <div className="text-white/50 text-xs">S{season} E{tvEpisode}</div>}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <BackendSelector backend={backend} onChange={handleBackendChange} />
            <button onClick={copyLink}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 backdrop-blur-md border border-white/10 text-white transition-all">
              <Share2 className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className={cn("absolute bottom-0 left-0 right-0 z-20 px-4 md:px-6 pb-5 md:pb-6 pt-20 bg-gradient-to-t from-black/80 via-black/20 to-transparent transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none")}>

          {duration > 0 && (
            <div className="mb-4 group/seek">
              <div ref={progressRef}
                className="relative w-full h-1.5 bg-white/20 rounded-full cursor-pointer overflow-visible"
                onClick={handleProgressClick} onMouseMove={handleProgressMouseMove}
                onMouseLeave={() => setShowHoverTime(false)} onMouseDown={handleProgressMouseDown}>
                <div className="absolute top-0 left-0 h-full bg-white/30 rounded-full" style={{ width: `${bufferedPercent}%` }} />
                <div className="absolute top-0 left-0 h-full bg-white rounded-full transition-all duration-75" style={{ width: `${progressPercent}%` }} />
                <div className="absolute top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-lg opacity-0 group-hover/seek:opacity-100 transition-opacity" style={{ left: `calc(${progressPercent}% - 6px)` }} />
                {showHoverTime && (
                  <div className="absolute -top-8 px-2 py-1 bg-black/80 text-white text-xs rounded font-medium pointer-events-none" style={{ left: `calc(${(hoverTime / duration) * 100}% - 20px)` }}>
                    {fmtTime(hoverTime)}
                  </div>
                )}
              </div>
              <div className="flex justify-between text-xs text-white/60 mt-1.5 font-medium">
                <span>{fmtTime(currentTime)}</span>
                <span>{fmtTime(duration)}</span>
              </div>
            </div>
          )}

          <div className="flex items-center gap-2 md:gap-3">
            <button onClick={togglePlay} className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white transition-all">
              {playing ? <Pause className="w-5 h-5 fill-white" /> : <Play className="w-5 h-5 fill-white ml-0.5" />}
            </button>

            <button onClick={() => { const v = videoRef.current; if (v && duration) v.currentTime = Math.min(duration, v.currentTime + 10); }}
              className="hidden md:flex items-center justify-center w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white transition-all">
              <SkipForward className="w-4 h-4" />
            </button>

            <div className="relative flex items-center gap-2" onMouseEnter={() => setShowVolumeSlider(true)} onMouseLeave={() => setShowVolumeSlider(false)}>
              <button onClick={toggleMute} className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white transition-all">
                {muted || volume === 0 ? <VolumeX className="w-5 h-5" /> : <Volume2 className="w-5 h-5" />}
              </button>
              <div className={cn("flex items-center transition-all duration-200 overflow-hidden", showVolumeSlider ? "w-24 opacity-100" : "w-0 opacity-0")}>
                <input type="range" min={0} max={1} step={0.05} value={muted ? 0 : volume}
                  onChange={(e) => handleVolumeChange(parseFloat(e.target.value))} className="w-full h-1 accent-white cursor-pointer" />
              </div>
            </div>

            <div className="flex-1" />

            <SourceSelector
              backend={backend}
              movietalkSources={movietalkSources}
              movietalkActiveIdx={sourceIdx}
              movietalkFailedSet={failedRef.current}
              onMovietalkSelect={selectMovietalkSource}
              bingrServers={BINGR_SERVERS}
              bingrActiveId={bingrServerId}
              onBingrSelect={selectBingrServer}
            />

            <div className="relative" onMouseLeave={() => setShowSpeedMenu(false)}>
              <button onMouseEnter={() => setShowSpeedMenu(true)} onClick={() => setShowSpeedMenu(v => !v)}
                className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white transition-all">
                <Gauge className="w-4 h-4" />
              </button>
              <div className={cn("absolute bottom-full right-0 mb-2 bg-black/70 backdrop-blur-2xl border border-white/10 rounded-xl shadow-2xl py-1.5 min-w-[100px] transition-all duration-200 origin-bottom-right",
                showSpeedMenu ? "opacity-100 scale-100" : "opacity-0 scale-95 pointer-events-none")}>
                {speedOptions.map(spd => (
                  <button key={spd} onClick={() => { const v = videoRef.current; if (v) v.playbackRate = spd; setPlaybackSpeed(spd); setShowSpeedMenu(false); }}
                    className={cn("w-full text-left px-4 py-2 text-sm hover:bg-white/10 transition-colors", playbackSpeed === spd ? "text-white font-semibold" : "text-white/70")}>
                    {spd === 1 ? 'Normal' : `${spd}x`}
                  </button>
                ))}
              </div>
            </div>

            <button onClick={togglePiP} className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white transition-all">
              <PictureInPicture2 className="w-4 h-4" />
            </button>

            <button onClick={() => setTheatreMode(v => !v)} className="hidden md:flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white transition-all">
              <Monitor className="w-4 h-4" />
            </button>

            <button onClick={toggleFullscreen} className="flex items-center justify-center w-11 h-11 rounded-full bg-white/10 hover:bg-white/20 border border-white/10 backdrop-blur-sm text-white transition-all">
              {fullscreen ? <Minimize className="w-5 h-5" /> : <Maximize className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Loading overlay */}
        {sourcesLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/85 backdrop-blur-sm z-40">
            <div className="h-10 w-10 rounded-full border-2 border-white/20 border-t-white animate-spin" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">Finding streams…</p>
              <p className="text-xs text-white/40 mt-1">
                {backend === 'movietalk' ? 'Checking providers' : `Checking ${BINGR_SERVERS.find(s => s.id === bingrServerId)?.name ?? bingrServerId}`}
              </p>
            </div>
          </div>
        )}

        {/* All failed */}
        {allFailed && !sourcesLoading && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 z-40">
            <AlertCircle className="h-10 w-10 text-red-400" />
            <div className="text-center">
              <p className="text-sm font-semibold text-white">
                {backend === 'bingr' ? 'Bingr server returned no sources' : 'No working streams found'}
              </p>
              <p className="text-xs text-white/40 mt-1">
                {backend === 'bingr'
                  ? 'Try another server or switch backend.'
                  : `All ${movietalkSources.length} sources failed`}
              </p>
            </div>
            <div className="flex items-center gap-3">
              <button onClick={() => { failedRef.current = new Set(); setAllFailed(false); backend === 'movietalk' ? mtRefetch() : bingrRefetch(); }}
                className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-sm font-medium text-white transition">
                <RotateCcw className="h-3.5 w-3.5" /> Try again
              </button>
              <button onClick={() => setBackend(backend === 'movietalk' ? 'bingr' : 'movietalk')}
                className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-sm font-medium text-white transition">
                Switch to {backend === 'movietalk' ? 'Bingr' : 'Movietalk'}
              </button>
            </div>
          </div>
        )}

        {/* No sources */}
        {!sourcesLoading && !allFailed && !activeSource && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-4 bg-black/90 z-40">
            <p className="text-sm font-semibold text-white">
              {sourcesError ? 'Stream service offline' : 'No streams found'}
            </p>
            {backend === 'movietalk' && sourcesError && (
              <p className="text-xs text-white/40 max-w-xs text-center">CinePro Core isn&apos;t responding. Make sure it&apos;s running.</p>
            )}
            {backend === 'bingr' && sourcesError && (
              <p className="text-xs text-white/40 max-w-xs text-center">Bingr API error: {sourcesError}</p>
            )}
            <div className="flex items-center gap-3">
              <button onClick={() => backend === 'movietalk' ? mtRefetch() : bingrRefetch()}
                className="flex items-center gap-2 rounded-full bg-white/10 hover:bg-white/20 px-5 py-2 text-sm font-medium text-white transition">
                <RotateCcw className="h-3.5 w-3.5" /> Retry
              </button>
              <button onClick={() => setBackend(backend === 'movietalk' ? 'bingr' : 'movietalk')}
                className="flex items-center gap-2 rounded-full bg-amber-500/20 hover:bg-amber-500/30 px-5 py-2 text-sm font-medium text-amber-300 transition">
                Switch to {backend === 'movietalk' ? 'Bingr' : 'Movietalk'}
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Below player */}
      <div className="bg-[#0a0a0a] border-t border-white/6">
        {mediaType === 'tv' && (
          <EpisodeList
            episodes={episodes}
            season={season}
            tvEpisode={tvEpisode}
            playing={playing}
            loading={epLoading}
            onChangeEpisode={changeEpisode}
            seasonList={seasonList}
            onChangeSeason={changeSeason}
          />
        )}

        {/* Source pills for movie mode */}
        {mediaType === 'movie' && !sourcesLoading && backend === 'movietalk' && movietalkSources.length > 0 && (
          <div className="px-4 py-4 md:px-6 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-white/30 font-medium mr-1">Sources</span>
            {movietalkSources.map((s, i) => {
              const failed = failedRef.current.has(i);
              return (
                <button key={i} onClick={() => selectMovietalkSource(i)}
                  className={cn("rounded-full px-3 py-1 text-xs font-semibold transition flex items-center gap-1",
                    i === sourceIdx ? 'bg-white text-black' : failed ? 'bg-red-900/30 text-red-300/60 line-through' : 'bg-white/8 text-white/50 hover:bg-white/14 hover:text-white')}
                >
                  {s.provider.name}
                  {s.quality !== 'Auto' && <span className="opacity-60 ml-0.5">{s.quality}</span>}
                </button>
              );
            })}
          </div>
        )}

        {mediaType === 'movie' && !sourcesLoading && backend === 'bingr' && bingrSources.length > 0 && (
          <div className="px-4 py-4 md:px-6 flex items-center gap-2 flex-wrap">
            <span className="text-[11px] uppercase tracking-wider text-white/30 font-medium mr-1">Bingr Sources</span>
            {bingrSources.map((s, i) => {
              const failed = failedRef.current.has(i);
              return (
                <button key={i} onClick={() => selectMovietalkSource(i)}
                  className={cn("rounded-full px-3 py-1 text-xs font-semibold transition flex items-center gap-1",
                    i === sourceIdx ? 'bg-amber-500 text-black' : failed ? 'bg-red-900/30 text-red-300/60 line-through' : 'bg-white/8 text-white/50 hover:bg-white/14 hover:text-white')}
                >
                  {s.quality}
                  <span className="opacity-60 uppercase">{s.type}</span>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
