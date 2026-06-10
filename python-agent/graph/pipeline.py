import os
from typing import TypedDict
from datetime import datetime, timezone
from dotenv import load_dotenv

# LangGraph imports
from langgraph.graph import StateGraph, END

# NAYA UNIFIED GOOGLE GENAI SDK (Iske liye `pip install google-genai` zaroori hai)
from google import genai

# Tool Import
from langchain_community.tools import DuckDuckGoSearchRun

load_dotenv()

# Naya Client Initialization — Ye automatically aapke environment se GEMINI_API_KEY utha leta hai
client = genai.Client()
MODEL_NAME = "gemini-2.5-flash"


# ── State definition ────────────────────────────────────────────
class AgentState(TypedDict):
    competitor_name: str
    competitor_url:  str
    blog_rss_url:    str
    scraped_data:    str
    news_data:       str
    relevance_score: float
    clean_data:      str
    analysis:        str
    summary:         str
    source:          str


# ── Node 1: Scraper ─────────────────────────────────────────────
def scraper_node(state: AgentState) -> dict:
    from tools.scraper import scrape_website
    print(f"[Node: Scraper] {state['competitor_name']}")
    data = scrape_website(state["competitor_name"], state["competitor_url"])
    return {"scraped_data": data}


# ── Node 2: News ─────────────────────────────────────────────────
def news_node(state: AgentState) -> dict:
    from tools.news import fetch_rss, fetch_blog_rss
    print(f"[Node: News] {state['competitor_name']}")
    news = fetch_rss(state["competitor_name"])
    blog = ""
    if state.get("blog_rss_url"):
        blog = fetch_blog_rss(state["blog_rss_url"])
    return {"news_data": news + "\n\nBLOG UPDATES:\n" + blog}


# ── Node 3: CRAG Grader ──────────────────────────────────────────
def crag_grader_node(state: AgentState) -> dict:
    print(f"[Node: CRAG Grader] Scoring quality...")
    combined = state["scraped_data"] + "\n\n" + state["news_data"]

    prompt = f"""You are a data quality evaluator for competitive intelligence.

Competitor being tracked: {state['competitor_name']}

Retrieved data (first 2000 chars):
{combined[:2000]}

Rate this data quality from 0.0 to 1.0 based on:
1. Is this actually about {state['competitor_name']}? (most important)
2. Is there meaningful business information (pricing, features, updates, campaigns)?
3. Is it recent and not just generic/error page content?

Rules:
- Score > 0.8: Rich, relevant, recent data
- Score 0.5-0.8: Some relevant info but incomplete
- Score < 0.5: Mostly irrelevant, error pages, or scraping failed

Respond with ONLY a decimal number between 0.0 and 1.0. Nothing else."""

    # FIX: Naye google-genai SDK v1 ke mutabik content generation
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        score_text = response.text.strip()
        score = float(score_text)
        score = max(0.0, min(1.0, score))  # Clamp between 0 and 1
    except Exception as e:
        print(f"[CRAG Grader Warning] New SDK Parse failed ({e}), setting default score.")
        score = 0.4  # Default to fallback if parsing fails

    print(f"[Node: CRAG Grader] Score: {score}")
    return {
        "relevance_score": score,
        "clean_data": combined,
        "source": "scraped"
    }


# ── CRAG Router ──────────────────────────────────────────────────
def crag_router(state: AgentState) -> str:
    score = state["relevance_score"]
    if score >= 0.8:
        print("[CRAG Router] → Good data, direct to analyzer")
        return "analyzer"
    elif score >= 0.5:
        print("[CRAG Router] → Ambiguous, merging with web search")
        return "merge"
    else:
        print("[CRAG Router] → Bad data, full web search fallback")
        return "web_search"


# ── Node 4a: Web Search Fallback ─────────────────────────────────
def web_search_node(state: AgentState) -> dict:
    print(f"[Node: Web Search] Fallback for {state['competitor_name']}")
    search = DuckDuckGoSearchRun()
    query  = f"{state['competitor_name']} latest news product update pricing 2025"
    result = search.run(query)
    return {
        "clean_data": result,
        "source": "web_search"
    }


# ── Node 4b: Merge ───────────────────────────────────────────────
def merge_node(state: AgentState) -> dict:
    print(f"[Node: Merge] Supplementing with web search")
    search = DuckDuckGoSearchRun()
    query  = f"{state['competitor_name']} latest news 2025"
    web    = search.run(query)
    merged = state["clean_data"] + "\n\n=== WEB SEARCH SUPPLEMENT ===\n" + web
    return {
        "clean_data": merged,
        "source": "merged"
    }


