import json
from datetime import datetime
from pathlib import Path
from typing import Dict, List, Optional

from intelligence import generate_post_tags

class CommunityManager:
    def __init__(self, storage_file: Optional[str] = None):
        default_path = Path(__file__).with_name("community_posts.json")
        self.storage_file = Path(storage_file) if storage_file else default_path
        self.posts: List[Dict] = []
        self.max_posts = 100
        self._load_posts()

    def _load_posts(self):
        try:
            with self.storage_file.open("r", encoding="utf-8") as f:
                self.posts = json.load(f)
        except (FileNotFoundError, json.JSONDecodeError):
            self.posts = []

    def _save_posts(self):
        with self.storage_file.open("w", encoding="utf-8") as f:
            json.dump(self.posts, f, indent=2)

    def add_post(self, user: str, message: str, tags: Optional[List[str]] = None):
        if not message.strip():
            return None
        
        post = {
            "id": len(self.posts) + 1,
            "user": user,
            "message": message,
            "timestamp": datetime.now().isoformat(),
            "tags": tags or generate_post_tags(message),
            "reactions": {"♻️": 0, "🌱": 0, "🔋": 0}
        }
        
        self.posts.insert(0, post)
        self.posts = self.posts[:self.max_posts]
        self._save_posts()
        return post

    def get_feed(self) -> List[Dict]:
        return self.posts

    def get_highlights(self) -> List[Dict]:
        return sorted(
            self.posts,
            key=lambda post: sum(post.get("reactions", {}).values()),
            reverse=True,
        )[:3]

    def add_reaction(self, post_id: int, reaction: str):
        for post in self.posts:
            if post["id"] == post_id:
                if reaction in post["reactions"]:
                    post["reactions"][reaction] += 1
                else:
                    post["reactions"][reaction] = 1
                self._save_posts()
                return post
        return None

    def clear_feed(self):
        self.posts = []
        self._save_posts()

community_manager = CommunityManager()
