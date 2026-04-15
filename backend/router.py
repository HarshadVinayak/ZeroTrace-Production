"""
ZeroTrace AI router with multi-agent intelligence and safe fallback behavior.
"""

from __future__ import annotations

import logging
from typing import Any, Dict, List

from ai_providers import DEMO_MODE, provider_status, query_provider_chain
from intelligence import analyze_behavior, analyze_product, generate_profile
from prompt import SYSTEM_PROMPT

logger = logging.getLogger("zerotrace.router")

DEMO_FALLBACK = (
    "AI is in demo mode. You can reduce plastic by avoiding bottled drinks, "
    "using reusable bags, and choosing low-packaging products."
)


def detect_route_intent(message: str) -> str:
    lowered = message.lower()
    if any(keyword in lowered for keyword in ["product", "packaging", "amazon", "link", "buy this"]):
        return "analysis"
    if any(keyword in lowered for keyword in ["plan", "habit", "routine", "weekly", "change"]):
        return "planning"
    if len(message.strip()) <= 80:
        return "quick"
    return "general"


def _analyzer_agent(message: str, history: List[Dict[str, Any]]) -> Dict[str, Any]:
    analysis = analyze_behavior(message, history)
    risky = analysis["patterns"]["risky"]
    issue = analysis["issue"]
    insight = (
        f"Primary plastic pressure: {issue}."
        if risky
        else "No single plastic habit dominates yet, which means one intentional swap can create visible progress."
    )
    return {
        "role": "Analyzer",
        "issue": issue,
        "insight": insight,
        "patterns": analysis["patterns"],
        "impact": analysis["impact"],
        "intercept": analysis["intercept"],
    }


