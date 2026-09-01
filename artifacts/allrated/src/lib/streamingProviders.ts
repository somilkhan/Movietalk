export type StreamingMediaType = 'movie' | 'tv';
export type StreamType = 'hls' | 'mp4' | 'dash' | 'embed';
export type StreamingProviderId = 'vidrift' | 'vidsrc' | 'vidlink' | 'vidfast' | 'vidcore' | 'vidcore2' | 'superembed' | 'videasy' | 'filmu' | 'screenscape' | 'vixsrc' | (string & {});
export interface StreamingServer { id: StreamingProviderId; name: string; provider: StreamingProviderId; sourceIds: readonly string[]; }
export interface NormalizedStream { url: string; type: StreamType; quality: string; provider: { id: string; name: string }; serverId: string; serverName: string; sourceId: string; sourceName: string; audio?: Array<{ id: string; label: string; language?: string }>; subtitles?: Array<{ url: string; label: string; language: string }>; headers?: Record<string, string>; }

export const STREAMING_SERVERS: readonly StreamingServer[] = [
  { id: 'vidrift', name: 'VidRift', provider: 'vidrift', sourceIds: ['vidrift'] },
  { id: 'vidsrc', name: 'VidSrc', provider: 'vidsrc', sourceIds: ['vidsrc'] },
  { id: 'vidlink', name: 'VidLink', provider: 'vidlink', sourceIds: ['vidlink'] },
  { id: 'vidfast', name: 'VidFast', provider: 'vidfast', sourceIds: ['vidfast'] },
  { id: 'vidcore', name: 'VidCore', provider: 'vidcore', sourceIds: ['vidcore'] },
  { id: 'vidcore2', name: 'VidCore 2', provider: 'vidcore2', sourceIds: ['vidcore2'] },
  { id: 'superembed', name: 'SuperEmbed', provider: 'superembed', sourceIds: ['superembed'] },
  { id: 'videasy', name: 'Videasy', provider: 'videasy', sourceIds: ['videasy'] },
  { id: 'filmu', name: 'Filmu', provider: 'filmu', sourceIds: ['filmu'] },
  { id: 'screenscape', name: 'ScreenScape', provider: 'screenscape', sourceIds: ['screenscape'] },
  { id: 'vixsrc', name: 'VixSrc', provider: 'vixsrc', sourceIds: ['vixsrc'] },
] as const;
export const BINGR_SOURCES = STREAMING_SERVERS.map(({ id, name }) => ({ id, name }));
export function getStreamingServer(serverId: string) { return STREAMING_SERVERS.find((server) => server.id === serverId) ?? null; }
export function getStreamServer(serverId: string) { return getStreamingServer(serverId); }
export function getStreamProvider(serverId: string) { return getStreamingServer(serverId)?.provider ?? null; }
export function getBingrSource(sourceId: string) { return BINGR_SOURCES.find((source) => source.id === sourceId) ?? null; }

export function buildEmbedUrl(mediaType: StreamingMediaType, tmdbId: number, serverId: string, season?: number, episode?: number) {
  if (!Number.isFinite(tmdbId)) return null;
  const id = encodeURIComponent(String(tmdbId));
  const s = Number.isFinite(season) ? encodeURIComponent(String(season)) : '';
  const e = Number.isFinite(episode) ? encodeURIComponent(String(episode)) : '';
  switch (serverId) {
    case 'vidrift': return mediaType === 'tv' ? (s && e ? `https://embed.vidrift.in/embed/tv/${id}/${s}/${e}` : null) : `https://embed.vidrift.in/embed/movie/${id}`;
    case 'vidsrc': return mediaType === 'tv' ? (s && e ? `https://vidsrc2.ru/embed/tv/${id}/${s}/${e}` : `https://vidsrc2.ru/embed/tv/${id}`) : `https://vidsrc2.ru/embed/movie/${id}`;
    case 'vidcore': return mediaType === 'tv' ? (s && e ? `https://vidcore.org/embed/tv/${id}/${s}/${e}` : null) : `https://vidcore.org/embed/movie/${id}`;
    case 'vidcore2': return mediaType === 'tv' ? (s && e ? `https://vidcore.org/embed/series/${id}/${s}/${e}` : null) : `https://vidcore.org/embed/movie/${id}`;
    case 'superembed': return mediaType === 'tv' ? (s && e ? `https://multiembed.mov/?video_id=${id}&tmdb=1&s=${s}&e=${e}` : null) : `https://multiembed.mov/?video_id=${id}&tmdb=1`;
    case 'videasy': return mediaType === 'tv' ? (s && e ? `https://player.videasy.net/tv/${id}/${s}/${e}` : null) : `https://player.videasy.net/movie/${id}`;
    case 'filmu': return mediaType === 'tv' ? (s && e ? `https://embed.filmu.in/embed/tv/${id}/${s}/${e}` : null) : `https://embed.filmu.in/embed/movie/${id}`;
    case 'screenscape': return mediaType === 'tv' ? (s && e ? `https://flix.screenscape.me/embed?tmdb=${id}&type=tv&s=${s}&e=${e}` : null) : `https://flix.screenscape.me/embed?tmdb=${id}&type=movie`;
    case 'vixsrc': return mediaType === 'tv' ? (s && e ? `https://vixsrc.to/tv/${id}/${s}/${e}` : null) : `https://vixsrc.to/movie/${id}`;
    case 'vidlink':
    case 'vidfast':
    default: return null;
  }
}
