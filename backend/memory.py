"""
Persistent user memory for ZeroTrace.
Stores interaction history and lightweight profile state for demo reliability.
"""

from __future__ import annotations

import json
import time
from pathlib import Path
from typing import Any, Dict, List

DATA_FILE = Path(__file__).with_name("user_memory.json")
MAX_MESSAGES = 40


def _default_store() -> Dict[str, Any]:
    return {"users": {}}


def _load_store() -> Dict[str, Any]:
    try:
        with DATA_FILE.open("r", encoding="utf-8") as handle:
            data = json.load(handle)
            if isinstance(data, dict) and "users" in data:
                return data
    except (FileNotFoundError, json.JSONDecodeError):
        pass
    return _default_store()


def _save_store(store: Dict[str, Any]) -> None:
    with DATA_FILE.open("w", encoding="utf-8") as handle:
        json.dump(store, handle, indent=2)


def _ensure_user(store: Dict[str, Any], user_id: str) -> Dict[str, Any]:
    users = store.setdefault("users", {})
    if user_id not in users:
        users[user_id] = {
            "messages": [],
            "profile": {
                "display_name": "Eco Hero",
                "plastic_score": 50,
                "risk_level": "Medium Risk",
                "last_updated": time.time(),
            },
            "stats": {
                "chat_count": 0,
                "product_analyses": 0,
                "habit_plans": 0,
                "community_posts": 0,
            },
        }
    return users[user_id]


def get_user_state(user_id: str) -> Dict[str, Any]:
    store = _load_store()
    return _ensure_user(store, user_id)


def get_history(user_id: str, limit: int = 12) -> List[Dict[str, Any]]:
    state = get_user_state(user_id)
    messages = state.get("messages", [])
    return [
        {"role": message["role"], "content": message["content"]}
        for message in messages[-limit:]
    ]


def get_raw_history(user_id: str, limit: int | None = None) -> List[Dict[str, Any]]:
    state = get_user_state(user_id)
    messages = state.get("messages", [])
    return messages[-limit:] if limit else messages


def record_interaction(
    user_id: str,
    user_message: str,
    assistant_message: str,
    *,
    intent: str | None = None,
    metadata: Dict[str, Any] | None = None,
) -> None:
    store = _load_store()
    state = _ensure_user(store, user_id)
    timestamp = time.time()

    state["messages"].extend([
        {
            "role": "user",
            "content": user_message,
            "timestamp": timestamp,
            "intent": intent,
            "metadata": metadata or {},
        },
        {
            "role": "assistant",
            "content": assistant_message,
            "timestamp": timestamp,
            "intent": intent,
            "metadata": metadata or {},
        },
    ])
    state["messages"] = state["messages"][-MAX_MESSAGES:]
    state["stats"]["chat_count"] = state["stats"].get("chat_count", 0) + 1
    state["profile"]["last_updated"] = timestamp
    _save_store(store)


def increment_stat(user_id: str, stat_name: str, amount: int = 1) -> None:
    store = _load_store()
    state = _ensure_user(store, user_id)
    state["stats"][stat_name] = state["stats"].get(stat_name, 0) + amount
    state["profile"]["last_updated"] = time.time()
    _save_store(store)


def update_profile_snapshot(user_id: str, profile: Dict[str, Any]) -> None:
    store = _load_store()
    state = _ensure_user(store, user_id)
    state["profile"].update(profile)
    state["profile"]["last_updated"] = time.time()
    _save_store(store)


def clear_session(user_id: str) -> None:
    store = _load_store()
    users = store.get("users", {})
    if user_id in users:
        del users[user_id]
        _save_store(store)
