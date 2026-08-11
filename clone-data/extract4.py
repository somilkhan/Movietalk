from playwright.sync_api import sync_playwright
import os

CHROMIUM_PATH = os.environ["CHROMIUM_BIN"]
TARGET_URL = "https://bingr.one"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path=CHROMIUM_PATH,
        args=["--no-sandbox", "--disable-setuid-sandbox", "--disable-blink-features=AutomationControlled"]
    )
    ctx = browser.new_context(
        viewport={"width": 1440, "height": 900},
        user_agent="Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/125.0.0.0 Safari/537.36",
    )
    ctx.add_init_script("Object.defineProperty(navigator, 'webdriver', {get: () => undefined});")
    page = ctx.new_page()
    page.on("requestfailed", lambda req: print("REQFAIL:", req.url, req.failure))
    page.on("response", lambda res: print("RESP:", res.status, res.url) if "api.bingr" in res.url else None)
    resp = page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
    for i in range(10):
        page.wait_for_timeout(1000)
        print(f"t={i+1}s url:", page.url, "len:", len(page.content()))
    browser.close()
