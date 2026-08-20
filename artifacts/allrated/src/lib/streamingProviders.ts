export type StreamingMediaType = 'movie' | 'tv';
export type StreamType = 'hls' | 'mp4' | 'dash';

export interface StreamServer {
  id: string;
  name: string;
  provider: 'bingr' | 'cinepro';
  group: 'server-1' | 'server-2';
}

export interface NormalizedStream {
  url: string;
  type: StreamType;
  quality: string;
  provider: { id: string; name: string };
  serverId: string;
  serverName: string;
  audio?: Array<{ id: string; label: string; language?: string }>;
  subtitles?: Array<{ url: string; label: string; language: string }>;
  headers?: Record<string, string>;
}

export const STREAM_SERVERS: readonly StreamServer[] = [
  { id: 's11', name: 'Sirius', provider: 'bingr', group: 'server-1' },
  { id: 's40', name: 'DarkMatter', provider: 'bingr', group: 'server-1' },
  { id: 's12', name: 'Quasar', provider: 'bingr', group: 'server-1' },
  { id: 's30', name: 'Apollo', provider: 'bingr', group: 'server-1' },
  { id: 's1', name: 'Miller', provider: 'bingr', group: 'server-1' },
  { id: 's2', name: 'Mann', provider: 'bingr', group: 'server-1' },
  { id: 's3', name: 'Edmunds', provider: 'bingr', group: 'server-1' },
  { id: 's4', name: 'Luna', provider: 'bingr', group: 'server-1' },
  { id: 's5', name: 'Aditya', provider: 'bingr', group: 'server-1' },
  { id: 'cinepro', name: 'CinePro', provider: 'cinepro', group: 'server-2' },
] as const;

export const STREAM_SERVER_GROUPS = [
  { id: 'server-1', name: 'Bingr', serverIds: STREAM_SERVERS.filter((server) => server.group === 'server-1').map((server) => server.id) },
  { id: 'server-2', name: 'CinePro', serverIds: STREAM_SERVERS.filter((server) => server.group === 'server-2').map((server) => server.id) },
] as const;

export function getStreamServer(serverId: string) {
  return STREAM_SERVERS.find((server) => server.id === serverId) ?? null;
}

export function getStreamProvider(serverId: string) {
  return getStreamServer(serverId)?.provider ?? null;
}
