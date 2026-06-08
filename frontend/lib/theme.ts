"use client";

import { useEffect, useState } from "react";

// Theme can be "light" | "dark" | "system". Stored in localStorage (system = no key).
export function getStoredTheme() {
  if (typeof window === "undefined") return "system";
  return localStorage.getItem("theme") || "system";
}

export function resolveDark(theme) {
  if (theme === "dark") return true;
  if (theme === "light") return false;
  return window.matchMedia("(prefers-color-scheme: dark)").matches;
}

export function applyTheme(theme) {
  const dark = resolveDark(theme);
  document.documentElement.classList.toggle("dark", dark);
  try {
    if (theme === "system") localStorage.removeItem("theme");
    else localStorage.setItem("theme", theme);
  } catch {}
  window.dispatchEvent(new Event("themechange"));
}

// Shared hook: current theme + setter, reactive to OS changes while in "system".
export function useTheme() {
  const [theme, setThemeState] = useState("system");

  useEffect(() => {
    setThemeState(getStoredTheme());
    const onChange = () => setThemeState(getStoredTheme());
    window.addEventListener("themechange", onChange);
    const mq = window.matchMedia("(prefers-color-scheme: dark)");
    const onMq = () => {
      if (getStoredTheme() === "system") applyTheme("system");
    };
    mq.addEventListener?.("change", onMq);
    return () => {
      window.removeEventListener("themechange", onChange);
      mq.removeEventListener?.("change", onMq);
    };
  }, []);

  return {
    theme,
    setTheme: (t) => {
      applyTheme(t);
      setThemeState(t);
    },
  };
}
