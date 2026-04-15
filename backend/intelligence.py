"""
Deterministic ZeroTrace intelligence layer.
Provides product analysis, profiles, reports, locations, and shareable insights.
"""

from __future__ import annotations

from typing import Any, Dict, List

from impact import estimate_from_text
from intent import detect_intent as detect_behavior_intent
from scoring import compute_score

RISKY_PATTERNS = [
    "bottled water",
    "plastic bottle",
    "plastic bag",
    "takeaway",
    "delivery",
    "food order",
    "order food",
    "cling wrap",
    "straw",
    "packaged snacks",
    "single use",
    "disposable",
    "cutlery",
    "frozen food",
]

POSITIVE_PATTERNS = [
    "reusable",
    "refill",
    "cloth bag",
    "steel bottle",
    "glass bottle",
    "metal straw",
    "beeswax",
    "bulk",
    "compost",
    "zero waste",
    "tap water",
    "bring my own",
]

PRODUCT_LIBRARY = {
    "bottled water": {
        "category": "Beverage",
        "packaging_impact": "High",
        "sustainability_score": 24,
        "alternatives": ["Refill station", "Steel bottle", "Filtered tap water"],
        "notes": "Bottled water creates one of the most repetitive and preventable plastic habits.",
    },
    "water bottle": {
        "category": "Beverage",
        "packaging_impact": "High",
        "sustainability_score": 28,
        "alternatives": ["Steel bottle", "Glass bottle", "Refill station"],
        "notes": "Single-use beverage packaging is one of the fastest recurring plastic habits.",
    },
    "chips": {
        "category": "Snack",
        "packaging_impact": "High",
        "sustainability_score": 35,
        "alternatives": ["Bulk snacks", "Fresh fruit", "Paper-packed snacks"],
        "notes": "Multi-layer snack wrappers are hard to recycle and easy to accumulate.",
    },
    "shampoo": {
        "category": "Personal care",
        "packaging_impact": "Medium",
        "sustainability_score": 55,
        "alternatives": ["Shampoo bar", "Refill pouch", "In-store refill"],
        "notes": "Liquid care products often create steady bottle churn over the year.",
    },
    "coffee": {
        "category": "Cafe",
        "packaging_impact": "Medium",
        "sustainability_score": 58,
        "alternatives": ["Travel mug", "Ceramic dine-in cup", "Local refill coffee spot"],
        "notes": "Takeaway cups, lids, and stirrers stack up quickly if the habit is daily.",
    },
    "takeaway": {
        "category": "Food delivery",
        "packaging_impact": "High",
        "sustainability_score": 32,
        "alternatives": ["Dine-in", "Bring-your-own container", "Meal prep"],
        "notes": "Delivery usually creates a packaging bundle: container, cutlery, bag, sauces.",
    },
    "detergent": {
        "category": "Home care",
        "packaging_impact": "Medium",
        "sustainability_score": 62,
        "alternatives": ["Refill pack", "Concentrate", "Local refill station"],
        "notes": "Household cleaning products are great candidates for refill behavior.",
    },
}

DEMO_LOCATIONS = [
    {"name": "GreenFill Refill Station", "type": "Refill", "city": "Chennai", "distance_km": 1.8, "address": "Anna Nagar Main Road"},
    {"name": "CycleLoop Recycling Hub", "type": "Recycling", "city": "Chennai", "distance_km": 3.2, "address": "Velachery Link Street"},
    {"name": "Bulk Basket Eco Store", "type": "Eco Store", "city": "Chennai", "distance_km": 4.4, "address": "Adyar Market Lane"},
    {"name": "Refill Cart Collective", "type": "Refill", "city": "Bengaluru", "distance_km": 2.1, "address": "Indiranagar 12th Main"},
    {"name": "BlueBin Recycling Point", "type": "Recycling", "city": "Bengaluru", "distance_km": 5.0, "address": "Koramangala 5th Block"},
    {"name": "Jar & Journey", "type": "Eco Store", "city": "Hyderabad", "distance_km": 2.7, "address": "Jubilee Hills Road 36"},
]


