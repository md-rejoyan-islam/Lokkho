"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import Sidebar from "./Sidebar";
import { PageSkeleton } from "@/components/shared/Skeleton";

// Wraps authenticated pages: redirects to /login if not signed in.
// Desktop → fixed left sidebar. Mobile → top bar + slide-in drawer.
export default function AppShell({ children }: any) {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  // Close the drawer whenever the route changes.
  useEffect(() => {
    setDrawerOpen(false);
  }, [pathname]);

  return (
    <div className="min-h-screen">
      {/* Desktop sidebar */}
      <aside className="fixed inset-y-0 left-0 z-30 hidden w-64 border-r border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 lg:block">
        <Sidebar />
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center gap-3 border-b border-slate-200/80 bg-white/80 px-4 py-3 backdrop-blur dark:border-slate-800 dark:bg-slate-950/80 lg:hidden">
        <button
          onClick={() => setDrawerOpen(true)}
          aria-label="Open menu"
          className="rounded-md p-2 text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <svg viewBox="0 0 24 24" className="h-6 w-6" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M4 6h16M4 12h16M4 18h16" strokeLinecap="round" />
          </svg>
        </button>
        <span className="flex items-center gap-2 text-lg font-bold text-slate-900 dark:text-slate-100">
          <span className="grid h-7 w-7 place-items-center rounded-md bg-gradient-to-br from-brand-500 to-brand-700 text-sm text-white">📚</span>
          Lokkho
        </span>
      </header>

      {/* Mobile drawer overlay */}
      <div
        onClick={() => setDrawerOpen(false)}
        className={`fixed inset-0 z-40 bg-black/40 transition-opacity duration-300 lg:hidden ${
          drawerOpen ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      {/* Mobile drawer panel */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 w-72 max-w-[80%] transform border-r border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl transition-transform duration-300 lg:hidden ${
          drawerOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <button
          onClick={() => setDrawerOpen(false)}
          aria-label="Close menu"
          className="absolute right-3 top-4 z-10 rounded-md p-1.5 text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800"
        >
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
          </svg>
        </button>
        <Sidebar onNavigate={() => setDrawerOpen(false)} />
      </aside>

      {/* Main content — offset by sidebar width on desktop, fills viewport height */}
      <main className="lg:pl-64">
        <div className="flex min-h-[calc(100dvh-3.5rem)] flex-col px-4 py-6 sm:px-6 lg:min-h-dvh lg:px-8">
          {user && user.emailVerified === false && (
            <div className="mb-4 flex flex-wrap items-center justify-between gap-2 rounded-md border border-amber-200 bg-amber-50 px-4 py-2.5 text-sm text-amber-800 dark:border-amber-900/50 dark:bg-amber-900/20 dark:text-amber-300">
              <span>✉️ আপনার email এখনো verify করা হয়নি।</span>
              <Link href="/settings" className="font-semibold underline">
                Verify now
              </Link>
            </div>
          )}
          {/* Static chrome (sidebar, logo, header) renders immediately; only the
              content area shows a skeleton while the session bootstraps. */}
          {loading || !user ? <PageSkeleton /> : children}
        </div>
      </main>
    </div>
  );
}
