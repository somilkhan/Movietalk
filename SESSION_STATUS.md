# SESSION STATUS

## 2026-08-15 — Bingr player interaction fixes

Bingr and CinePro remain separate systems. No CinePro routing was introduced for the Bingr player.

### Bugs fixed in this pass
- **Fullscreen:** player root now enters fullscreen with browser UI hidden where supported, then requests `screen.orientation.lock('landscape')`; fullscreen exit unlocks orientation. The API is best-effort because orientation locking is browser/device dependent.
- **Subtitles:** external subtitle URLs now use the existing `/api/proxy` before being attached to `<track>` elements. Selected subtitle tracks are explicitly enabled and all other tracks disabled.
- **10-second controls:** replaced the curved rewind/fast-forward glyphs with left/right double-chevron icons matching the supplied Bingr reference.
- **Controls auto-hide:** removed the stale timer dependency on React menu/loading state. Refs keep the timer state current; controls hide after 3.2s during playback, while menus/More Like This/loading keep them visible. Pointer movement only wakes hidden controls.
- **More Like This:** API now requests TMDB `recommendations` first and only falls back to `similar` when recommendations are empty. Current title is excluded and results are deduplicated before returning 20 cards.

### Commits
- `737d32d0aa84217fe0fdaa6ae7d1dcfa79eedc44` — recommendations-first More Like This API
- `5bd82acf43607c05c0e439f3116d17e7f90b64ae` — fullscreen, subtitle, transport icon, auto-hide and More Like This player fixes
- `aacdd827c1ba392d5ab4a46a988ce595f2fb82e0` — handoff update

### Verification still required
Deploy `main` to Vercel and runtime-test:
1. Fullscreen from mobile portrait rotates to landscape when the browser/device permits orientation lock.
2. Subtitle selection visibly renders the selected WebVTT track.
3. Rewind/forward buttons show the correct chevron icons and seek exactly ±10 seconds.
4. More Like This contains title-relevant TMDB recommendations, not generic/random fallback data.
5. Controls auto-hide about 3.2 seconds after being shown while playing and do not remain permanently visible after blank taps.
6. Existing Bingr streaming remains HTTP 200 with the original Bingr request path.

Do not claim runtime parity until these are checked on the deployed build.
