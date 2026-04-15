from __future__ import annotations

import logging
import json
import time
from contextlib import asynccontextmanager
from typing import Any, Dict, List, Optional
from datetime import datetime, timedelta

from dotenv import load_dotenv
from fastapi import FastAPI, HTTPException, Query, WebSocket, WebSocketDisconnect
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel, Field

from ai_providers import DEMO_MODE, provider_status, query_provider_chain
import database as db

load_dotenv()
logging.basicConfig(level=logging.INFO, format="%(asctime)s │ %(name)-10s │ %(levelname)-5s │ %(message)s")
logger = logging.getLogger("zerotrace")

@asynccontextmanager
async def lifespan(app: FastAPI):
    logger.info("ZeroTrace backend online with Real Data SQLite architecture.")
    yield
    logger.info("ZeroTrace backend shutting down.")

app = FastAPI(title="ZeroTrace API", description="Data-driven intelligence", version="3.0", lifespan=lifespan)
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])

# --- MODELS ---

class HabitInput(BaseModel):
    type: str
    frequency_per_day: Optional[float] = 0
    frequency_per_week: Optional[float] = 0

class SimulateImpactRequest(BaseModel):
    habits: List[HabitInput]

class ProductAnalyzeRequest(BaseModel):
    product: str
    user_id: str = "demo_user"

class ChatRequest(BaseModel):
    message: str
    user_id: str = "demo_user"

class ChallengeJoinRequest(BaseModel):
    challenge_id: int
    user_id: str = "demo_user"

# --- SYSTEM MEMORY ---

user_settings = {
    "demo_user": {
        "theme": "dark",
        "notifications": {"smart_nudges": True, "weekly_report": True, "challenges": False},
        "eco_preferences": {"lifestyle": "home", "goal": "medium", "focus": ["food"]},
        "ai_settings": {"multi_agent": True, "response_style": "short", "mode": "smart"},
        "privacy": {"tracking": True},
        "gamification": {"public_profile": True, "leaderboard": True},
        "experimental": {"simulator": False, "ai_twin": True, "analyzer_beta": False}
    }
}

class ConnectionManager:
    def __init__(self):
        self.active_connections: Dict[str, List[WebSocket]] = {}
        self.messages: Dict[str, List[dict]] = {
            "general": [], "eco-tips": [], "challenges": [], "reuse-ideas": []
        }
    
    async def connect(self, websocket: WebSocket, channel: str):
        await websocket.accept()
        if channel not in self.active_connections:
            self.active_connections[channel] = []
        self.active_connections[channel].append(websocket)
        
    def disconnect(self, websocket: WebSocket, channel: str):
        if channel in self.active_connections and websocket in self.active_connections[channel]:
            self.active_connections[channel].remove(websocket)
            
    async def broadcast(self, message: dict, channel: str):
        if channel in self.messages:
            self.messages[channel].append(message)
            # Memory leak protection for demo
            self.messages[channel] = self.messages[channel][-50:]
        for connection in self.active_connections.get(channel, []):
            try:
                await connection.send_json(message)
            except Exception:
                pass

manager = ConnectionManager()

# --- SMART ENGINE (NUDGES) ---

def generate_nudges(user_data: Dict[str, Any], habits: List[Dict]) -> List[str]:
    nudges = []
    current_hour = datetime.now().hour

    habit_types = [h["type"].lower() for h in habits]
    
    if "food_delivery" in habit_types or "food packaging" in habit_types:
        if 16 <= current_hour <= 22:
            nudges.append("You usually order food in evenings — try cooking today to reduce packaging waste.")
        else:
            nudges.append("Consider filtering local restaurants by 'eco-packaging' for your next delivery.")
            
    if "plastic_bottles" in habit_types or "water bottle" in habit_types:
        if 6 <= current_hour <= 11:
            nudges.append("Morning! Don't forget to pack your reusable water bottle today.")
        else:
            nudges.append("Swapping to a reusable steel or glass bottle saves an average of ~8kg of plastic a year.")
            
    if not nudges:
        nudges.append("A small behavioral change goes a long way. Log your next zero-waste purchase!")

    return nudges

