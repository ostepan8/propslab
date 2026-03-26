const API_URL = process.env.NEXT_PUBLIC_API_URL || 'https://api.propslab.dev';

interface ApiOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

export class ApiError extends Error {
  status: number;
  constructor(message: string, status: number) {
    super(message);
    this.status = status;
  }
}

export async function api<T>(endpoint: string, options: ApiOptions = {}): Promise<T> {
  const { method = 'GET', body, auth = false } = options;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (auth) {
    const token = typeof window !== 'undefined' ? localStorage.getItem('propslab_token') : null;
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const res = await fetch(`${API_URL}${endpoint}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401) {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('propslab_token');
      localStorage.removeItem('propslab_user');
      window.location.href = '/login';
    }
    throw new ApiError('Unauthorized', 401);
  }

  if (res.status === 403) {
    throw new ApiError('Upgrade required', 403);
  }

  if (!res.ok) {
    const data = await res.json().catch(() => ({}));
    throw new ApiError(data.detail || data.message || 'API error', res.status);
  }

  return res.json();
}

// Auth endpoints
export async function login(email: string, password: string) {
  const data = await api<{ access_token: string; token_type: string }>('/auth/login', {
    method: 'POST',
    body: { email, password },
  });
  localStorage.setItem('propslab_token', data.access_token);
  // Fetch user profile after login
  const user = await api<UserResponse>('/auth/me', { auth: true });
  localStorage.setItem('propslab_user', JSON.stringify(user));
  return { access_token: data.access_token, user };
}

export async function register(email: string, password: string, name: string) {
  const data = await api<{ access_token: string; token_type: string }>('/auth/register', {
    method: 'POST',
    body: { email, password, full_name: name },
  });
  localStorage.setItem('propslab_token', data.access_token);
  // Fetch user profile after register
  const user = await api<UserResponse>('/auth/me', { auth: true });
  localStorage.setItem('propslab_user', JSON.stringify(user));
  return { access_token: data.access_token, user };
}

export function logout() {
  localStorage.removeItem('propslab_token');
  localStorage.removeItem('propslab_user');
  window.location.href = '/login';
}

// Types
export interface User {
  id: number;
  email: string;
  full_name: string | null;
  tier: 'free' | 'pro' | 'elite';
  is_active: boolean;
  created_at: string;
}

export type UserResponse = User;

export interface GlobalStats {
  active_models: number;
  total_picks: number;
  resolved_picks: number;
  pending_picks: number;
  total_wins: number;
  total_losses: number;
  win_rate: number;
  total_pnl: number;
  roi: number;
  avg_model_roi_net: number;
}

export interface LeaderboardModel {
  name: string;
  display_name: string;
  stat: string;
  architecture: string;
  sides: string;
  roi_raw: number;
  roi_net: number;
  win_rate: number;
  total_bets: number;
  p_value: number;
}

export interface ModelDetail {
  id: number;
  name: string;
  display_name: string;
  description: string | null;
  stat: string;
  market: string;
  architecture: string;
  sides: string;
  roi_raw: number;
  roi_net: number;
  win_rate: number;
  total_bets: number;
  p_value: number;
  config_json: string | null;
  feature_description: string | null;
  min_tier: string;
  is_active: boolean;
}

export interface Model {
  id: string;
  name: string;
  stat: string;
  description: string;
  roi: number;
  win_rate: number;
  total_bets: number;
  p_value: number;
  features: string[];
  backtest_data: { date: string; cumulative_roi: number }[];
}

export interface Pick {
  id: string;
  model_id: string;
  model_name: string;
  player_name: string;
  stat: string;
  line: number;
  direction: 'over' | 'under';
  confidence: number;
  odds: number;
  game: string;
  game_time: string;
  result?: 'win' | 'loss' | 'push' | null;
  actual_value?: number | null;
}

export interface PaperTrade {
  id: string;
  pick_id: string;
  stake: number;
  odds: number;
  result?: 'win' | 'loss' | 'push' | null;
  pnl?: number;
  created_at: string;
}

export interface PaperTradeStats {
  total_trades: number;
  wins: number;
  losses: number;
  pushes: number;
  total_staked: number;
  total_pnl: number;
  roi: number;
  win_rate: number;
}
