export type StreamingMediaType = 'movie' | 'tv';
export type StreamType = 'hls' | 'mp4' | 'dash';

export type StreamingProviderId = 'bingr' | 'cinepro' | (string & {});

export interface StreamingServer {
  id: string;
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

/**
 * RabbitRip's server hierarchy.
 *
 * Server 1 is Bingr and its named entries are Bingr sources.
 * Server 2 is CinePro; its source list is intentionally dynamic and comes
 * from the CinePro response so adding/changing providers never requires a
 * player-code change.
 */
export const STREAMING_SERVERS: readonly StreamingServer[] = [
  {
    id: 'bingr',
    name: 'Bingr',
    provider: 'bingr',
    sourceIds: ['s11', 's40', 's12', 's30', 's1', 's2', 's3', 's4', 's5'],
  },
  {
    id: 'cinepro',
    name: 'CinePro',
    provider: 'cinepro',
    sourceIds: [],
  },
] as const;

export const BINGR_SOURCES = [
  { id: 's11', name: 'Sirius' },
  { id: 's40', name: 'DarkMatter' },
  { id: 's12', name: 'Quasar' },
  { id: 's30', name: 'Apollo' },
  { id: 's1', name: 'Miller' },
  { id: 's2', name: 'Mann' },
  { id: 's3', name: 'Edmunds' },
  { id: 's4', name: 'Luna' },
  { id: 's5', name: 'Aditya' },
] as const;

export function getStreamingServer(serverId: string) {
  return STREAMING_SERVERS.find((server) => server.id === serverId) ?? null;
}

export function getStreamServer(serverId: string) {
  if (serverId === 'bingr') return getStreamingServer('bingr');
  if (serverId === 'cinepro') return getStreamingServer('cinepro');
  const bingrSource = BINGR_SOURCES.find((source) => source.id === serverId);
  return bingrSource ? { id: bingrSource.id, name: bingrSource.name, provider: 'bingr' as const, sourceIds: [bingrSource.id] } : null;
}

export function getStreamProvider(serverId: string) {
  return getStreamingServer(serverId)?.provider ?? (BINGR_SOURCES.some((source) => source.id === serverId) ? 'bingr' : null);
}

export function getBingrSource(sourceId: string) {
  return BINGR_SOURCES.find((source) => source.id === sourceId) ?? null;
}
