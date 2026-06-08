"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { ListSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

export default function ImportantTopicsPage() {
  return (
    <>
      <Content />
    </>
  );
}

function Content() {
  const { user } = useAuth();
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [subjectModal, setSubjectModal] = useState(null); // {mode, data}
  const [confirm, setConfirm] = useState(null);

  function loadSubjects() {
    setLoading(true);
    api("/important-subjects")
      .then((d) => setSubjects(d.subjects))
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    loadSubjects();
  }, []);

  async function saveSubject(form) {
    if (subjectModal.mode === "edit") {
      await api(`/important-subjects/${subjectModal.data._id}`, { method: "PUT", body: { name: form.name } });
    } else {
      await api("/important-subjects", { method: "POST", body: { name: form.name } });
    }
    setSubjectModal(null);
    loadSubjects();
  }

  async function doDelete(s) {
    await api(`/important-subjects/${s._id}`, { method: "DELETE" });
    loadSubjects();
  }

  return (
    <>
      <PageHeader
        title="Important Topics"
        subtitle="subject অনুযায়ী গুরুত্বপূর্ণ টপিক — subject-এ ক্লিক করে ভেতরে topics দেখুন"
        action={
          <button onClick={() => setSubjectModal({ mode: "add", data: { name: "" } })} className="btn-primary">
            + Add subject
          </button>
        }
      />

      {!loading && subjects.length > 0 && (
        <div className="mb-4 flex items-center justify-between gap-3">
          <span className="text-sm text-slate-500 dark:text-slate-400">{subjects.length} subjects</span>
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
      )}

      {loading ? (
        <ListSkeleton count={5} />
      ) : subjects.length === 0 ? (
        <Empty>কোনো subject নেই। "+ Add subject" দিয়ে শুরু করুন।</Empty>
      ) : (
        <div className={view === "grid" ? "grid gap-3 sm:grid-cols-2 lg:grid-cols-3" : "space-y-2"}>
          {subjects.map((s) => (
            <div key={s._id} className="card relative flex items-center justify-between gap-3 transition hover:border-brand-300">
              {isOwner(s.createdBy, user) && (
                <div className="absolute right-3 top-3 z-10">
                  <RowActions
                    canManage
                    onEdit={() => setSubjectModal({ mode: "edit", data: { _id: s._id, name: s.name } })}
                    onDelete={() => setConfirm(s)}
                  />
                </div>
              )}
              <Link href={`/important-topics/${s._id}`} className="block min-w-0 flex-1">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-600 dark:bg-brand-500/15 dark:text-brand-300">⭐</span>
                  <div className="min-w-0">
                    <div className="truncate pr-8 font-semibold">{s.name}</div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">{s.topicCount} topics</div>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      {subjectModal && (
        <Modal open onClose={() => setSubjectModal(null)} title={subjectModal.mode === "edit" ? "Edit subject" : "Add subject"}>
          <SubjectForm initial={subjectModal.data} onSave={saveSubject} onClose={() => setSubjectModal(null)} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete this subject?"
        message={confirm ? `"${confirm.name}" ও এর সব topic মুছে যাবে।` : ""}
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function SubjectForm({ initial, onSave, onClose }: any) {
  const [name, setName] = useState(initial.name || "");
  const [busy, setBusy] = useState(false);
  async function submit(e) {
    e.preventDefault();
    if (!name.trim()) return;
    setBusy(true);
    try {
      await onSave({ name });
    } finally {
      setBusy(false);
    }
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div>
        <label className="label">Subject name *</label>
        <input className="input" placeholder="e.g. English" value={name} onChange={(e) => setName(e.target.value)} autoFocus required />
      </div>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}
