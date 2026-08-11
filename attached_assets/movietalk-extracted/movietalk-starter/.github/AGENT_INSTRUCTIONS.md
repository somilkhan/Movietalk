# Agent Instructions — movietalk

## Project Overview
- **Name:** movietalk
- **Target:** Clone of https://bingr.one
- **Stack:** Next.js 14 (App Router), React, TypeScript, Tailwind CSS
- **Deploy:** Vercel (auto-deploy on push to main)

## Agent Rules

### 1. ONE Commit Per Session
- `git add .`
- `git commit -m "type: description"`
- `git push origin main`
- NEVER leave uncommitted changes.

### 2. Build Before Commit
- Run `npm run build` (or `next build`)
- Fix ALL errors before committing
- Warnings are okay if they don't break the build

### 3. Write HANDOFF.md Before Session Ends
When you have ~5 tool calls or ~2000 tokens remaining:
1. STOP feature work
2. Update `HANDOFF.md` at repo root
3. Commit and push the handoff
4. Tell user: "Handoff written. Say 'continue' to resume."

### 4. No Blind CSS Copying
- NEVER copy CSS from extracted files without verifying rendered output
- Use localhost screenshots (`npm run dev` + browser screenshot) to verify changes
- If you can't see the site, ASK the user for screenshots

### 5. Mock Data for Development
- Use `lib/mock-data.ts` for sandbox testing (no API keys needed)
- Real API calls only in production (`NODE_ENV !== "development"`)
- See `lib/tmdb.ts` for the toggle pattern

### 6. Mobile-First
- Design for mobile (375px) first, then scale up
- Test both mobile and desktop before committing
- Real site screenshots are in `bingr-one-observations.md`

### 7. File Naming
- Components: `PascalCase.tsx`
- Hooks: `useHookName.ts`
- Utils: `camelCase.ts`
- Styles: keep in `globals.css` or component-level

## Tech Stack Details

| Layer | Technology |
|-------|------------|
| Framework | Next.js 14 (App Router) |
| Language | TypeScript |
| Styling | Tailwind CSS + custom CSS |
| State | React hooks (useState, useEffect) |
| Data Fetching | React Query (TanStack Query) |
| Icons | Lucide React |
| Fonts | Google Fonts (Space Grotesk, Manrope, DM Mono) |
| Images | Next.js Image component |

## Project Structure
```
app/
  page.tsx              # Home page
  layout.tsx            # Root layout (fonts, providers)
  globals.css           # Global styles
  components/           # React components
    Hero.tsx
    Topbar.tsx
    NavPill.tsx
    Rail.tsx
    MediaCard.tsx
    MobileNav.tsx
    SearchDialog.tsx
    ...
lib/
  tmdb.ts               # TMDB API client
  mock-data.ts          # Mock data for dev
  hooks/
    useTMDB.ts          # React Query hooks
  utils.ts              # Utilities
types/
  index.ts              # TypeScript types
public/
  images/               # Static assets
```

## API Keys (DO NOT COMMIT)
- `NEXT_PUBLIC_TMDB_API_KEY` — TMDB API key
- Add to `.env.local` (already in `.gitignore`)

## Deployment
- **URL:** https://movietalk.vercel.app (update with actual)
- Auto-deploys on every push to `main`
- Check Vercel dashboard for build errors

## Target Site Reference
- **URL:** https://bingr.one
- **Screenshots & CSS:** See `bingr-one-observations.md`
- **Handoff history:** See `HANDOFF.md`
