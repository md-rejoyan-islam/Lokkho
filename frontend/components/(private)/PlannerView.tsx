"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";

const LIMIT = 6;
const ITEM_STATUSES = ["pending", "completed", "missed", "rescheduled"];
const STATUS_CLS = {
  pending: "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
  completed: "bg-green-100 text-green-700",
  missed: "bg-red-100 text-red-700",
  rescheduled: "bg-amber-100 text-amber-700",
};
const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

function todayStr() {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}
function prettyDate(s) {
  const [y, m, d] = s.split("-").map(Number);
  return `${String(d).padStart(2, "0")} ${MONTHS[m - 1]} ${y}`;
}
function relativeLabel(s) {
  const t = todayStr();
  if (s === t) return "Today";
  const diff = (new Date(s).getTime() - new Date(t).getTime()) / 86400000;
  if (diff === 1) return "Tomorrow";
  if (diff === -1) return "Yesterday";
  return "";
}

export default function PlannerPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <PlannerContent />
      </Suspense>
    </>
  );
}

function PlannerContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [plans, setPlans] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ date: todayStr(), text: "", minutes: "" });
  const [saving, setSaving] = useState(false);

  function fetchPlans() {
    setLoading(true);
    api(`/study-plans?page=${page}&limit=${LIMIT}`)
      .then((d) => {
        setPlans(d.plans);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchPlans();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page]);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v == null) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  // Persist a date's full item list (upsert replaces items for that date).
  async function saveDay(date, items) {
    await api("/study-plans", {
      method: "POST",
      body: {
        date,
        items: items.map((i) => ({ text: i.text, targetMinutes: i.targetMinutes, status: i.status })),
      },
    });
  }

  async function addTask(e) {
    e.preventDefault();
    if (!form.text.trim()) return;
    setSaving(true);
    try {
      const existing = await api(`/study-plans?date=${form.date}`);
      const items = existing.plans[0]?.items || [];
      await saveDay(form.date, [
        ...items,
        { text: form.text.trim(), targetMinutes: Number(form.minutes) || 0, status: "pending" },
      ]);
      setForm({ date: form.date, text: "", minutes: "" });
      setShowModal(false);
      fetchPlans();
    } finally {
      setSaving(false);
    }
  }

  function setItemStatus(plan, idx, status) {
    const items = plan.items.map((it, i) => (i === idx ? { ...it, status } : it));
    setPlans((ps) => ps.map((p) => (p._id === plan._id ? { ...p, items } : p)));
    saveDay(plan.date, items);
  }

  async function removeItem(plan, idx) {
    const items = plan.items.filter((_, i) => i !== idx);
    if (items.length === 0) {
      await api(`/study-plans/${plan._id}`, { method: "DELETE" });
      if (plans.length === 1 && page > 1) updateParams({ page: page - 1 });
      else fetchPlans();
    } else {
      setPlans((ps) => ps.map((p) => (p._id === plan._id ? { ...p, items } : p)));
      saveDay(plan.date, items);
    }
  }

  return (
    <>
      <PageHeader
        title="Study Planner"
        subtitle="দৈনিক পড়ার পরিকল্পনা — সব দিনের plan"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + Add task
          </button>
        }
      />

      <div className="mb-5 flex items-center justify-between gap-3">
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {meta.total} day-plans · page {meta.page} of {meta.totalPages}
        </span>
        <div className="flex w-fit shrink-0 overflow-hidden rounded-md border border-gray-300 dark:border-slate-700">
          <button onClick={() => setView("list")} aria-label="List view" title="List view"
            className={`p-2 ${view === "list" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => setView("grid")} aria-label="Grid view" title="Grid view"
            className={`border-l border-gray-300 p-2 dark:border-slate-700 ${view === "grid" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50 dark:hover:bg-slate-800 dark:bg-slate-900 dark:text-slate-300"}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          </button>
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={4} cols="lg:grid-cols-2" />
      ) : plans.length === 0 ? (
        <Empty>কোনো plan নেই। "+ Add task" দিয়ে শুরু করুন।</Empty>
      ) : (
        <div className={view === "grid" ? "grid gap-4 lg:grid-cols-2" : "space-y-4"}>
          {plans.map((plan) => {
            const done = plan.items.filter((i) => i.status === "completed").length;
            const totalMin = plan.items.reduce((a, b) => a + (b.targetMinutes || 0), 0);
            const rel = relativeLabel(plan.date);
            return (
              <div key={plan._id} className="card">
                <div className="mb-3 flex items-center justify-between">
                  <div className="font-semibold">
                    {prettyDate(plan.date)}
                    {rel && <span className="ml-2 badge bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{rel}</span>}
                  </div>
                  <span className="text-xs text-slate-500 dark:text-slate-400">
                    {done}/{plan.items.length} done · {totalMin} min
                  </span>
                </div>
                <div className="space-y-2">
                  {plan.items.map((it, idx) => (
                    <div key={idx} className="flex items-center justify-between gap-2 rounded-md border border-gray-200 px-3 py-2 dark:border-slate-800">
                      <span className={it.status === "completed" ? "text-sm line-through text-gray-400 dark:text-slate-500" : "text-sm"}>
                        {it.text}
                        {it.targetMinutes > 0 && <span className="ml-2 text-xs text-gray-400 dark:text-slate-500">{it.targetMinutes} min</span>}
                      </span>
                      <div className="flex items-center gap-2">
                        <select
                          value={it.status}
                          onChange={(e) => setItemStatus(plan, idx, e.target.value)}
                          className={`cursor-pointer rounded-full border-0 py-1 pl-2.5 pr-7 text-xs font-medium capitalize outline-none ring-1 ring-inset ring-black/5 focus:ring-2 focus:ring-brand-500/40 ${STATUS_CLS[it.status]}`}
                          aria-label="Change status"
                        >
                          {ITEM_STATUSES.map((s) => (
                            <option key={s} value={s} className="bg-white capitalize text-slate-700 dark:bg-slate-900 dark:text-slate-200">
                              {s}
                            </option>
                          ))}
                        </select>
                        <button onClick={() => removeItem(plan, idx)} className="text-xs text-gray-400 hover:text-red-600 dark:text-slate-500" aria-label="Remove">✕</button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={(n) => updateParams({ page: n })} />

      <Modal open={showModal} onClose={() => setShowModal(false)} title="Add task">
        <form onSubmit={addTask} className="space-y-3">
          <div>
            <label className="label">Date</label>
            <input type="date" className="input" value={form.date} onChange={(e) => setForm((f) => ({ ...f, date: e.target.value }))} required />
          </div>
          <div>
            <label className="label">Task *</label>
            <input className="input" placeholder="e.g. English — Preposition" value={form.text} onChange={(e) => setForm((f) => ({ ...f, text: e.target.value }))} autoFocus required />
          </div>
          <div>
            <label className="label">Target minutes</label>
            <input type="number" className="input" placeholder="e.g. 60" value={form.minutes} onChange={(e) => setForm((f) => ({ ...f, minutes: e.target.value }))} />
          </div>
          <div className="flex justify-end gap-2">
            <button type="button" onClick={() => setShowModal(false)} className="btn-outline">Cancel</button>
            <button className="btn-primary" disabled={saving}>{saving ? "Adding…" : "Add task"}</button>
          </div>
        </form>
      </Modal>
    </>
  );
}
