"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, JobBadge, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, TableSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const TABS = [
  { key: "all", label: "All" },
  { key: "government", label: "Govt" },
  { key: "non_government", label: "Non-Govt" },
  { key: "pension", label: "Pension-included" },
];
const LIMIT = 10;

const EMPTY_FORM = {
  title: "",
  organization: "",
  category: "government",
  pensionIncluded: false,
  sector: "",
  qualification: "",
  ageLimit: "",
  salaryScale: "",
  description: "",
};

function toForm(job) {
  return {
    title: job.title || "",
    organization: job.organization || "",
    category: job.category || "government",
    pensionIncluded: !!job.pensionIncluded,
    sector: job.sector || "",
    qualification: job.qualification || "",
    ageLimit: job.ageLimit || "",
    salaryScale: job.salaryScale || "",
    description: job.description || "",
  };
}

export default function JobsPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <JobsContent />
      </Suspense>
    </>
  );
}

function JobsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Source of truth = URL query params
  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const tab = searchParams.get("tab") || "all";
  const qParam = searchParams.get("q") || "";

  const [view, setView] = useState("cards"); // default grid (cards)
  const [jobs, setJobs] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(qParam);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  function fetchJobs() {
    const params = new URLSearchParams();
    if (tab === "pension") params.set("pension", "true");
    else if (tab !== "all") params.set("category", tab);
    if (qParam) params.set("search", qParam);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    setLoading(true);
    api(`/jobs?${params}`)
      .then((d) => {
        setJobs(d.jobs);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchJobs();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, tab, qParam]);

  useEffect(() => setSearchInput(qParam), [qParam]);

  // Update URL query params (drives refetch).
  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v == null) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  const changeTab = (t) => updateParams({ tab: t === "all" ? "" : t, page: 1 });
  const submitSearch = (e) => {
    e.preventDefault();
    updateParams({ q: searchInput.trim(), page: 1 });
  };
  const goPage = (n) => updateParams({ page: n });

  function openAdd() {
    setForm(EMPTY_FORM);
    setEditingId(null);
    setShowModal(true);
  }
  function openEdit(job) {
    setForm(toForm(job));
    setEditingId(job._id);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY_FORM);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) await api(`/jobs/${editingId}`, { method: "PUT", body: form });
      else await api("/jobs", { method: "POST", body: form });
      closeModal();
      fetchJobs();
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(job) {
    await api(`/jobs/${job._id}`, { method: "DELETE" });
    // if we just removed the last item on a page beyond the first, step back
    if (jobs.length === 1 && page > 1) goPage(page - 1);
    else fetchJobs();
  }

  return (
    <>
      <PageHeader
        title="Job List"
        subtitle="সরকারি, বেসরকারি ও অন্যান্য চাকরি — grade/scale ও আবেদনের ন্যূনতম যোগ্যতা সহ"
        action={
          <button onClick={openAdd} className="btn-primary">
            + Add job
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {TABS.map((t) => (
            <button
              key={t.key}
              onClick={() => changeTab(t.key)}
              className={`rounded-md px-4 py-1.5 text-sm font-medium ${
                tab === t.key
                  ? "bg-brand-600 text-white"
                  : "border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300"
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
              placeholder="Search position…"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
            />
            <button className="btn-outline">Search</button>
          </form>
          <div className="flex w-fit shrink-0 overflow-hidden rounded-md border border-gray-300 dark:border-slate-700">
            <button
              onClick={() => setView("table")}
              aria-label="List view"
              title="List view"
              className={`p-2 ${view === "table" ? "bg-brand-600 text-white" : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
            >
              <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01" strokeLinecap="round" />
              </svg>
            </button>
            <button
              onClick={() => setView("cards")}
              aria-label="Grid view"
              title="Grid view"
              className={`border-l border-gray-300 dark:border-slate-700 p-2 ${view === "cards" ? "bg-brand-600 text-white" : "bg-white dark:bg-slate-900 text-gray-600 dark:text-slate-300 hover:bg-gray-50 dark:hover:bg-slate-800"}`}
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

      <p className="mb-3 text-sm text-gray-500 dark:text-slate-400">
        {meta.total} positions · page {meta.page} of {meta.totalPages}
      </p>

      {loading ? (
        view === "table" ? <TableSkeleton rows={10} /> : <GridSkeleton count={6} cols="lg:grid-cols-2" />
      ) : jobs.length === 0 ? (
        <Empty>কোনো চাকরি পাওয়া যায়নি।</Empty>
      ) : view === "table" ? (
        <JobsTable jobs={jobs} startIndex={(page - 1) * LIMIT} user={user} onEdit={openEdit} onDelete={setConfirm} />
      ) : (
        <JobsCards jobs={jobs} user={user} onEdit={openEdit} onDelete={setConfirm} />
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={goPage} />

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingId ? "Edit job" : "Add a job"}
        maxWidth="max-w-2xl"
      >
        <JobForm form={form} setForm={setForm} submit={submit} saving={saving} editing={!!editingId} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this job?"
        message={confirm ? `"${confirm.title}" স্থায়ীভাবে মুছে যাবে।` : ""}
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function JobsTable({ jobs, startIndex, user, onEdit, onDelete }: any) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900">
      <table className="w-full min-w-[820px] text-sm">
        <thead className="bg-gray-50 dark:bg-slate-800/60 text-left text-xs uppercase tracking-wide text-gray-500 dark:text-slate-400">
          <tr>
            <th className="px-4 py-3">#</th>
            <th className="px-4 py-3">Position / Organization</th>
            <th className="px-4 py-3">Type</th>
            <th className="px-4 py-3">Sector</th>
            <th className="px-4 py-3">Grade / Starting Scale</th>
            <th className="px-4 py-3">Minimum Requirement</th>
            <th className="px-4 py-3">Actions</th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((j, i) => (
            <tr key={j._id} className="border-t border-gray-100 dark:border-slate-800 align-top hover:bg-gray-50/60">
              <td className="px-4 py-3 text-gray-400 dark:text-slate-500">{startIndex + i + 1}</td>
              <td className="px-4 py-3">
                <div className="font-medium text-gray-900 dark:text-slate-100">{j.title}</div>
                {j.organization && <div className="text-xs text-gray-500 dark:text-slate-400">{j.organization}</div>}
              </td>
              <td className="px-4 py-3">
                <div className="flex flex-col gap-1">
                  <JobBadge category={j.category} />
                  {j.pensionIncluded && (
                    <span className="badge bg-amber-100 text-amber-700">Pension</span>
                  )}
                </div>
              </td>
              <td className="px-4 py-3 text-gray-600 dark:text-slate-300">{j.sector || "—"}</td>
              <td className="px-4 py-3 font-medium text-gray-800 dark:text-slate-200">{j.salaryScale || "—"}</td>
              <td className="px-4 py-3 text-gray-600 dark:text-slate-300">
                <div>{j.qualification || "—"}</div>
                {j.ageLimit && <div className="mt-0.5 text-xs text-gray-400 dark:text-slate-500">Age: {j.ageLimit}</div>}
              </td>
              <td className="px-4 py-3">
                <RowActions
                  canManage={isOwner(j.createdBy, user)}
                  onEdit={() => onEdit(j)}
                  onDelete={() => onDelete(j)}
                />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

function JobsCards({ jobs, user, onEdit, onDelete }: any) {
  return (
    <div className="grid gap-3 lg:grid-cols-2">
      {jobs.map((j) => (
        <div key={j._id} className="card">
          <div className="flex flex-wrap items-start justify-between gap-2">
            <div>
              <div className="text-lg font-semibold">{j.title}</div>
              {j.organization && <div className="text-sm text-gray-500 dark:text-slate-400">{j.organization}</div>}
            </div>
            <div className="flex items-center gap-2">
              <JobBadge category={j.category} />
              {j.pensionIncluded && <span className="badge bg-amber-100 text-amber-700">Pension</span>}
              <RowActions
                canManage={isOwner(j.createdBy, user)}
                onEdit={() => onEdit(j)}
                onDelete={() => onDelete(j)}
              />
            </div>
          </div>
          {j.description && <p className="mt-2 text-sm text-gray-600 dark:text-slate-300">{j.description}</p>}
          <div className="mt-3 grid gap-1 text-xs text-gray-500 dark:text-slate-400 sm:grid-cols-2">
            {j.salaryScale && <span>💰 {j.salaryScale}</span>}
            {j.qualification && <span>🎓 {j.qualification}</span>}
            {j.ageLimit && <span>📅 {j.ageLimit}</span>}
            {j.source && <span>🔗 {j.source}</span>}
          </div>
        </div>
      ))}
    </div>
  );
}

function JobForm({ form, setForm, submit, saving, editing }: any) {
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Job title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
        <input className="input" placeholder="Organization" value={form.organization} onChange={(e) => setForm((f) => ({ ...f, organization: e.target.value }))} />
        <select className="input" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
          <option value="government">Government</option>
          <option value="non_government">Non-Government</option>
          <option value="other">Other</option>
        </select>
        <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-slate-300">
          <input type="checkbox" checked={form.pensionIncluded} onChange={(e) => setForm((f) => ({ ...f, pensionIncluded: e.target.checked }))} />
          Pension included
        </label>
        <input className="input" placeholder="Sector (e.g. Banking)" value={form.sector} onChange={(e) => setForm((f) => ({ ...f, sector: e.target.value }))} />
        <input className="input" placeholder="Grade / Starting scale" value={form.salaryScale} onChange={(e) => setForm((f) => ({ ...f, salaryScale: e.target.value }))} />
        <input className="input" placeholder="Minimum requirement (qualification)" value={form.qualification} onChange={(e) => setForm((f) => ({ ...f, qualification: e.target.value }))} />
        <input className="input" placeholder="Age limit" value={form.ageLimit} onChange={(e) => setForm((f) => ({ ...f, ageLimit: e.target.value }))} />
      </div>
      <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
      <div className="flex justify-end">
        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Add job"}
        </button>
      </div>
    </form>
  );
}
