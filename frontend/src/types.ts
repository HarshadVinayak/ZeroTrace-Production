export type DashboardResponse = {
  score: number;
  streak: number;
  stats: {
    chat_count?: number;
    product_analyses?: number;
    community_posts?: number;
    habit_plans?: number;
  };
  profile?: {
    plastic_score: number;
    risk_level: string;
    habit_summary: string;
    ai_twin: { title: string; summary: string };
  };
  weekly_report?: {
    reduction_percent: number;
    biggest_issue: string;
    suggestions: string[];
    summary: string;
    future_projection?: {
      if_continue_kg_per_year: number;
      if_improve_kg_per_year: number;
    };
  };
  recommended_challenges?: Challenge[];
  challenge_board?: Challenge[];
  leaderboard?: LeaderboardEntry[];
  community_highlights?: CommunityPost[];
};

export type ChatResponse = {
  response?: string;
  reply: string;
  provider: string;
  next_action?: string;
  profile?: {
    plastic_score: number;
    risk_level: string;
  };
};

export type ProductResponse = {
  impact: string;
  rating: number;
  alternatives: string[];
  category?: string;
  notes?: string;
  summary?: string;
};

export type WeeklyReport = {
  reduction_percent: number;
  top_issue: string;
  suggestions: string[];
  summary?: string;
  future_projection?: {
    if_continue_kg_per_year: number;
    if_improve_kg_per_year: number;
    savings_kg_per_year: number;
  };
  share_card?: {
    title: string;
    body: string;
    hashtags: string;
  };
};

export type CommunityPost = {
  id: number;
  user: string;
  message: string;
  timestamp: string;
  tags: string[];
  reactions: Record<string, number>;
};

export type CommunityFeedResponse = {
  feed: CommunityPost[];
  highlights: CommunityPost[];
};

export type Challenge = {
  id: number;
  title: string;
  description: string;
  difficulty?: string;
  metric?: string;
  goal?: string;
  participants?: number;
  impact?: string;
  status?: string;
};

export type LeaderboardEntry = {
  rank: number;
  challenge_id: number;
  title: string;
  participants: number;
};

export type ChallengeListResponse = {
  challenges: Challenge[];
  leaderboard: LeaderboardEntry[];
};

export type LocationsResponse = {
  city: string;
  locations: Array<{
    name: string;
    type: string;
    city: string;
    distance_km: number;
    address: string;
  }>;
};
