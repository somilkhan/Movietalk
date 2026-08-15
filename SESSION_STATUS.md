# SESSION STATUS

## 2026-08-15 — Bingr player polish

Bingr and CinePro remain separate systems. No CinePro routing was introduced for the Bingr player.

### Implemented
- **Fullscreen:** player root enters fullscreen with browser UI hidden where supported, then requests landscape orientation lock; fullscreen exit unlocks orientation.
- **Subtitles:** external subtitle URLs use the existing `/api/proxy` before being attached to `<track>` elements. A global subtitle normalizer now converts SRT/ASS-style payloads to browser-compatible WebVTT blobs without changing the Bingr stream request path.
- **10-second controls:** left/right double-chevron icons are used for rewind/forward.
- **Controls auto-hide:** controls hide after 3.2s during playback; menus/More Like This/loading keep them visible, and pointer movement wakes hidden controls.
- **More Like This:** TMDB recommendations are requested first with similar-title fallback; current title is excluded and cards navigate through the SPA.
- **Player identity:** the Allrated watermark is shown only while controls are hidden, moved to the top-right corner, and reduced to about 48% opacity. The duplicate logo inside the control overlay is hidden. Compact Netflix-style genre metadata remains under the title when available.
- **Animations:** added restrained play/pause and ±10s feedback, menu/More Like This entrance, button press/hover, and seek-thumb transitions. No unnecessary player features were added.
- **Streaming:** existing Bingr request/playback path was not changed by the polish work.

### Latest commits
- `a6f0c613c39056ba61b853cf87797aa8c5034955` — keep only subtle top-right hidden-controls watermark.
- `9849e4b44a09941ff8f5cc13c8a00d875ccb21f8` — subtitle SRT/ASS normalization to WebVTT.
- `d9e49b5bb94728fe6096db009174587bae51f4f0` — load subtitle normalizer globally.

### Verification still required
Deploy `main` to Vercel and runtime-test:
1. Subtitle selection visibly renders the selected track.
2. Rewind/forward buttons seek exactly ±10 seconds.
3. More Like This contains title-relevant TMDB recommendations.
4. Only one Allrated watermark is visible, at the top-right, around 48% opacity, when controls are hidden.
5. Controls auto-hide about 3.2 seconds after being shown while playing.
6. Existing Bingr streaming remains HTTP 200 with the original Bingr request path.

Do not claim runtime parity until these are checked on the deployed build.
