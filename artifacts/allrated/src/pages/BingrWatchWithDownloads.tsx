import { useEffect, useState } from 'react';
import { useParams } from 'wouter';
import { Download, Loader2, X } from 'lucide-react';
import BingrWatch from './BingrWatch';

type DownloadOption = { server?: string; url?: string; quality?: number | string; size?: string; source?: string };
type DownloadResponse = { ok?: boolean; title?: string; downloads?: DownloadOption[] };

function qualityLabel(value: DownloadOption['quality']) {
  const n = Number(value);
  if (n === 2160) return '4K';
  if (n === 1080 || n === 720 || n === 480 || n === 360 || n === 240) return `${n}p`;
  return 'HD';
}

function openDownload(url: string) {
  if (!url) return;
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.target = '_blank';
  anchor.rel = 'noopener noreferrer';
  anchor.style.display = 'none';
  document.body.appendChild(anchor);
  anchor.click();
  anchor.remove();
}

export default function BingrWatchWithDownloads() {
  const params = useParams<{ mediaType: string; id: string; season?: string; episode?: string }>();
  const mediaType = params.mediaType === 'tv' ? 'tv' : 'movie';
  const id = Number(params.id);
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [downloads, setDownloads] = useState<DownloadOption[]>([]);

  useEffect(() => {
    if (!open || !Number.isFinite(id)) return;
    const controller = new AbortController();
    const query = new URLSearchParams();
    query.set('mediaType', mediaType);
    query.set('id', String(id));
    if (mediaType === 'tv') {
      if (params.season) query.set('season', params.season);
      if (params.episode) query.set('episode', params.episode);
    }
    setLoading(true);
    setError('');
    setDownloads([]);
    fetch(`/api/bingr/download?${query.toString()}`, { headers: { Accept: 'application/json' }, signal: controller.signal })
      .then((response) => {
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        return response.json() as Promise<DownloadResponse>;
      })
      .then((data) => {
        const options = Array.isArray(data.downloads)
          ? data.downloads.filter((item) => typeof item?.url === 'string' && item.url.trim().length > 0)
          : [];
        setDownloads(options);
        if (!options.length) setError('No download options found for this episode.');
      })
      .catch((err) => {
        if (err?.name !== 'AbortError') {
          setDownloads([]);
          setError('Download options are unavailable right now.');
        }
      })
      .finally(() => setLoading(false));
    return () => controller.abort();
  }, [open, id, mediaType, params.season, params.episode]);

  return (
    <>
      <BingrWatch />
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="fixed right-4 top-4 z-[430] flex items-center gap-2 rounded-full border border-white/10 bg-black/60 px-4 py-2.5 text-sm font-semibold text-white shadow-xl backdrop-blur-xl transition-all hover:bg-white/15"
        aria-label="Download options"
      >
        <Download className="h-4 w-4" />
        <span className="hidden sm:inline">Download</span>
      </button>

      {open ? (
        <div className="fixed inset-0 z-[500] flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm" role="dialog" aria-modal="true" aria-label="Download Options">
          <div className="w-full max-w-lg overflow-hidden rounded-2xl border border-white/10 bg-[#0d0d0f] shadow-2xl">
            <div className="flex items-center justify-between border-b border-white/10 p-4">
              <h3 className="text-lg font-bold text-white">Download Options</h3>
              <button type="button" onClick={() => setOpen(false)} className="rounded-full p-1 text-white/50 transition-colors hover:bg-white/10 hover:text-white" aria-label="Close">
                <X className="h-5 w-5" />
              </button>
            </div>
            <div className="max-h-[60vh] overflow-y-auto p-4">
              {loading ? (
                <div className="flex min-h-32 items-center justify-center"><Loader2 className="h-6 w-6 animate-spin text-white/60" /></div>
              ) : error ? (
                <div className="py-10 text-center text-sm text-white/50">{error}</div>
              ) : (
                <div className="flex flex-col gap-3">
                  {downloads.map((item, index) => {
                    const url = typeof item.url === 'string' ? item.url.trim() : '';
                    const label = qualityLabel(item.quality);
                    const provider = item.server || item.source || 'Download';
                    const size = item.size?.trim() || 'Unknown Size';
                    return (
                      <div
                        key={`${url}-${index}`}
                        className="group/dl flex w-full items-center justify-between gap-3 rounded-xl border border-white/5 bg-white/5 p-3 text-left transition-all hover:border-white/20 hover:bg-white/10"
                      >
                        <div className="flex min-w-0 flex-1 flex-col">
                          <span className="text-sm font-semibold text-white transition-colors group-hover/dl:text-[#4ade80] md:text-base">{label}</span>
                          <span className="mt-1 break-words text-xs text-white/50 transition-colors group-hover/dl:text-white/70">{provider} • {size}</span>
                        </div>
                        <button
                          type="button"
                          disabled={!url}
                          aria-label={`Download ${label} from ${provider}`}
                          onClick={(event) => {
                            event.preventDefault();
                            event.stopPropagation();
                            openDownload(url);
                          }}
                          className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-[#4ade80]/20 hover:text-[#4ade80] disabled:cursor-not-allowed disabled:opacity-40"
                        >
                          <Download className="h-4 w-4 pointer-events-none" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
