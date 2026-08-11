from playwright.sync_api import sync_playwright
import json, os

CHROMIUM_PATH = os.environ["CHROMIUM_BIN"]
TARGET_URL = "https://bingr.one"
OUT_DIR = "/home/runner/workspace/clone-data"

with sync_playwright() as p:
    browser = p.chromium.launch(
        headless=True,
        executable_path=CHROMIUM_PATH,
        args=["--no-sandbox", "--disable-setuid-sandbox"]
    )
    page = browser.new_page(viewport={"width": 1440, "height": 900})
    try:
        resp = page.goto(TARGET_URL, wait_until="domcontentloaded", timeout=60000)
        print("status:", resp.status if resp else None)
    except Exception as e:
        print("GOTO ERROR:", repr(e))
    page.wait_for_timeout(6000)

    for _ in range(15):
        page.evaluate("window.scrollBy(0, 500)")
        page.wait_for_timeout(400)
    page.evaluate("window.scrollTo(0, 0)")
    page.wait_for_timeout(1500)

    raw_html = page.content()
    with open(f"{OUT_DIR}/raw.html", "w", encoding="utf-8") as f:
        f.write(raw_html)
    print(f"Saved raw.html ({len(raw_html)} chars)")

    page.screenshot(path=f"{OUT_DIR}/screenshots/desktop-full.png", full_page=True)
    page.screenshot(path=f"{OUT_DIR}/screenshots/header.png", clip={"x":0,"y":0,"width":1440,"height":150})

    page.set_viewport_size({"width": 390, "height": 844})
    page.wait_for_timeout(1000)
    page.screenshot(path=f"{OUT_DIR}/screenshots/mobile-full.png", full_page=True)
    page.set_viewport_size({"width": 1440, "height": 900})
    page.wait_for_timeout(500)

    print("title:", page.title())
    print("url:", page.url)
    browser.close()
