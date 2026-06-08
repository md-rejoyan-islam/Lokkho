"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const LIMIT = 10;
const PRIORITIES = ["low", "medium", "high"];
const PROGRESS_STATUSES = ["not_started", "in_progress", "completed", "need_revision", "weak"];

// Premium status palette — vibrant solid colour when active, muted when not.
const STATUS = {
  not_started: { label: "Not started", active: "bg-slate-500 text-white shadow-sm shadow-slate-500/30" },
  in_progress: { label: "In progress", active: "bg-blue-600 text-white shadow-sm shadow-blue-600/30" },
  completed: { label: "Completed", active: "bg-emerald-600 text-white shadow-sm shadow-emerald-600/30" },
  need_revision: { label: "Need revision", active: "bg-amber-500 text-white shadow-sm shadow-amber-500/30" },
  weak: { label: "Weak", active: "bg-rose-600 text-white shadow-sm shadow-rose-600/30" },
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
  const { id: moduleId, subjectId } = useParams();
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));

  const [topics, setTopics] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [progressMap, setProgressMap] = useState({});
  const [topicModal, setTopicModal] = useState(null); // {mode, data}
  const [confirm, setConfirm] = useState(null);

  async function load() {
    const [t, p] = await Promise.all([
      api(`/subjects/${subjectId}/topics?page=${page}&limit=${LIMIT}`),
      api(`/progress?moduleId=${moduleId}`).catch(() => ({ progress: [] })),
    ]);
    setTopics(t.topics);
    setMeta({ total: t.total, totalPages: t.totalPages, page: t.page });
    const map = {};
    for (const pr of p.progress) {
      const tid = pr.topicId?._id || pr.topicId;
      map[tid] = pr.status;
    }
    setProgressMap(map);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [subjectId, page]);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v == null) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  async function setStatus(topicId, status) {
    setProgressMap((m) => ({ ...m, [topicId]: status }));
    await api(`/progress/${topicId}`, { method: "PUT", body: { status } });
  }

  async function saveTopic(form) {
    if (topicModal.mode === "edit") {
      await api(`/topics/${topicModal.data._id}`, {
        method: "PUT",
        body: { title: form.title, priority: form.priority },
      });
    } else {
      await api(`/subjects/${subjectId}/topics`, {
        method: "POST",
        body: { title: form.title, priority: form.priority },
      });
    }
    setTopicModal(null);
    load();
  }

  async function doDelete(t) {
    await api(`/topics/${t._id}`, { method: "DELETE" });
    if (topics.length === 1 && page > 1) updateParams({ page: page - 1 });
    else load();
  }

  return (
    <>
      <PageHeader
        title="Topics"
        subtitle="প্রতিটি topic-এর status আপডেট করুন (আপনার নিজস্ব progress)"
        action={
          <div className="flex gap-2">
            <Link href={`/modules/${moduleId}`} className="btn-outline">← Module</Link>
            <button
              onClick={() => setTopicModal({ mode: "add", data: { title: "", priority: "medium" } })}
              className="btn-primary"
            >
              + Add topic
            </button>
          </div>
        }
      />

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {meta.total} topics · page {meta.page} of {meta.totalPages}
      </p>

      {topics.length === 0 ? (
        <Empty>কোনো topic নেই। "+ Add topic" দিয়ে যোগ করুন।</Empty>
      ) : (
        <div className="space-y-2">
          {topics.map((t) => {
            const status = progressMap[t._id] || "not_started";
            return (
              <div
                key={t._id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-lg border border-gray-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900"
              >
                <div className="flex items-center gap-2">
                  <Link href={`/topics/${t._id}`} className="font-medium hover:text-brand-600">
                    {t.title}
                  </Link>
                  <span className="text-xs text-gray-400 dark:text-slate-500">{t.priority}</span>
                </div>
                <div className="flex flex-wrap items-center gap-1.5">
                  {PROGRESS_STATUSES.map((s) => (
                    <button
                      key={s}
                      onClick={() => setStatus(t._id, s)}
                      className={`rounded-full px-2.5 py-1 text-xs font-medium transition ${
                        status === s ? STATUS[s].active : INACTIVE
                      }`}
                    >
                      {STATUS[s].label}
                    </button>
                  ))}
                  {isOwner(t.createdBy, user) && (
                    <RowActions
                      canManage
                      onEdit={() => setTopicModal({ mode: "edit", data: { _id: t._id, title: t.title, priority: t.priority } })}
                      onDelete={() => setConfirm(t)}
                    />
                  )}
                </div>
              </div>
            );
          })}
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
  const [form, setForm] = useState({ title: initial.title || "", priority: initial.priority || "medium" });
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
        <select className="input capitalize" value={form.priority} onChange={(e) => setForm((f) => ({ ...f, priority: e.target.value }))}>
          {PRIORITIES.map((p) => (
            <option key={p} value={p}>{p}</option>
          ))}
        </select>
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
