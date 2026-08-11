from playwright.sync_api import sync_playwright
import os, json

CHROMIUM_PATH = os.environ["CHROMIUM_BIN"]
BASE = "https://bingr.one"
OUT = "/home/runner/workspace/clone-data"

with open(f"{OUT}/stealth_init2.js") as f:
    STEALTH = f.read()

def new_page(ctx):
    page = ctx.new_page()
    return page

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path=CHROMIUM_PATH,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        locale="en-US",
    )
    ctx.add_init_script(STEALTH)
    page = new_page(ctx)
    page.goto(f"{BASE}/home", wait_until="domcontentloaded", timeout=60000)
    page.wait_for_timeout(6000)
    print("HOME url:", page.url, "len:", len(page.content()))

    # Full page screenshot
    page.screenshot(path=f"{OUT}/screenshots/home-desktop.png", full_page=True)

    # Sidebar nav extraction
    nav = page.evaluate("""
    () => {
      const nav = document.querySelector('nav');
      if (!nav) return null;
      const items = [...nav.querySelectorAll('a, button')].map(el => ({
        tag: el.tagName, href: el.getAttribute('href'),
        text: el.innerText.trim(), title: el.getAttribute('title'),
        html: el.outerHTML.slice(0, 400)
      }));
      return { outerHTML: nav.outerHTML.slice(0, 6000), items };
    }
    """)
    with open(f"{OUT}/nav.json", "w") as f:
        json.dump(nav, f, indent=2)
    print("nav items:", len(nav['items']) if nav else 0)

    # Design tokens
    tokens = page.evaluate("""
    () => {
      const body = document.body;
      const cs = getComputedStyle(body);
      const h1 = document.querySelector('h1, [class*="text-5xl"], [class*="text-6xl"]');
      const btn = document.querySelector('button');
      function styles(el){ if(!el) return null; const s=getComputedStyle(el); return {fontFamily:s.fontFamily, fontSize:s.fontSize, fontWeight:s.fontWeight, color:s.color, backgroundColor:s.backgroundColor, borderRadius:s.borderRadius}; }
      return {
        bodyBg: cs.backgroundColor, bodyColor: cs.color, bodyFont: cs.fontFamily,
        h1: styles(h1), btn: styles(btn),
        fonts: [...document.querySelectorAll('link[href*="fonts.googleapis"]')].map(l=>l.href),
        title: document.title
      };
    }
    """)
    with open(f"{OUT}/tokens.json", "w") as f:
        json.dump(tokens, f, indent=2)
    print("tokens:", tokens)

    # Hero section
    hero = page.evaluate("""
    () => {
      const main = document.querySelector('main') || document.body;
      const firstChild = main.children[0];
      return firstChild ? firstChild.outerHTML.slice(0, 8000) : null;
    }
    """)
    with open(f"{OUT}/hero.html", "w") as f:
        f.write(hero or "")

    # Rows / sections headings
    headings = page.evaluate("""
    () => [...document.querySelectorAll('h2, h3')].map(h => h.innerText.trim()).filter(t=>t)
    """)
    print("headings:", headings)
    with open(f"{OUT}/headings.json", "w") as f:
        json.dump(headings, f, indent=2)

    # Images
    images = page.evaluate("""
    () => [...document.querySelectorAll('img')].filter(i=>i.offsetWidth>20).map(i=>({src:i.src, alt:i.alt, w:i.offsetWidth,h:i.offsetHeight}))
    """)
    with open(f"{OUT}/images.json", "w") as f:
        json.dump(images, f, indent=2)
    print("images count:", len(images))

    browser.close()
