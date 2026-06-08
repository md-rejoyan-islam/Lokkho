"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, ProgressBar, StatusBadge } from "@/components/shared/ui";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

const ITEM_CLS = {
  pending: "bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300",
  completed: "bg-emerald-100 text-emerald-700",
  missed: "bg-rose-100 text-rose-700",
  rescheduled: "bg-amber-100 text-amber-700",
};

export default function DashboardPage() {
  return (
    <>
      <DashboardContent />
    </>
  );
}

function DashboardContent() {
  const { user } = useAuth();
  const [modules, setModules] = useState([]);
  const [moduleTotal, setModuleTotal] = useState(0);
  const [analytics, setAnalytics] = useState(null);
  const [progress, setProgress] = useState([]);
  const [appSummary, setAppSummary] = useState({ all: 0, applied: 0, notApplied: 0 });
  const [today, setToday] = useState([]);
  const [counts, setCounts] = useState({ jobs: 0, books: 0, topics: 0, questions: 0 });

  useEffect(() => {
    api("/modules?limit=6").then((d) => { setModules(d.modules); setModuleTotal(d.total); }).catch(() => {});
    api("/progress/analytics").then(setAnalytics).catch(() => {});
    api("/progress").then((d) => setProgress(d.progress)).catch(() => {});
    api("/applications?limit=1").then((d) => setAppSummary(d.summary || { all: 0, applied: 0, notApplied: 0 })).catch(() => {});
    api(`/study-plans?date=${todayStr()}`).then((d) => setToday(d.plans?.[0]?.items || [])).catch(() => {});
    Promise.all([
      api("/jobs?limit=1").catch(() => ({ total: 0 })),
      api("/books?limit=1").catch(() => ({ total: 0 })),
      api("/important-topics?limit=1").catch(() => ({ total: 0 })),
      api("/questions?limit=1").catch(() => ({ total: 0 })),
    ]).then(([j, b, t, q]) =>
      setCounts({ jobs: j.total || 0, books: b.total || 0, topics: t.total || 0, questions: q.total || 0 })
    );
  }, []);

  const c = analytics?.counts || {};
  const revisions = progress.filter((p) => p.status === "need_revision" || p.status === "weak").slice(0, 6);
  const todayDone = today.filter((i) => i.status === "completed").length;

  return (
    <>
      <PageHeader title={`স্বাগতম, ${user?.name || ""} 👋`} subtitle="আপনার প্রস্তুতির সারসংক্ষেপ" />

      {/* Primary stats */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard label="Overall completion" value={`${analytics?.completionRate ?? 0}%`}>
          <ProgressBar value={analytics?.completionRate ?? 0} />
        </StatCard>
        <StatCard label="Topics tracked" value={analytics?.totalTracked ?? 0} hint={`${c.completed || 0} completed`} />
        <StatCard label="Jobs applied" value={`${appSummary.applied}/${appSummary.all}`} hint={`${appSummary.notApplied} not applied`} accent="text-emerald-600" />
        <StatCard label="Today's tasks" value={`${todayDone}/${today.length}`} hint="study planner" accent="text-blue-600" />
      </div>

      <div className="mt-7 grid gap-6 lg:grid-cols-3">
        {/* Left: today's plan + exam guides */}
        <div className="space-y-6 lg:col-span-2">
          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Today's Plan</h2>
              <Link href="/planner" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                Open planner →
              </Link>
            </div>
            <div className="card">
              {today.length === 0 ? (
                <p className="text-sm text-slate-500 dark:text-slate-400">আজকের জন্য কোনো task নেই। planner-এ যোগ করুন।</p>
              ) : (
                <div className="space-y-2">
                  {today.map((it, i) => (
                    <div key={i} className="flex items-center justify-between gap-2 border-b border-slate-100 pb-2 last:border-0 last:pb-0 dark:border-slate-800">
                      <span className={`text-sm ${it.status === "completed" ? "text-slate-400 line-through dark:text-slate-500" : ""}`}>
                        {it.text}
                        {it.targetMinutes > 0 && <span className="ml-2 text-xs text-slate-400">{it.targetMinutes}m</span>}
                      </span>
                      <span className={`badge capitalize ${ITEM_CLS[it.status]}`}>{it.status}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </section>

          <section>
            <div className="mb-3 flex items-center justify-between">
              <h2 className="text-lg font-semibold">Exam Guides</h2>
              <Link href="/modules" className="text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                View all ({moduleTotal}) →
              </Link>
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              {modules.slice(0, 4).map((m) => (
                <Link key={m._id} href={`/modules/${m._id}`} className="card transition hover:border-brand-300 hover:-translate-y-0.5">
                  <div className="mb-1 text-xs font-medium text-brand-600 dark:text-brand-400">{m.category}</div>
                  <div className="font-semibold">{m.title}</div>
                  <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">
                    {m.totalMarks ? `${m.totalMarks} marks` : "—"} · {m.examPattern?.length || 0} sections
                  </div>
                </Link>
              ))}
            </div>
          </section>
        </div>

        {/* Right: applications + revision */}
        <div className="space-y-6">
          <section>
            <h2 className="mb-3 text-lg font-semibold">Application Tracker</h2>
            <div className="card space-y-3">
              <Row label="Total" value={appSummary.all} />
              <Row label="Applied" value={appSummary.applied} accent="text-emerald-600" />
              <Row label="Not applied" value={appSummary.notApplied} accent="text-amber-600" />
              <Link href="/applications" className="block pt-1 text-sm font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
                Manage applications →
              </Link>
            </div>
          </section>

          <section>
            <h2 className="mb-3 text-lg font-semibold">Revision / Weak</h2>
            <div className="card space-y-3">
              {revisions.length === 0 && <p className="text-sm text-slate-500 dark:text-slate-400">কিছু নেই — দারুণ! 🎉</p>}
              {revisions.map((p) => (
                <div key={p._id} className="flex items-center justify-between gap-2">
                  <span className="truncate text-sm">{p.topicId?.title || "Topic"}</span>
                  <StatusBadge status={p.status} />
                </div>
              ))}
            </div>
          </section>
        </div>
      </div>

      {/* Explore */}
      <section className="mt-8">
        <h2 className="mb-3 text-lg font-semibold">Explore</h2>
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-5">
          <ExploreCard href="/modules" icon="🧩" label="Exam Guides" value={moduleTotal} />
          <ExploreCard href="/important-topics" icon="⭐" label="Important Topics" value={counts.topics} />
          <ExploreCard href="/questions" icon="❓" label="Questions" value={counts.questions} />
          <ExploreCard href="/jobs" icon="💼" label="Jobs" value={counts.jobs} />
          <ExploreCard href="/books" icon="📚" label="Books" value={counts.books} />
        </div>
      </section>
    </>
  );
}

function StatCard({ label, value, hint, accent = "text-slate-900 dark:text-slate-50", children }: any) {
  return (
    <div className="card">
      <div className="text-sm text-slate-500 dark:text-slate-400">{label}</div>
      <div className={`mt-1 text-2xl font-bold ${accent}`}>{value}</div>
      {hint && <div className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">{hint}</div>}
      {children && <div className="mt-3">{children}</div>}
    </div>
  );
}

function Row({ label, value, accent = "text-slate-800 dark:text-slate-100" }: any) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-slate-500 dark:text-slate-400">{label}</span>
      <span className={`font-semibold ${accent}`}>{value}</span>
    </div>
  );
}

function ExploreCard({ href, icon, label, value }: any) {
  return (
    <Link href={href} className="card flex flex-col items-center gap-1 py-4 text-center transition hover:border-brand-300 hover:-translate-y-0.5">
      <span className="text-xl">{icon}</span>
      <span className="text-lg font-bold text-slate-900 dark:text-slate-50">{value}</span>
      <span className="text-xs text-slate-500 dark:text-slate-400">{label}</span>
    </Link>
  );
}
