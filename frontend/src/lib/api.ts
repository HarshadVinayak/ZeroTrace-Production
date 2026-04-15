import type {
  ChallengeListResponse,
  ChatResponse,
  CommunityFeedResponse,
  DashboardResponse,
  LocationsResponse,
  ProductResponse,
  WeeklyReport
} from "../types";

export const API = "http://127.0.0.1:8000";

export const FALLBACK_AI_MESSAGE =
  "AI is currently unavailable, showing smart fallback. Based on your habits, reducing takeaway packaging will have highest impact. Switching to reusable bottles can reduce 30% waste.";

export const getSessionId = (): string => {
  const existing = localStorage.getItem("zerotrace_session_id");
  if (existing) return existing;
  const next = `session_${Math.random().toString(36).slice(2, 10)}`;
  localStorage.setItem("zerotrace_session_id", next);
  return next;
};

async function request<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API}${path}`, init);
  if (!response.ok) {
    throw new Error(`Request failed with ${response.status}`);
  }
  return response.json() as Promise<T>;
}

export const api = {
  dashboard: async (): Promise<DashboardResponse> =>
    request<DashboardResponse>(`/user/dashboard/${getSessionId()}`),

  chat: async (message: string): Promise<ChatResponse> =>
    request<ChatResponse>("/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, session_id: getSessionId() })
    }),

  analyzeProduct: async (productName: string): Promise<ProductResponse> =>
    request<ProductResponse>("/analyze-product", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ product_name: productName, user_id: getSessionId() })
    }),

  weeklyReport: async (): Promise<WeeklyReport> =>
    request<WeeklyReport>(`/weekly-report?user_id=${getSessionId()}`),

  communityFeed: async (): Promise<CommunityFeedResponse> =>
    request<CommunityFeedResponse>("/community/feed"),

  postCommunity: async (user: string, message: string): Promise<unknown> =>
    request("/community/post", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ user, user_id: getSessionId(), message })
    }),

  likePost: async (postId: number): Promise<unknown> =>
    request("/community/react", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ post_id: postId, reaction: "♻️" })
    }),

  challenges: async (): Promise<ChallengeListResponse> =>
    request<ChallengeListResponse>(`/challenge/list?user_id=${getSessionId()}`),

  joinChallenge: async (challengeId: number): Promise<ChallengeListResponse> => {
    const data = await request<{ leaderboard: ChallengeListResponse["leaderboard"] } & { challenge: unknown }>(
      "/challenge/join",
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ challenge_id: challengeId, user_id: getSessionId() })
      }
    );
    const refreshed = await api.challenges();
    return { ...refreshed, leaderboard: data.leaderboard || refreshed.leaderboard };
  },

  locations: async (city = "Chennai"): Promise<LocationsResponse> =>
    request<LocationsResponse>(`/locations?city=${encodeURIComponent(city)}`)
};
