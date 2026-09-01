export type StreamingMediaType = 'movie' | 'tv';
export type StreamType = 'hls' | 'mp4' | 'dash' | 'embed';

export type StreamingProviderId =
  | 'vidrift' | 'playapi' | 'hindi-new' | 'screenscape' | 'vidbolt' | 'cinezo'
  | 'vidcore' | 'vidup' | 'hindi2' | 'zxcstream' | 'filmu' | 'videasy' | 'vidlink' | 'vidfast'
  | (string & {});

export interface StreamingServer { id: StreamingProviderId; name: string; provider: StreamingProviderId; sourceIds: readonly string[]; }
export interface NormalizedStream {
  url: string; type: StreamType; quality: string; provider: { id: string; name: string };
  serverId: string; serverName: string; sourceId: string; sourceName: string;
  audio?: Array<{ id: string; label: string; language?: string }>;
  subtitles?: Array<{ url: string; label: string; language: string }>;
  headers?: Record<string, string>;
}

// Keep the selector data-driven. Only providers with a configured adapter should be
// offered as playable sources; additional licensed providers can be added without
// changing the detail-page UI.
export const STREAMING_SERVERS: readonly StreamingServer[] = [
  { id: 'vidrift', name: 'Vidrift', provider: 'vidrift', sourceIds: ['vidrift'] },
] as const;

export const BINGR_SOURCES = STREAMING_SERVERS.map(({ id, name }) => ({ id, name }));
export function getStreamingServer(serverId: string) { return STREAMING_SERVERS.find((server) => server.id === serverId) ?? null; }
export function getStreamServer(serverId: string) { return getStreamingServer(serverId); }
export function getStreamProvider(serverId: string) { return getStreamingServer(serverId)?.provider ?? null; }
export function getBingrSource(sourceId: string) { return BINGR_SOURCES.find((source) => source.id === sourceId) ?? null; }

/**
 * Build the provider's native embeddable player URL.
 * VidRift documents a direct iframe endpoint, so the detail page can keep the
 * player in-place instead of navigating to a separate playback page.
 */
export function buildEmbedUrl(mediaType: StreamingMediaType, tmdbId: number, serverId: string, season?: number, episode?: number) {
  if (serverId !== 'vidrift' || !Number.isFinite(tmdbId)) return null;

  const base = 'https://embed.vidrift.in/embed';
  if (mediaType === 'tv') {
    if (!Number.isFinite(season) || !Number.isFinite(episode)) return null;
    return `${base}/tv/${encodeURIComponent(String(tmdbId))}/${encodeURIComponent(String(season))}/${encodeURIComponent(String(episode))}`;
  }

  return `${base}/movie/${encodeURIComponent(String(tmdbId))}`;
}
