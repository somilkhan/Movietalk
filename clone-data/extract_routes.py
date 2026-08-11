from playwright.sync_api import sync_playwright
import os, json

CHROMIUM_PATH = os.environ["CHROMIUM_BIN"]
BASE = "https://bingr.one"
OUT = "/home/runner/workspace/clone-data"

with open(f"{OUT}/stealth_init2.js") as f:
    STEALTH = f.read()

routes = ["/home", "/explore", "/movies", "/tv", "/anime", "/sports", "/categories", "/space", "/login", "/signup"]

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
    page = ctx.new_page()

    for route in routes:
        try:
            page.goto(f"{BASE}{route}", wait_until="domcontentloaded", timeout=30000)
            page.wait_for_timeout(4000)
            slug = route.strip("/").replace("/", "-") or "root"
            html = page.content()
            with open(f"{OUT}/route-{slug}.html", "w") as f:
                f.write(html)
            page.screenshot(path=f"{OUT}/screenshots/route-{slug}.png", full_page=True)
            print(f"{route} -> url={page.url} len={len(html)}")
        except Exception as e:
            print(f"{route} FAILED: {e}")

    browser.close()
