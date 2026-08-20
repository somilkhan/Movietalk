export type StreamingMediaType = 'movie' | 'tv';
export type StreamType = 'hls' | 'mp4' | 'dash';

export type StreamingProviderId = 'bingr' | 'cinemove' | (string & {});

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
 * RabbitRip streaming hierarchy.
 * Server 1 = Bingr and its named source entries.
 * Server 2 = CineMove; CineMove source data is resolved at runtime.
 */
export const STREAMING_SERVERS: readonly StreamingServer[] = [
  { id: 'bingr', name: 'Bingr', provider: 'bingr', sourceIds: ['s11', 's40', 's12', 's30', 's1', 's2', 's3', 's4', 's5'] },
  { id: 'cinemove', name: 'CineMove', provider: 'cinemove', sourceIds: [] },
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
  if (serverId === 'cinemove') return getStreamingServer('cinemove');
  // Compatibility for the current player state while its label is migrated.
  if (serverId === 'cinepro') return getStreamingServer('cinemove');
  const bingrSource = BINGR_SOURCES.find((source) => source.id === serverId);
  return bingrSource ? { id: bingrSource.id, name: bingrSource.name, provider: 'bingr' as const, sourceIds: [bingrSource.id] } : null;
}

export function getStreamProvider(serverId: string) {
  if (serverId === 'cinepro') return 'cinemove' as const;
  return getStreamingServer(serverId)?.provider ?? (BINGR_SOURCES.some((source) => source.id === serverId) ? 'bingr' : null);
}

export function getBingrSource(sourceId: string) {
  return BINGR_SOURCES.find((source) => source.id === sourceId) ?? null;
}
