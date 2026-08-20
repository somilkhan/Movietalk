import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useGetTitleDetail } from '@workspace/api-client-react';
import { ArrowLeft, Captions, ChevronsLeft, ChevronsRight, Loader2, Maximize, Pause, Play, Settings2, Volume2, VolumeX } from 'lucide-react';
import { useRabbitSources } from '@/hooks/useRabbitSources';
import { BINGR_SOURCES, STREAMING_SERVERS } from '@/lib/streamingProviders';
import { useHlsPlayer } from '@/hooks/useHlsPlayer';

const QUALITIES = [
  { id: 'cinematic', label: 'Cinematic', cap: 1080 },
  { id: 'theatrical', label: 'Theatrical', cap: 720 },
  { id: 'smooth', label: 'Smooth', cap: 480 },
] as const;

type Menu = 'quality' | 'audio' | null;
function rankQuality(value: string) { const match = value.match(/(2160|1080|720|480|360|240)/); return match ? Number(match[1]) : 0; }
function timeLabel(value: number) { if (!Number.isFinite(value) || value < 0) return '0:00'; const h = Math.floor(value / 3600); const m = Math.floor((value % 3600) / 60); const s = Math.floor(value % 60); return h ? `${h}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}` : `${m}:${String(s).padStart(2, '0')}`; }
function proxyUrl(url: string) { if (!url || url.startsWith('/') || url.startsWith(window.location.origin)) return url; return `/api/proxy?url=${encodeURIComponent(url)}`; }

