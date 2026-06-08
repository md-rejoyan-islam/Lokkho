"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import ThemeToggle from "./ThemeToggle";
import { Skeleton } from "@/components/shared/Skeleton";

const LINKS = [
  { href: "/dashboard", label: "Dashboard", icon: "🏠" },
  { href: "/modules", label: "Exam Guides", icon: "🧩" },
  { href: "/important-topics", label: "Important Topics", icon: "⭐" },
  { href: "/questions", label: "Questions", icon: "❓" },
  { href: "/planner", label: "Planner", icon: "🗓️" },
  { href: "/books", label: "Books", icon: "📚" },
  { href: "/jobs", label: "Jobs", icon: "💼" },
  { href: "/applications", label: "Application Tracker", icon: "🗂️" },
  { href: "/resources", label: "Resources", icon: "📄" },
  { href: "/settings", label: "Settings", icon: "⚙️" },
];

// Nav content shared by the desktop sidebar and the mobile drawer.
export default function Sidebar({ onNavigate }: any) {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  return (
    <div className="flex h-full flex-col bg-white dark:bg-slate-900">
      <div className="flex items-center gap-2.5 px-5 py-4">
        <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-brand-500 to-brand-700 text-white shadow-sm">
          📚
        </span>
        <div className="leading-tight">
          <div className="text-base font-bold text-slate-900 dark:text-slate-100">Lokkho</div>
          <div className="text-[11px] text-slate-400 dark:text-slate-500">Preparation suite</div>
        </div>
      </div>

      <div className="px-5 pb-1 pt-3 text-[11px] font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">
        Menu
      </div>
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-3 pb-3">
        {LINKS.map((l) => {
          const active = pathname === l.href || pathname.startsWith(l.href + "/");
          return (
            <Link
              key={l.href}
              href={l.href}
              onClick={onNavigate}
              className={`group relative flex items-center gap-3 rounded-lg px-3 py-2 text-sm font-medium transition ${
                active
                  ? "bg-brand-50 dark:bg-brand-500/15 text-brand-700 dark:text-brand-300"
                  : "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-900 dark:hover:text-slate-100"
              }`}
            >
              {active && (
                <span className="absolute left-0 top-1/2 h-5 w-1 -translate-y-1/2 rounded-r-full bg-brand-600" />
              )}
              <span className="text-base">{l.icon}</span>
              {l.label}
            </Link>
          );
        })}
      </nav>

      <div className="border-t border-slate-100 p-3 dark:border-slate-800">
        <div className="mb-2">
          <ThemeToggle />
        </div>
        <div className="flex items-center gap-3 px-2 py-1.5">
          <span className="grid h-9 w-9 place-items-center rounded-full bg-gradient-to-br from-brand-500 to-brand-700 text-sm font-semibold text-white">
            {user?.name?.[0]?.toUpperCase() || "U"}
          </span>
          <div className="min-w-0 flex-1">
            {user ? (
              <>
                <div className="truncate text-sm font-semibold text-slate-800 dark:text-slate-200">{user.name}</div>
                <div className="truncate text-xs text-slate-400 dark:text-slate-500">{user.email}</div>
              </>
            ) : (
              <div className="space-y-1.5 py-0.5">
                <Skeleton className="h-3 w-20" />
                <Skeleton className="h-2.5 w-28" />
              </div>
            )}
          </div>
        </div>
        <button
          onClick={() => {
            onNavigate?.();
            logout();
          }}
          className="btn-outline mt-2 w-full"
        >
          Logout
        </button>
      </div>
    </div>
  );
}
