import type { AuthResponse, Goal, GoalCheckinsResponse } from "./types";

// 开发环境默认使用相对路径，让 Vite dev server 代理 /api 到后端。
// 生产部署时可以通过 VITE_API_URL 指向真实后端地址，例如 https://api.example.com。
const API_URL = (import.meta.env.VITE_API_URL ?? "").replace(/\/$/, "");
const TOKEN_KEY = "habit-goals-token";

export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

async function apiRequest<T>(path: string, options: RequestInit = {}): Promise<T> {
  const token = getToken();
  const headers = new Headers(options.headers);
  headers.set("Content-Type", "application/json");

  if (token) {
    headers.set("Authorization", `Bearer ${token}`);
  }

  let response: Response;

  try {
    response = await fetch(`${API_URL}${path}`, {
      ...options,
      headers
    });
  } catch {
    throw new Error("无法连接后端服务，请确认后端已启动，并且前端代理或 API 地址配置正确。");
  }

  const data = await response.json().catch(() => ({}));

  if (!response.ok) {
    throw new Error(data.message ?? "请求失败，请稍后重试。");
  }

  return data as T;
}

export function register(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/register", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function login(email: string, password: string) {
  return apiRequest<AuthResponse>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify({ email, password })
  });
}

export function createGoal(title: string, description?: string) {
  return apiRequest<Goal>("/api/goals", {
    method: "POST",
    body: JSON.stringify({ title, description })
  });
}

export function getGoals() {
  return apiRequest<Goal[]>("/api/goals");
}

export function checkInGoal(goalId: string) {
  return apiRequest(`/api/goals/${goalId}/checkin`, {
    method: "POST"
  });
}

export function getGoalCheckins(goalId: string) {
  return apiRequest<GoalCheckinsResponse>(`/api/goals/${goalId}/checkins`);
}
