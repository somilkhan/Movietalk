# SESSION STATUS

## 2026-08-15 — Bingr player polish

Bingr and CinePro remain separate systems. No CinePro routing was introduced for the Bingr player.

### Implemented
- **TV episode routing:** `/watch/tv/:id/:season/:episode` is now a dedicated watch route before the generic movie/TV watch route.
- **TV episode streaming:** the Bingr stream request reads the season/episode from the actual watch URL and sends those values to the existing `POST /api/bingr/stream` request instead of always requesting season 1 / episode 1.
- **Fullscreen:** player root enters fullscreen with browser UI hidden where supported, then requests landscape orientation lock; fullscreen exit unlocks orientation.
- **Subtitles:** external subtitle URLs use the existing `/api/proxy` before being attached to `<track>` elements. A global subtitle normalizer converts SRT/ASS-style payloads to browser-compatible WebVTT blobs without changing the Bingr stream request path.
- **10-second controls:** left/right double-chevron icons are used for rewind/forward.
- **Controls auto-hide:** controls hide after 3.2s during playback; menus/More Like This/loading keep them visible, and pointer movement wakes hidden controls.
- **More Like This:** TMDB recommendations are requested first with similar-title fallback; current title is excluded and cards navigate through the SPA.
- **Player identity:** the Allrated watermark is shown only while controls are hidden, moved to the top-right corner, and reduced to about 48% opacity. The duplicate logo inside the control overlay is hidden. Compact Netflix-style genre metadata remains under the title when available.
- **Animations:** added restrained play/pause and ±10s feedback, menu/More Like This entrance, button press/hover, and seek-thumb transitions. No unnecessary player features were added.
- **Streaming:** existing Bingr request/playback path remains `POST /api/bingr/stream`; only the TV query now uses the actual requested season/episode.

### Latest commits
- `97ccf344152fd35cea49fa156dbdfeafa50ce5b4` — support Bingr TV season/episode watch routes.
- `501842034ffd5672c5953cd1bb0001452a551618` — pass selected Bingr TV season/episode to the stream request.
- `a6f0c613c39056ba61b853cf87797aa8c5034955` — keep only subtle top-right hidden-controls watermark.
- `9849e4b44a09941ff8f5cc13c8a00d875ccb21f8` — subtitle SRT/ASS normalization to WebVTT.
- `d9e49b5bb94728fe6096db009174587bae51f4f0` — load subtitle normalizer globally.

### Verification still required
Deploy `main` to Vercel and runtime-test:
1. Open `/watch/tv/108978/2/1` and confirm the Bingr request contains `season: 2, episode: 1`.
2. Subtitle selection visibly renders the selected track.
3. Rewind/forward buttons seek exactly ±10 seconds.
4. More Like This contains title-relevant TMDB recommendations.
5. Only one Allrated watermark is visible, at the top-right, around 48% opacity, when controls are hidden.
6. Controls auto-hide about 3.2 seconds after being shown while playing.
7. Existing Bingr streaming remains HTTP 200 with the original Bingr request path.

Do not claim runtime parity until these are checked on the deployed build.