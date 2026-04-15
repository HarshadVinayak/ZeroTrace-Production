"""
Challenge engine with seeded demo missions and basic participation tracking.
"""

from __future__ import annotations

import json
import random
from pathlib import Path
from typing import Any, Dict, List

STORE_FILE = Path(__file__).with_name("challenges_store.json")

CHALLENGE_TEMPLATES = {
    "water bottle": {
        "title": "Bottle-Free Week",
        "description": "Avoid buying single-use plastic bottles for the next 7 days.",
        "goal": "7 days bottle-free",
        "metric": "0 plastic bottles",
        "difficulty": "Easy",
        "participants": 18,
        "impact": "Cuts a high-frequency daily plastic habit immediately.",
    },
    "takeaway": {
        "title": "Cutlery Off Mission",
        "description": "Order food without disposable cutlery and napkin packs all week.",
        "goal": "5 cutlery-free orders",
        "metric": "Packaging bundle avoided",
        "difficulty": "Medium",
        "participants": 24,
        "impact": "Stops the hidden extras that make delivery waste spike.",
    },
    "cling wrap": {
        "title": "Wrap Detox",
        "description": "Use boxes, jars, or beeswax wraps instead of cling film.",
        "goal": "7 days without cling wrap",
        "metric": "Kitchen plastic avoided",
        "difficulty": "Easy",
        "participants": 11,
        "impact": "Turns one kitchen habit into a repeatable low-waste system.",
    },
    "plastic bag": {
        "title": "Bag Ban Sprint",
        "description": "Carry your own bag every time you leave home this week.",
        "goal": "10 trips with reusable bag",
        "metric": "Bag refusals",
        "difficulty": "Easy",
        "participants": 32,
        "impact": "Builds a frictionless reusable habit fast.",
    },
}

DEFAULT_CHALLENGES = [
    {
        "title": "ZeroTrace Audit",
        "description": "Count every plastic item you throw away for one full week.",
        "goal": "7-day audit",
        "metric": "All plastic items logged",
        "difficulty": "Easy",
        "participants": 14,
        "impact": "Awareness creates the fastest compounding behavior change.",
    },
    {
        "title": "Refill Run",
        "description": "Visit one refill station or eco store this week.",
        "goal": "1 refill visit",
        "metric": "Station checked in",
        "difficulty": "Medium",
        "participants": 9,
        "impact": "Connects your digital plan to a real-world replacement habit.",
    },
    {
        "title": "One Meal, Zero Plastic",
        "description": "Complete one meal or snack with no single-use plastic packaging.",
        "goal": "3 zero-plastic meals",
        "metric": "Meals completed",
        "difficulty": "Medium",
        "participants": 16,
        "impact": "Shows how small moments add up into visible impact.",
    },
]


def _seed_store() -> Dict[str, Any]:
    challenges: List[Dict[str, Any]] = []
    next_id = 1
    for template in [*CHALLENGE_TEMPLATES.values(), *DEFAULT_CHALLENGES]:
        challenges.append({
            "id": next_id,
            "created_by": "ZeroTrace",
            "status": "active",
            "week_label": "This Week",
            **template,
        })
        next_id += 1
    return {"challenges": challenges}


def _load_store() -> Dict[str, Any]:
    try:
        with STORE_FILE.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
            if isinstance(data, dict) and "challenges" in data:
                return data
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    store = _seed_store()
    _save_store(store)
    return store


def _save_store(store: Dict[str, Any]) -> None:
    with STORE_FILE.open("w", encoding="utf-8") as handle:
        json.dump(store, handle, indent=2)


def generate_challenges(detected_risks: List[str], score: int, count: int = 3) -> List[Dict[str, Any]]:
    personalized: List[Dict[str, Any]] = []
    used_titles = set()

    for risk in detected_risks:
        for key, template in CHALLENGE_TEMPLATES.items():
            if key in risk and template["title"] not in used_titles:
                personalized.append(_enrich_challenge(template, score))
                used_titles.add(template["title"])
                break

    defaults = DEFAULT_CHALLENGES[:]
    random.shuffle(defaults)
    for challenge in defaults:
        if len(personalized) >= count:
            break
        if challenge["title"] not in used_titles:
            personalized.append(_enrich_challenge(challenge, score))
            used_titles.add(challenge["title"])

    return personalized[:count]


def list_challenges(user_id: str | None = None) -> List[Dict[str, Any]]:
    store = _load_store()
    challenges = store["challenges"][:]
    challenges.sort(key=lambda challenge: (-challenge.get("participants", 0), challenge["id"]))
    return challenges


def join_challenge(challenge_id: int, user_id: str) -> Dict[str, Any] | None:
    store = _load_store()
    for challenge in store["challenges"]:
        joined_by = challenge.setdefault("joined_by", [])
        if challenge["id"] == challenge_id:
            if user_id not in joined_by:
                joined_by.append(user_id)
                challenge["participants"] = int(challenge.get("participants", 0)) + 1
                _save_store(store)
            return challenge
    return None


def build_leaderboard() -> List[Dict[str, Any]]:
    store = _load_store()
    ordered = sorted(store["challenges"], key=lambda item: item.get("participants", 0), reverse=True)
    leaderboard = []
    for index, challenge in enumerate(ordered[:5], start=1):
        leaderboard.append({
            "rank": index,
            "challenge_id": challenge["id"],
            "title": challenge["title"],
            "participants": challenge.get("participants", 0),
        })
    return leaderboard


def create_challenge(title: str, description: str, goal: str, created_by: str) -> Dict[str, Any]:
    store = _load_store()
    challenge = {
        "id": max((entry["id"] for entry in store["challenges"]), default=0) + 1,
        "title": title.strip(),
        "description": description.strip(),
        "goal": goal.strip(),
        "metric": goal.strip(),
        "difficulty": "Custom",
        "participants": 1,
        "impact": "Community-created mission to keep ZeroTrace behavior visible.",
        "created_by": created_by.strip() or "Community",
        "status": "active",
        "week_label": "Community Challenge",
    }
    store["challenges"].insert(0, challenge)
    _save_store(store)
    return challenge


def _enrich_challenge(template: Dict[str, Any], score: int) -> Dict[str, Any]:
    challenge = {
        "created_by": "ZeroTrace",
        "status": "active",
        "week_label": "This Week",
        **template,
    }
    if score >= 70:
        challenge["urgency"] = "High"
    elif score >= 45:
        challenge["urgency"] = "Medium"
    else:
        challenge["urgency"] = "Low"
    return challenge
