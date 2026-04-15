"""
Plastic Impact Estimation Engine
Converts habits and purchases into yearly plastic usage quantities.
Returns numeric kg estimate + visual severity level.
"""

from typing import Dict, Any

# (unit_grams, typical_uses_per_year)
PLASTIC_WEIGHTS: Dict[str, tuple] = {
    "water bottle":       (20,  156),   # 3/week
    "plastic bag":        (5,   200),   # ~4/week
    "cling wrap":         (2,   300),   # ~6/week
    "straw":              (0.5, 365),   # 1/day
    "coffee cup":         (10,  260),   # weekdays
    "disposable cup":     (10,  260),
    "styrofoam container":(30,  104),   # 2/week
    "takeaway container": (25,  104),
    "zip lock":           (3,   156),   # 3/week
    "yogurt cup":         (15,  104),
    "shampoo bottle":     (50,  4),     # quarterly
    "conditioner bottle": (50,  4),
    "frozen food bag":    (20,  52),    # weekly
    "milk bottle":        (25,  52),
    "plastic fork":       (3,   104),
    "plastic spoon":      (2,   104),
    "plastic straw":      (0.5, 365),
    "bread bag":          (10,  52),
    "chip bag":           (8,   52),
    "candy wrapper":      (1,   365),
    "bubble wrap":        (50,  12),    # monthly
    "shrink wrap":        (15,  24),
}

SEVERITY_THRESHOLDS = {
    "low":    (0, 2),       # < 2 kg/year
    "medium": (2, 10),      # 2-10 kg/year
    "high":   (10, 30),     # 10-30 kg/year
    "critical": (30, 9999), # > 30 kg/year
}

SEVERITY_META = {
    "low":      {"label": "Low Risk", "color": "#22c55e", "icon": "🟢", "bar": 15},
    "medium":   {"label": "Medium Risk", "color": "#fbbf24", "icon": "🟡", "bar": 45},
    "high":     {"label": "High Risk", "color": "#f97316", "icon": "🟠", "bar": 75},
    "critical": {"label": "Critical Risk", "color": "#ef4444", "icon": "🔴", "bar": 95},
}


def estimate_item_impact(item: str, frequency_per_week: float = 1.0) -> Dict[str, Any]:
    """Estimate yearly plastic for a single item."""
    key = item.lower().strip()
    match = None
    for k in PLASTIC_WEIGHTS:
        if k in key or key in k:
            match = k
            break

    if not match:
        # Generic fallback: 10g per use
        grams_per_use = 10
        uses_per_year = frequency_per_week * 52
    else:
        grams_per_use, default_annual = PLASTIC_WEIGHTS[match]
        uses_per_year = frequency_per_week * 52 if frequency_per_week != 1.0 else default_annual

    yearly_grams = grams_per_use * uses_per_year
    yearly_kg = round(yearly_grams / 1000, 2)
    return {"item": item, "yearly_kg": yearly_kg, "uses_per_year": int(uses_per_year)}


def estimate_from_text(text: str) -> Dict[str, Any]:
    """
    Parse free-form text and extract plastic items, returning full impact report.
    """
    text_lower = text.lower()
    found_items = []
    total_kg = 0.0

    for item, (grams, annual_uses) in PLASTIC_WEIGHTS.items():
        if item in text_lower:
            yearly_kg = round((grams * annual_uses) / 1000, 2)
            found_items.append({"item": item, "yearly_kg": yearly_kg})
            total_kg += yearly_kg

    total_kg = round(total_kg, 2)

    # Determine severity
    severity = "low"
    for level, (lo, hi) in SEVERITY_THRESHOLDS.items():
        if lo <= total_kg < hi:
            severity = level
            break

    meta = SEVERITY_META[severity]

    return {
        "total_kg_per_year": total_kg,
        "items_detected": found_items,
        "severity": severity,
        "severity_label": meta["label"],
        "severity_color": meta["color"],
        "severity_icon": meta["icon"],
        "bar_percent": meta["bar"],
        "co2_equivalent_kg": round(total_kg * 2.4, 2),  # ~2.4 kg CO2 per kg plastic
        "equivalent_bottles": int(total_kg * 50),         # 1 kg ≈ 50 small bottles
        "trees_to_offset": round(total_kg * 0.08, 1),    # rough offset estimate
    }