export default function RabbitPlayer() {
  const params = useParams<{ mediaType: string; id: string; season?: string; episode?: string }>();
  const [, navigate] = useLocation();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const tmdbId = Number(params.id);
  const season = params.season ? Number(params.season) : undefined;
  const episode = params.episode ? Number(params.episode) : undefined;
  const [serverId, setServerId] = useState<'bingr' | 'cinepro'>('bingr');
  const [sourceId, setSourceId] = useState(BINGR_SOURCES[0].id);
  const [qualityId, setQualityId] = useState<(typeof QUALITIES)[number]['id']>('cinematic');
  const [menu, setMenu] = useState<Menu>(null);
  const [playing, setPlaying] = useState(false);
  const [controls, setControls] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [buffered, setBuffered] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);
  const [audio, setAudio] = useState('');
  const [subtitle, setSubtitle] = useState('Off');
  const [notice, setNotice] = useState('');
  const [showVolume, setShowVolume] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const rootRef = useRef<HTMLDivElement>(null);
  const restoreTimeRef = useRef(0);
  const hideRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const noticeRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const fatalRef = useRef<(() => void) | null>(null);
  const { data: title } = useGetTitleDetail(mediaType, tmdbId, { query: { enabled: Number.isFinite(tmdbId) } });
  const titleName = title?.title || title?.name || '';
  const year = (title?.release_date || title?.first_air_date || '').slice(0, 4);
  const genres = Array.isArray((title as any)?.genres) ? (title as any).genres.map((g: any) => typeof g === 'string' ? g : g?.name).filter(Boolean).slice(0, 3).join(' • ') : '';
  const requestSourceId = serverId === 'bingr' ? sourceId : 'cinepro';
  const { sources, subtitles, loading: sourceLoading, error: sourceError } = useRabbitSources(requestSourceId, mediaType, tmdbId, titleName, year, season, episode);
  const availableSources = useMemo(() => serverId === 'bingr' ? BINGR_SOURCES.map((s) => ({ id: s.id, name: s.name })) : Array.from(new Map(sources.map((s) => [s.sourceId, { id: s.sourceId, name: s.sourceName }])).values()), [serverId, sources]);
  const activeSourceId = sourceId && availableSources.some((s) => s.id === sourceId) ? sourceId : availableSources[0]?.id || '';
  const quality = QUALITIES.find((q) => q.id === qualityId) || QUALITIES[0];
  const selectedSource = useMemo(() => {
    const candidates = serverId === 'cinepro' && activeSourceId ? sources.filter((s) => s.sourceId === activeSourceId) : sources;
    if (!candidates.length) return null;
    const ranked = candidates.map((s) => ({ s, rank: rankQuality(s.quality) })).filter((x) => x.rank > 0 && x.rank <= quality.cap).sort((a, b) => b.rank - a.rank);
    return ranked[0]?.s || candidates[0];
  }, [sources, serverId, activeSourceId, quality.cap]);
  const showControls = useCallback(() => { setControls(true); if (hideRef.current) clearTimeout(hideRef.current); if (playing) hideRef.current = setTimeout(() => setControls(false), 3200); }, [playing]);
  const showNotice = useCallback((message: string) => { setNotice(message); if (noticeRef.current) clearTimeout(noticeRef.current); noticeRef.current = setTimeout(() => setNotice(''), 2600); }, []);
  const handleFatal = useCallback(() => showNotice('This source failed to play. Try another source.'), [showNotice]);
  useEffect(() => { fatalRef.current = handleFatal; }, [handleFatal]);
  const { load, audioTracks, selectAudioTrack } = useHlsPlayer(videoRef, fatalRef);
  useEffect(() => { if (serverId === 'cinepro' && availableSources.length && !availableSources.some((s) => s.id === sourceId)) setSourceId(availableSources[0].id); }, [serverId, availableSources, sourceId]);
  useEffect(() => { if (!selectedSource) return; restoreTimeRef.current = videoRef.current?.currentTime || 0; load(selectedSource.url, selectedSource.type); }, [load, selectedSource?.url, selectedSource?.type]);
  useEffect(() => { if (!audioTracks.length) { setAudio(''); return; } const preferred = audioTracks.find((t) => /english|en/i.test(`${t.label} ${t.language}`)) || audioTracks[0]; setAudio(preferred.label); selectAudioTrack(preferred.id); }, [audioTracks, selectAudioTrack]);
  useEffect(() => { const video = videoRef.current; if (!video) return; video.querySelectorAll('track').forEach((t) => t.remove()); subtitles.forEach((sub) => { const track = document.createElement('track'); track.kind = 'subtitles'; track.src = proxyUrl(sub.url); track.label = sub.label; track.srclang = (sub.language || 'en').slice(0, 2).toLowerCase(); video.appendChild(track); }); }, [subtitles]);
  useEffect(() => { const video = videoRef.current; if (!video) return; Array.from(video.textTracks).forEach((t) => { t.mode = 'disabled'; }); if (subtitle !== 'Off') { const t = Array.from(video.textTracks).find((x) => x.label === subtitle); if (t) t.mode = 'showing'; } }, [subtitle, subtitles]);
  useEffect(() => { const video = videoRef.current; if (!video) return; const metadata = () => { setDuration(video.duration || 0); if (restoreTimeRef.current > 0 && Number.isFinite(video.duration)) video.currentTime = Math.min(restoreTimeRef.current, Math.max(0, video.duration - .5)); restoreTimeRef.current = 0; }; const onTime = () => setCurrentTime(video.currentTime || 0); const onProgress = () => { if (video.buffered.length) setBuffered(video.buffered.end(video.buffered.length - 1)); }; const onPlay = () => setPlaying(true); const onPause = () => setPlaying(false); const onEnd = () => { try { localStorage.setItem('movietalk:last-completed-rabbit', JSON.stringify({ id: tmdbId, mediaType, title: titleName, completedAt: Date.now() })); window.dispatchEvent(new Event('rabbit:completed')); } catch {} }; video.addEventListener('loadedmetadata', metadata); video.addEventListener('timeupdate', onTime); video.addEventListener('progress', onProgress); video.addEventListener('play', onPlay); video.addEventListener('pause', onPause); video.addEventListener('ended', onEnd); return () => { video.removeEventListener('loadedmetadata', metadata); video.removeEventListener('timeupdate', onTime); video.removeEventListener('progress', onProgress); video.removeEventListener('play', onPlay); video.removeEventListener('pause', onPause); video.removeEventListener('ended', onEnd); }; }, [mediaType, tmdbId, titleName]);
  useEffect(() => () => { if (hideRef.current) clearTimeout(hideRef.current); if (noticeRef.current) clearTimeout(noticeRef.current); }, []);
  const togglePlay = () => { const v = videoRef.current; if (!v) return; if (v.paused) void v.play().catch(() => undefined); else v.pause(); showControls(); };
  const seek = (delta: number) => { const v = videoRef.current; if (!v) return; v.currentTime = Math.max(0, Math.min(v.duration || 0, v.currentTime + delta)); showControls(); };
  const selectServer = (id: 'bingr' | 'cinepro') => { restoreTimeRef.current = videoRef.current?.currentTime || 0; setServerId(id); setSourceId(id === 'bingr' ? BINGR_SOURCES[0].id : ''); setMenu(null); showControls(); };
  const selectSource = (id: string) => { restoreTimeRef.current = videoRef.current?.currentTime || 0; setSourceId(id); setMenu(null); showControls(); };
  const toggleMute = () => { const v = videoRef.current; if (!v) return; v.muted = !v.muted; setMuted(v.muted); showControls(); };
  const changeVolume = (value: number) => { const v = videoRef.current; if (!v) return; const next = Math.max(0, Math.min(1, value)); v.volume = next; v.muted = next === 0; setVolume(next); setMuted(next === 0); };
  const fullscreen = async () => { const root = rootRef.current; if (!root) return; if (document.fullscreenElement) { const task = document.exitFullscreen?.(); if (task) await task.catch(() => undefined); return; } const task = root.requestFullscreen?.(); if (task) await task.catch(() => undefined); };
  const progress = duration ? currentTime / duration * 100 : 0;
  const bufferedProgress = duration ? buffered / duration * 100 : 0;
  if (!Number.isFinite(tmdbId)) return <div className="min-h-screen bg-black" />;
  return <div ref={rootRef} data-testid="rabbit-player" className="fixed inset-0 z-[200] overflow-hidden select-none bg-black text-white" onMouseMove={showControls}>
    <video ref={videoRef} className="absolute inset-0 h-full w-full object-contain bg-black" crossOrigin="anonymous" playsInline onClick={togglePlay} />
    <div className={`absolute inset-0 bg-gradient-to-b from-black/70 via-transparent to-black/90 transition-opacity ${controls || menu ? 'opacity-100' : 'pointer-events-none opacity-0'}`}>
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-3 p-4 md:p-7"><div className="flex min-w-0 items-center gap-3"><button type="button" onClick={() => navigate(`/title/${mediaType}/${tmdbId}`)} className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 backdrop-blur-md" aria-label="Back"><ArrowLeft /></button><div className="min-w-0"><div className="truncate text-lg font-bold md:text-xl">{titleName}</div>{genres && <div className="truncate text-xs text-white/55">{genres}</div>}</div></div><div className="relative flex items-center gap-1"><button type="button" onClick={() => setMenu(menu === 'quality' ? null : 'quality')} className="rounded-lg p-2 hover:bg-white/10" aria-label="Quality and sources"><Settings2 className="h-6 w-6" /></button><button type="button" onClick={() => setMenu(menu === 'audio' ? null : 'audio')} className="rounded-lg p-2 hover:bg-white/10" aria-label="Audio and subtitles"><Captions className="h-6 w-6" /></button>
        {menu === 'quality' && <div className="absolute right-0 top-12 z-20 w-[min(92vw,620px)] rounded-2xl border border-white/10 bg-black/75 p-3 shadow-2xl backdrop-blur-2xl"><div className="grid grid-cols-3 gap-2"><div><div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/45">Quality</div>{QUALITIES.map((q) => <button type="button" key={q.id} onClick={() => { restoreTimeRef.current = videoRef.current?.currentTime || 0; setQualityId(q.id); setMenu(null); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${qualityId === q.id ? 'bg-white text-black' : 'hover:bg-white/10'}`}>{q.label}<span className="ml-2 text-xs opacity-50">≤{q.cap}p</span></button>)}</div><div><div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/45">Server</div>{STREAMING_SERVERS.map((s) => <button type="button" key={s.id} onClick={() => selectServer(s.id as 'bingr' | 'cinepro')} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${serverId === s.id ? 'bg-white text-black' : 'hover:bg-white/10'}`}>{s.name}</button>)}</div><div><div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/45">Source</div><div className="max-h-52 overflow-y-auto">{availableSources.length ? availableSources.map((s) => <button type="button" key={s.id} onClick={() => selectSource(s.id)} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${activeSourceId === s.id ? 'bg-white text-black' : 'hover:bg-white/10'}`}>{s.name}</button>) : <div className="px-3 py-2 text-xs text-white/45">No sources yet</div>}</div></div></div></div>}
        {menu === 'audio' && <div className="absolute right-0 top-12 z-20 w-[min(92vw,520px)] rounded-2xl border border-white/10 bg-black/75 p-3 shadow-2xl backdrop-blur-2xl"><div className="grid grid-cols-2 gap-2"><div><div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/45">Audio</div>{audioTracks.length ? audioTracks.map((t) => <button type="button" key={t.id} onClick={() => { selectAudioTrack(t.id); setAudio(t.label); setMenu(null); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${audio === t.label ? 'bg-white text-black' : 'hover:bg-white/10'}`}>{t.label}</button>) : <div className="px-3 py-2 text-xs text-white/45">No alternate audio tracks</div>}</div><div><div className="px-3 py-2 text-[11px] font-bold uppercase tracking-wider text-white/45">Subtitles</div><button type="button" onClick={() => { setSubtitle('Off'); setMenu(null); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${subtitle === 'Off' ? 'bg-white text-black' : 'hover:bg-white/10'}`}>Off</button>{subtitles.map((s, i) => <button type="button" key={`${s.label}-${i}`} onClick={() => { setSubtitle(s.label); setMenu(null); }} className={`block w-full rounded-lg px-3 py-2 text-left text-sm ${subtitle === s.label ? 'bg-white text-black' : 'hover:bg-white/10'}`}>{s.label}</button>)}</div></div></div>}
      </div></div>
      <div className="absolute inset-x-0 bottom-0 p-4 md:p-7"><div className="mb-3 flex justify-center"><div className="flex gap-1 rounded-full border border-white/15 bg-black/45 p-1 backdrop-blur-md">{STREAMING_SERVERS.map((s) => <button type="button" key={s.id} onClick={() => selectServer(s.id as 'bingr' | 'cinepro')} className={`rounded-full px-4 py-1.5 text-xs font-semibold ${serverId === s.id ? 'bg-white text-black' : 'text-white/70 hover:text-white'}`}>{s.name}</button>)}</div></div><div className="mb-2 flex items-center gap-3"><div className="relative h-5 flex-1 cursor-pointer" onClick={(e) => { const v = videoRef.current; if (!v || !duration) return; const r = e.currentTarget.getBoundingClientRect(); v.currentTime = ((e.clientX-r.left)/r.width)*duration; }}><div className="absolute top-1/2 h-1.5 w-full -translate-y-1/2 rounded-full bg-white/25"><div className="h-full origin-left rounded-full bg-white/40" style={{ transform: `scaleX(${bufferedProgress/100})` }} /><div className="absolute inset-y-0 left-0 w-full origin-left rounded-full bg-white" style={{ transform: `scaleX(${progress/100})` }} /></div></div><span className="text-xs tabular-nums">{timeLabel(currentTime)} / {timeLabel(duration)}</span></div><div className="flex items-center justify-between"><div className="flex items-center gap-2"><button type="button" onClick={() => seek(-10)} className="flex items-center gap-1 p-2" aria-label="Rewind 10 seconds"><ChevronsLeft />10</button><button type="button" onClick={togglePlay} className="p-2" aria-label={playing ? 'Pause' : 'Play'}>{playing ? <Pause className="h-9 w-9" /> : <Play className="h-9 w-9 fill-current" />}</button><button type="button" onClick={() => seek(10)} className="flex items-center gap-1 p-2" aria-label="Forward 10 seconds">10<ChevronsRight /></button><div className="flex items-center" onMouseEnter={() => setShowVolume(true)} onMouseLeave={() => setShowVolume(false)}><button type="button" onClick={toggleMute} className="p-2" aria-label="Volume">{muted || volume === 0 ? <VolumeX /> : <Volume2 />}</button>{showVolume && <input aria-label="Volume level" type="range" min="0" max="1" step=".01" value={volume} onChange={(e) => changeVolume(Number(e.target.value))} className="w-20 accent-white" />}</div></div><button type="button" onClick={fullscreen} className="p-2" aria-label="Fullscreen"><Maximize /></button></div></div>
    </div>
    {(sourceLoading || !selectedSource) && <div className="pointer-events-none absolute inset-0 z-30 flex items-center justify-center"><Loader2 className="h-8 w-8 animate-spin text-white/70" /></div>}
    {(sourceError || notice) && <div className="pointer-events-none absolute left-1/2 top-20 z-40 -translate-x-1/2 rounded-full border border-white/10 bg-black/80 px-4 py-2 text-xs text-white shadow-xl backdrop-blur-md">{notice || sourceError}</div>}
  </div>;
}