# ── Node 5: Analyzer ─────────────────────────────────────────────
def analyzer_node(state: AgentState) -> dict:
    from db.mongo_client import get_last_report
    print(f"[Node: Analyzer] Comparing with previous data...")

    old_data = get_last_report(state["competitor_name"])

    prompt = f"""You are a competitive intelligence analyst.

Competitor: {state['competitor_name']}
Data source: {state.get('source', 'scraped')}
Relevance score: {state['relevance_score']:.2f}

=== PREVIOUS REPORT ===
{old_data[:1500]}

=== NEW DATA ===
{state['clean_data'][:3000]}

Analyze what has changed. Focus on:
- Pricing changes
- New features or products launched
- Marketing campaigns or offers
- Business strategy shifts
- Leadership or partnership news

If nothing significant changed, say "No significant changes detected."
Be specific and factual. Do not speculate."""

    # FIX: Naye google-genai SDK v1 ke mutabik Analyzer call
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        analysis_content = response.text
    except Exception as e:
        analysis_content = f"Error during analysis generation: {str(e)}"

    return {"analysis": analysis_content}


# ── Node 6: Summarizer ───────────────────────────────────────────
def summarizer_node(state: AgentState) -> dict:
    print(f"[Node: Summarizer] Creating executive summary...")

    prompt = f"""Create a concise executive summary for {state['competitor_name']}.

Analysis:
{state['analysis']}

Format exactly like this (3 bullets max):
- [Action verb] [what changed] — [business impact]
- [Action verb] [what changed] — [business impact]
- [Action verb] [what changed] — [business impact]

Rules:
- Max 20 words per bullet
- Start each bullet with a strong action verb
- If nothing changed, write: "• No significant changes detected this cycle"
- Be specific, not vague"""

    # FIX: Naye google-genai SDK v1 ke mutabik Summarizer call
    try:
        response = client.models.generate_content(
            model=MODEL_NAME,
            contents=prompt
        )
        summary_content = response.text
    except Exception as e:
        summary_content = "• No significant changes detected this cycle"

    return {"summary": summary_content}


# ── Node 7: Store ────────────────────────────────────────────────
def store_node(state: AgentState) -> dict:
    from db.mongo_client import save_report
    print(f"[Node: Store] Saving report to MongoDB...")

    report_data = {
        "competitor":      state["competitor_name"],
        "summary":         state["summary"],
        "analysis":        state["analysis"],
        "relevance_score": state["relevance_score"],
        "source":          state.get("source", "scraped"),
        "url":             state["competitor_url"],
        "timestamp":       datetime.now(timezone.utc)
    }

    save_report(report_data)
    print(f"[Node: Store] Report saved successfully for {state['competitor_name']}!")
    return state


# ── Build Graph ──────────────────────────────────────────────────
def build_graph():
    g = StateGraph(AgentState)

    g.add_node("scraper",    scraper_node)
    g.add_node("news",       news_node)
    g.add_node("crag_grade", crag_grader_node)
    g.add_node("web_search", web_search_node)
    g.add_node("merge",      merge_node)
    g.add_node("analyzer",   analyzer_node)
    g.add_node("summarizer", summarizer_node)
    g.add_node("store",      store_node)

    g.set_entry_point("scraper")
    g.add_edge("scraper",    "news")
    g.add_edge("news",       "crag_grade")

    g.add_conditional_edges(
        "crag_grade",
        crag_router,
        {
            "analyzer":   "analyzer",
            "web_search": "web_search",
            "merge":      "merge"
        }
    )

    g.add_edge("web_search", "analyzer")
    g.add_edge("merge",      "analyzer")
    g.add_edge("analyzer",   "summarizer")
    g.add_edge("summarizer", "store")
    g.add_edge("store",      END)

    return g.compile()


# ── Run for one competitor ───────────────────────────────────────
def run_for_competitor(competitor: dict) -> dict:
    graph = build_graph()
    result = graph.invoke({
        "competitor_name": competitor["name"],
        "competitor_url":  competitor["url"],
        "blog_rss_url":    competitor.get("blog_rss_url", ""),
        "scraped_data":    "",
        "news_data":       "",
        "relevance_score": 0.0,
        "clean_data":      "",
        "analysis":        "",
        "summary":         "",
        "source":          ""
    })
    return result