from playwright.sync_api import sync_playwright
import os

CHROMIUM_PATH = os.environ["CHROMIUM_BIN"]
TARGET_URL = "https://bingr.one"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path=CHROMIUM_PATH,
        args=["--no-sandbox", "--disable-setuid-sandbox"]
    )
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    page.on("console", lambda msg: print("CONSOLE:", msg.type, msg.text))
    page.on("requestfailed", lambda req: print("REQFAIL:", req.url, req.failure))
    page.on("framenavigated", lambda frame: print("NAV:", frame.url))
    resp = page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
    print("status right after goto:", resp.status if resp else None, "page.url:", page.url)
    page.wait_for_timeout(3000)
    print("after 3s url:", page.url, "title:", page.title())
    html_len = len(page.content())
    print("html len after 3s:", html_len)
    page.wait_for_timeout(5000)
    print("after 8s total url:", page.url, "title:", page.title())
    print("html len:", len(page.content()))
    browser.close()
