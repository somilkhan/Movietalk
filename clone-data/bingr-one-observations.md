# Bingr.one — Complete Clone Research Document

**Source:** https://bingr.one/home  
**Purpose:** Pixel-perfect reverse engineering reference  
**Extracted:** 2026-08-04

---

## 1. Site Overview

**Title:** Bingr — Stream Movies, Shows, Anime & Live Sports  
**Type:** Streaming platform (movies, TV shows, anime, live sports)  
**Data source:** TMDB API for all content metadata & images  
**Logo:** `https://bingr.one/brand/logo.png` (star/sparkle shape, white) — downloaded to `clone-data/public/images/bingr-logo.png`

---

## 2. Design System (Exact Values)

### Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-primary` | `#07070b` | Page background (near-black) |
| `--bg-card` | `#252830` | Card/panel backgrounds |
| `--accent-blue` | `#4752c4` | Primary accent (buttons, active states) |
| `--accent-red` | `#ff2357` | Danger/live/highlight accent |
| `--accent-red-dim` | `#ff235733` | Red accent 20% opacity |
| `--white-glass-1` | `#ffffff1f` | Frosted/glass background 12% |
| `--white-glass-2` | `#ffffff24` | Frosted/glass background 14% |
| `--text-primary` | `#e9e9ee` | Primary text color |
| `--text-secondary` | `rgba(255,255,255,0.6)` | Secondary/muted text |

### Typography
- **Primary font:** System sans-serif (Inter or similar, based on rendering). The site uses a clean, modern sans-serif. Use `Inter` from Google Fonts as the closest match.
- **Body text:** ~14–16px, weight 400
- **Headings:** weight 600–700

### TMDB Image URLs
- Poster (portrait): `https://image.tmdb.org/t/p/w500/{path}` — used in cards
- Backdrop (landscape): `https://image.tmdb.org/t/p/w780/{path}` — used in carousels/hero
- Episode thumb: `https://image.tmdb.org/t/p/w300/{path}`

---

## 3. Global Layout

### Left Sidebar (fixed, ~60px wide)
- Position: fixed left edge, full height
- Background: `#07070b` (same as page, or very slight border/shadow to the right)
- Contains icon-only navigation (no text labels on desktop)
- **Desktop:** visible, icon-only
- **Mobile:** collapses to bottom tab bar OR hamburger

### Main Content Area
- Margin-left: ~60px (sidebar width)
- Full viewport height minus sidebar
- Background: `#07070b`

---

## 4. Sidebar Navigation — Icon Order (Top → Bottom)

```
[LOGO]  — Bingr sparkle/star icon (links to /home)
  ↓
[HOME]  — House icon → /home
[SEARCH] — Magnifying glass → /search
[TV]    — Monitor/TV icon → TV shows section
[HISTORY] — Clock icon → Watch history
[WATCHLIST] — Bookmark icon → Saved/watchlist
[SPORTS] — Lightning bolt icon → Live sports
[CATEGORIES] — Grid/apps icon → Browse by genre
  ↓ (spacer)
[USER]  — Person/profile icon → /myspace
```

