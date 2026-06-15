import feedparser
import requests
import random
import re  # HTML cleaning ke liye
from datetime import datetime, timezone
import os

def clean_html(raw_html: str) -> str:
    """HTML tags aur extra whitespace ko clean karke simple text return karega"""
    if not raw_html:
        return ""
    # Saare <tags> ko remove karo
    clean_text = re.sub(r'<[^>]+>', '', raw_html)
    # Extra spaces aur newlines ko fix karo
    return " ".join(clean_text.split())

def get_safe_headers() -> dict:
    """Google ko fake karne ke liye alag-alag real user agents return karega"""
    user_agents = [
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/16.6 Safari/605.1.15",
        "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/119.0"
    ]
    return {
        "User-Agent": random.choice(user_agents),
        "Accept": "application/xml, text/xml, */*",
        "Accept-Language": "en-US,en;q=0.5"
    }

def fetch_rss(competitor_name: str) -> str:
    """
    Google News RSS se competitor ke baare mein latest articles fetch karo.
    Timeout handle karke fallback search par control transfer karega.
    """
    print(f"[News] Fetching news for {competitor_name}")

    query = competitor_name.replace(" ", "+")
    rss_url = f"https://news.google.com/rss/search?q={query}&hl=en-IN&gl=IN&ceid=IN:en"

    try:
        # Timeout set kiya 8 seconds ka + Custom Headers lagaye
        response = requests.get(rss_url, headers=get_safe_headers(), timeout=8)
        response.raise_for_status()
        
        # Raw XML content ko feedparser se parse kiya
        feed = feedparser.parse(response.content)
        articles = []

        for entry in feed.entries[:8]:  # Top 8 articles
            title = entry.get("title", "").strip()
            summary = clean_html(entry.get("summary", ""))
            pub_date = entry.get("published", "")
            articles.append(f"TITLE: {title}\nSUMMARY: {summary}\nDATE: {pub_date}\n")

        if not articles:
            print(f"[News Warning] No articles found in feed for {competitor_name}")
            return "" # Return empty string taaki web_search fallback automatically trigger ho jaye

        return "\n---\n".join(articles)

    except requests.exceptions.Timeout:
        print(f"[News Timeout] Google News timed out for {competitor_name}. Proceeding to fallback search.")
        return "" # Crash hone se bacha kar pipeline ko fallback search par bhej rahe hain
    except Exception as e:
        print(f"[News Error] Exception occurred: {str(e)}")
        return ""

def fetch_blog_rss(blog_rss_url: str) -> str:
    """
    Competitor ke official blog RSS se product updates fetch karo.
    """
    if not blog_rss_url or not blog_rss_url.startswith("http"):
        print("[Blog RSS] No valid URL provided, skipping blog parsing.")
        return "No blog posts found"

    print(f"[News] Fetching blog updates from {blog_rss_url}")
    try:
        # Blog servers aksar slow hote hain, isliye explicit timeout handle karna zaroori hai
        response = requests.get(blog_rss_url, headers=get_safe_headers(), timeout=8)
        response.raise_for_status()
        
        feed = feedparser.parse(response.content)
        posts = []
        
        for entry in feed.entries[:5]: # Top 5 posts
            title = entry.get("title", "").strip()
            summary = clean_html(entry.get("summary", ""))[:300]
            posts.append(f"POST: {title}\nSUMMARY: {summary}")
            
        return "\n---\n".join(posts) if posts else "No blog posts found"
        
    except requests.exceptions.Timeout:
        print(f"[Blog Timeout] Blog RSS timed out for URL: {blog_rss_url}")
        return "BLOG_RSS_ERROR: Network timeout while fetching blog."
    except Exception as e:
        return f"BLOG_RSS_ERROR: {str(e)}"

def fetch_newsapi(company: str) -> str:
    key = os.getenv("NEWS_API_KEY")
    if not key:
        return ""
    try:
        url = "https://newsapi.org/v2/everything"
        params = {
            "q":        company,
            "apiKey":   key,
            "pageSize": 5,
            "sortBy":   "publishedAt",
            "language": "en"
        }
        res = requests.get(url, params=params, timeout=10).json()
        articles = res.get("articles", [])
        if not articles:
            return ""
        result = []
        for a in articles:
            result.append(f"TITLE: {a['title']}\nSOURCE: {a['source']['name']}\nDESC: {a['description']}")
        return "\n---\n".join(result)
    except:
        return ""