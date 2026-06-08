"use client";

import { Suspense, useEffect, useState } from "react";
import Link from "next/link";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { MODULE_CATEGORIES, isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const LIMIT = 12; // 3-column grid → fills evenly

export default function ModulesPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <ModulesContent />
      </Suspense>
    </>
  );
}

function ModulesContent() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const { user } = useAuth();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const category = searchParams.get("category") || "";
  const qParam = searchParams.get("q") || "";

  const [modules, setModules] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(qParam);
  const [catInput, setCatInput] = useState(category);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState(null);
  const [confirm, setConfirm] = useState(null);

  async function saveEdit(form) {
    await api(`/modules/${editing._id}`, {
      method: "PUT",
      body: {
        title: form.title,
        category: form.category,
        totalMarks: Number(form.totalMarks) || 0,
        durationMinutes: Number(form.durationMinutes) || 0,
        description: form.description,
        minCgpa: form.minCgpa,
        degree: form.degree,
        eligibility: form.eligibility,
      },
    });
    setEditing(null);
    fetchModules();
  }

  async function doDelete(m) {
    await api(`/modules/${m._id}`, { method: "DELETE" });
    if (modules.length === 1 && page > 1) updateParams({ page: page - 1 });
    else fetchModules();
  }

  function fetchModules() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (qParam) params.set("search", qParam);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    setLoading(true);
    api(`/modules?${params}`)
      .then((d) => {
        setModules(d.modules);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchModules();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, qParam]);

  useEffect(() => {
    setSearchInput(qParam);
    setCatInput(category);
  }, [qParam, category]);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v == null) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const submitFilters = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim(), category: catInput.trim(), page: 1 });
  };

  return (
    <>
      <PageHeader
        title="Exam Guides"
        subtitle="প্রতিটি চাকরির পরীক্ষার পূর্ণ গাইড — pattern, requirement, subject সহ (সবার জন্য shared)"
        action={
          <button onClick={() => setShowModal(true)} className="btn-primary">
            + New exam guide
          </button>
        }
      />

      <form onSubmit={submitFilters} className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center">
        <input
          className="input w-full sm:max-w-xs"
          placeholder="Search exam guides…"
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
        />
        <input
          className="input w-full sm:max-w-[200px]"
          placeholder="Filter by category…"
          list="module-categories"
          value={catInput}
          onChange={(e) => setCatInput(e.target.value)}
        />
        <datalist id="module-categories">
          {MODULE_CATEGORIES.map((c) => (
            <option key={c} value={c} />
          ))}
        </datalist>
        <button className="btn-outline shrink-0">Search</button>
      </form>

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {meta.total} exam guides · page {meta.page} of {meta.totalPages}
      </p>

      {loading ? (
        <GridSkeleton count={6} />
      ) : modules.length === 0 ? (
        <Empty>কোনো exam guide পাওয়া যায়নি। নতুন একটা তৈরি করুন।</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {modules.map((m) => (
            <div key={m._id} className="card relative hover:border-brand-300">
              {isOwner(m.createdBy, user) && (
                <div className="absolute right-3 top-3 z-10">
                  <RowActions
                    canManage
                    onEdit={() => setEditing(m)}
                    onDelete={() => setConfirm(m)}
                  />
                </div>
              )}
              <Link href={`/modules/${m._id}`} className="block">
                <div className="mb-1 pr-16 text-xs font-medium text-brand-600 dark:text-brand-400">
                  {m.category}
                </div>
                <div className="text-lg font-semibold">{m.title}</div>
                {m.description && (
                  <p className="mt-1 line-clamp-2 text-sm text-gray-500 dark:text-slate-400">
                    {m.description}
                  </p>
                )}
                <div className="mt-3 flex gap-4 text-xs text-gray-500 dark:text-slate-400">
                  <span>{m.totalMarks || 0} marks</span>
                  <span>{m.examPattern?.length || 0} sections</span>
                </div>
              </Link>
            </div>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={(n) => updateParams({ page: n })} />

      {editing && (
        <Modal open onClose={() => setEditing(null)} title="Edit exam guide" maxWidth="max-w-2xl">
          <EditModuleForm module={editing} onSave={saveEdit} onClose={() => setEditing(null)} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirm}
        title="Delete this exam guide?"
        message={confirm ? `"${confirm.title}" ও এর সব subject/topic মুছে যাবে।` : ""}
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />

      <Modal
        open={showModal}
        onClose={() => setShowModal(false)}
        title="New exam guide"
        maxWidth="max-w-2xl"
      >
        <ModuleForm
          onClose={() => setShowModal(false)}
          onCreated={(id) => {
            setShowModal(false);
            router.push(`/modules/${id}`);
          }}
        />
      </Modal>
    </>
  );
}

function ModuleForm({ onClose, onCreated }: any) {
  const [form, setForm] = useState({
    title: "",
    category: "Other",
    description: "",
    totalMarks: "",
    durationMinutes: "",
    minCgpa: "",
    degree: "",
    eligibility: "",
  });
  const [pattern, setPattern] = useState([{ section: "", marks: "", questionCount: "" }]);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }
  function updateRow(i, k, v) {
    setPattern((rows) => rows.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  }
  function addRow() {
    setPattern((rows) => [...rows, { section: "", marks: "", questionCount: "" }]);
  }
  function removeRow(i) {
    setPattern((rows) => rows.filter((_, idx) => idx !== i));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      const examPattern = pattern
        .filter((r) => r.section.trim())
        .map((r) => ({
          section: r.section,
          marks: Number(r.marks) || 0,
          questionCount: Number(r.questionCount) || 0,
        }));
      const { module } = await api("/modules", {
        method: "POST",
        body: {
          title: form.title,
          category: form.category,
          description: form.description,
          totalMarks: Number(form.totalMarks) || 0,
          durationMinutes: Number(form.durationMinutes) || 0,
          minCgpa: form.minCgpa,
          degree: form.degree,
          eligibility: form.eligibility,
          examPattern,
        },
      });
      onCreated(module._id);
    } catch (err) {
      setError(err.details?.map((d) => d.message).join(", ") || err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={onSubmit} className="space-y-4">
      <div>
        <label className="label">Module title *</label>
        <input
          className="input"
          placeholder="e.g. Railway Exam (Grade-2)"
          value={form.title}
          onChange={(e) => update("title", e.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        <div>
          <label className="label">Category</label>
          <input
            className="input"
            placeholder="e.g. BCS, Primary, Bank"
            list="module-categories"
            value={form.category}
            onChange={(e) => update("category", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Total marks</label>
          <input
            type="number"
            className="input"
            value={form.totalMarks}
            onChange={(e) => update("totalMarks", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Duration (min)</label>
          <input
            type="number"
            className="input"
            value={form.durationMinutes}
            onChange={(e) => update("durationMinutes", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Description</label>
        <textarea
          className="input"
          rows={2}
          value={form.description}
          onChange={(e) => update("description", e.target.value)}
        />
      </div>

      {/* Minimum requirements to apply */}
      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className="label">Minimum CGPA</label>
          <input
            className="input"
            placeholder="e.g. 2.50"
            value={form.minCgpa}
            onChange={(e) => update("minCgpa", e.target.value)}
          />
        </div>
        <div>
          <label className="label">Degree required</label>
          <input
            className="input"
            placeholder="e.g. Bachelor's (any discipline)"
            value={form.degree}
            onChange={(e) => update("degree", e.target.value)}
          />
        </div>
      </div>
      <div>
        <label className="label">Eligibility / other requirements</label>
        <textarea
          className="input"
          rows={2}
          placeholder="বয়সসীমা, অভিজ্ঞতা, অন্যান্য শর্ত…"
          value={form.eligibility}
          onChange={(e) => update("eligibility", e.target.value)}
        />
      </div>

      <div>
        <div className="mb-2 flex items-center justify-between">
          <label className="label mb-0">Exam pattern / mark distribution</label>
          <button type="button" onClick={addRow} className="btn-outline py-1 text-xs">
            + Add section
          </button>
        </div>
        <div className="space-y-2">
          {pattern.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input
                className="input flex-1"
                placeholder="Section (e.g. Math)"
                value={r.section}
                onChange={(e) => updateRow(i, "section", e.target.value)}
              />
              <input
                type="number"
                className="input w-24"
                placeholder="Marks"
                value={r.marks}
                onChange={(e) => updateRow(i, "marks", e.target.value)}
              />
              <input
                type="number"
                className="input w-24"
                placeholder="Qs"
                value={r.questionCount}
                onChange={(e) => updateRow(i, "questionCount", e.target.value)}
              />
              <button
                type="button"
                onClick={() => removeRow(i)}
                className="px-2 text-gray-400 dark:text-slate-500 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      </div>

      {error && <p className="text-sm text-red-600">{error}</p>}
      <div className="flex justify-end gap-3">
        <button type="button" onClick={onClose} className="btn-outline">
          Cancel
        </button>
        <button className="btn-primary" disabled={busy}>
          {busy ? "Creating…" : "Create module"}
        </button>
      </div>
    </form>
  );
}

// Edit basic info + requirements of an existing exam guide (mark distribution is
// edited on the detail page's editable table).
function EditModuleForm({ module, onSave, onClose }: any) {
  const [form, setForm] = useState({
    title: module.title || "",
    category: module.category || "Other",
    totalMarks: module.totalMarks ?? "",
    durationMinutes: module.durationMinutes ?? "",
    description: module.description || "",
    minCgpa: module.minCgpa || "",
    degree: module.degree || "",
    eligibility: module.eligibility || "",
  });
  const [busy, setBusy] = useState(false);
  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));

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
      <input className="input" placeholder="Title *" value={form.title} onChange={(e) => set("title", e.target.value)} required />
      <div className="grid gap-3 sm:grid-cols-3">
        <input className="input" placeholder="Category" list="module-categories" value={form.category} onChange={(e) => set("category", e.target.value)} />
        <input type="number" className="input" placeholder="Total marks" value={form.totalMarks} onChange={(e) => set("totalMarks", e.target.value)} />
        <input type="number" className="input" placeholder="Duration (min)" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} />
      </div>
      <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Minimum CGPA" value={form.minCgpa} onChange={(e) => set("minCgpa", e.target.value)} />
        <input className="input" placeholder="Degree required" value={form.degree} onChange={(e) => set("degree", e.target.value)} />
      </div>
      <textarea className="input" rows={2} placeholder="Eligibility / other requirements" value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} />
      <p className="text-xs text-slate-400">
        💡 Mark distribution ও subjects exam guide-এর ভেতরে গিয়ে edit করা যায়।
      </p>
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}
