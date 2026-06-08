"use client";

import { createContext, useContext, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api, setAccessToken, getAccessToken } from "./api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  // On mount: if a token exists, fetch the current user.
  useEffect(() => {
    async function bootstrap() {
      const token = getAccessToken();
      if (!token) {
        setLoading(false);
        return;
      }
      try {
        const { user } = await api("/auth/me");
        setUser(user);
      } catch {
        setAccessToken(null);
      } finally {
        setLoading(false);
      }
    }
    bootstrap();
  }, []);

  async function login(email, password) {
    const data = await api("/auth/login", {
      method: "POST",
      auth: false,
      body: { email, password },
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function register(name, email, password) {
    const data = await api("/auth/register", {
      method: "POST",
      auth: false,
      body: { name, email, password },
    });
    setAccessToken(data.accessToken);
    setUser(data.user);
    return data.user;
  }

  async function logout() {
    try {
      await api("/auth/logout", { method: "POST", auth: false });
    } catch {}
    setAccessToken(null);
    setUser(null);
    router.push("/login");
  }

  async function refreshUser() {
    try {
      const { user } = await api("/auth/me");
      setUser(user);
      return user;
    } catch {
      return null;
    }
  }

  return (
    <AuthContext.Provider
      value={{ user, loading, login, register, logout, refreshUser, setUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
