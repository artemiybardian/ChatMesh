const AUTH_API = process.env.NEXT_PUBLIC_AUTH_API_URL || "http://localhost:8001";
const CHAT_API = process.env.NEXT_PUBLIC_CHAT_API_URL || "http://localhost:8002";
const NOTIFICATIONS_API = process.env.NEXT_PUBLIC_NOTIFICATIONS_API_URL || "http://localhost:8004";
const WS_URL = process.env.NEXT_PUBLIC_WS_URL || "ws://localhost:8003";

async function request<T>(base: string, path: string, options: RequestInit = {}): Promise<T> {
  const token = typeof window !== "undefined" ? localStorage.getItem("access_token") : null;

  const res = await fetch(`${base}${path}`, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });

  if (!res.ok) {
    const body = await res.json().catch(() => ({}));
    throw new Error(body.detail || `Request failed: ${res.status}`);
  }

  if (res.status === 204) return undefined as T;
  return res.json();
}

export const authApi = {
  register: (data: { username: string; email: string; password: string }) =>
    request<{ access_token: string }>(AUTH_API, "/auth/register", { method: "POST", body: JSON.stringify(data) }),

  login: (data: { username: string; password: string }) =>
    request<{ access_token: string }>(AUTH_API, "/auth/login", { method: "POST", body: JSON.stringify(data) }),

  me: () =>
    request<{ id: number; username: string; email: string; is_active: boolean; created_at: string }>(AUTH_API, "/auth/me"),
};

export const chatApi = {
  getRooms: () =>
    request<{ id: number; name: string; created_by: number; created_at: string }[]>(CHAT_API, "/rooms"),

  createRoom: (name: string) =>
    request<{ id: number; name: string }>(CHAT_API, "/rooms", { method: "POST", body: JSON.stringify({ name }) }),

  joinRoom: (roomId: number) =>
    request<void>(CHAT_API, `/rooms/${roomId}/join`, { method: "POST" }),

  leaveRoom: (roomId: number) =>
    request<void>(CHAT_API, `/rooms/${roomId}/leave`, { method: "POST" }),

  getMembers: (roomId: number) =>
    request<{ user_id: number; username: string; joined_at: string }[]>(CHAT_API, `/rooms/${roomId}/members`),

  getMessages: (roomId: number, limit = 50, offset = 0) =>
    request<{ items: Message[]; total: number }>(CHAT_API, `/rooms/${roomId}/messages?limit=${limit}&offset=${offset}`),
};

export const notificationsApi = {
  list: (limit = 50, offset = 0) =>
    request<{ items: Notification[]; total: number }>(NOTIFICATIONS_API, `/notifications?limit=${limit}&offset=${offset}`),

  markRead: (id: number) =>
    request<Notification>(NOTIFICATIONS_API, `/notifications/${id}/read`, { method: "POST" }),

  markAllRead: () =>
    request<void>(NOTIFICATIONS_API, "/notifications/read-all", { method: "POST" }),
};

export function getWsUrl(token: string, roomId: number) {
  return `${WS_URL}/ws?token=${token}&room_id=${roomId}`;
}

export interface Message {
  id: number;
  room_id: number;
  user_id: number;
  username: string;
  content: string;
  created_at: string;
}

export interface Notification {
  id: number;
  user_id: number;
  type: string;
  title: string;
  body: string;
  room_id: number | null;
  is_read: boolean;
  created_at: string;
}
