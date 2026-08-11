export interface BingrStreamResponse {
    scraperName: string;
    sources: BingrRawSource[];
    subtitles: BingrRawSubtitle[];
}

export interface BingrRawSource {
    url: string;
    quality?: string | number;
    language?: string;
    type?: string;
    label?: string;
    name?: string;
    headers?: Record<string, string>;
}

export interface BingrRawSubtitle {
    url: string;
    language?: string;
    label?: string;
    name?: string;
}

export interface BingrParsedSource {
    url: string;
    quality: string;
    language: string;
    type: 'hls' | 'mp4' | 'dash';
    label: string;
    headers: Record<string, string>;
    serverName: string;
    serverCode: string;
}

export interface BingrParsedSubtitle {
    url: string;
    label: string;
    language: string;
    serverName: string;
}
