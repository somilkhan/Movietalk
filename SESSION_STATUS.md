# SESSION STATUS

## 2026-08-15 — Bingr player polish

Bingr and CinePro remain separate systems. No CinePro routing was introduced for the Bingr player.

### Implemented
- **Fullscreen:** player root enters fullscreen with browser UI hidden where supported, then requests landscape orientation lock; fullscreen exit unlocks orientation.
- **Subtitles:** external subtitle URLs use the existing `/api/proxy` before being attached to `<track>` elements. Selected subtitle tracks are explicitly enabled and all other tracks disabled.
- **10-second controls:** left/right double-chevron icons are used for rewind/forward.
- **Controls auto-hide:** controls hide after 3.2s during playback; menus/More Like This/loading keep them visible, and pointer movement wakes hidden controls.
- **More Like This:** TMDB recommendations are requested first with similar-title fallback; current title is excluded and cards navigate through the SPA.
- **Player identity:** added the existing Allrated logo as a subtle watermark and compact Netflix-style genre metadata under the title when available.
- **Animations:** added restrained play/pause and ±10s feedback, menu/More Like This entrance, button press/hover, and seek-thumb transitions. No unnecessary player features were added.
- **Streaming:** existing Bingr request/playback path was not changed by the polish work.

### Latest commit
- `88a9f65570c09bb1b32aea2de5c08c52a3a8f45a` — Allrated logo, genre metadata, restrained animations and player identity polish.

### Verification still required
Deploy `main` to Vercel and runtime-test:
1. Fullscreen from mobile portrait rotates to landscape when the browser/device permits orientation lock.
2. Subtitle selection visibly renders the selected WebVTT track.
3. Rewind/forward buttons seek exactly ±10 seconds.
4. More Like This contains title-relevant TMDB recommendations.
5. Logo and genre metadata are correctly placed and do not clutter the player.
6. Animations remain subtle and do not interfere with controls.
7. Controls auto-hide about 3.2 seconds after being shown while playing.
8. Existing Bingr streaming remains HTTP 200 with the original Bingr request path.

Do not claim runtime parity until these are checked on the deployed build.
