# SESSION STATUS

## 2026-08-15 — Bingr stream routing

The supplied DevTools HAR established the real Bingr request path: `POST https://api.bingr.one/api/stream`, returning HTTP 200 JSON. The Allrated deployment was failing earlier at `POST /api/bingr/stream` with HTTP 404.

Bingr and CinePro are intentionally separate. The fix adds a dedicated Vercel function at `artifacts/allrated/api/bingr/stream.js` that forwards the existing Bingr request body to the user's Bingr API and returns its JSON response. No CinePro code or Bingr extraction implementation was substituted.

`vercel.json` now declares the dedicated Bingr function and its route configuration.

Commits for this fix:
- `9837f1d47571a5ed1788948edb4cfe858ebf22a5` — dedicated Bingr stream proxy
- `caa89623b8cd5d292b6d71f06372e5dd12908e29` — Vercel routing/function config
- `3141f45208221f326b155107c22afcba4ad8cd42` — handoff/status documentation

Next: deploy `main`, then verify `/api/bingr/stream` is HTTP 200 and returns `sources`/`subtitles`. Only after that should playback itself be debugged.
