# SESSION STATUS

## 2026-08-15 — Bingr player and home polish

Bingr and CinePro remain separate systems. No CinePro routing was introduced for the Bingr player.

### Implemented
- **TV episode routing:** `/watch/tv/:id/:season/:episode` is a dedicated watch route before the generic movie/TV watch route.
- **TV episode streaming:** the Bingr stream request reads the season/episode from the actual watch URL and sends those values to the existing `POST /api/bingr/stream` request.
- **Completion-driven Next Bingr:** when a video actually reaches the native `ended` event, the current title is saved as the latest completed Bingr in local storage. Home then requests that title's recommendations through the existing catalog recommendation/similar endpoint and renders **Your next Bingr after <title>** dynamically. The previous hardcoded Reacher follow-up list is removed.
- **Fullscreen:** player root enters fullscreen with browser UI hidden where supported, then requests landscape orientation lock; fullscreen exit unlocks orientation.
- **Subtitles:** external subtitle URLs use the existing `/api/proxy` before being attached to `<track>` elements. A global subtitle normalizer converts SRT/ASS-style payloads to browser-compatible WebVTT blobs without changing the Bingr stream request path.
- **10-second controls:** left/right double-chevron icons are used for rewind/forward.
- **Controls auto-hide:** controls hide after 3.2s during playback; menus/More Like This/loading keep them visible, and pointer movement wakes hidden controls.
- **More Like This:** TMDB recommendations are requested first with similar-title fallback; current title is excluded and cards navigate through the SPA.
- **Player identity:** the Allrated watermark is shown only while controls are hidden, moved to the top-right corner, and reduced to about 48% opacity. The duplicate logo inside the control overlay is hidden. Compact genre metadata remains under the title when available.
- **Bingr home sections:** added the supplied home-page data and visual structure for Trending Right Now, Studios, and Popular Genres using the supplied ordering and Bingr artwork URLs.
- **Home cleanup:** removed the obsolete duplicate Studios/Popular Genres tray implementations.
- **Streaming:** existing Bingr request/playback path remains `POST /api/bingr/stream`; TV queries now use the actual requested season/episode.

### Latest commits
- `3ebad1ca199634f105edba0a2af7854c9332d1ba` — record completed title and pass TV season/episode from watch URL.
- `924e76765fa81cb17a432e4660b67f1ffe087934` — add completion-driven Next Bingr recommendation tray.
- `f6596317e4dfdf27cd10bb099687c67dfae58055` — replace hardcoded Reacher follow-up with dynamic completion-driven tray.
- `05bdb7314aefb48c0865e4736c6b8c787879c4a3` — clean Bingr home carousel interactions and types.
- `3c706a5c7a5ff24aba12b729701689a1875ed367` — use supplied Bingr home sections in Home.
- `10484be54520eb515aa369268312ef0eab10eeb1` — add supplied Bingr home data/sections.
- `97ccf344152fd35cea49fa156dbdfeafa50ce5b4` — support Bingr TV season/episode watch routes.
- `501842034ffd5672c5953cd1bb0001452a551618` — pass selected Bingr TV season/episode to the stream request.
- `a6f0c613c39056ba61b853cf87797aa8c5034955` — keep only subtle top-right hidden-controls watermark.
- `9849e4b44a09941ff8f5cc13c8a00d875ccb21f8` — subtitle SRT/ASS normalization to WebVTT.
- `d9e49b5bb94728fe6096db009174587bae51f4f0` — load subtitle normalizer globally.

### Verification still required
Deploy `main` to Vercel and runtime-test:
1. Finish a movie/episode and return to Home; confirm **Your next Bingr after** names that exact completed title and shows recommendations for it.
2. Open `/watch/tv/108978/2/1` and confirm the Bingr request contains `season: 2, episode: 1`.
3. Subtitle selection visibly renders the selected track.
4. Rewind/forward buttons seek exactly ±10 seconds.
5. More Like This contains title-relevant recommendations.
6. Only one Allrated watermark is visible, at the top-right, around 48% opacity, when controls are hidden.
7. Bingr home sections match the supplied order/artwork and carousel interaction.
8. Existing Bingr streaming remains HTTP 200 with the original Bingr request path.

Do not claim runtime parity until these are checked on the deployed build.
