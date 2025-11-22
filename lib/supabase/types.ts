export interface Profile {
  id: string;
  username: string;
  avatar_url: string | null;
  tokens: number;
  diamonds: number;
  total_bets: number;
  won_bets: number;
  role: 'user' | 'admin';
  leaderboard_score: number;
  has_seen_tutorial: boolean;
  referrer_id: string | null;
  created_at: string;
  updated_at: string;
}

export interface Match {
  id: string;
  team_a: string;
  team_b: string;
  league: string;
  competition?: string;
  odds_a: number;
  odds_draw: number;
  odds_b: number;
  status: 'upcoming' | 'live' | 'finished';
  result: 'A' | 'Draw' | 'B' | null;
  match_date: string;
  match_mode: 'fictif' | 'real';
  external_api_id: string | null;
  api_provider: string | null;
  team_a_badge: string | null;
  team_b_badge: string | null;
  team_a_banner: string | null;
  team_b_banner: string | null;
  team_a_stadium: string | null;
  team_b_stadium: string | null;
  created_at: string;
  updated_at: string;
}

export interface Bet {
  id: string;
  user_id: string;
  match_id: string;
  amount: number;
  choice: 'A' | 'Draw' | 'B';
  odds: number;
  potential_win: number;
  potential_diamonds: number;
  bet_currency: 'tokens' | 'diamonds';
  is_win: boolean | null;
  tokens_won: number | null;
  diamonds_won: number;
  created_at: string;
}

export interface ComboBet {
  id: string;
  user_id: string;
  amount: number;
  bet_currency: 'tokens' | 'diamonds';
  total_odds: number;
  potential_win: number;
  potential_diamonds: number;
  is_win: boolean | null;
  tokens_won: number | null;
  diamonds_won: number | null;
  created_at: string;
}

export interface ComboBetSelection {
  id: string;
  combo_bet_id: string;
  match_id: string;
  choice: 'A' | 'Draw' | 'B';
  odds: number;
  created_at: string;
}

export interface TapEarning {
  id: string;
  user_id: string;
  tokens_earned: number;
  created_at: string;
}

export interface Friend {
  id: string;
  user_id: string;
  friend_id: string;
  created_at: string;
}

export interface Referral {
  id: string;
  referrer_id: string;
  referred_id: string;
  rewarded: boolean;
  created_at: string;
}

export interface LeaderboardEntry {
  user_id: string;
  username: string;
  avatar_url: string | null;
  leaderboard_score: number;
  rank: number;
}
