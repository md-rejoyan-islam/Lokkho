import { AUTH_COOKIE } from "./constants";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api";

let accessToken: string | null = null;

export function setAccessToken(token: string | null) {
  accessToken = token;
  if (typeof window !== "undefined") {
    if (token) {
      localStorage.setItem("accessToken", token);
      document.cookie = `${AUTH_COOKIE}=1; path=/; max-age=${7 * 24 * 60 * 60}; samesite=lax`;
    } else {
      localStorage.removeItem("accessToken");
      document.cookie = `${AUTH_COOKIE}=; path=/; max-age=0; samesite=lax`;
    }
  }
}

export function getAccessToken(): string | null {
  if (accessToken) return accessToken;
  if (typeof window !== "undefined") {
    accessToken = localStorage.getItem("accessToken");
  }
  return accessToken;
}

export interface ApiOptions {
  method?: string;
  body?: any;
  auth?: boolean;
  _retry?: boolean;
}

export interface ApiError extends Error {
  status?: number;
  details?: any;
}

// Tries the request; on 401 attempts a refresh once, then retries.
export async function api(
  path: string,
  { method = "GET", body, auth = true, _retry }: ApiOptions = {},
): Promise<any> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  const token = getAccessToken();
  if (auth && token) headers.Authorization = `Bearer ${token}`;

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    credentials: "include", // send refresh cookie
    cache: "no-store", // always fetch fresh — never serve a stale cached list
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 401 && auth && !_retry) {
    const refreshed = await tryRefresh();
    if (refreshed) return api(path, { method, body, auth, _retry: true });
  }

  let json: any = null;
  try {
    json = await res.json();
  } catch {}

  if (!res.ok) {
    const err = new Error(
      json?.message || `Request failed (${res.status})`,
    ) as ApiError;
    err.status = res.status;
    err.details = json?.details;
    throw err;
  }
  return json;
}

async function tryRefresh(): Promise<boolean> {
  try {
    const res = await fetch(`${API_URL}/auth/refresh`, {
      method: "POST",
      credentials: "include",
    });
    if (!res.ok) return false;
    const json = await res.json();
    if (json.accessToken) {
      setAccessToken(json.accessToken);
      return true;
    }
  } catch {}
  return false;
}
