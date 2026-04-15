const API_BASE = inferApiBase();
const userId = getOrCreateUserId();
let communityInterval = null;

function inferApiBase() {
    if (window.location.protocol === "file:") {
        return "http://127.0.0.1:8000";
    }
    return window.location.origin;
}

function getOrCreateUserId() {
    let id = localStorage.getItem("zerotrace_user_id");
    if (!id) {
        id = `user_${Math.random().toString(36).slice(2, 10)}`;
        localStorage.setItem("zerotrace_user_id", id);
    }
    return id;
}

function getDisplayName() {
    return localStorage.getItem("zerotrace_display_name") || "IIT Builder";
}

function setDisplayName(value) {
    localStorage.setItem("zerotrace_display_name", value || "IIT Builder");
}

function escapeHTML(value = "") {
    return String(value).replace(/[&<>"']/g, (character) => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;",
    }[character]));
}

function formatTextResponse(text, provider, latency) {
    let html = escapeHTML(text).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
    html = html.replace(/^- (.+)$/gm, "<li>$1</li>");
    html = html.replace(/((?:<li>.*<\/li>\n?)+)/g, "<ul>$1</ul>");
    html = html.replace(/\n{2,}/g, "<br><br>");
    html = html.replace(/\n/g, "<br>");
    html = html.replace(/<br><ul>/g, "<ul>");
    html = html.replace(/<\/ul><br>/g, "</ul>");
    const badge = provider ? `<div class="provider-tag">${escapeHTML(provider)}${latency ? ` · ${latency}s` : ""}</div>` : "";
    return badge + html;
}

function loadingHTML(label = "Thinking") {
    return `
        <div class="loading">
            <div class="loading-dots"><span></span><span></span><span></span></div>
            <span>${escapeHTML(label)}...</span>
        </div>
    `;
}

function setHTML(id, html) {
    const element = document.getElementById(id);
    if (element) {
        element.innerHTML = html;
    }
}

function setText(id, text) {
    const element = document.getElementById(id);
    if (element) {
        element.textContent = text;
    }
}

async function api(path, options) {
    const response = await fetch(`${API_BASE}${path}`, options);
    if (!response.ok) {
        throw new Error(`Request failed with ${response.status}`);
    }
    return response.json();
}

async function sendMessage() {
    const input = document.getElementById("dashboardChatInput");
    const output = document.getElementById("dashboardChatOutput");
    if (!input || !output) return;

    const message = input.value.trim();
    if (!message) {
        output.innerHTML = `<div class="empty-state">Ask ZeroTrace about a habit, product, or buying decision.</div>`;
        return;
    }

    output.innerHTML = loadingHTML("Running Analyzer, Planner, and Coach");

    try {
        const data = await api("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, user_id: userId }),
        });
        output.innerHTML = formatTextResponse(data.reply, data.provider, data.latency);
        setText("nextActionLabel", data.next_action || "Track your next purchase in ZeroTrace.");
        if (data.profile) {
            setText("heroScore", `${data.profile.plastic_score}/100`);
        }
        input.value = "";
        await Promise.all([loadDashboard(), loadWeeklyReport()]);
    } catch (error) {
        output.innerHTML = `<div class="empty-state">${escapeHTML(error.message)}</div>`;
    }
}

async function sendCoachMessage() {
    const input = document.getElementById("coachInput");
    const output = document.getElementById("coachOutput");
    if (!input || !output) return;

    const message = input.value.trim();
    if (!message) {
        output.innerHTML = `<div class="empty-state">Try: "I want to order food tonight" or "Should I buy bottled water?"</div>`;
        return;
    }

    output.innerHTML = loadingHTML("Intercepting the decision");
    try {
        const data = await api("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ message, user_id: userId }),
        });
        output.innerHTML = formatTextResponse(data.reply, data.provider, data.latency);
        setText("coachNextAction", data.next_action || "Choose the lower-packaging option.");
        input.value = "";
        await loadDashboard();
    } catch (error) {
        output.innerHTML = `<div class="empty-state">${escapeHTML(error.message)}</div>`;
    }
}

