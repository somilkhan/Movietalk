from playwright.sync_api import sync_playwright
import os, json

CHROMIUM_PATH = os.environ["CHROMIUM_BIN"]
BASE = "https://bingr.one"
OUT = "/home/runner/workspace/clone-data"

with open(f"{OUT}/stealth_init2.js") as f:
    STEALTH = f.read()

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True, executable_path=CHROMIUM_PATH,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
        locale="en-US",
    )
    ctx.add_init_script(STEALTH)
    page = ctx.new_page()
    page.goto(f"{BASE}/categories", wait_until="domcontentloaded", timeout=30000)
    page.wait_for_timeout(5000)

    data = page.evaluate("""
    () => {
      const cards = [...document.querySelectorAll('a, div')].filter(el => {
        const t = el.innerText?.trim();
        return t && ['Sports','Anime','TV','Movies','Sparks','Romance','Drama','Comedy','Family','Reality'].includes(t) && el.children.length <= 3;
      });
      return cards.slice(0,10).map(el => {
        const cs = getComputedStyle(el);
        return { text: el.innerText.trim(), background: cs.backgroundImage !== 'none' ? cs.backgroundImage : cs.backgroundColor, borderRadius: cs.borderRadius, className: el.className };
      });
    }
    """)
    print(json.dumps(data, indent=2))

    fonts = page.evaluate("""
    () => {
      const h1 = document.querySelector('h1');
      const body = document.body;
      return {
        h1Font: h1 ? getComputedStyle(h1).fontFamily : null,
        bodyFont: getComputedStyle(body).fontFamily,
        accent: getComputedStyle(document.querySelector('button') || body).color
      };
    }
    """)
    print(json.dumps(fonts, indent=2))
    browser.close()
