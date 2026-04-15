"""
Intent Detection — Intercepts future-action phrases and proactively 
suggests low-plastic alternatives before the user makes a decision.
"""

import re
from typing import Optional

# Trigger verbs that indicate a user is about to do something
FUTURE_ACTION_PATTERNS = [
    r"\b(going to|gonna|will|want to|planning to|thinking of|about to|need to|should i)\b.{0,40}\b(buy|get|order|use|purchase|grab|pick up|try)\b",
    r"\b(buy|order|purchase|get)\b.{0,50}",
    r"\b(i need|i want|i should get)\b",
]

# Plastic-heavy product keywords that trigger interception
PLASTIC_HEAVY_ITEMS = {
    "water bottle", "plastic bag", "cling wrap", "zip lock", "ziploc",
    "disposable", "single use", "single-use", "plastic cup", "styrofoam",
    "takeaway", "takeout container", "straw", "plastic straw", "plastic fork",
    "plastic spoon", "plastic cutlery", "packaging", "plastic wrap",
    "bubble wrap", "coffee cup", "paper cup", "yogurt cup", "shampoo bottle",
    "conditioner bottle", "plastic bottle", "pet bottle", "polythene",
    "polybag", "shrink wrap", "frozen food", "microwave meal"
}

ALTERNATIVES = {
    "water bottle": "a stainless steel or glass reusable bottle (saves ~156 plastic bottles/year)",
    "plastic bag": "reusable cloth bags or jute bags (1 bag replaces ~700 plastic bags lifetime)",
    "cling wrap": "beeswax wraps or silicone lids (eliminates ~50m of film/year)",
    "straw": "a bamboo or stainless steel straw (saves ~540 straws/year)",
    "coffee cup": "a reusable travel mug (saves ~500 cups/year if daily)",
    "disposable": "reusable alternatives — glass, steel, or bamboo equivalents",
    "takeaway": "bring your own container (BYO) — saves 1 container per meal",
    "styrofoam": "glass or stainless containers — styrofoam takes 500 years to decompose",
    "plastic fork": "carry a bamboo cutlery kit — costs ~₹200, lasts years",
    "shampoo bottle": "shampoo bars (1 bar = 2-3 bottles, zero plastic)",
    "zip lock": "reusable silicone pouches or glass containers",
    "frozen food": "fresh or bulk dry goods in cloth bags — reduces packaging 80%",
}


def detect_intent(message: str) -> dict:
    """
    Returns:
      {
        "is_intercept": bool,
        "detected_item": str or None,
        "alternative": str or None,
        "is_future_action": bool
      }
    """
    text = message.lower()

    # Check for future action verbs
    is_future = any(re.search(p, text) for p in FUTURE_ACTION_PATTERNS)

    # Check for plastic-heavy items
    detected_item = None
    for item in PLASTIC_HEAVY_ITEMS:
        if item in text:
            detected_item = item
            break

    if is_future and detected_item:
        alternative = ALTERNATIVES.get(detected_item, "a reusable, plastic-free alternative")
        return {
            "is_intercept": True,
            "detected_item": detected_item,
            "alternative": alternative,
            "is_future_action": True,
        }

    return {
        "is_intercept": False,
        "detected_item": detected_item,
        "alternative": None,
        "is_future_action": is_future,
    }


def build_intercept_prefix(intent_result: dict) -> Optional[str]:
    """Returns a warning prefix to prepend to the AI prompt if interception triggered."""
    if not intent_result["is_intercept"]:
        return None
    item = intent_result["detected_item"]
    alt = intent_result["alternative"]
    return (
        f"⚡ INTERCEPT: User is about to buy/use '{item}'. "
        f"Proactively suggest: {alt}. "
        f"Lead with this alternative FIRST before answering anything else. "
        f"Be direct and specific."
    )