async function analyzeProduct() {
    const input = document.getElementById("productInput") || document.getElementById("dashboardProductInput");
    const output = document.getElementById("productOutput") || document.getElementById("dashboardProductOutput");
    if (!input || !output) return;

    const productName = input.value.trim();
    if (!productName) {
        output.innerHTML = `<div class="empty-state">Enter a product name, store listing, or buying idea.</div>`;
        return;
    }

    output.innerHTML = loadingHTML("Scanning packaging");
    try {
        const data = await api("/analyze-product", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ product_name: productName, user_id: userId }),
        });

        output.innerHTML = `
            <div class="provider-tag">E-Commerce Analyzer</div>
            <strong>${escapeHTML(data.product_name)}</strong>
            <div class="metric-row">
                <span class="tag">Impact: ${escapeHTML(data.packaging_impact)}</span>
                <span class="tag">Score: ${escapeHTML(String(data.sustainability_score))}/100</span>
                <span class="tag">${escapeHTML(data.category)}</span>
            </div>
            <p class="kicker">${escapeHTML(data.notes)}</p>
            <ul class="list">
                ${data.alternatives.map((item) => `<li>${escapeHTML(item)}</li>`).join("")}
            </ul>
        `;
        setText("productBestSwap", data.better_choice || "Reusable alternative");
    } catch (error) {
        output.innerHTML = `<div class="empty-state">${escapeHTML(error.message)}</div>`;
    }
}

async function generateHabitPlan() {
    const input = document.getElementById("habitInput");
    const output = document.getElementById("habitOutput");
    if (!input || !output) return;

    const habit = input.value.trim();
    if (!habit) {
        output.innerHTML = `<div class="empty-state">Describe one plastic-heavy habit you want to replace.</div>`;
        return;
    }

    output.innerHTML = loadingHTML("Building habit replacement plan");
    try {
        const data = await api("/chat", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                message: `Create a habit replacement plan for: ${habit}`,
                user_id: userId,
            }),
        });
        output.innerHTML = formatTextResponse(data.reply, data.provider, data.latency);
        setText("habitLoopStep", data.next_action || "Repeat the new habit for 7 days.");
        await loadDashboard();
    } catch (error) {
        output.innerHTML = `<div class="empty-state">${escapeHTML(error.message)}</div>`;
    }
}

async function loadHealth() {
    try {
        const data = await api("/health");
        const providerLabel = data.demo_mode ? "Demo-safe AI loop active" : "Live multi-model AI active";
        document.querySelectorAll("[data-provider-badge]").forEach((element) => {
            element.innerHTML = `<span class="dot"></span>${escapeHTML(providerLabel)}`;
        });

        const statusHTML = data.providers.map((provider) => `
            <div class="mini-card">
                <strong>${escapeHTML(provider.name)}</strong>
                <span class="muted">${escapeHTML(provider.mode)}</span>
            </div>
        `).join("");
        setHTML("providerStatus", statusHTML || `<div class="empty-state">Provider status unavailable.</div>`);
    } catch (error) {
        setHTML("providerStatus", `<div class="empty-state">${escapeHTML(error.message)}</div>`);
    }
}

async function loadDashboard() {
    const dashboard = document.body.dataset.page === "dashboard";
    const data = await api(`/user/dashboard/${userId}`);
    const profile = data.profile;
    const report = data.weekly_report;

    if (dashboard) {
        setText("heroScore", `${profile.plastic_score}/100`);
        setText("scoreValue", profile.plastic_score);
        setText("scoreRisk", profile.risk_level);
        setText("aiTwinTitle", profile.ai_twin.title);
        setText("aiTwinSummary", profile.habit_summary);
        setText("nudgeText", report.suggestions[0] || "Carry one reusable item before your next purchase.");
        setText("nextActionLabel", data.recommended_challenges[0]?.title || "Run one low-plastic experiment this week.");
        setText("shareCardTitle", data.share_card.title);
        setText("shareCardBody", `${data.share_card.body} ${data.share_card.hashtags}`);
        setText("statsChats", String(data.stats.chat_count || 0));
        setText("statsProducts", String(data.stats.product_analyses || 0));
        setText("statsPosts", String(data.stats.community_posts || 0));
        setHTML("challengeList", renderChallengeCards(data.recommended_challenges, true));
        setHTML("locationPreview", renderLocationCards(data.locations_preview));
        setHTML("communityHighlightList", renderCommunityHighlights(data.community_highlights));
        setHTML("providerStatus", renderProviderStatus(data.provider_status));
        const scoreBar = document.getElementById("scoreBar");
        if (scoreBar) {
            scoreBar.style.width = `${profile.plastic_score}%`;
        }
    }

    return data;
}

async function loadWeeklyReport() {
    const reportContainers = document.querySelectorAll("[data-weekly-report]");
    if (!reportContainers.length) return null;

    const data = await api(`/weekly-report?user_id=${encodeURIComponent(userId)}`);
    const profile = data.profile_snapshot;

    setText("weeklyReduction", `${data.reduction_percent}%`);
    setText("weeklyIssue", data.biggest_issue);
    setText("futureContinue", `${data.future_projection.if_continue_kg_per_year} kg/yr`);
    setText("futureImprove", `${data.future_projection.if_improve_kg_per_year} kg/yr`);
    setText("profileScore", `${profile.plastic_score}/100`);
    setText("profileRisk", profile.risk_level);
    setText("profileTrend", profile.trend);
    setText("reportSummary", data.summary);
    setHTML("badHabitsList", renderSimpleList(data.bad_habits));
    setHTML("goodHabitsList", renderSimpleList(data.good_habits));
    setHTML("suggestionsList", renderSimpleList(data.suggestions));
    setText("impactCardTitle", data.share_card.title);
    setText("impactCardBody", `${data.share_card.body} ${data.share_card.hashtags}`);

    const trendBar = document.getElementById("trendBar");
    if (trendBar) {
        trendBar.style.width = `${Math.max(12, 100 - profile.plastic_score)}%`;
    }
    return data;
}

