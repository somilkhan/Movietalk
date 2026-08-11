from playwright.sync_api import sync_playwright
import json, os, re, hashlib, urllib.request

TARGET_URL = "https://bingr.one/home"
OUT_DIR = "clone-data"
PUBLIC_DIR = "clone-data/public"

os.makedirs(f"{OUT_DIR}/screenshots", exist_ok=True)
os.makedirs(f"{OUT_DIR}/components", exist_ok=True)
os.makedirs(f"{PUBLIC_DIR}/images", exist_ok=True)
os.makedirs(f"{PUBLIC_DIR}/fonts", exist_ok=True)

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-dev-shm-usage"]
    )

    # ---- DESKTOP ----
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(6000)

    # Scroll to trigger lazy loading
    for _ in range(30):
        page.evaluate("window.scrollBy(0, 400)")
        page.wait_for_timeout(200)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(2000)

    # 1. Save raw HTML
    raw_html = page.content()
    with open(f"{OUT_DIR}/raw.html", "w", encoding="utf-8") as f:
        f.write(raw_html)
    print(f"raw.html saved: {len(raw_html)} chars")

    # 2. Full-page desktop screenshot
    page.screenshot(path=f"{OUT_DIR}/screenshots/desktop-full.png", full_page=True)
    print("Desktop screenshot done")

    # 3. Header-only screenshot (top 150px)
    page.screenshot(path=f"{OUT_DIR}/screenshots/header-only.png", clip={"x":0,"y":0,"width":1440,"height":150})
    print("Header screenshot done")

    # 4. Mobile screenshot
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1500)
    page.screenshot(path=f"{OUT_DIR}/screenshots/mobile-full.png", full_page=True)
    print("Mobile screenshot done")

    # Reset to desktop
    page.set_viewport_size({"width": 1440, "height": 900})
    page.wait_for_timeout(1000)

    # 5. Design tokens
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
                display: s.display, gap: s.gap
            };
        }

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
            selfHostedFonts: (() => {
                const fonts = [];
                try {
                    for (const sheet of document.styleSheets) {
                        try {
                            for (const rule of sheet.cssRules) {
                                if (rule instanceof CSSFontFaceRule) {
                                    fonts.push({
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
                return fonts;
            })(),
            favicons: [...document.querySelectorAll('link[rel*="icon"]')].map(l => ({ href: l.href, rel: l.rel, sizes: l.sizes?.toString() || '' }))
        };
    }
    """)
    with open(f"{OUT_DIR}/tokens.json", "w") as f:
        json.dump(tokens, f, indent=2)
    print("Design tokens saved")

    # 6. Section inventory
    inventory = page.evaluate("""
    () => {
        const sections = [];
        const header = document.querySelector('header, nav, [class*="header"], [class*="navbar"]');
        if (header) {
            const hs = getComputedStyle(header);
            sections.push({
                index: 0, type: 'header', selector: 'header',
                tag: header.tagName.toLowerCase(), classes: header.className?.toString().slice(0, 300) || '',
                text: header.innerText?.trim().slice(0, 500) || '',
                html: header.outerHTML.slice(0, 3000),
                bgColor: hs.backgroundColor,
                height: Math.round(header.getBoundingClientRect().height),
                navLinks: [...header.querySelectorAll('a')].map(a => ({text: a.innerText.trim(), href: a.getAttribute('href')})).filter(a => a.text).slice(0, 15)
            });
        }

        const main = document.querySelector('main') || document.body;
        const children = [...main.children];
        children.forEach((child, idx) => {
            const rect = child.getBoundingClientRect();
            const cs = getComputedStyle(child);
            if (rect.height < 10 || cs.display === 'none') return;
            const headings = [...child.querySelectorAll('h1,h2,h3,h4,h5')].map(h => h.innerText.trim()).filter(Boolean).slice(0, 10);
            const buttons = [...child.querySelectorAll('button, a[class*="btn"], a[class*="button"], [role="button"]')].map(b => b.innerText.trim()).filter(Boolean).slice(0, 10);
            const imgs = [...child.querySelectorAll('img')].map(i => ({src: i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight})).slice(0, 20);
            sections.push({
                index: idx + 1,
                type: child.querySelector('[class*="hero"]') ? 'hero' : child.querySelector('[class*="carousel"], [class*="slider"], [class*="scroll"]') ? 'carousel' : child.querySelectorAll('img').length > 3 ? 'grid' : 'content',
                selector: child.id ? '#'+child.id : child.tagName.toLowerCase()+'.'+(child.className?.toString().split(' ')[0] || ''),
                tag: child.tagName.toLowerCase(), classes: child.className?.toString().slice(0, 300) || '',
                text: child.innerText?.trim().slice(0, 800) || '',
                html: child.outerHTML.slice(0, 5000),
                bgColor: cs.backgroundColor,
                height: Math.round(rect.height),
                headings, buttons, imgs,
                display: cs.display, flexDirection: cs.flexDirection, gridTemplateColumns: cs.gridTemplateColumns,
                padding: cs.padding, gap: cs.gap
            });
        });

        const footer = document.querySelector('footer, [class*="footer"]');
        if (footer) {
            const fs = getComputedStyle(footer);
            sections.push({
                index: 999, type: 'footer', selector: 'footer',
                tag: footer.tagName.toLowerCase(), classes: footer.className?.toString().slice(0, 300) || '',
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
    print(f"Section inventory saved: {len(inventory)} sections")

    # 7. Header deep extraction
    header_info = page.evaluate("""
    () => {
        const header = document.querySelector('header, [class*="header"], [class*="navbar"]');
        if (!header) return null;
        const hs = getComputedStyle(header);
        const logo = header.querySelector('img[class*="logo"], img[alt*="logo"], img[alt*="Logo"], svg, [class*="logo"] img');
        const logoRect = logo?.getBoundingClientRect();
        const headerRect = header.getBoundingClientRect();
        return {
            html: header.outerHTML.slice(0, 8000),
            bgColor: hs.backgroundColor,
            height: Math.round(headerRect.height),
            logoHTML: logo ? logo.outerHTML.slice(0, 2000) : null,
            logoPosition: logoRect ? (logoRect.left < headerRect.width/3 ? 'left' : logoRect.left < headerRect.width*2/3 ? 'center' : 'right') : 'unknown',
            logoSrc: logo?.tagName === 'IMG' ? logo.src : null,
            navLinks: [...header.querySelectorAll('nav a, [class*="nav"] a, header a')].map(a => ({text: a.innerText.trim(), href: a.getAttribute('href')})).filter(a => a.text && a.text.length < 50).slice(0, 20),
            allLinks: [...header.querySelectorAll('a')].map(a => ({text: a.innerText.trim(), href: a.getAttribute('href'), classes: a.className?.toString().slice(0,100)})).filter(a => a.text).slice(0, 30),
            svgs: [...header.querySelectorAll('svg')].map(svg => ({html: svg.outerHTML.slice(0, 3000), viewBox: svg.getAttribute('viewBox'), ariaLabel: svg.getAttribute('aria-label')}))
        };
    }
    """)
    with open(f"{OUT_DIR}/header.json", "w") as f:
        json.dump(header_info, f, indent=2)
    print("Header info saved")

    # 8. All assets
    assets = page.evaluate("""
    () => ({
        images: [...document.querySelectorAll('img')].filter(i => i.src && !i.src.startsWith('data:')).map(i => ({
            src: i.src, alt: i.alt, w: i.naturalWidth, h: i.naturalHeight,
            displayW: i.offsetWidth, displayH: i.offsetHeight,
            parentClasses: i.parentElement?.className?.toString().slice(0,100) || ''
        })),
        backgroundImages: [...document.querySelectorAll('*')].filter(el => {
            const bg = getComputedStyle(el).backgroundImage;
            return bg && bg !== 'none' && bg.includes('url(');
        }).slice(0, 30).map(el => ({
            url: getComputedStyle(el).backgroundImage,
            classes: el.className?.toString().slice(0,100) || ''
        })),
        svgs: [...document.querySelectorAll('svg')].slice(0, 30).map((svg,i) => ({
            index: i,
            html: svg.outerHTML.length < 4000 ? svg.outerHTML : '[TOO_LARGE]',
            viewBox: svg.getAttribute('viewBox'),
            ariaLabel: svg.getAttribute('aria-label') || '',
            parentText: svg.parentElement?.innerText?.trim().slice(0,50) || ''
        }))
    })
    """)
    with open(f"{OUT_DIR}/assets.json", "w") as f:
        json.dump(assets, f, indent=2)
    print(f"Assets saved: {len(assets.get('images',[]))} images, {len(assets.get('svgs',[]))} SVGs")

    # 9. Hover/scroll states
    scroll_state = page.evaluate("""
    () => {
        const header = document.querySelector('header, [class*="header"], [class*="navbar"]');
        if (!header) return null;
        const cs = getComputedStyle(header);
        return { before: { bgColor: cs.backgroundColor, boxShadow: cs.boxShadow, position: cs.position, height: cs.height } };
    }
    """)
    page.evaluate("window.scrollTo(0, 300)")
    page.wait_for_timeout(800)
    scroll_after = page.evaluate("""
    () => {
        const header = document.querySelector('header, [class*="header"], [class*="navbar"]');
        if (!header) return null;
        const cs = getComputedStyle(header);
        return { bgColor: cs.backgroundColor, boxShadow: cs.boxShadow, position: cs.position, height: cs.height, backdropFilter: cs.backdropFilter };
    }
    """)
    page.evaluate("window.scrollTo(0, 0)")
    with open(f"{OUT_DIR}/scroll-state.json", "w") as f:
        json.dump({"before": scroll_state, "after": scroll_after}, f, indent=2)
    print("Scroll states saved")

    # 10. Movie detail page
    page.goto("https://bingr.one/movie/969681", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(4000)
    for _ in range(10): page.evaluate("window.scrollBy(0, 400)"); page.wait_for_timeout(150)
    page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(1000)
    movie_html = page.content()
    with open(f"{OUT_DIR}/movie-detail-raw.html", "w", encoding="utf-8") as f:
        f.write(movie_html)
    page.screenshot(path=f"{OUT_DIR}/screenshots/movie-detail-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/screenshots/movie-detail-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print("Movie detail page saved")

    # 11. TV detail page
    page.goto("https://bingr.one/tv/94997", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(4000)
    for _ in range(10): page.evaluate("window.scrollBy(0, 400)"); page.wait_for_timeout(150)
    page.evaluate("window.scrollTo(0,0)"); page.wait_for_timeout(1000)
    tv_html = page.content()
    with open(f"{OUT_DIR}/tv-detail-raw.html", "w", encoding="utf-8") as f:
        f.write(tv_html)
    page.screenshot(path=f"{OUT_DIR}/screenshots/tv-detail-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/screenshots/tv-detail-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print("TV detail page saved")

    # 12. Watch/player page
    page.goto("https://bingr.one/watch/tv/94997/1/1", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(4000)
    watch_html = page.content()
    with open(f"{OUT_DIR}/watch-raw.html", "w", encoding="utf-8") as f:
        f.write(watch_html)
    page.screenshot(path=f"{OUT_DIR}/screenshots/watch-page-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/screenshots/watch-page-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print("Watch page saved")

    # 13. Search page
    page.goto("https://bingr.one/search", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(3000)
    search_html = page.content()
    with open(f"{OUT_DIR}/search-raw.html", "w", encoding="utf-8") as f:
        f.write(search_html)
    page.screenshot(path=f"{OUT_DIR}/screenshots/search-desktop.png", full_page=True)
    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/screenshots/search-mobile.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    print("Search page saved")

    # Back to home for final responsive check
    page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(4000)

    # Tablet screenshot
    page.set_viewport_size({"width": 768, "height": 1024})
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/screenshots/tablet-full.png", full_page=True)
    print("Tablet screenshot done")

    # Download logo
    page.set_viewport_size({"width": 1440, "height": 900})
    page.wait_for_timeout(500)
    logo_url = "https://bingr.one/brand/logo.png"
    try:
        req = urllib.request.Request(logo_url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=15) as resp:
            with open(f"{PUBLIC_DIR}/images/bingr-logo.png", "wb") as f:
                f.write(resp.read())
        print("Logo downloaded")
    except Exception as e:
        print(f"Logo download failed: {e}")

    browser.close()

print("\n=== EXTRACTION COMPLETE ===")
print(f"Files in {OUT_DIR}/screenshots: {os.listdir(OUT_DIR+'/screenshots')}")
print(f"Files in {OUT_DIR}: {[f for f in os.listdir(OUT_DIR) if f.endswith('.json') or f.endswith('.html')]}")
