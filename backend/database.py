import sqlite3
import json
from pathlib import Path
from contextlib import contextmanager
from typing import Dict, Any, List

DB_PATH = Path(__file__).parent / "zerotrace.db"

def init_db():
    with sqlite3.connect(DB_PATH) as conn:
        c = conn.cursor()
        c.execute("""
            CREATE TABLE IF NOT EXISTS users (
                id TEXT PRIMARY KEY,
                score INTEGER DEFAULT 100,
                risk_level TEXT DEFAULT 'low',
                streak INTEGER DEFAULT 0
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS habits (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                type TEXT,
                frequency REAL,
                period TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS actions (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                action_type TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                details TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS chat_history (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                role TEXT,
                content TEXT,
                timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        c.execute("""
            CREATE TABLE IF NOT EXISTS challenges (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                user_id TEXT,
                title TEXT,
                status TEXT,
                FOREIGN KEY (user_id) REFERENCES users(id)
            )
        """)
        conn.commit()

@contextmanager
def get_db():
    conn = sqlite3.connect(DB_PATH)
    conn.row_factory = sqlite3.Row
    try:
        yield conn
    finally:
        conn.close()

def execute_query(query: str, args=(), fetchall=False, fetchone=False, commit=False):
    with get_db() as conn:
        c = conn.cursor()
        c.execute(query, args)
        if commit:
            conn.commit()
            return c.lastrowid
        if fetchall:
            return [dict(row) for row in c.fetchall()]
        if fetchone:
            row = c.fetchone()
            return dict(row) if row else None
        return None

# User functions
def ensure_user(user_id: str):
    user = execute_query("SELECT * FROM users WHERE id = ?", (user_id,), fetchone=True)
    if not user:
        execute_query("INSERT INTO users (id, score, risk_level, streak) VALUES (?, ?, ?, ?)", 
                      (user_id, 100, 'low', 0), commit=True)
        return {"id": user_id, "score": 100, "risk_level": "low", "streak": 0}
    return user

def update_user_score(user_id: str, score: int, risk_level: str):
    execute_query("UPDATE users SET score = ?, risk_level = ? WHERE id = ?", 
                  (score, risk_level, user_id), commit=True)

# Chat History functions
def save_chat_message(user_id: str, role: str, content: str):
    execute_query("INSERT INTO chat_history (user_id, role, content) VALUES (?, ?, ?)",
                  (user_id, role, content), commit=True)

def get_recent_chat_history(user_id: str, limit: int = 5) -> List[Dict]:
    return execute_query("SELECT role, content FROM chat_history WHERE user_id = ? ORDER BY timestamp DESC LIMIT ?", 
                         (user_id, limit), fetchall=True)[::-1] # reverse the reversed order

# Action & Habits Tracking
def record_user_action(user_id: str, action_type: str, details: Dict):
    execute_query("INSERT INTO actions (user_id, action_type, details) VALUES (?, ?, ?)",
                  (user_id, action_type, json.dumps(details)), commit=True)

def get_user_actions(user_id: str, action_type: str = None) -> List[Dict]:
    if action_type:
        rows = execute_query("SELECT * FROM actions WHERE user_id = ? AND action_type = ? ORDER BY timestamp DESC", 
                             (user_id, action_type), fetchall=True)
    else:
        rows = execute_query("SELECT * FROM actions WHERE user_id = ? ORDER BY timestamp DESC", 
                             (user_id,), fetchall=True)
    for row in rows:
        row['details'] = json.loads(row['details'])
    return rows

def save_habit(user_id: str, habit_type: str, frequency: float, period: str):
    execute_query("INSERT INTO habits (user_id, type, frequency, period) VALUES (?, ?, ?, ?)",
                  (user_id, habit_type, frequency, period), commit=True)

def get_user_habits(user_id: str) -> List[Dict]:
    return execute_query("SELECT * FROM habits WHERE user_id = ?", (user_id,), fetchall=True)

# Initialize
init_db()