def _planner_agent(message: str, analysis: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    risky = analysis["patterns"]["risky"]
    intercept = analysis["intercept"]
    actions: List[str] = []

    if intercept["is_intercept"]:
        actions.append(f"Before you buy, switch to {intercept['alternative']}.")
    if "delivery" in risky or "takeaway" in risky or "food order" in risky or "order food" in risky:
        actions.append("Turn off cutlery, sauces, and extra packaging whenever you order food.")
    if "bottled water" in risky or "plastic bottle" in risky:
        actions.append("Refill a reusable bottle before leaving home so bottled drinks stop being the default.")
    if "cling wrap" in risky:
        actions.append("Place one box or jar near your prep area and use it instead of cling wrap for the next 7 days.")
    if not actions:
        actions.append("Pick one repeat-use plastic item this week and replace it with a reusable version.")
    actions.append("Log your next purchase inside ZeroTrace so the AI twin can refine your score.")
    deduped_actions: List[str] = []
    for action in actions:
        if action not in deduped_actions:
            deduped_actions.append(action)
    actions = deduped_actions[:3]
    while len(actions) < 3:
        actions.append("Repeat the lowest-friction plastic swap until it becomes automatic.")

    return {
        "role": "Planner",
        "actions": actions,
        "next_action": actions[0],
        "milestone": f"Current score is {profile['plastic_score']}/100. A single consistent swap can lower it over the next week.",
    }


def _coach_agent(message: str, analysis: Dict[str, Any], profile: Dict[str, Any]) -> Dict[str, Any]:
    risky = analysis["patterns"]["risky"]
    if risky:
        encouragement = f"You do not need to solve every plastic habit today. Fix {risky[0]} first and let the score move with you."
    else:
        encouragement = "You are early, not behind. ZeroTrace works best when you repeat one small win until it feels automatic."
    return {
        "role": "Coach",
        "encouragement": encouragement,
        "identity": profile["ai_twin"]["title"],
    }


def _compose_local_reply(
    intent: str,
    analyzer: Dict[str, Any],
    planner: Dict[str, Any],
    coach: Dict[str, Any],
) -> str:
    impact = analyzer["impact"]
    risky = analyzer["patterns"]["risky"] or ["hidden packaging habits"]
    positives = analyzer["patterns"]["positive"]
    positive_line = ", ".join(positives[:2]) if positives else "No strong positive signals yet"

    return "\n".join([
        "**Title:** ZeroTrace Multi-Agent Brief",
        "",
        "**Analyzer:**",
        f"- {analyzer['insight']}",
        f"- Risk signals: {', '.join(risky[:3])}.",
        f"- Positive signals: {positive_line}.",
        "",
        "**Planner:**",
        f"- {planner['actions'][0]}",
        f"- {planner['actions'][1]}",
        f"- {planner['actions'][2]}",
        "",
        "**Coach:**",
        f"- {coach['encouragement']}",
        f"- Your ZeroTrace mode right now: {coach['identity']}.",
        "",
        "**Impact Estimate:**",
        f"- Estimated exposure from this topic: {impact['total_kg_per_year']} kg plastic/year.",
        f"- Potential CO2 equivalent: {impact['co2_equivalent_kg']} kg/year.",
        f"- Next loop action: {planner['next_action']}",
    ])


async def route_request(message: str, *, user_id: str, history: List[Dict[str, Any]] | None = None) -> Dict[str, Any]:
    history = history or []
    intent = detect_route_intent(message)
    profile = generate_profile(user_id, history)
    analyzer = _analyzer_agent(message, history)
    planner = _planner_agent(message, analyzer, profile)
    coach = _coach_agent(message, analyzer, profile)
    local_reply = _compose_local_reply(intent, analyzer, planner, coach)

    if not DEMO_MODE:
        remote_prompt = (
            f"{SYSTEM_PROMPT}\n\n"
            "Respond as a combined Analyzer, Planner, and Coach for ZeroTrace. "
            "Keep the sections named exactly Analyzer, Planner, Coach, and Impact Estimate."
        )
        try:
            remote_result = await query_provider_chain(message, intent=intent, system_prompt=remote_prompt)
            reply = remote_result["reply"]
            provider = remote_result["provider"]
            latency = remote_result["latency"]
            errors = remote_result.get("errors", [])
        except Exception as exc:
            logger.warning("Remote AI failed, using local multi-agent response: %s", exc)
            reply = local_reply
            provider = "Local Demo Agents"
            latency = 0.0
            errors = [str(exc)]
    else:
        reply = local_reply
        provider = "Local Demo Agents"
        latency = 0.0
        errors = []

    if not reply.strip():
        reply = DEMO_FALLBACK

    score_snapshot = max(0, profile["plastic_score"] - (2 if analyzer["patterns"]["positive"] else 0))
    return {
        "reply": reply,
        "provider": provider,
        "intent": intent,
        "latency": latency,
        "errors": errors,
        "agents": {
            "analyzer": analyzer,
            "planner": planner,
            "coach": coach,
        },
        "next_action": planner["next_action"],
        "score_snapshot": score_snapshot,
        "loop_state": {
            "current_action": message,
            "feedback": analyzer["issue"],
            "next_step": planner["next_action"],
        },
        "provider_status": provider_status(),
    }


def build_product_brief(product_name: str) -> Dict[str, Any]:
    analysis = analyze_product(product_name)
    summary = "\n".join([
        "**Title:** Product Packaging Review",
        "",
        "**Analyzer:**",
        f"- Packaging impact: {analysis['packaging_impact']}.",
        f"- Sustainability score: {analysis['sustainability_score']}/100.",
        f"- Category: {analysis['category']}.",
        "",
        "**Planner:**",
        f"- Best immediate swap: {analysis['better_choice']}.",
        f"- Alternatives: {', '.join(analysis['alternatives'])}.",
        "",
        "**Coach:**",
        f"- Buy the version that reduces repeat packaging, not just the cheapest visible option.",
        "",
        "**Impact Estimate:**",
        f"- {analysis['notes']}",
    ])
    analysis["ai_summary"] = summary
    return analysis