async function loadChallenges() {
    const containers = document.querySelectorAll("[data-challenges]");
    if (!containers.length) return null;

    const data = await api(`/challenge/list?user_id=${encodeURIComponent(userId)}`);
    const html = renderChallengeCards(data.challenges);
    containers.forEach((container) => {
        container.innerHTML = html;
    });
    return data;
}

async function loadCommunity() {
    const feedEl = document.getElementById("communityFeed");
    if (!feedEl) return null;

    const data = await api("/community/feed");
    feedEl.innerHTML = renderCommunityFeed(data.feed);
    setHTML("communityHighlights", renderCommunityHighlights(data.highlights));
    return data;
}

async function loadLocations(city) {
    const query = city || document.getElementById("locationCityInput")?.value || "Chennai";
    const target = document.querySelectorAll("[data-locations]");
    if (!target.length) return null;

    const data = await api(`/locations?city=${encodeURIComponent(query)}`);
    target.forEach((container) => {
        container.innerHTML = renderLocationCards(data.locations);
    });
    setText("locationCityLabel", data.city);
    return data;
}

async function postCommunity() {
    const nameInput = document.getElementById("communityName");
    const messageInput = document.getElementById("communityMessage");
    if (!nameInput || !messageInput) return;

    const name = nameInput.value.trim() || getDisplayName();
    const message = messageInput.value.trim();
    if (!message) return;

    setDisplayName(name);

    await api("/community/post", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            user: name,
            user_id: userId,
            message,
        }),
    });

    messageInput.value = "";
    await loadCommunity();
    await loadDashboard();
}

async function reactToPost(postId, reaction) {
    await api("/community/react", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ post_id: postId, reaction }),
    });
    await loadCommunity();
}

async function createChallengeCard() {
    const title = document.getElementById("challengeTitle")?.value.trim();
    const description = document.getElementById("challengeDescription")?.value.trim();
    const goal = document.getElementById("challengeGoal")?.value.trim();
    const creator = document.getElementById("challengeCreator")?.value.trim() || getDisplayName();

    if (!title || !description || !goal) return;

    setDisplayName(creator);

    await api("/challenge/create", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
            title,
            description,
            goal,
            created_by: creator,
        }),
    });

    ["challengeTitle", "challengeDescription", "challengeGoal"].forEach((id) => {
        const field = document.getElementById(id);
        if (field) field.value = "";
    });
    await loadChallenges();
}

async function copyImpactCard(sourceTitleId = "impactCardTitle", sourceBodyId = "impactCardBody") {
    const title = document.getElementById(sourceTitleId)?.textContent || "";
    const body = document.getElementById(sourceBodyId)?.textContent || "";
    const text = `${title}\n${body}`.trim();
    if (!text) return;
    await navigator.clipboard.writeText(text);
    const feedback = document.getElementById("copyFeedback");
    if (feedback) {
        feedback.textContent = "Impact card copied. Ready to share.";
    }
}

function renderSimpleList(items = []) {
    if (!items.length) {
        return `<li>No data yet.</li>`;
    }
    return items.map((item) => `<li>${escapeHTML(item)}</li>`).join("");
}

function renderChallengeCards(challenges = [], emphasizeFirst = false) {
    if (!challenges.length) {
        return `<div class="empty-state">No challenges found yet.</div>`;
    }

    return challenges.map((challenge, index) => `
        <div class="challenge-card ${emphasizeFirst && index === 0 ? "featured" : ""}">
            <strong>${escapeHTML(challenge.title)}</strong>
            <div class="metric-row">
                <span class="tag">${escapeHTML(challenge.difficulty || challenge.week_label || "Weekly")}</span>
                <span class="tag">${escapeHTML(challenge.metric || challenge.goal)}</span>
                <span class="tag">${escapeHTML(String(challenge.participants || 0))} participants</span>
            </div>
            <p class="kicker">${escapeHTML(challenge.description)}</p>
            <div class="footer-note">${escapeHTML(challenge.impact || "A small challenge that strengthens low-plastic behavior.")}</div>
        </div>
    `).join("");
}

