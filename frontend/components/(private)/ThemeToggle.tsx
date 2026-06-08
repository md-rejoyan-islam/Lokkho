"use client";

import { useTheme } from "@/lib/theme";

const SunIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <circle cx="12" cy="12" r="4" />
    <path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4" strokeLinecap="round" />
  </svg>
);
const MoonIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M21 12.8A9 9 0 1 1 11.2 3a7 7 0 0 0 9.8 9.8Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const SystemIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <rect x="3" y="4" width="18" height="12" rx="2" />
    <path d="M8 20h8M12 16v4" strokeLinecap="round" />
  </svg>
);

const OPTIONS = [
  { key: "light", icon: SunIcon, title: "Light" },
  { key: "dark", icon: MoonIcon, title: "Dark" },
  { key: "system", icon: SystemIcon, title: "System" },
];

// Compact segmented control for the sidebar.
export default function ThemeToggle() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="grid grid-cols-3 gap-1 rounded-lg border border-slate-200 bg-slate-50 p-1 dark:border-slate-700 dark:bg-slate-800/60">
      {OPTIONS.map((o) => (
        <button
          key={o.key}
          onClick={() => setTheme(o.key)}
          title={o.title}
          aria-label={o.title}
          aria-pressed={theme === o.key}
          className={`flex items-center justify-center rounded-md py-1.5 transition ${
            theme === o.key
              ? "bg-white text-brand-600 shadow-soft dark:bg-slate-900 dark:text-brand-400"
              : "text-slate-400 hover:text-slate-600 dark:text-slate-500 dark:hover:text-slate-300"
          }`}
        >
          {o.icon}
        </button>
      ))}
    </div>
  );
}