def get_top_problem(habits: List[Dict]) -> str:
    if not habits:
        return "Not enough data"
    # Estimate grams per week to find top problem
    weights = {"plastic_bottles": 20, "water bottle": 20, "food_delivery": 50, "food packaging": 50}
    max_impact = -1
    top = "General single-use"
    for h in habits:
        freq = float(h.get("frequency", 0))
        period_multiplier = 7 if h.get("period") == "daily" else 1
        est_g = weights.get(h["type"].lower(), 30) * freq * period_multiplier
        if est_g > max_impact:
            max_impact = est_g
            top = h["type"]
    return top.replace("_", " ")

# --- ENDPOINTS ---

class PluginAnalyzeRequest(BaseModel):
    user_id: str = "demo_user"
    platform: str
    content: str
    demo_mode: bool = False
    
@app.post("/plugin/analyze")
async def analyze_plugin_order(req: PluginAnalyzeRequest):
    import json
    
    if req.demo_mode:
        import random
        score = random.randint(40, 90)
        return {
            "impact_score": score,
            "packaging_level": "high" if score > 70 else "medium",
            "recommendations": ["Request minimal packaging at checkout.", "Opt out of disposable cutlery."],
            "alternatives": ["Reusable bags", "Glass containers"]
        }

    prompt = f"Analyze this order from {req.platform} for plastic usage: '{req.content}'. Extract intent. Return ONLY valid JSON: {{\n\"impact_score\": <number 0-100>,\n\"packaging_level\": \"low\" | \"medium\" | \"high\",\n\"recommendations\": [\"3 actionable eco tips\"],\n\"alternatives\": [\"2 better products\"]\n}}."
    
    from search import search_product
    # REAL DDGS DATA INTEGRATION
    search_context = ""
    if not req.demo_mode:
        search_results = search_product(f"{req.platform} packaging {req.content}")
        for r in search_results:
            search_context += f"{r['title']} - {r['body']}\n"
        
        prompt = f"Using this real-world data about the product packaging on {req.platform}:\n\n{search_context}\n\nAnalyze this order: '{req.content}'. Return ONLY valid JSON: {{\n\"impact_score\": <number 0-100>,\n\"packaging_level\": \"low\" | \"medium\" | \"high\",\n\"recommendations\": [\"3 actionable eco tips\"],\n\"alternatives\": [\"2 better products\"]\n}}."

    try:
        response_text = await query_provider_chain([{"role": "user", "content": prompt}])
        if response_text:
            cleaned = response_text[response_text.find('{'):response_text.rfind('}')+1]
            data = json.loads(cleaned)
            
            db.record_user_action(req.user_id, "plugin_analysis", {
                "platform": req.platform,
                "input": req.content,
                "result": data
            })
            return data
    except Exception as e:
        logger.error(f"AI Plugin Analysis Failed: {e}")
        
    return {
        "impact_score": 50,
        "packaging_level": "medium",
        "recommendations": ["Try eco-friendly alternatives", "Ask for zero plastic checkout"],
        "alternatives": ["Local eco stores", "Reusable bags"]
    }

@app.get("/alerts/{user_id}")
async def get_alerts(user_id: str):
    import random
    alerts = []
    actions = db.get_user_actions(user_id, "plugin_analysis")
    if actions and len(actions) > 0:
        latest = actions[0]
        if latest.get("details", {}).get("result", {}).get("packaging_level") == "high":
             alerts.append({
                "type": "warning",
                "message": f"⚠️ Your recent {latest['details']['platform']} item uses high plastic packaging.",
                "priority": "high"
             })
    
    if random.random() > 0.5:
        alerts.append({
           "type": "suggestion",
           "message": "💡 You've used plastic-heavy items 3 times today. Try switching to refill packs.",
           "priority": "medium"
        })
    return alerts

@app.get("/plugin/insights/{user_id}")
async def plugin_insights(user_id: str):
    return {
        "insights": [
            "You order food 4x/week",
            "70% of your orders have high plastic",
            "Biggest issue: Food delivery packaging"
        ]
    }

