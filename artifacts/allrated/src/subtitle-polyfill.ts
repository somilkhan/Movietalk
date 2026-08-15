/* Normalize remote subtitle files for native HTML5 <track> support. */
const installed = new WeakSet<HTMLTrackElement>();
const blobUrls = new WeakMap<HTMLTrackElement, string>();

function toVttTimestamp(value: string) {
  const clean = value.trim().replace(',', '.');
  const parts = clean.split(':');
  if (parts.length === 2) return `00:${parts[0].padStart(2, '0')}:${parts[1].padStart(6, '0')}`;
  if (parts.length === 3) return parts.map((part, index) => index === 2 ? part.padStart(6, '0') : part.padStart(2, '0')).join(':');
  return clean;
}

function srtToVtt(text: string) {
  const blocks = text.replace(/^\uFEFF/, '').replace(/\r/g, '').trim().split(/\n{2,}/);
  const cues: string[] = [];
  for (const block of blocks) {
    const lines = block.split('\n');
    const timeIndex = lines.findIndex((line) => line.includes('-->'));
    if (timeIndex < 0) continue;
    const timing = lines[timeIndex].split('-->');
    if (timing.length !== 2) continue;
    const start = toVttTimestamp(timing[0]);
    const end = toVttTimestamp(timing[1].trim().split(/\s+/)[0]);
    const payload = lines.slice(timeIndex + 1).join('\n').trim();
    if (payload) cues.push(`${start} --> ${end}\n${payload}`);
  }
  return `WEBVTT\n\n${cues.join('\n\n')}\n`;
}

function assToVtt(text: string) {
  const cues: string[] = [];
  for (const line of text.replace(/\r/g, '').split('\n')) {
    if (!/^Dialogue:/i.test(line)) continue;
    const fields = line.slice(line.indexOf(':') + 1).split(',');
    if (fields.length < 10) continue;
    const start = fields[1].trim().replace(/\.(\d{1,2})$/, '.$1');
    const end = fields[2].trim().replace(/\.(\d{1,2})$/, '.$1');
    const payload = fields.slice(9).join(',').replace(/\{[^}]*\}/g, '').replace(/\\N/g, '\n').trim();
    if (!payload) continue;
    const normalize = (value: string) => {
      const m = value.match(/^(\d+):(\d{2}):(\d{2})\.(\d{1,2})$/);
      if (!m) return value;
      return `${m[1].padStart(2, '0')}:${m[2]}:${m[3]}.${m[4].padEnd(3, '0')}`;
    };
    cues.push(`${normalize(start)} --> ${normalize(end)}\n${payload}`);
  }
  return `WEBVTT\n\n${cues.join('\n\n')}\n`;
}

function normalizeSubtitle(text: string) {
  const value = text.replace(/^\uFEFF/, '').trim();
  if (/^WEBVTT(?:\s|$)/i.test(value)) return value.endsWith('\n') ? value : `${value}\n`;
  if (/^\s*(?:\[Script Info\]|\[V4\+? Styles\]|\[Events\])/i.test(value) || /^Dialogue:/im.test(value)) return assToVtt(value);
  return srtToVtt(value);
}

async function normalizeTrack(track: HTMLTrackElement) {
  if (installed.has(track) || !track.src) return;
  installed.add(track);
  const original = track.src;
  try {
    const response = await fetch(original, { credentials: 'same-origin' });
    if (!response.ok) return;
    const text = await response.text();
    if (!text.trim()) return;
    const vtt = normalizeSubtitle(text);
    if (!/^WEBVTT(?:\s|$)/i.test(vtt.trim())) return;
    const url = URL.createObjectURL(new Blob([vtt], { type: 'text/vtt' }));
    blobUrls.set(track, url);
    track.src = url;
  } catch {
    // Leave the original track URL intact if normalization is unavailable.
  }
}

const observer = new MutationObserver((mutations) => {
  for (const mutation of mutations) {
    mutation.addedNodes.forEach((node) => {
      if (!(node instanceof HTMLTrackElement)) {
        if (node instanceof Element) node.querySelectorAll('track').forEach((track) => normalizeTrack(track));
        return;
      }
      normalizeTrack(node);
    });
  }
});

observer.observe(document.documentElement, { childList: true, subtree: true });

window.addEventListener('beforeunload', () => {
  document.querySelectorAll('track').forEach((track) => {
    const url = blobUrls.get(track);
    if (url) URL.revokeObjectURL(url);
  });
});
