# SESSION STATUS

## 2026-08-15 — Bingr stream + player interaction

The supplied DevTools HAR established the real Bingr request path: `POST https://api.bingr.one/api/stream`, returning HTTP 200 JSON. The Allrated deployment had been failing earlier at `POST /api/bingr/stream` with HTTP 404.

Bingr and CinePro are intentionally separate. The dedicated Vercel function at `artifacts/allrated/api/bingr/stream.js` forwards the existing Bingr request body to the user's Bingr API and returns its JSON response. No CinePro routing was used for the Bingr player.

### Player work completed
- `BingrWatch.tsx` layout matches the supplied bingr.one screenshots: top title/back + Quality/Audio controls, bottom Server 1/2 pill, More Like This, seekbar, transport controls and fullscreen.
- Quality profiles switch the selected source and preserve playback position.
- Server 1/2 and the full server list switch the Bingr source and preserve playback position.
- Rewind/forward 10s, play/pause, seekbar, volume/mute and fullscreen are connected to the actual video element.
- Subtitle selection controls actual `TextTrack` visibility.
- HLS audio-track selection is exposed by `useHlsPlayer`; the UI only shows tracks the manifest actually provides.
- More Like This now loads live TMDB similar-title data from `/api/catalog/title/:mediaType/:id/similar`; cards navigate through the SPA and render real backdrop/poster, rating, year and media type data.
- Report an Issue uses the device share sheet or clipboard fallback.

### Commits
- `859a50b3334609840da71d7afa74bb3b373fde01` — add API-server similar-title endpoint
- `0553522f96e62aad2db53365a0a9952dd49b5fe7` — add Vercel similar-title function
- `52a58f1ee3f1c3e39156aaa674021ee51f1ae901` — route similar-title endpoint in Vercel
- `54f13716d65ceb4e0d9755d105208650d8a25b00` — load live data in Bingr More Like This
- `2de37f186c3af4ba30f349f50ac23f702aa65f10` — handoff update

### Verification still required
Deploy `main` to Vercel, then verify:
1. `POST /api/bingr/stream` returns HTTP 200 with `sources`/`subtitles`.
2. `GET /api/catalog/title/movie/969681/similar` returns a non-empty `results` array when TMDB has similar titles.
3. More Like This opens with real cards and each card navigates correctly.
4. Mobile/desktop runtime QA against the supplied bingr.one screenshots.

Pixel-perfect/runtime parity should only be claimed after that visual check.
