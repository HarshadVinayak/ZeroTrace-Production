"""
Weekly Insights Generator — Analyzes session history to produce
a personalized summary with patterns, risks, and recommendations.
"""

from typing import List, Dict, Any
from impact import estimate_from_text
from scoring import compute_score

POSITIVE_PATTERNS = [
    "reusable", "refill", "bulk", "bamboo", "cloth bag", "metal straw",
    "compost", "zero waste", "eco", "sustainable", "beeswax", "glass bottle",
    "reduce", "avoid plastic", "no plastic", "tap water", "bring my own",
]

RISKY_PATTERNS = [
    "plastic", "disposable", "single use", "takeaway", "bottled water",
    "packaged", "styrofoam", "cling wrap", "zip lock", "straw",
    "delivery", "wrapped", "frozen food",
]


def generate_insights(messages: List[Dict]) -> Dict[str, Any]:
    """
    Takes raw session messages and produces a structured weekly insights report.
    """
    if not messages:
        return {
            "summary": "No activity recorded this week. Start by analyzing a bill or asking the AI coach!",
            "patterns": [],
            "top_risks": [],
            "positive_actions": [],
            "impact": {"total_kg_per_year": 0, "severity": "low"},
            "score": {"score": 50, "label": "Neutral", "color": "#94a3b8"},
            "recommendations": ["Ask the AI coach your first question to get started!"],
            "message_count": 0,
        }

    full_text = " ".join(m.get("content", "") for m in messages).lower()
    user_messages = [m for m in messages if m.get("role") == "user"]
    user_text = " ".join(m.get("content", "") for m in user_messages).lower()

    # ── Pattern detection ───────────────────────────────────────
    detected_risks = [p for p in RISKY_PATTERNS if p in user_text]
    detected_positives = [p for p in POSITIVE_PATTERNS if p in user_text]

    # ── Impact + Score ──────────────────────────────────────────
    impact = estimate_from_text(user_text)
    score = compute_score(user_messages)

    # ── Recommendations ──────────────────────────────────────────
    recommendations = _generate_recommendations(detected_risks, detected_positives, score["score"])

    # ── Summary text ─────────────────────────────────────────────
    summary = _build_summary(
        len(user_messages), detected_risks, detected_positives,
        impact["total_kg_per_year"], score["label"]
    )

    return {
        "summary": summary,
        "patterns": {
            "risky": detected_risks[:5],
            "positive": detected_positives[:5],
        },
        "top_risks": detected_risks[:3],
        "positive_actions": detected_positives[:3],
        "impact": impact,
        "score": score,
        "recommendations": recommendations,
        "message_count": len(user_messages),
    }


def _build_summary(count: int, risks: list, positives: list, kg: float, label: str) -> str:
    if count == 0:
        return "No activity this week."
    parts = [f"This week you had {count} interaction(s) with ZeroTrace."]
    if kg > 0:
        parts.append(f"Estimated plastic exposure: {kg} kg/year equivalent.")
    if risks:
        parts.append(f"Risky patterns detected: {', '.join(risks[:3])}.")
    if positives:
        parts.append(f"Positive habits noted: {', '.join(positives[:3])}.")
    parts.append(f"Current classification: {label}.")
    return " ".join(parts)


def _generate_recommendations(risks: list, positives: list, score: int) -> List[str]:
    recs = []
    if "bottled water" in risks or "water bottle" in risks:
        recs.append("Replace bottled water with a reusable steel bottle — saves ~₹8,000/year and 156 bottles.")
    if "straw" in risks:
        recs.append("Switch to a bamboo or metal straw. A pack of 10 costs < ₹200 and lasts years.")
    if "takeaway" in risks or "delivery" in risks:
        recs.append("Carry your own container for takeaway — 1 container per meal eliminates packaging.")
    if "plastic" in risks and "reusable" not in positives:
        recs.append("Audit your top 3 plastic-heavy purchases and find reusable alternatives.")
    if score > 60:
        recs.append("Your score is high. Start with one swap this week — small changes compound fast.")
    if not risks:
        recs.append("Great profile! Challenge yourself to go one week without any single-use plastic.")
    return recs[:4]
