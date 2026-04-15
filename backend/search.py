from duckduckgo_search import DDGS
import logging

logger = logging.getLogger("zerotrace")

def search_product(query: str):
    logger.info(f"DDGS Search for: {query}")
    results = []
    try:
        with DDGS() as ddgs:
            for r in ddgs.text(query, max_results=5):
                results.append({
                    "title": r.get("title", ""),
                    "body": r.get("body", ""),
                    "link": r.get("href", "")
                })
    except Exception as e:
        logger.error(f"DDGS Error: {e}")
    return results
