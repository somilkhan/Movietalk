# SESSION STATUS

## 2026-08-15 — Bingr stream + player interaction

The supplied DevTools HAR established the real Bingr request path: `POST https://api.bingr.one/api/stream`, returning HTTP 200 JSON. The Allrated deployment had been failing earlier at `POST /api/bingr/stream` with HTTP 404.

Bingr and CinePro are intentionally separate. The dedicated Vercel function at `artifacts/allrated/api/bingr/stream.js` forwards the existing Bingr request body to the user's Bingr API and returns its JSON response. No CinePro routing was used for the Bingr player.

### Player work completed
- `BingrWatch.tsx` layout was corrected to match the supplied bingr.one screenshots: top title/back + Quality/Audio controls, bottom Server 1/2 pill, More Like This, seekbar, transport controls and fullscreen.
- Quality profiles switch the selected source and preserve playback position.
- Server 1/2 and the full server list switch the Bingr source and preserve playback position.
- Rewind/forward 10s, play/pause, seekbar, volume/mute and fullscreen are connected to the actual video element.
- Subtitle selection controls actual `TextTrack` visibility.
- HLS audio-track selection is now exposed by `useHlsPlayer`; the UI only shows tracks the manifest actually provides.
- More Like This cards use SPA navigation; close/back controls are connected.
- Report an Issue uses the device share sheet or clipboard fallback.

### Commits
- `811ec6f17f34d9a4ae2f8157942ca4ebf358fc94` — connect HLS audio track selection
- `4f45237e2f65224bc169c93f753975523ce8ddb0` — match Bingr controls and wire player actions
- `f279cd162a81a17fbbb643c65f82a355ad8fb9f3` — explicit pointer event typing
- `a8f52e4ef344c7dc961b9c5dd49e9beaa188ff8a` — handoff update

### Verification still required
Deploy `main` to Vercel, then verify the Bingr endpoint returns HTTP 200 with `sources`/`subtitles` and perform mobile/desktop runtime QA. Pixel-perfect parity should only be claimed after that visual check.