def extract_patterns(text: str) -> Dict[str, List[str]]:
    lowered = text.lower()
    risky = [pattern for pattern in RISKY_PATTERNS if pattern in lowered]
    positive = [pattern for pattern in POSITIVE_PATTERNS if pattern in lowered]
    return {"risky": risky[:5], "positive": positive[:5]}


def analyze_behavior(message: str, history: List[Dict[str, Any]] | None = None) -> Dict[str, Any]:
    combined = " ".join([entry.get("content", "") for entry in history or []] + [message])
    patterns = extract_patterns(combined)
    impact = estimate_from_text(combined)
    intercept = detect_behavior_intent(message)
    issue = patterns["risky"][0] if patterns["risky"] else "hidden packaging habits"

    return {
        "issue": issue,
        "patterns": patterns,
        "impact": impact,
        "intercept": intercept,
        "packaging_pressure": impact["severity_label"],
    }


def generate_profile(user_id: str, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    score = compute_score(messages)
    user_text = " ".join(message.get("content", "") for message in messages if message.get("role") == "user")
    patterns = extract_patterns(user_text)
    streak = max(1, len(patterns["positive"]) * 2)
    trend = "Improving" if len(patterns["positive"]) >= len(patterns["risky"]) else "Needs Attention"

    if patterns["positive"]:
        habit_summary = f"You already show low-plastic intent through {', '.join(patterns['positive'][:2])}."
    elif patterns["risky"]:
        habit_summary = f"Your biggest drag right now is {', '.join(patterns['risky'][:2])}."
    else:
        habit_summary = "You are early in the ZeroTrace journey. One consistent swap will create momentum fast."

    return {
        "user_id": user_id,
        "plastic_score": score["score"],
        "risk_level": score["label"],
        "risk_color": score["color"],
        "trend": trend,
        "streak_days": streak,
        "habit_summary": habit_summary,
        "top_risky_habits": patterns["risky"][:3],
        "top_positive_habits": patterns["positive"][:3],
        "ai_twin": {
            "title": "Decision-Stage Optimizer" if trend == "Improving" else "Plastic Pressure Watcher",
            "summary": "A digital twin that learns where your packaging friction appears and nudges the next better choice.",
        },
    }


def generate_weekly_report(user_id: str, messages: List[Dict[str, Any]]) -> Dict[str, Any]:
    profile = generate_profile(user_id, messages)
    user_text = " ".join(message.get("content", "") for message in messages if message.get("role") == "user")
    patterns = extract_patterns(user_text)
    impact = estimate_from_text(user_text)

    if patterns["positive"] and not patterns["risky"]:
        reduction_percent = 22
    elif patterns["positive"]:
        reduction_percent = max(8, len(patterns["positive"]) * 6 - len(patterns["risky"]) * 2)
    elif patterns["risky"]:
        reduction_percent = 4
    else:
        reduction_percent = 10

    biggest_issue = patterns["risky"][0] if patterns["risky"] else "inconsistent tracking"
    suggestions = build_suggestions(patterns["risky"], patterns["positive"], impact["total_kg_per_year"])
    future_if_continue = round(impact["total_kg_per_year"] + 3.2, 1)
    future_if_improve = round(max(0.5, impact["total_kg_per_year"] * 0.55), 1)

    return {
        "summary": f"ZeroTrace estimates a {reduction_percent}% plastic reduction opportunity this week if you act on your next swap.",
        "reduction_percent": reduction_percent,
        "biggest_issue": biggest_issue,
        "bad_habits": patterns["risky"][:4] or ["No dominant plastic habit detected yet."],
        "good_habits": patterns["positive"][:4] or ["No strong low-plastic habit signals yet."],
        "suggestions": suggestions,
        "future_projection": {
            "if_continue_kg_per_year": future_if_continue,
            "if_improve_kg_per_year": future_if_improve,
            "savings_kg_per_year": round(future_if_continue - future_if_improve, 1),
        },
        "impact": impact,
        "profile_snapshot": profile,
    }


def build_suggestions(risky: List[str], positive: List[str], total_kg: float) -> List[str]:
    suggestions: List[str] = []
    if "bottled water" in risky or "plastic bottle" in risky:
        suggestions.append("Carry one reusable bottle this week and refill before buying any drink.")
    if "delivery" in risky or "takeaway" in risky or "food order" in risky:
        suggestions.append("Turn off auto-cutlery and choose restaurants with minimal packaging when ordering food.")
    if "order food" in risky:
        suggestions.append("Decide your no-cutlery and no-extra-sauce settings before you place the order.")
    if "cling wrap" in risky:
        suggestions.append("Swap cling wrap for containers or beeswax wraps in your kitchen setup.")
    if total_kg > 5:
        suggestions.append("Focus on the top two repeat-use plastic habits instead of trying to fix everything at once.")
    if positive:
        suggestions.append("Double down on one behavior you already do well and make it visible in your routine.")
    if not suggestions:
        suggestions.append("Start with a one-week audit of bottles, bags, wrappers, and takeaway packaging.")
    return suggestions[:4]


def analyze_product(product_name: str) -> Dict[str, Any]:
    lowered = product_name.lower()
    selected = None
    for keyword, data in PRODUCT_LIBRARY.items():
        if keyword in lowered:
            selected = (keyword, data)
            break

    if not selected:
        selected = (
            product_name,
            {
                "category": "General",
                "packaging_impact": "Medium",
                "sustainability_score": 52,
                "alternatives": ["Bulk option", "Refill option", "Reusable version"],
                "notes": "This product likely depends on packaging choices rather than the item alone.",
            },
        )

    keyword, details = selected
    better_choice = details["alternatives"][0]
    return {
        "product_name": product_name,
        "matched_keyword": keyword,
        "category": details["category"],
        "packaging_impact": details["packaging_impact"],
        "sustainability_score": details["sustainability_score"],
        "alternatives": details["alternatives"],
        "better_choice": better_choice,
        "notes": details["notes"],
        "summary": f"{product_name} shows {details['packaging_impact'].lower()} packaging pressure. A stronger swap is {better_choice}.",
    }


def get_locations(city: str | None = None) -> Dict[str, Any]:
    if city:
        matches = [location for location in DEMO_LOCATIONS if location["city"].lower() == city.lower()]
    else:
        matches = DEMO_LOCATIONS[:]
    if not matches:
        matches = DEMO_LOCATIONS[:3]
    return {
        "city": city or "Demo Network",
        "locations": matches,
        "summary": "Refill stations and recycling points help ZeroTrace turn insight into action in the real world.",
    }


def build_share_card(profile: Dict[str, Any], report: Dict[str, Any]) -> Dict[str, str]:
    title = f"I cut my plastic risk to {profile['plastic_score']}/100 with ZeroTrace"
    body = (
        f"This week I unlocked a {report['reduction_percent']}% plastic reduction opportunity. "
        f"Biggest fix: {report['biggest_issue']}. Next move: {report['suggestions'][0]}"
    )
    return {
        "title": title,
        "body": body,
        "hashtags": "#ZeroTrace #PlasticFree #IITDemo",
    }


def generate_post_tags(message: str) -> List[str]:
    lowered = message.lower()
    tags = []
    if "reusable" in lowered or "bottle" in lowered or "bag" in lowered:
        tags.append("reusable")
    if "refill" in lowered or "bulk" in lowered:
        tags.append("refill")
    if "challenge" in lowered or "week" in lowered:
        tags.append("challenge")
    if "community" in lowered or "together" in lowered:
        tags.append("community")
    if not tags:
        tags = ["plastic-free", "small-win"]
    return tags[:3]
