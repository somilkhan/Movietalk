---
name: Tailwind v4 CSS @import ordering
description: Google Fonts @import in a Tailwind v4 index.css must come before @import 'tailwindcss', or PostCSS throws "@import must precede all other statements".
---

In the artifact scaffold's `index.css`, the file starts with `@import 'tailwindcss'; @import 'tw-animate-css'; @plugin "...";`. If you add a Google Fonts `@import url(...)` for a custom display/body font, it must be placed **before** `@import 'tailwindcss'` (i.e. as the very first line), not after it.

**Why:** `@import 'tailwindcss'` expands into a large amount of generated CSS during PostCSS processing. If the font `@import` is textually placed after it (even before other non-import statements like `@plugin`), PostCSS ends up emitting it after already-flattened content, which violates the CSS rule that `@import` must precede all other statements — causing a build error (`[vite:css][postcss] @import must precede all other statements`).

**How to apply:** whenever customizing fonts in a Tailwind v4 artifact's `index.css`, always add the font `@import` as line 1, above the `@import 'tailwindcss'` line.
