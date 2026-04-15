"""
Local demo response engine.
Keeps the app useful when remote AI providers are not configured.
"""

from insights import generate_insights
from challenges import generate_challenges
from intent import detect_intent as detect_intercept


TAG_KEYWORDS = {
    "reusable": ["reusable", "steel bottle", "travel mug", "cloth bag", "container"],
    "refill": ["refill", "bulk", "station"],
    "plastic-free": ["plastic free", "zero waste", "no plastic"],
    "community": ["together", "group", "friends", "community"],
    "food-swap": ["takeaway", "container", "meal prep", "coffee", "cup"],
}


def generate_demo_response(message: str, intent: str, system_prompt: str | None = None) -> str:
    if system_prompt and "tagging assistant" in system_prompt.lower():
        return _generate_tags(message)

    intercept = detect_intercept(message)
    if intent == "analysis":
        return _build_analysis_response(message, intercept)
    if intent == "planning":
        return _build_plan_response(message, intercept)
    return _build_general_response(message, intercept)


def _build_analysis_response(message: str, intercept: dict) -> str:
    insights = generate_insights([{"role": "user", "content": message}])
    impact = insights["impact"]
    score = insights["score"]
    risks = insights["top_risks"] or ["plastic-heavy purchases not yet identified"]
    items = impact["items_detected"][:3]

    headline = "Plastic Impact Scan"
    item_line = ", ".join(item["item"] for item in items) if items else "No exact item matches, so this is a pattern-based estimate"
    actions = _build_actions(insights["recommendations"], intercept)

    return "\n".join([
        f"**Title:** {headline}",
        "",
        "**Key Insights:**",
        f"- Score: {score['score']}/100 ({score['label']}).",
        f"- Likely pressure points: {', '.join(risks[:3])}.",
        f"- Detected items: {item_line}.",
        "",
        "**Action Plan:**",
        f"- {actions[0]}",
        f"- {actions[1]}",
        f"- {actions[2]}",
        "",
        "**Impact Estimate:**",
        f"- Estimated plastic exposure: {impact['total_kg_per_year']} kg/year.",
        f"- Rough CO2 equivalent: {impact['co2_equivalent_kg']} kg.",
    ])


def _build_plan_response(message: str, intercept: dict) -> str:
    insights = generate_insights([{"role": "user", "content": message}])
    score = insights["score"]
    challenge = generate_challenges(insights["top_risks"], score["score"], count=1)[0]
    actions = _build_actions(insights["recommendations"], intercept)

    return "\n".join([
        "**Title:** Habit Shift Plan",
        "",
        "**Key Insights:**",
        f"- Current score: {score['score']}/100 ({score['label']}).",
        f"- Best first target: {insights['top_risks'][0] if insights['top_risks'] else 'single-use convenience habits'}.",
        f"- Suggested weekly challenge: {challenge['title']}.",
        "",
        "**Action Plan:**",
        f"- Today: {actions[0]}",
        f"- This week: {actions[1]}",
        f"- Keep momentum: {actions[2]}",
        "",
        "**Impact Estimate:**",
        f"- Completing {challenge['title']} can help lower future plastic use and improve your score.",
    ])


def _build_general_response(message: str, intercept: dict) -> str:
    insights = generate_insights([{"role": "user", "content": message}])
    impact = insights["impact"]
    actions = _build_actions(insights["recommendations"], intercept)
    opener = (
        f"Lead with this swap: choose {intercept['alternative']}."
        if intercept["is_intercept"]
        else "This looks like a good moment for one practical plastic-saving swap."
    )

    return "\n".join([
        "**Title:** ZeroTrace Coach",
        "",
        "**Key Insights:**",
        f"- {opener}",
        f"- Score snapshot: {insights['score']['score']}/100 ({insights['score']['label']}).",
        f"- Estimated plastic exposure from this topic: {impact['total_kg_per_year']} kg/year.",
        "",
        "**Action Plan:**",
        f"- {actions[0]}",
        f"- {actions[1]}",
        f"- {actions[2]}",
        "",
        "**Impact Estimate:**",
        f"- Replacing one repeat-use plastic habit can meaningfully reduce your annual footprint over time.",
    ])


def _build_actions(recommendations: list[str], intercept: dict) -> list[str]:
    actions = recommendations[:3]
    if intercept["is_intercept"]:
        actions.insert(0, f"Before you buy, switch to {intercept['alternative']}.")
    while len(actions) < 3:
        actions.append("Track one plastic-heavy item this week and replace it with a reusable option.")
    return actions[:3]


def _generate_tags(message: str) -> str:
    text = message.lower()
    tags = [tag for tag, keywords in TAG_KEYWORDS.items() if any(keyword in text for keyword in keywords)]
    if not tags:
        tags = ["plastic-free", "community"]
    return ", ".join(tags[:3])
