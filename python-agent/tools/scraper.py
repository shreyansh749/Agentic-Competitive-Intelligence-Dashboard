import requests
from bs4 import BeautifulSoup
from playwright.sync_api import sync_playwright
import time

def scrape_static(url: str) -> str:
    """Scrape a static page using BeautifulSoup"""
    try:
        headers = {"User-Agent": "Mozilla/5.0 (compatible; IntelBot/1.0)"}
        res = requests.get(url, headers=headers, timeout=10)
        soup = BeautifulSoup(res.text, "html.parser")

        for tag in soup(["script", "style", "nav", "footer", "header"]):
            tag.decompose()

        text = soup.get_text(separator=" ", strip=True)
        return text[:5000]
    except Exception as e:
        return f"SCRAPE_ERROR: {str(e)}"

def scrape_dynamic(url: str) -> str:
    """Scrape JS-heavy pages using Playwright"""
    try:
        with sync_playwright() as p:
            browser = p.chromium.launch(headless=True)
            page = browser.new_page()
            page.goto(url, timeout=15000)
            time.sleep(2)  # allow JS to load
            text = page.inner_text("body")
            browser.close()
            return text[:5000]
    except Exception as e:
        return f"DYNAMIC_SCRAPE_ERROR: {str(e)}"

def scrape_website(competitor_name: str, url: str) -> str:
    """
    Main scraper function — try static first,
    fall back to dynamic if not enough data is found
    """
    print(f"[Scraper] Scraping {competitor_name} at {url}")

    static_data = scrape_static(url)

    if len(static_data) > 500 and "SCRAPE_ERROR" not in static_data:
        return static_data

    print(f"[Scraper] Static failed, trying dynamic for {competitor_name}")
    return scrape_dynamic(url)