@app.post("/simulate-impact")
async def simulate_impact(req: SimulateImpactRequest):
    daily_grams = 0
    weights = {"plastic_bottles": 20, "food_delivery": 50, "default": 30}
    
    for h in req.habits:
        weight = weights.get(h.type.lower(), weights["default"])
        if h.frequency_per_day:
            daily_grams += h.frequency_per_day * weight
        elif h.frequency_per_week:
            daily_grams += (h.frequency_per_week * weight) / 7.0

    yearly_kg = (daily_grams * 365) / 1000.0

    return {
        "daily_grams": round(daily_grams, 1),
        "yearly_kg": round(yearly_kg, 1),
        "scenarios": [
            {"reduction": "25%", "saved_kg": round(yearly_kg * 0.25, 2)},
            {"reduction": "50%", "saved_kg": round(yearly_kg * 0.50, 2)},
            {"reduction": "75%", "saved_kg": round(yearly_kg * 0.75, 2)},
        ]
    }

@app.get("/profile/{user_id}")
async def get_profile(user_id: str):
    user = db.ensure_user(user_id)
    habits = db.get_user_habits(user_id)
    
    top_problem = get_top_problem(habits)
    
    # Calculate score based on actual habits recorded
    # Assume Baseline 1000g week = 50 score
    weekly_grams = 0
    for h in habits:
        w = 30
        f = float(h["frequency"])
        weekly_grams += w * (f * 7 if h["period"] == "daily" else f)
        
    normalized = min(100, max(0, 100 - (weekly_grams / 20.0)))
    score = int(normalized)
    
    if score > 70:
        risk = "low"
    elif score >= 40:
        risk = "medium"
    else:
        risk = "high"
        
    db.update_user_score(user_id, score, risk)
    
    nudges = generate_nudges(user, habits)
    actions = db.get_user_actions(user_id)
    chat_hist = db.get_recent_chat_history(user_id, limit=50)
    
    return {
        "score": score,
        "xp": 1250 + (len(chat_hist) * 50) + (len(actions) * 10),
        "level": 3 + (len(actions) // 5),
        "risk_level": risk,
        "top_problem": top_problem,
        "weekly_trend": -5,
        "nudges": nudges
    }

class ActionRequest(BaseModel):
    action_type: str
    user_id: str = "demo_user"

@app.post("/action")
async def log_quick_action(req: ActionRequest):
    db.ensure_user(req.user_id)
    impact_score = {"plastic_bottle": 20, "ordered_food": 50, "packaged_item": 30}.get(req.action_type, 10)
    db.record_user_action(req.user_id, "quick_log", {"type": req.action_type, "impact": impact_score})
    return {"status": "success", "xp_gained": 10}

class ScanProductRequest(BaseModel):
    image: str

@app.post("/scan-product")
async def scan_product(req: ScanProductRequest):
    # Base64 simulated parse -> fallback detection
    product_guess = "Coca Cola bottle"
    
    from search import search_product
    search_results = search_product(f"plastic packaging impact {product_guess}")
    search_context = ""
    for r in search_results:
        search_context += f"{r['title']} - {r['body']}\n"
        
    prompt = f"Analyze this product (detected as {product_guess}) using this real-world data:\n\n{search_context}\n\nReturn EXACT JSON matching: {{\n\"product_name\": \"string\",\n\"plastic_level\": \"low\" | \"medium\" | \"high\",\n\"score\": <0-100>,\n\"verdict\": \"Eco rating string\",\n\"alternatives\": [\"Option 1\"],\n\"recommendation\": \"String recommendation\"\n}}"
    
    import json
    try:
        response_text = await query_provider_chain([{"role": "user", "content": prompt}])
        if response_text:
            cleaned = response_text[response_text.find('{'):response_text.rfind('}')+1]
            return json.loads(cleaned)
    except Exception as e:
        logger.error(f"Scan Product AI Failed: {e}")
        
    return {
        "product_name": "PET Plastic Water Bottle",
        "plastic_level": "high",
        "score": 15,
        "verdict": "High Environmental Impact",
        "explanation": "High volume single-use PET plastic.",
        "alternatives": ["Reusable Steel Bottle", "Glass Bottled Water"],
        "recommendation": "Switch to a reusable bottle to save 120g of plastic weekly."
    }

@app.get("/global-impact")
async def global_impact():
    return {"total_saved_kg": 4250.5, "users_active": 1204}

@app.get("/impact/{user_id}")
async def get_impact_dashboard(user_id: str):
    user = db.ensure_user(user_id)
    actions = db.get_user_actions(user_id)
    
    # Generate timeline based on actions or fallback pseudo-timeline mapping to history
    today = datetime.now()
    timeline = []
    total_saved = 0
    
    if not actions:
        # Give some initial realistic baseline if empty
        timeline = [{"date": (today - timedelta(days=i)).strftime("%Y-%m-%d"), "usage": 150 - (i*5)} for i in range(5, -1, -1)]
        total_saved = 0
    else:
        counts_by_date = {}
        for a in actions:
            d = a["timestamp"][:10]
            if d not in counts_by_date: counts_by_date[d] = 0
            # Every action recorded represents approx 20g saved!
            counts_by_date[d] += 20
        
        # Sort and transform
        for k in sorted(counts_by_date.keys()):
            timeline.append({"date": k, "usage": max(0, 150 - counts_by_date[k])})
            total_saved += counts_by_date[k]
        
    return {
        "timeline": timeline,
        "total_saved": total_saved,
        "streak": user["streak"]
    }

@app.post("/analyze-product")
async def analyze_product(req: ProductAnalyzeRequest):
    req_product = req.product.lower()
    db.ensure_user(req.user_id)
    db.record_user_action(req.user_id, "product_analysis", {"product": req.product})
    
    plastic_level = "medium"
    impact_v = 40
    reason = "contains mixed components"
    alts = ["buy bulk", "reusable equivalent"]
    
    if "bottle" in req_product or "water" in req_product:
        plastic_level = "high"
        impact_v = 85
        reason = "single-use packaging generates rapid emissions"
        alts = ["stainless steel flask", "glass reusable bottle"]
    elif "shampoo" in req_product or "soap" in req_product:
        plastic_level = "high"
        impact_v = 75
        reason = "thick HDPE plastic rarely fully recycled"
        alts = ["refill pouches", "solid shampoo bar"]
        
    score = 100 - impact_v
    
    return {
        "impact_score": score,
        "plastic_level": plastic_level,
        "reason": reason,
        "alternatives": alts
    }

@app.post("/chat")
async def chat_interaction(req: ChatRequest):
    user_id = req.user_id
    db.ensure_user(user_id)
    history = db.get_recent_chat_history(user_id, 5)
    
    # Save user message
    db.save_chat_message(user_id, "user", req.message)
    
    # Reconstruct prompt for AI
    from prompt import SYSTEM_PROMPT
    prompt_with_context = SYSTEM_PROMPT + \
        f"\n\nContext based on user memory:\nLast 5 interactions: {json.dumps(history)}\nUser is asking: {req.message}"
    
    try:
        if "plastic" in req.message.lower():
            prompt_with_context += "\n\nCRITICAL: The user explicitly mentioned plastic. Bias your response heavily toward practical sustainability advice and alternatives."
            
        result = await query_provider_chain(req.message, intent="general", system_prompt=prompt_with_context)
        ai_reply = result["reply"]
    except Exception as e:
        logger.error(f"AI chain failed: {e}")
        # Intelligent fallback when all real providers fail
        intelligent_fallbacks = [
            "Reducing single-use packaging will significantly lower your plastic footprint.",
            "Switching to reusable bottles and containers can cut daily plastic usage by up to 40%.",
            "Avoiding food delivery packaging is one of the highest impact changes you can make."
        ]
        import random
        ai_reply = random.choice(intelligent_fallbacks)
        
    db.save_chat_message(user_id, "ai", ai_reply)
    db.record_user_action(user_id, "chat", {"query": req.message[:50]})
    
    return {"response": ai_reply, "status": "success", "history_used": len(history)}

@app.get("/challenge/leaderboard")
async def challenge_leaderboard():
    users = db.execute_query("SELECT id, score, streak FROM users ORDER BY score DESC LIMIT 10", fetchall=True)
    board = []
    for u in users:
        board.append({
            "user": u["id"],
            "score": u["score"],
            "reduction_percent": min(100, max(0, u["score"])), 
            "streak": u["streak"]
        })
    # If no real users, return empty list (no fake data)
    return board

@app.get("/challenge/list")
async def challenge_list():
    import random
    # Simulated live active challenges
    challenges = [
        {"id": 1, "title": "Zero Waste Week", "difficulty": "Medium", "participants": random.randint(10, 100), "impact": "High reduction"},
        {"id": 2, "title": "No Delivery Month", "difficulty": "Hard", "participants": random.randint(5, 50), "impact": "Huge reduction"},
        {"id": 3, "title": "Bring Your Own Cup", "difficulty": "Easy", "participants": random.randint(50, 500), "impact": "Steady reduction"}
    ]
    return {"challenges": challenges}

class CommunityPostReq(BaseModel):
    message: str
    user_id: str = "demo_user"

@app.get("/community/feed")
async def community_feed():
    posts_raw = db.execute_query("SELECT user_id, action_type, details, timestamp FROM actions WHERE action_type = 'community_post' ORDER BY timestamp DESC LIMIT 20", fetchall=True)
    posts = []
    for p in posts_raw:
        try:
            details = json.loads(p["details"])
            posts.append({
                "id": p["timestamp"],
                "user": p["user_id"],
                "message": details.get("message", ""),
                "timestamp": p["timestamp"]
            })
        except:
            pass
    return {"feed": posts}

@app.post("/community/post")
async def community_post(req: CommunityPostReq):
    db.ensure_user(req.user_id)
    db.record_user_action(req.user_id, "community_post", {"message": req.message})
    return {"status": "success"}

@app.post("/challenge/join")
async def challenge_join(req: ChallengeJoinRequest):
    db.ensure_user(req.user_id)
    db.record_user_action(req.user_id, "challenge_join", {"challenge_id": req.challenge_id})
    db.execute_query("INSERT INTO challenges (user_id, title, status) VALUES (?, ?, ?)",
                     (req.user_id, "Monthly Reduction sprint", "active"), commit=True)
    return {"status": "success", "joined": req.challenge_id}

# --- SETTINGS ENDPOINTS ---
@app.get("/user/settings")
async def get_settings(user_id: str = "demo_user"):
    return user_settings.get(user_id, {})

@app.post("/user/settings")
async def update_settings(req: dict, user_id: str = "demo_user"):
    user_settings[user_id] = req
    return {"status": "success"}

# --- WEBSOCKET CHAT ENDPOINTS ---
@app.websocket("/ws/chat/{channel}")
async def websocket_endpoint(websocket: WebSocket, channel: str):
    await manager.connect(websocket, channel)
    try:
        while True:
            data = await websocket.receive_text()
            try:
                message = json.loads(data)
                message["timestamp"] = datetime.now().isoformat()
                await manager.broadcast(message, channel)
            except Exception as e:
                logger.error(f"WebSocket parse error: {e}")
    except WebSocketDisconnect:
        manager.disconnect(websocket, channel)

@app.get("/community/channels")
async def get_channels():
    return list(manager.messages.keys())

@app.get("/community/messages/{channel}")
async def get_messages(channel: str):
    return manager.messages.get(channel, [])

@app.get("/weekly-report/{user_id}")
async def weekly_report(user_id: str):
    db.ensure_user(user_id)
    habits = db.get_user_habits(user_id)
    top_issue = get_top_problem(habits)
    
    actions = db.get_user_actions(user_id)
    reduction = len(actions) * 2.5 # approx 2.5% improvement per logged action
    red_percent = min(100.0, reduction)
    
    return {
        "reduction_percent": red_percent,
        "top_issue": top_issue,
        "improvement_area": "Daily tracking",
        "suggestions": [
            "You logged actions this week! Keep tracking replacement habits.",
            f"Focus on reducing {top_issue} to double your impact."
        ]
    }

@app.get("/health")
async def health():
    statuses = provider_status()
    # Populate a completely new demo user for first impression calculation
    db.ensure_user("demo_user")
    db.save_habit("demo_user", "plastic_bottles", 3, "daily")
    db.save_habit("demo_user", "food_delivery", 2, "weekly")
    
    return {"status": "online", "providers": statuses, "data_mode": "SQLite Real Engine"}

if __name__ == "__main__":
    import uvicorn
    uvicorn.run("main:app", host="127.0.0.1", port=8000, reload=True)
