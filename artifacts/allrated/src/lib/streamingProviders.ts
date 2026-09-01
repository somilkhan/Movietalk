export type StreamingMediaType = 'movie' | 'tv';
export type StreamType = 'hls' | 'mp4' | 'dash' | 'embed';

export type StreamingProviderId =
  | 'vidrift'
  | 'playapi'
  | 'hindi-new'
  | 'screenscape'
  | 'vidbolt'
  | 'cinezo'
  | 'vidcore'
  | 'vidup'
  | 'hindi2'
  | 'zxcstream'
  | 'filmu'
  | 'videasy'
  | 'vidlink'
  | 'vidfast'
  | (string & {});

export interface StreamingServer {
  id: StreamingProviderId;
  name: string;
  provider: StreamingProviderId;
  sourceIds: readonly string[];
}

export interface NormalizedStream {
  url: string;
  type: StreamType;
  quality: string;
  provider: { id: string; name: string };
  serverId: string;
  serverName: string;
  sourceId: string;
  sourceName: string;
  audio?: Array<{ id: string; label: string; language?: string }>;
  subtitles?: Array<{ url: string; label: string; language: string }>;
  headers?: Record<string, string>;
}

// Provider/server identifiers observed in the supplied Firefox HAR.
// The captured player route is dynamic: /play?id=<TMDB_ID>&type=<movie|tv>&server=<SERVER>.
export const STREAMING_SERVERS: readonly StreamingServer[] = [
  { id: 'vidrift', name: 'Vidrift', provider: 'vidrift', sourceIds: ['vidrift'] },
  { id: 'playapi', name: 'PlayAPI', provider: 'playapi', sourceIds: ['playapi'] },
  { id: 'hindi-new', name: 'Hindi', provider: 'hindi-new', sourceIds: ['hindi-new'] },
  { id: 'screenscape', name: 'Screenscape', provider: 'screenscape', sourceIds: ['screenscape'] },
  { id: 'vidbolt', name: 'Vidbolt', provider: 'vidbolt', sourceIds: ['vidbolt'] },
  { id: 'cinezo', name: 'Cinezo', provider: 'cinezo', sourceIds: ['cinezo'] },
  { id: 'vidcore', name: 'Vidcore', provider: 'vidcore', sourceIds: ['vidcore'] },
  { id: 'vidup', name: 'Vidup', provider: 'vidup', sourceIds: ['vidup'] },
  { id: 'hindi2', name: 'Hindi 2', provider: 'hindi2', sourceIds: ['hindi2'] },
  { id: 'zxcstream', name: 'ZXCStream', provider: 'zxcstream', sourceIds: ['zxcstream'] },
  { id: 'filmu', name: 'Filmu', provider: 'filmu', sourceIds: ['filmu'] },
  { id: 'videasy', name: 'Videasy', provider: 'videasy', sourceIds: ['videasy'] },
  { id: 'vidlink', name: 'Vidlink', provider: 'vidlink', sourceIds: ['vidlink'] },
  { id: 'vidfast', name: 'Vidfast', provider: 'vidfast', sourceIds: ['vidfast'] },
] as const;

export const BINGR_SOURCES = STREAMING_SERVERS.map((server) => ({ id: server.id, name: server.name }));

export function getStreamingServer(serverId: string) {
  return STREAMING_SERVERS.find((server) => server.id === serverId) ?? null;
}

export function getStreamServer(serverId: string) {
  return getStreamingServer(serverId);
}

export function getStreamProvider(serverId: string) {
  return getStreamingServer(serverId)?.provider ?? null;
}

export function getBingrSource(sourceId: string) {
  return BINGR_SOURCES.find((source) => source.id === sourceId) ?? null;
}

/**
 * Build the provider player URL from dynamic title identity + selected server.
 * The base is configuration, not movie/show data, so providers can be changed
 * without changing the detail-page UI.
 */
export function buildEmbedUrl(mediaType: StreamingMediaType, tmdbId: number, serverId: string, season?: number, episode?: number) {
  const configuredBase = (import.meta.env.VITE_STREAM_PLAY_BASE_URL as string | undefined)?.trim();
  if (!configuredBase) return null;

  const url = new URL(configuredBase);
  url.searchParams.set('id', String(tmdbId));
  url.searchParams.set('type', mediaType);
  url.searchParams.set('server', serverId);
  if (mediaType === 'tv' && season && episode) {
    url.searchParams.set('season', String(season));
    url.searchParams.set('episode', String(episode));
  }
  return url.toString();
}
