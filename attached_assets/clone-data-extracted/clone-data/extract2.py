from playwright.sync_api import sync_playwright
import json, os, re, hashlib, urllib.request

TARGET_URL = "https://bingr.one/home"
OUT_DIR = "clone-data"
PUBLIC_DIR = "clone-data/public"

os.makedirs(f"{OUT_DIR}/screenshots", exist_ok=True)
os.makedirs(f"{OUT_DIR}/components", exist_ok=True)
os.makedirs(f"{PUBLIC_DIR}/images", exist_ok=True)

def navigate_and_wait(page, url, wait_selector=None, timeout=60000):
    page.goto(url, wait_until="domcontentloaded", timeout=timeout)
    page.wait_for_timeout(3000)
    # Wait for actual content to appear (SPA hydration)
    if wait_selector:
        try:
            page.wait_for_selector(wait_selector, timeout=15000)
        except:
            pass
    else:
        # Generic: wait until body has content
        for _ in range(20):
            content_len = page.evaluate("document.body?.innerHTML?.length || 0")
            if content_len > 1000:
                break
            page.wait_for_timeout(500)
    page.wait_for_timeout(2000)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage", "--disable-gpu"]
    )

    # ---- HOME PAGE ----
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    navigate_and_wait(page, TARGET_URL, wait_selector="img, header, nav, [class*='header']")
    
    # Scroll to trigger lazy loading
    for _ in range(25):
        page.evaluate("window.scrollBy(0, 400)")
        page.wait_for_timeout(300)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(2000)

    # Save raw HTML
    raw_html = page.content()
    with open(f"{OUT_DIR}/raw.html", "w", encoding="utf-8") as f:
        f.write(raw_html)
    print(f"raw.html saved: {len(raw_html)} chars")

    # Full-page desktop screenshot
    page.screenshot(path=f"{OUT_DIR}/screenshots/desktop-full.png", full_page=True)
    print("Desktop screenshot done")

    # Header-only screenshot
    page.screenshot(path=f"{OUT_DIR}/screenshots/header-only.png", clip={"x":0,"y":0,"width":1440,"height":200})

    # Design tokens
    tokens = page.evaluate("""
    () => {
        const body = document.body;
        const cs = getComputedStyle(body);
        const cssVars = [];
        try {
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        if (rule.selectorText === ':root' || rule.selectorText === ':root, :host') {
                            for (const prop of rule.style) {
                                if (prop.startsWith('--')) {
                                    cssVars.push([prop, rule.style.getPropertyValue(prop).trim()]);
                                }
                            }
                        }
                    }
                } catch(e) {}
            }
        } catch(e) {}

        function getStyles(el) {
            if (!el) return null;
            const s = getComputedStyle(el);
            return {
                fontSize: s.fontSize, fontWeight: s.fontWeight, fontFamily: s.fontFamily,
                lineHeight: s.lineHeight, letterSpacing: s.letterSpacing, color: s.color,
                textTransform: s.textTransform, textAlign: s.textAlign,
                backgroundColor: s.backgroundColor, padding: s.padding,
                borderRadius: s.borderRadius, border: s.border, boxShadow: s.boxShadow,
                display: s.display, gap: s.gap, width: s.width, height: s.height
            };
        }

        const allFonts = [];
        try {
            for (const sheet of document.styleSheets) {
                try {
                    for (const rule of sheet.cssRules) {
                        if (rule instanceof CSSFontFaceRule) {
                            allFonts.push({
                                family: rule.style.getPropertyValue('font-family').replace(/['"]/g, ''),
                                src: rule.style.getPropertyValue('src'),
                                weight: rule.style.getPropertyValue('font-weight') || '400',
                                style: rule.style.getPropertyValue('font-style') || 'normal'
                            });
                        }
                    }
                } catch(e) {}
            }
        } catch(e) {}

        return {
            title: document.title,
            metaDescription: document.querySelector('meta[name="description"]')?.content || '',
            body: { bgColor: cs.backgroundColor, textColor: cs.color, fontFamily: cs.fontFamily, fontSize: cs.fontSize, lineHeight: cs.lineHeight },
            h1: getStyles(document.querySelector('h1')),
            h2: getStyles(document.querySelector('h2')),
            h3: getStyles(document.querySelector('h3')),
            button: getStyles(document.querySelector('button')),
            nav: getStyles(document.querySelector('nav, header')),
            card: getStyles(document.querySelector('[class*="card"], [class*="Card"]')),
            cssVars: cssVars,
            googleFonts: [...document.querySelectorAll('link[href*="fonts.googleapis"], link[href*="fonts.gstatic"]')].map(l => l.href),
            selfHostedFonts: allFonts,
            favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, rel: l.rel, sizes: l.sizes?.toString() || '' })),
            scriptSrcs: [...document.querySelectorAll('script[src]')].map(s => s.src).slice(0, 20),
            linkHrefs: [...document.querySelectorAll('link[href]')].map(l => l.href).slice(0, 30)
        };
    }
    """)
    with open(f"{OUT_DIR}/tokens.json", "w") as f:
        json.dump(tokens, f, indent=2)
    print(f"Title: {tokens.get('title')}")
    print(f"Body font: {tokens.get('body', {}).get('fontFamily')}")
    print(f"CSS vars count: {len(tokens.get('cssVars', []))}")
    print(f"Self-hosted fonts: {len(tokens.get('selfHostedFonts', []))}")

    # Section inventory
    inventory = page.evaluate("""
    () => {
        const sections = [];
        const header = document.querySelector('header, [class*="Navbar"], [class*="navbar"], [class*="Header"]');
        if (header) {
            const hs = getComputedStyle(header);
            sections.push({
                index: 0, type: 'header', tag: header.tagName.toLowerCase(),
                classes: header.className?.toString().slice(0, 300) || '',
                text: header.innerText?.trim().slice(0, 500) || '',
                html: header.outerHTML.slice(0, 5000),
                bgColor: hs.backgroundColor, color: hs.color,
                height: Math.round(header.getBoundingClientRect().height),
                navLinks: [...header.querySelectorAll('a')].map(a => ({text: a.innerText.trim(), href: a.getAttribute('href')})).filter(a => a.text).slice(0, 20)
            });
        }

        const main = document.querySelector('main') || document.body;
        [...main.children].forEach((child, idx) => {
            const rect = child.getBoundingClientRect();
            const cs = getComputedStyle(child);
            if (rect.height < 10 || cs.display === 'none') return;
            const headings = [...child.querySelectorAll('h1,h2,h3,h4,h5')].map(h => h.innerText.trim()).filter(Boolean).slice(0, 10);
            const buttons = [...child.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"]')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 10);
            const imgs = [...child.querySelectorAll('img')].map(i => ({src: i.src, alt: i.alt})).slice(0, 20);
            sections.push({
                index: idx + 1, type: 'section', tag: child.tagName.toLowerCase(),
                classes: child.className?.toString().slice(0, 300) || '',
                text: child.innerText?.trim().slice(0, 800) || '',
                html: child.outerHTML.slice(0, 8000),
                bgColor: cs.backgroundColor, color: cs.color,
                height: Math.round(rect.height), headings, buttons, imgs,
                display: cs.display, flexDirection: cs.flexDirection, gridTemplateColumns: cs.gridTemplateColumns,
                padding: cs.padding, gap: cs.gap
            });
        });

        const footer = document.querySelector('footer, [class*="footer"], [class*="Footer"]');
        if (footer) {
            const fs = getComputedStyle(footer);
            sections.push({
                index: 999, type: 'footer', tag: footer.tagName.toLowerCase(),
                classes: footer.className?.toString().slice(0, 300) || '',
                text: footer.innerText?.trim().slice(0, 1000) || '',
                html: footer.outerHTML.slice(0, 5000),
                bgColor: fs.backgroundColor, color: fs.color,
                height: Math.round(footer.getBoundingClientRect().height),
                links: [...footer.querySelectorAll('a')].map(a => ({text: a.innerText.trim(), href: a.getAttribute('href')})).filter(a => a.text).slice(0, 50)
            });
        }
        return sections;
    }
    """)
    with open(f"{OUT_DIR}/inventory.json", "w") as f:
        json.dump(inventory, f, indent=2)
    print(f"Sections: {len(inventory)}")
    for s in inventory:
        print(f"  [{s['index']}] {s['type']} - h:{s['height']}px - {s.get('classes','')[:60]}")

    # All assets + SVGs
    assets = page.evaluate("""
    () => ({
        images: [...document.querySelectorAll('img')].filter(i => i.src && !i.src.startsWith('data:')).map(i => ({
            src: i.src, alt: i.alt, displayW: i.offsetWidth, displayH: i.offsetHeight,
            naturalW: i.naturalWidth, naturalH: i.naturalHeight,
            parentClasses: i.parentElement?.className?.toString().slice(0,150) || ''
        })),
        backgroundImages: [...document.querySelectorAll('*')].filter(el => {
            const bg = getComputedStyle(el).backgroundImage;
            return bg && bg !== 'none' && bg.includes('url(');
        }).slice(0, 30).map(el => ({
            url: getComputedStyle(el).backgroundImage,
            classes: el.className?.toString().slice(0,150) || ''
        })),
        svgs: [...document.querySelectorAll('svg')].slice(0, 40).map((svg,i) => ({
            index: i, html: svg.outerHTML.length < 4000 ? svg.outerHTML : '[TOO_LARGE]',
            viewBox: svg.getAttribute('viewBox'), ariaLabel: svg.getAttribute('aria-label') || '',
            parentText: svg.parentElement?.innerText?.trim().slice(0,80) || '',
            parentClasses: svg.parentElement?.className?.toString().slice(0,100) || ''
        })),
        allLinks: [...document.querySelectorAll('a')].map(a => ({text: a.innerText.trim().slice(0,50), href: a.getAttribute('href')})).filter(a => a.text).slice(0, 60),
        bodyHTML: document.body.innerHTML.slice(0, 20000)
    })
    """)
    with open(f"{OUT_DIR}/assets.json", "w") as f:
        json.dump(assets, f, indent=2)
    print(f"Images: {len(assets.get('images', []))}, SVGs: {len(assets.get('svgs', []))}")
    print(f"Nav links (first 10): {[l['text'] for l in assets.get('allLinks', [])[:10]]}")

    # Header deep extraction
    header_info = page.evaluate("""
    () => {
        const header = document.querySelector('header, [class*="Navbar"], [class*="navbar"], [class*="Header"]');
        if (!header) return {error: 'no header found', bodyStart: document.body.innerHTML.slice(0,2000)};
        const hs = getComputedStyle(header);
        const logo = header.querySelector('img');
        const logoRect = logo?.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        return {
            html: header.outerHTML.slice(0, 8000),
            bgColor: hs.backgroundColor, color: hs.color,
            height: Math.round(headerRect.height),
            position: hs.position,
            logoSrc: logo?.src || null,
            logoAlt: logo?.alt || null,
            logoPosition: logoRect ? (logoRect.left < headerRect.width/3 ? 'left' : logoRect.left < headerRect.width*2/3 ? 'center' : 'right') : 'unknown',
            navLinks: [...header.querySelectorAll('a')].map(a => ({text: a.innerText.trim(), href: a.getAttribute('href'), classes: a.className?.toString().slice(0,100)})).filter(a => a.text).slice(0, 25),
            svgs: [...header.querySelectorAll('svg')].map(svg => ({html: svg.outerHTML.slice(0,3000), viewBox: svg.getAttribute('viewBox'), ariaLabel: svg.getAttribute('aria-label')}))
        };
    }
    """)
    with open(f"{OUT_DIR}/header.json", "w") as f:
        json.dump(header_info, f, indent=2)
    print(f"Header: bg={header_info.get('bgColor')}, logo pos={header_info.get('logoPosition')}")
    print(f"Header nav links: {[l['text'] for l in header_info.get('navLinks', [])]}")

    # Scroll state of header
    before_scroll = page.evaluate("""
    () => {
        const h = document.querySelector('header, [class*="Navbar"], [class*="navbar"]');
        if (!h) return null;
        const s = getComputedStyle(h);
        return { bgColor: s.backgroundColor, boxShadow: s.boxShadow, height: s.height, position: s.position, backdropFilter: s.backdropFilter };
    }
    """)
    page.evaluate("window.scrollTo(0, 400)")
    page.wait_for_timeout(800)
    after_scroll = page.evaluate("""
    () => {
        const h = document.querySelector('header, [class*="Navbar"], [class*="navbar"]');
        if (!h) return null;
        const s = getComputedStyle(h);
        return { bgColor: s.backgroundColor, boxShadow: s.boxShadow, height: s.height, position: s.position, backdropFilter: s.backdropFilter };
    }
    """)
    page.evaluate("window.scrollTo(0, 0)")
    with open(f"{OUT_DIR}/scroll-state.json", "w") as f:
        json.dump({"before": before_scroll, "after": after_scroll}, f, indent=2)
    print(f"Scroll state captured")

    # Mobile screenshot
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1500)
    page.screenshot(path=f"{OUT_DIR}/screenshots/mobile-full.png", full_page=True)
    print("Mobile screenshot done")

    # Tablet screenshot
    page.set_viewport_size({"width": 768, "height": 1024})
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/screenshots/tablet-full.png", full_page=True)
    print("Tablet screenshot done")

    # Back to desktop
    page.set_viewport_size({"width": 1440, "height": 900})
    page.wait_for_timeout(500)

    # ---- MOVIE DETAIL PAGE ----
    navigate_and_wait(page, "https://bingr.one/movie/969681", wait_selector="img, h1, h2")
    for _ in range(12): page.evaluate("window.scrollBy(0, 400)"); page.wait_for_timeout(200)
    page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(1000)
    movie_html = page.content()
    with open(f"{OUT_DIR}/movie-detail-raw.html", "w", encoding="utf-8") as f:
        f.write(movie_html)
    movie_assets = page.evaluate("""
    () => ({
        title: document.title,
        h1: document.querySelector('h1')?.innerText,
        images: [...document.querySelectorAll('img')].map(i => ({src: i.src, alt: i.alt})).slice(0, 20),
        bodyHTML: document.body.innerHTML.slice(0, 30000)
    })
    """)
    with open(f"{OUT_DIR}/movie-page-assets.json", "w") as f:
        json.dump(movie_assets, f, indent=2)
    page.screenshot(path=f"{OUT_DIR}/screenshots/movie-detail-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(800)
    page.screenshot(path=f"{OUT_DIR}/screenshots/movie-detail-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print(f"Movie page: {len(movie_html)} chars, title={movie_assets.get('title')}")

    # ---- TV DETAIL PAGE ----
    navigate_and_wait(page, "https://bingr.one/tv/94997", wait_selector="img, h1, h2")
    for _ in range(12): page.evaluate("window.scrollBy(0, 400)"); page.wait_for_timeout(200)
    page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(1000)
    tv_html = page.content()
    with open(f"{OUT_DIR}/tv-detail-raw.html", "w", encoding="utf-8") as f:
        f.write(tv_html)
    tv_assets = page.evaluate("""
    () => ({
        title: document.title,
        h1: document.querySelector('h1')?.innerText,
        images: [...document.querySelectorAll('img')].map(i => ({src: i.src, alt: i.alt})).slice(0, 20),
        bodyHTML: document.body.innerHTML.slice(0, 30000)
    })
    """)
    with open(f"{OUT_DIR}/tv-page-assets.json", "w") as f:
        json.dump(tv_assets, f, indent=2)
    page.screenshot(path=f"{OUT_DIR}/screenshots/tv-detail-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(800)
    page.screenshot(path=f"{OUT_DIR}/screenshots/tv-detail-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print(f"TV page: {len(tv_html)} chars, title={tv_assets.get('title')}")

    # ---- WATCH/PLAYER PAGE ----
    navigate_and_wait(page, "https://bingr.one/watch/tv/94997/1/1", wait_selector="video, iframe, [class*='player']")
    page.wait_for_timeout(3000)
    watch_html = page.content()
    with open(f"{OUT_DIR}/watch-raw.html", "w", encoding="utf-8") as f:
        f.write(watch_html)
    watch_assets = page.evaluate("""
    () => ({
        title: document.title,
        bodyHTML: document.body.innerHTML.slice(0, 20000),
        videos: [...document.querySelectorAll('video')].map(v => ({src: v.src, poster: v.poster})),
        iframes: [...document.querySelectorAll('iframe')].map(i => ({src: i.src, width: i.width, height: i.height}))
    })
    """)
    with open(f"{OUT_DIR}/watch-page-assets.json", "w") as f:
        json.dump(watch_assets, f, indent=2)
    page.screenshot(path=f"{OUT_DIR}/screenshots/watch-page-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(800)
    page.screenshot(path=f"{OUT_DIR}/screenshots/watch-page-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print(f"Watch page: {len(watch_html)} chars")

    # ---- SEARCH PAGE ----
    navigate_and_wait(page, "https://bingr.one/search", wait_selector="input, [class*='search']")
    page.wait_for_timeout(2000)
    search_html = page.content()
    with open(f"{OUT_DIR}/search-raw.html", "w", encoding="utf-8") as f:
        f.write(search_html)
    page.screenshot(path=f"{OUT_DIR}/screenshots/search-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(600)
    page.screenshot(path=f"{OUT_DIR}/screenshots/search-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print(f"Search page: {len(search_html)} chars")

    # Download logo
    logo_url = "https://bingr.one/brand/logo.png"
    try:
        req = urllib.request.Request(logo_url, headers={"User-Agent": "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            logo_data = resp.read()
        with open(f"{PUBLIC_DIR}/images/bingr-logo.png", "wb") as f:
            f.write(logo_data)
        print(f"Logo downloaded: {len(logo_data)} bytes")
    except Exception as e:
        print(f"Logo download failed: {e}")

    # Download favicon
    try:
        fav_url = "https://bingr.one/favicon.ico"
        req = urllib.request.Request(fav_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=10) as resp:
            with open(f"{PUBLIC_DIR}/images/favicon.ico", "wb") as f:
                f.write(resp.read())
        print("Favicon downloaded")
    except Exception as e:
        print(f"Favicon: {e}")

    browser.close()

print("\n=== DONE ===")
for fname in sorted(os.listdir(OUT_DIR)):
    if not os.path.isdir(f"{OUT_DIR}/{fname}"):
        size = os.path.getsize(f"{OUT_DIR}/{fname}")
        print(f"  {fname}: {size} bytes")
