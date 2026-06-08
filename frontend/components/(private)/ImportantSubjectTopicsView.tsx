"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, ListSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { PRIORITIES, PRIORITY_META, isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const LIMIT = 9;
const PROGRESS_STATUSES = ["not_started", "in_progress", "completed", "need_revision", "weak"];
const STATUS = {
  not_started: { label: "Not started", active: "bg-slate-500 text-white" },
  in_progress: { label: "In progress", active: "bg-blue-600 text-white" },
  completed: { label: "Completed", active: "bg-emerald-600 text-white" },
  need_revision: { label: "Need revision", active: "bg-amber-500 text-white" },
  weak: { label: "Weak", active: "bg-rose-600 text-white" },
};
const INACTIVE =
  "bg-slate-100 text-slate-500 hover:bg-slate-200 dark:bg-slate-800 dark:text-slate-400 dark:hover:bg-slate-700";

export default function SubjectTopicsPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

function Content() {
  const { subjectId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const priority = searchParams.get("priority") || "";
  const qParam = searchParams.get("q") || "";

  const [subject, setSubject] = useState(null);
  const [topics, setTopics] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [progressMap, setProgressMap] = useState({});
  const [view, setView] = useState("grid");
  const [searchInput, setSearchInput] = useState(qParam);
  const [topicModal, setTopicModal] = useState(null);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    api(`/important-subjects/${subjectId}`).then((d) => setSubject(d.subject)).catch(() => {});
    if (user) {
      api(`/important-progress?subjectId=${subjectId}`)
        .then((p) => {
          const map = {};
          for (const pr of p.progress) map[pr.importantTopicId] = pr.status;
          setProgressMap(map);
        })
        .catch(() => {});
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId]);

  function fetchTopics() {
    setLoading(true);
    const params = new URLSearchParams();
    if (priority) params.set("priority", priority);
    if (qParam) params.set("search", qParam);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    api(`/important-subjects/${subjectId}/topics?${params}`)
      .then((d) => {
        setTopics(d.topics);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchTopics();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, page, priority, qParam]);

  useEffect(() => setSearchInput(qParam), [qParam]);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v == null) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const submitSearch = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim(), page: 1 });
  };

  async function setStatus(topicId, status) {
    setProgressMap((m) => ({ ...m, [topicId]: status }));
    await api(`/important-progress/${topicId}`, { method: "PUT", body: { status } });
  }

  async function saveTopic(form) {
    if (topicModal.mode === "edit") {
      await api(`/important-topics/${topicModal.data._id}`, { method: "PUT", body: { title: form.title, priority: form.priority, note: form.note } });
    } else {
      await api(`/important-subjects/${subjectId}/topics`, { method: "POST", body: { title: form.title, priority: form.priority, note: form.note } });
    }
    setTopicModal(null);
    fetchTopics();
  }

  async function doDelete(t) {
    await api(`/important-topics/${t._id}`, { method: "DELETE" });
    if (topics.length === 1 && page > 1) updateParams({ page: page - 1 });
    else fetchTopics();
  }

  return (
    <>
      <PageHeader
        title={subject ? subject.name : "Topics"}
        subtitle="গুরুত্বপূর্ণ টপিক — priority ও আপনার progress status সহ"
        action={
          <div className="flex gap-2">
            <Link href="/important-topics" className="btn-outline">← Subjects</Link>
            <button onClick={() => setTopicModal({ mode: "add", data: { title: "", priority: "high", note: "" } })} className="btn-primary">
              + Add topic
            </button>
          </div>
        }
      />

      {/* Filters + view toggle */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap items-center gap-3 sm:flex-nowrap">
          <select
            className="input w-auto shrink-0"
            value={priority}
            onChange={(e) => updateParams({ priority: e.target.value, page: 1 })}
          >
            <option value="">All priority</option>
            {PRIORITIES.map((p) => (
              <option key={p} value={p}>{PRIORITY_META[p].label}</option>
            ))}
          </select>
          <form onSubmit={submitSearch} className="flex flex-1 gap-2">
            <input className="input w-full sm:max-w-[240px]" placeholder="Search topic…" value={searchInput} onChange={(e) => setSearchInput(e.target.value)} />
            <button className="btn-outline shrink-0">Search</button>
          </form>
        </div>
        <div className="flex overflow-hidden rounded-md border border-gray-300 dark:border-slate-700">
          <button onClick={() => setView("list")} aria-label="List view" title="List view"
            className={`p-2 ${view === "list" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" /></svg>
          </button>
          <button onClick={() => setView("grid")} aria-label="Grid view" title="Grid view"
            className={`border-l border-gray-300 p-2 dark:border-slate-700 ${view === "grid" ? "bg-brand-600 text-white" : "bg-white text-gray-600 hover:bg-gray-50 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800"}`}>
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1" /><rect x="14" y="3" width="7" height="7" rx="1" /><rect x="3" y="14" width="7" height="7" rx="1" /><rect x="14" y="14" width="7" height="7" rx="1" /></svg>
          </button>
        </div>
      </div>

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {meta.total} topics · page {meta.page} of {meta.totalPages}
      </p>

      {loading ? (
        view === "grid" ? <GridSkeleton count={6} /> : <ListSkeleton count={6} />
      ) : topics.length === 0 ? (
        <Empty>কোনো topic পাওয়া যায়নি।</Empty>
      ) : (
        <div className={view === "grid" ? "grid items-start gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
          {topics.map((t) => (
            <div key={t._id} className="card">
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className={`badge ${PRIORITY_META[t.priority]?.cls}`}>{PRIORITY_META[t.priority]?.label}</span>
                    <span className="font-medium text-slate-800 dark:text-slate-100">{t.title}</span>
                  </div>
                  {t.note && <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">{t.note}</p>}
                </div>
                {isOwner(t.createdBy, user) && (
                  <RowActions
                    canManage
                    onEdit={() => setTopicModal({ mode: "edit", data: { _id: t._id, title: t.title, priority: t.priority, note: t.note || "" } })}
                    onDelete={() => setConfirm(t)}
                  />
                )}
              </div>
              <div className="mt-2.5 flex flex-wrap gap-1.5">
                {PROGRESS_STATUSES.map((st) => {
                  const cur = progressMap[t._id] || "not_started";
                  return (
                    <button
                      key={st}
                      onClick={() => setStatus(t._id, st)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${cur === st ? STATUS[st].active : INACTIVE}`}
                    >
                      {STATUS[st].label}
                    </button>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={(n) => updateParams({ page: n })} />

      {topicModal && (
        <Modal open onClose={() => setTopicModal(null)} title={topicModal.mode === "edit" ? "Edit topic" : "Add topic"}>
          <TopicForm initial={topicModal.data} onSave={saveTopic} onClose={() => setTopicModal(null)} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete this topic?"
        message={confirm ? `"${confirm.title}" মুছে যাবে।` : ""}
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function TopicForm({ initial, onSave, onClose }: any) {
  const [form, setForm] = useState({ title: initial.title || "", priority: initial.priority || "high", note: initial.note || "" });
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setBusy(true);
    try {
      await onSave(form);
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">Topic title *</label>
        <input className="input" placeholder="e.g. Preposition" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} autoFocus required />
      </div>
      <div>
        <label className="label">Priority</label>
        <select className="input" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{PRIORITY_META[p].label}</option>
          ))}
        </select>
      </div>
      <textarea className="input" rows={2} placeholder="Note (optional)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
