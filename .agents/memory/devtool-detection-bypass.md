---
name: Bypassing devtool-detection during site extraction
description: How to scrape/screenshot a site that blanks itself to about:blank when it detects automation or open devtools.
---

Some sites ship a `disable-devtool`-style script that uses `console.log`/`console.table`/`console.clear` timing tricks to detect CDP/automation or open DevTools, then navigates the page to `about:blank` shortly after render.

**Fix:** before navigation, inject a Playwright `add_init_script` that:
- No-ops `console.log`, `console.table`, `console.clear`, `console.dir`, `console.debug`, `console.info`, `console.warn`, `console.error` (the timing trick relies on these).
- Adds basic stealth: `navigator.webdriver` undefined, fake `navigator.plugins`/`languages`, define `window.chrome`.

**Why:** this defeats the detection script entirely — the SPA renders normally and stays rendered instead of blanking after a few seconds. Without this, extraction (raw HTML, screenshots) silently fails a few seconds after page load.

**How to apply:** any time a target site's content disappears/blanks a few seconds after Playwright navigation, suspect this pattern before assuming a normal render bug.