All icons: ~22–24px, white/light color, opacity ~0.6 default, 1.0 on active/hover  
Active state: icon color becomes white OR has blue (#4752c4) indicator dot/bar

---

## 5. Pages — Complete Specification

### 5.1 Home Page (`/home`)

**Structure (top → bottom in main content):**

1. **Featured Hero Section** — Full-screen (100vw, 100vh or ~80vh)
   - Background: Large backdrop image (`w780` TMDB) with gradient overlay
   - Gradient: `linear-gradient(to right, rgba(7,7,11,0.95) 30%, rgba(7,7,11,0.3) 100%)`
   - **Left side content (bottom ~35% of hero):**
     - Movie title logo image (NOT text — it's a PNG `w500`) 
     - Rating badge + metadata: `8.0 · 2026 · Science Fiction · Action` (dot-separated)
     - Description paragraph (~2-3 lines)
     - "See More" link button
   - **Controls (bottom-right):**
     - Mute/volume toggle icon button
     - Pause/play icon button
   - **Navigation arrows (left/right):** for cycling through featured items
     - Left: back arrow with play count indicator
     - Right: "NEXT PAGE" label + small thumbnail
   - **Featured title text** shown in lower-left area (separate from logo image)
   
2. **Content Rows** — Horizontal scrollable card rows, each with:
   - Section header text (e.g., "Trending Now", "New Releases")
   - Horizontally scrollable track of cards
   - Cards: poster image (portrait, `w500`) + metadata overlay on hover

**Card Structure (Movie/Show Card):**
```
┌──────────────┐
│  [poster]    │
│              │
│              │
│   8.0 ★     │ ← rating overlay (top-right or bottom)
└──────────────┘
  Title text
  Year · Type
```

**Home content rows observed:**
- Featured items cycling: Spider-Man: Brand New Day, The Odyssey, Supergirl, Obsession, The Devil's Mouth, House of the Dragon, Evil Dead Burn, Silo, Disclosure Day...
- Content rows: Movies, Series, etc.

---

### 5.2 Movie Detail Page (`/movie/:id`)

**Example:** `/movie/969681` → Spider-Man: Brand New Day

**Full-screen layout:**
1. **Hero** — Full-viewport backdrop image (`w780` TMDB) as background
   - Very dark overlay gradient so content is readable
   - Background image blurred at bottom
   
2. **Bottom-left content panel:**
   - Title logo image (PNG from TMDB `w500` - the official movie/show logo)
   - Action row:
     - ▶ "Watch Now" button (circular white play icon + text + "MOVIE" label below)
     - + button (circular, glass bg) — Add to watchlist
     - ⬇ button (circular, glass bg) — Download
   
3. **Bottom-right controls:**
   - 🔇 Volume/mute toggle
   - ⏸ Pause/play (for the auto-playing background trailer/backdrop)

4. **Below hero (scroll down):**
   - **Actors** section — horizontal card row with actor headshots + names
   - **Similar content rows** — "More Like This" horizontal scroll rows
   - **Rating info, year, genre tags, description** (separate section)
   - **Server selection** (if on watch page embedded):
     - "EmbedFilmu", "Embed Player"
     - Server indicators: ✓Filmu ✓Videasy ✓Cinezo ✓Vidbolt ✓Vidrift
     - "Server 1 | Server 2" tabs
     - Warning: "These servers may contain ads or popups. Use a blocker for the best experience."

---

### 5.3 TV Detail Page (`/tv/:id`)

**Example:** `/tv/94997` → House of the Dragon

Same as Movie Detail but adds:

- **"SERIES"** type label (instead of "MOVIE")
- **Episodes section** (below hero):
  - Season selector tabs: "Season 1", "Season 2", etc.
  - Episode list:
    ```
    [thumb] [number] [title]
            [description]
            [Play button]
    ```
  - Episode entry structure:
    - Thumbnail image (`w300` TMDB)
    - Episode number (large)
    - Episode title (bold)
    - Description text
    - [Play] button → `/watch/tv/:id/:season/:episode`

---

### 5.4 Watch/Player Page (`/watch/movie/:id` or `/watch/tv/:id/:s/:ep`)

**Full-screen black layout:**
- Background: pure `#000000`
- **Top-left:** Rating card
  - "Rated PG-13" or "Rated TV-MA" (bold)
  - Content warnings: "Drug Use, Smoking Visuals, Coarse Language, Disturbing Scenes, Graphic Violence"
  - Font: small, white
- **Top-right:** Bingr logo (star icon, white)
- **Center:** Circular loading spinner (white, animated)
- **Bottom-center:** Language selector
  - "Hindi" (plain text) | "**English**" (active, rounded pill button)
  - × close button to dismiss

**Video player** (once loaded):
- Full-screen embedded iframe/player
- Controls TBD (not visible at load)

---

### 5.5 Genre/Search Results Page (`/genre/:id`)

**Grid layout:**
- Content cards in a responsive grid
- Each card: poster image + title + rating + year + type

---

### 5.6 404 Error Page

- Background: `#07070b`
- **Center content:**
  - Deadpool error GIF: `https://bingr.one/media/error.gif`
  - Heading: `404. Well, fuck.`
  - Body: "The page you're looking for is either dead, missing, or out banging someone's mom. Don't worry, it happens to a lot of guys."
  - Button: "Take me home, Daddy" → `/home`

---

## 6. Modal/Popup: Ads Toggle Notice

Appears on home page load (one-time notice):
- **Dark modal** with rounded corners
- Background: `#252830` or similar
- Backdrop blur behind modal
- **Bell icon** (top center, rounded bg)
- **Title:** "Ads Toggle Moved"
- **Body:** "We've listened to your feedback! The ads toggle switch has been moved to the My Space page. You can now easily turn ads on or off directly from there without digging through the settings."
- **Button:** "Got it" (full-width, white background, black text, rounded)

---

## 7. Route Map

```
/home                           → Home (content rows + featured hero)
/movie/:id                      → Movie detail page
/tv/:id                         → TV show detail page
/watch/movie/:id               → Movie player
/watch/tv/:id/:season/:episode → TV episode player
/genre/:id                      → Genre/browse page
/search                        → Search page (404s currently)
/myspace                       → User profile (404s currently)
*                              → 404 Deadpool page
```

---

## 8. Content Data (from TMDB API)

The site uses TMDB (The Movie Database) for all content. Key image URL patterns:
- `https://image.tmdb.org/t/p/w500/{poster_path}` — portrait posters
- `https://image.tmdb.org/t/p/w780/{backdrop_path}` — wide backdrop
- `https://image.tmdb.org/t/p/w300/{still_path}` — episode thumbnails
- Logo images are also served from TMDB as PNG with transparency

**Sample content IDs observed:**
- Spider-Man: Brand New Day → movie/969681
- The Odyssey → movie/1368337
- Supergirl → movie/1081003
- House of the Dragon → tv/94997 (Season 1-2)
- Silo → tv/125988
- Evil Dead Burn → movie/1212763

**Rating format in UI:** `{rating} · {year} · {genre} · {type}`  
Example: `8.0 · 2026 · Science Fiction · Action`

---

## 9. Video Servers (Embeds)

The watch page uses third-party embed servers:
- **Filmu** (✓ active)
- **Videasy** (✓ active)  
- **Cinezo** (✓ active)
- **Vidbolt** (✓ active)
- **Vidrift** (✓ active)
- "Server 1" / "Server 2" toggle buttons

Notice: "These servers may contain ads or popups. Use a blocker for the best experience."

---

## 10. Mobile Layout (390px)

From screenshots, mobile differs significantly:
- The full sidebar becomes a **bottom tab bar** OR collapses
- Content adapts to single-column layout
- Hero section loses some left-side padding
- Cards remain horizontally scrollable

**Known mobile issues (from user report):** Mobile layout is broken/not matching original. Priority fix areas:
1. Sidebar → bottom navigation conversion
2. Hero section proportions/padding
3. Card sizing in horizontal scroll

---

## 11. Screenshots Saved

All screenshots in `clone-data/screenshots/`:
- `desktop-home.png` — Home page with ads modal popup (1456px)
- `movie-detail.png` — Spider-Man movie detail (full viewport)
- `tv-detail.png` — House of the Dragon TV detail (full viewport)
- `watch-page.png` — Movie watch/player page
- `watch-tv.png` — TV watch/player page
- `movie-detail-desktop.png` — Movie detail desktop (Playwright, may be blank)
- `mobile-full.png` — Mobile home (Playwright, may be blank)
- `tablet-full.png` — Tablet home (Playwright, may be blank)

Key reference: **`movie-detail.png`** is the clearest screenshot and shows the full design system:
- Exact sidebar icon layout
- Exact hero layout
- Watch Now button design
- + and download button design
- Volume/pause controls

---

## 12. Assets

- **Logo:** `clone-data/public/images/bingr-logo.png` (91KB, star/sparkle shape)
- **Error GIF:** `https://bingr.one/media/error.gif` (Deadpool)
- **All other images:** Served dynamically from TMDB CDN at runtime

---

## 13. What's Working vs Broken (User Report)

The user says they have ~40-60% built but:
1. **Mobile is broken** — The responsive/mobile layout doesn't match
2. **Desktop also has issues** — Not pixel-perfect

Priority areas for the rebuild:
1. Get the sidebar right on desktop (fixed, 60px, icon-only)
2. Get the bottom nav right on mobile
3. Hero section proportions (full-screen, gradient, content positioning)
4. Card rows (horizontal scroll, card sizing)
5. Watch page layout (black bg, rating display, language selector, loading spinner)
6. Detail page hero (full-screen backdrop, logo image overlay, action buttons)

---

## 14. Build Notes

1. **This is a React SPA** — all routes handled client-side
2. **Font:** Use `Inter` from Google Fonts (closest match to site's font)
3. **Icons:** Use Lucide React (matches the icon style in sidebar - clean line icons)
4. **No Tailwind** in original — plain CSS, but you can use whatever for the rebuild
5. **TMDB integration** is needed for real data, or mock with the sample data above
6. **Video embeds** are iframes from third-party servers — use `https://vidsrc.to/embed/movie/{tmdb_id}` or similar
7. **The site is a React/Next.js or Vite app** (blocked Playwright headless, suggesting CSR/SPA)

---

## 15. Recommended Build Order

1. Global layout (sidebar + main area)
2. Mobile nav (bottom tabs)
3. Home page hero section
4. Content card component
5. Horizontal scroll row
6. Movie detail page
7. TV detail page (adds episodes)
8. Watch page (player)
9. 404 page
10. Search/genre pages
