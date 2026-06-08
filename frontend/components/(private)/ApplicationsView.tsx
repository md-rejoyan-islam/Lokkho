"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";

const LIMIT = 10;

const STAGE_META = {
  pending: { label: "Pending", cls: "bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300" },
  passed: { label: "Passed", cls: "bg-green-100 text-green-700" },
  failed: { label: "Failed", cls: "bg-red-100 text-red-700" },
};
const STAGE_CYCLE = ["pending", "passed", "failed"];

const DEFAULT_STAGES = [
  { name: "Preliminary", status: "pending" },
  { name: "Written", status: "pending" },
  { name: "Viva", status: "pending" },
];

const EMPTY = {
  jobName: "",
  organization: "",
  isApplied: false,
  appliedDate: "",
  examDate: "",
  stages: DEFAULT_STAGES.map((s) => ({ ...s })),
  notes: "",
  link: "",
};

const TABS = [
  { key: "", label: "All" },
  { key: "true", label: "Applied" },
  { key: "false", label: "Not applied" },
];

function dateToInput(d) {
  return d ? new Date(d).toISOString().slice(0, 10) : "";
}

function toForm(a) {
  return {
    jobName: a.jobName || "",
    organization: a.organization || "",
    isApplied: !!a.isApplied,
    appliedDate: dateToInput(a.appliedDate),
    examDate: dateToInput(a.examDate),
    stages: (a.stages || []).map((s) => ({ name: s.name, status: s.status })),
    notes: a.notes || "",
    link: a.link || "",
  };
}

export default function ApplicationsPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <Content />
      </Suspense>
    </>
  );
}