function renderLocationCards(locations = []) {
    if (!locations.length) {
        return `<div class="empty-state">No refill or recycling points found.</div>`;
    }

    return locations.map((location) => `
        <div class="location-card">
            <strong>${escapeHTML(location.name)}</strong>
            <div class="metric-row">
                <span class="tag">${escapeHTML(location.type)}</span>
                <span class="tag">${escapeHTML(location.city)}</span>
                <span class="tag">${escapeHTML(String(location.distance_km))} km</span>
            </div>
            <div class="footer-note">${escapeHTML(location.address)}</div>
        </div>
    `).join("");
}

function renderProviderStatus(providers = []) {
    if (!providers.length) {
        return `<div class="empty-state">Provider status unavailable.</div>`;
    }
    return providers.map((provider) => `
        <div class="mini-card">
            <strong>${escapeHTML(provider.name)}</strong>
            <div class="footer-note">${escapeHTML(provider.mode)}</div>
        </div>
    `).join("");
}

function renderCommunityFeed(feed = []) {
    if (!feed.length) {
        return `<div class="empty-state">No posts yet. Start the culture by sharing a small win.</div>`;
    }

    return feed.map((post) => `
        <div class="feed-card">
            <div class="feed-head">
                <div>
                    <strong>${escapeHTML(post.user)}</strong>
                    <div class="feed-meta">${escapeHTML(new Date(post.timestamp).toLocaleString())}</div>
                </div>
            </div>
            <div>${escapeHTML(post.message)}</div>
            <div class="tag-row">
                ${(post.tags || []).map((tag) => `<span class="tag">${escapeHTML(tag)}</span>`).join("")}
            </div>
            <div class="reaction-row">
                <button class="reaction-btn" onclick="reactToPost(${post.id}, '♻️')">♻️ ${post.reactions["♻️"] || 0}</button>
                <button class="reaction-btn" onclick="reactToPost(${post.id}, '🌱')">🌱 ${post.reactions["🌱"] || 0}</button>
                <button class="reaction-btn" onclick="reactToPost(${post.id}, '🔋')">🔋 ${post.reactions["🔋"] || 0}</button>
            </div>
        </div>
    `).join("");
}

function renderCommunityHighlights(posts = []) {
    if (!posts.length) {
        return `<div class="empty-state">Community highlights will appear here once people react.</div>`;
    }

    return posts.map((post) => `
        <div class="mini-card">
            <strong>${escapeHTML(post.user)}</strong>
            <div class="kicker">${escapeHTML(post.message)}</div>
        </div>
    `).join("");
}

function hydrateNameInputs() {
    document.querySelectorAll("[data-display-name]").forEach((input) => {
        input.value = getDisplayName();
        input.addEventListener("change", () => setDisplayName(input.value.trim()));
    });
}

function bindKeyboardShortcuts() {
    const dashboardInput = document.getElementById("dashboardChatInput");
    if (dashboardInput) {
        dashboardInput.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                sendMessage();
            }
        });
    }

    const coachInput = document.getElementById("coachInput");
    if (coachInput) {
        coachInput.addEventListener("keydown", (event) => {
            if ((event.ctrlKey || event.metaKey) && event.key === "Enter") {
                sendCoachMessage();
            }
        });
    }
}

async function initializePage() {
    hydrateNameInputs();
    bindKeyboardShortcuts();
    await loadHealth();

    const page = document.body.dataset.page;
    if (page === "dashboard") {
        await Promise.all([loadDashboard(), loadChallenges(), loadLocations()]);
    }
    if (page === "impact") {
        await loadWeeklyReport();
    }
    if (page === "community") {
        await Promise.all([loadCommunity(), loadChallenges()]);
        if (communityInterval) clearInterval(communityInterval);
        communityInterval = setInterval(loadCommunity, 5000);
    }
    if (page === "analyze") {
        setText("productBestSwap", "Reusable alternative pending analysis.");
    }
    if (page === "habit") {
        setText("habitLoopStep", "Describe the habit and ZeroTrace will create the loop.");
    }
    if (page === "explore") {
        await Promise.all([loadLocations(), loadChallenges()]);
    }
}

window.addEventListener("DOMContentLoaded", initializePage);

window.sendMessage = sendMessage;
window.sendCoachMessage = sendCoachMessage;
window.analyzeProduct = analyzeProduct;
window.generateHabitPlan = generateHabitPlan;
window.loadDashboard = loadDashboard;
window.loadWeeklyReport = loadWeeklyReport;
window.loadChallenges = loadChallenges;
window.loadCommunity = loadCommunity;
window.loadLocations = loadLocations;
window.postCommunity = postCommunity;
window.reactToPost = reactToPost;
window.createChallengeCard = createChallengeCard;
window.copyImpactCard = copyImpactCard;
window.go = (page) => { window.location.href = page; };
