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
    resp = page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
    print("status:", resp.status if resp else None, "url:", page.url)
    html0 = page.content()
    print("html len immediately:", len(html0))
    page.wait_for_timeout(500)
    print("url@0.5s:", page.url, "len:", len(page.content()))
    page.wait_for_timeout(1000)
    print("url@1.5s:", page.url, "len:", len(page.content()))
    with open("/home/runner/workspace/clone-data/raw_early.html", "w") as f:
        f.write(html0)
    browser.close()