function Content() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const applied = searchParams.get("applied") || "";
  const qParam = searchParams.get("q") || "";

  const [apps, setApps] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1, summary: { all: 0, applied: 0, notApplied: 0 } });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(qParam);
  const [view, setView] = useState("grid"); // default grid
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  function fetchApps() {
    const params = new URLSearchParams();
    if (applied !== "") params.set("applied", applied);
    if (qParam) params.set("search", qParam);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    setLoading(true);
    api(`/applications?${params}`)
      .then((d) => {
        setApps(d.applications);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page, summary: d.summary });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchApps();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, applied, qParam]);

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

  function openAdd() {
    setForm({ ...EMPTY, stages: DEFAULT_STAGES.map((s) => ({ ...s })) });
    setEditingId(null);
    setShowModal(true);
  }
  function openEdit(a) {
    setForm(toForm(a));
    setEditingId(a._id);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditingId(null);
  }

  function buildBody(f) {
    return {
      jobName: f.jobName,
      organization: f.organization,
      isApplied: f.isApplied,
      appliedDate: f.appliedDate || null,
      examDate: f.examDate || null,
      stages: f.stages.filter((s) => s.name.trim()),
      notes: f.notes,
      link: f.link,
    };
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.jobName.trim()) return;
    setSaving(true);
    try {
      const body = buildBody(form);
      if (editingId) await api(`/applications/${editingId}`, { method: "PUT", body });
      else await api("/applications", { method: "POST", body });
      closeModal();
      fetchApps();
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(a) {
    await api(`/applications/${a._id}`, { method: "DELETE" });
    if (apps.length === 1 && page > 1) updateParams({ page: page - 1 });
    else fetchApps();
  }

  // Quick toggles directly on the card (persist immediately).
  async function toggleApplied(a) {
    const next = !a.isApplied;
    setApps((list) => list.map((x) => (x._id === a._id ? { ...x, isApplied: next } : x)));
    await api(`/applications/${a._id}`, {
      method: "PUT",
      body: { isApplied: next, appliedDate: next && !a.appliedDate ? new Date().toISOString().slice(0, 10) : dateToInput(a.appliedDate) },
    });
    fetchApps();
  }

  async function cycleStage(a, idx) {
    const stages = a.stages.map((s, i) =>
      i === idx ? { name: s.name, status: STAGE_CYCLE[(STAGE_CYCLE.indexOf(s.status) + 1) % STAGE_CYCLE.length] } : { name: s.name, status: s.status }
    );
    setApps((list) => list.map((x) => (x._id === a._id ? { ...x, stages } : x)));
    await api(`/applications/${a._id}`, { method: "PUT", body: { stages } });
  }

  const s = meta.summary || { all: 0, applied: 0, notApplied: 0 };

  return (
    <>
      <PageHeader
        title="Application Tracker"
        subtitle="কোন চাকরিতে apply করেছেন, কোন stage pass — সব এক জায়গায়"
        action={
          <button onClick={openAdd} className="btn-primary">
            + Add application
          </button>
        }
      />

      {/* Summary */}
      <div className="mb-5 grid grid-cols-3 gap-3">
        <StatCard label="Total" value={s.all} />
        <StatCard label="Applied" value={s.applied} accent="text-green-600" />
        <StatCard label="Not applied" value={s.notApplied} accent="text-amber-600" />
      </div>

      {/* Filters */}
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key || "all"}
              onClick={() => updateParams({ applied: t.key, page: 1 })}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                applied === t.key ? "bg-brand-600 text-white" : "border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300"
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
        <div className="flex items-center gap-2">
          <form onSubmit={submitSearch} className="flex gap-2">
            <input
              className="input max-w-[200px]"
              placeholder="Search job…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn-outline">Search</button>
          </form>
          <div className="flex w-fit shrink-0 overflow-hidden rounded-md border border-gray-300 dark:border-slate-700">
            <button
              onClick={() => setView("list")}
              aria-label="List view"
              title="List view"
              className={`p-2 ${view === "list" ? "bg-brand-600 text-white" : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setView("grid")}
              aria-label="Grid view"
              title="Grid view"
              className={`border-l border-gray-300 dark:border-slate-700 p-2 ${view === "grid" ? "bg-brand-600 text-white" : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <rect x="14" y="14" width="7" height="7" rx="1" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <GridSkeleton count={4} cols="lg:grid-cols-2" />
      ) : apps.length === 0 ? (
        <Empty>কোনো application নেই। নতুন একটা যোগ করুন।</Empty>
      ) : (
        <div className={view === "grid" ? "grid gap-3 lg:grid-cols-2" : "space-y-3"}>
          {apps.map((a) => (
            <div key={a._id} className="card">
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <div className="text-lg font-semibold">{a.jobName}</div>
                  {a.organization && <div className="text-sm text-gray-500 dark:text-slate-400">{a.organization}</div>}
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => toggleApplied(a)}
                    className={`badge cursor-pointer ${
                      a.isApplied ? "bg-green-100 text-green-700" : "bg-gray-100 dark:bg-slate-800 text-gray-500 dark:text-slate-400"
                    }`}
                    title="Toggle applied"
                  >
                    {a.isApplied ? "✓ Applied" : "Not applied"}
                  </button>
                  <RowActions canManage onEdit={() => openEdit(a)} onDelete={() => setConfirm(a)} />
                </div>
              </div>

              <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-500 dark:text-slate-400">
                {a.appliedDate && <span>📅 Applied: {dateToInput(a.appliedDate)}</span>}
                {a.examDate && <span>📝 Exam: {dateToInput(a.examDate)}</span>}
                {a.link && (
                  <a href={a.link} target="_blank" rel="noreferrer" className="font-medium text-brand-600 dark:text-brand-400">
                    🔗 Link
                  </a>
                )}
              </div>

              {a.stages?.length > 0 && (
                <div className="mt-3 flex flex-wrap items-center gap-2">
                  <span className="text-xs text-gray-400 dark:text-slate-500">Stages:</span>
                  {a.stages.map((st, idx) => (
                    <button
                      key={idx}
                      onClick={() => cycleStage(a, idx)}
                      className={`badge cursor-pointer ${STAGE_META[st.status]?.cls}`}
                      title="Click to change status"
                    >
                      {st.name}: {STAGE_META[st.status]?.label}
                    </button>
                  ))}
                </div>
              )}

              {a.notes && <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{a.notes}</p>}
            </div>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={(n) => updateParams({ page: n })} />

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingId ? "Edit application" : "Add application"}
        maxWidth="max-w-xl"
      >
        <ApplicationForm form={form} setForm={setForm} submit={submit} saving={saving} editing={!!editingId} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this application?"
        message={confirm ? `"${confirm.jobName}" tracker থেকে মুছে যাবে।` : ""}
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function StatCard({ label, value, accent = "text-gray-900 dark:text-slate-100" }: any) {
  return (
    <div className="card py-3 text-center">
      <div className={`text-2xl font-bold ${accent}`}>{value}</div>
      <div className="text-xs text-gray-500 dark:text-slate-400">{label}</div>
    </div>
  );
}

function ApplicationForm({ form, setForm, submit, saving, editing }: any) {
  function setStage(i, key, val) {
    setForm((f) => ({
      ...f,
      stages: f.stages.map((s, idx) => (idx === i ? { ...s, [key]: val } : s)),
    }));
  }
  function addStage() {
    setForm((f) => ({ ...f, stages: [...f.stages, { name: "", status: "pending" }] }));
  }
  function removeStage(i) {
    setForm((f) => ({ ...f, stages: f.stages.filter((_, idx) => idx !== i) }));
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Job name *" value={form.jobName} onChange={(e) => setForm((f) => ({ ...f, jobName: e.target.value }))} required />
        <input className="input" placeholder="Organization" value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} />
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
          <input type="checkbox" checked={form.isApplied} onChange={(e) => setForm((f) => ({ ...f, isApplied: e.target.checked }))} />
          Already applied
        </label>
      </div>

      <div className="grid gap-3 sm:grid-cols-2">
        <div>
          <label className="label">Applied date</label>
          <input type="date" className="input" value={form.appliedDate} onChange={(e) => setForm((f) => ({ ...f, appliedDate: e.target.value }))} />
        </div>
        <div>
          <label className="label">Exam date</label>
          <input type="date" className="input" value={form.examDate} onChange={(e) => setForm((f) => ({ ...f, examDate: e.target.value }))} />
        </div>
      </div>

      {/* Configurable stages */}
      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Selection stages (configurable)</label>
          <button type="button" onClick={addStage} className="btn-outline py-1 text-xs">
            + Add stage
          </button>
        </div>
        <div className="space-y-2">
          {form.stages.map((s, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Stage name (e.g. Preliminary)"
                value={s.name}
                onChange={(e) => setStage(i, "name", e.target.value)}
              />
              <select className="input w-32" value={s.status} onChange={(e) => setStage(i, "status", e.target.value)}>
                <option value="pending">Pending</option>
                <option value="passed">Passed</option>
                <option value="failed">Failed</option>
              </select>
              <button type="button" onClick={() => removeStage(i)} className="px-2 text-gray-400 dark:text-slate-500 hover:text-red-600">
                ✕
              </button>
            </div>
          ))}
          {form.stages.length === 0 && (
            <p className="text-xs text-gray-400 dark:text-slate-500">কোনো stage নেই — "Add stage" দিয়ে যোগ করুন।</p>
          )}
        </div>
      </div>

      <input className="input" placeholder="Circular / apply link (optional)" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
      <textarea className="input" rows={2} placeholder="Notes (optional)" value={form.notes} onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))} />

      <div className="flex justify-end">
        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Add application"}
        </button>
      </div>
    </form>
  );
}
