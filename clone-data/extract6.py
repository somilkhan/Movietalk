from playwright.sync_api import sync_playwright
import os

CHROMIUM_PATH = os.environ["CHROMIUM_BIN"]
TARGET_URL = "https://bingr.one"

with open("/home/runner/workspace/clone-data/stealth_init2.js") as f:
    STEALTH = f.read()

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
    resp = page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
    for i in range(10):
        page.wait_for_timeout(1000)
        print(f"t={i+1}s url:", page.url, "len:", len(page.content()))
        if page.url == "about:blank":
            break
    if page.url != "about:blank":
        page.wait_for_timeout(3000)
        html = page.content()
        with open("/home/runner/workspace/clone-data/raw_home.html", "w") as f:
            f.write(html)
        print("saved raw_home.html len", len(html))
        page.screenshot(path="/home/runner/workspace/clone-data/screenshots/home-full.png", full_page=True)
    browser.close()
