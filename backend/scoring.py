"""
Scoring System — Classifies user into Low / Medium / High / Critical plastic risk.
Based on session message history + direct item detection.
"""

from typing import Dict, Any, List
from impact import estimate_from_text, SEVERITY_THRESHOLDS, SEVERITY_META

RISK_LEVELS = {
    "low":      {"label": "Low Risk", "score_range": (0, 25),  "color": "#22c55e", "icon": "🟢"},
    "medium":   {"label": "Medium Risk", "score_range": (26, 55), "color": "#fbbf24", "icon": "🟡"},
    "high":     {"label": "High Risk", "score_range": (56, 80), "color": "#f97316", "icon": "🟠"},
    "critical": {"label": "Critical Risk", "score_range": (81, 100), "color": "#ef4444", "icon": "🔴"},
}

# Habits that increase score
RISKY_PATTERNS = [
    "plastic", "disposable", "single use", "takeaway", "bottled water",
    "packaged", "styrofoam", "cling wrap", "zip lock", "straw",
    "delivery", "amazon", "online order", "wrapped", "frozen",
]

# Habits that decrease score (positive signals)
POSITIVE_PATTERNS = [
    "reusable", "refill", "bulk", "bamboo", "cloth bag", "metal straw",
    "compost", "zero waste", "eco", "sustainable", "beeswax", "glass bottle",
    "reduce", "avoid plastic", "no plastic", "tap water", "bring my own",
]


def compute_score(messages: List[Dict]) -> Dict[str, Any]:
    """
    Analyze session history and compute a plastic risk score (0–100).
    Lower is better.
    """
    if not messages:
        return _score_result(50)  # Neutral default

    full_text = " ".join(m.get("content", "") for m in messages).lower()

    risky_hits = sum(1 for p in RISKY_PATTERNS if p in full_text)
    positive_hits = sum(1 for p in POSITIVE_PATTERNS if p in full_text)

    # Base score 50, +5 per risky hit, -5 per positive hit
    raw_score = 50 + (risky_hits * 5) - (positive_hits * 5)
    raw_score = max(0, min(100, raw_score))

    # Also factor in impact estimation from the full text
    impact = estimate_from_text(full_text)
    kg = impact["total_kg_per_year"]

    # Add kg-based penalty
    if kg > 30:
        raw_score = min(100, raw_score + 20)
    elif kg > 10:
        raw_score = min(100, raw_score + 10)
    elif kg > 2:
        raw_score = min(100, raw_score + 5)
    elif kg > 0:
        raw_score = max(0, raw_score - 5)

    return _score_result(int(raw_score))


def _score_result(score: int) -> Dict[str, Any]:
    level = "low"
    for lvl, data in RISK_LEVELS.items():
        lo, hi = data["score_range"]
        if lo <= score <= hi:
            level = lvl
            break

    data = RISK_LEVELS[level]
    return {
        "score": score,
        "level": level,
        "label": data["label"],
        "color": data["color"],
        "icon": data["icon"],
        "bar_percent": score,
        "description": _score_description(level),
    }


def _score_description(level: str) -> str:
    return {
        "low": "Great job! You have minimal plastic usage. Keep it up.",
        "medium": "You're average. A few habit swaps could cut your plastic 40–60%.",
        "high": "Your plastic usage is above average. Time for an action plan.",
        "critical": "High plastic risk detected. Immediate habit changes recommended.",
    }[level]
