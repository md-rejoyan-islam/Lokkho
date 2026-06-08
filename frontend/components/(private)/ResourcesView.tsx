"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { RESOURCE_CATEGORIES, isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const LIMIT = 8;
const EMPTY = { title: "", category: "general", content: "", link: "" };

function toForm(r) {
  return {
    title: r.title || "",
    category: r.category || "general",
    content: r.content || "",
    link: r.link || "",
  };
}

export default function ResourcesPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <ResourcesContent />
      </Suspense>
    </>
  );
}

function ResourcesContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const category = searchParams.get("category") || "";
  const qParam = searchParams.get("q") || "";

  const [resources, setResources] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(qParam);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  function fetchResources() {
    const params = new URLSearchParams();
    if (category) params.set("category", category);
    if (qParam) params.set("search", qParam);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    setLoading(true);
    api(`/resources?${params}`)
      .then((d) => {
        setResources(d.resources);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchResources();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, category, qParam]);

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
    setForm(EMPTY);
    setEditingId(null);
    setShowModal(true);
  }
  function openEdit(r) {
    setForm(toForm(r));
    setEditingId(r._id);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.title.trim()) return;
    setSaving(true);
    try {
      if (editingId) await api(`/resources/${editingId}`, { method: "PUT", body: form });
      else await api("/resources", { method: "POST", body: form });
      closeModal();
      fetchResources();
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(r) {
    await api(`/resources/${r._id}`, { method: "DELETE" });
    if (resources.length === 1 && page > 1) updateParams({ page: page - 1 });
    else fetchResources();
  }

  return (
    <>
      <PageHeader
        title="Job-Seeker Resources"
        subtitle="চাকরির আবেদন, ডকুমেন্ট, প্রক্রিয়া ও টিপস — যা জানা দরকার"
        action={
          <button onClick={openAdd} className="btn-primary">
            + Add resource
          </button>
        }
      />

      {/* Category filter + search */}
      <div className="mb-5 flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => updateParams({ category: "", page: 1 })}
            className={`rounded-md px-3 py-1.5 text-sm font-medium ${
              category === "" ? "bg-brand-600 text-white" : "border border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
            }`}
          >
            All
          </button>
          {RESOURCE_CATEGORIES.map((c) => (
            <button
              key={c}
              onClick={() => updateParams({ category: c, page: 1 })}
              className={`rounded-md px-3 py-1.5 text-sm font-medium capitalize ${
                category === c ? "bg-brand-600 text-white" : "border border-slate-300 bg-white text-slate-600 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300"
              }`}
            >
              {c}
            </button>
          ))}
        </div>
        <form onSubmit={submitSearch} className="flex gap-2">
          <input
            className="input sm:max-w-[240px]"
            placeholder="Search resources…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn-outline shrink-0">Search</button>
        </form>
      </div>

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {meta.total} resources · page {meta.page} of {meta.totalPages}
      </p>

      {loading ? (
        <GridSkeleton count={6} cols="sm:grid-cols-2" />
      ) : resources.length === 0 ? (
        <Empty>কোনো resource নেই।</Empty>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {resources.map((r) => (
            <div key={r._id} className="card">
              <div className="flex items-start justify-between">
                <span className="badge mb-2 bg-gray-100 capitalize text-gray-600 dark:bg-slate-800 dark:text-slate-300">
                  {r.category}
                </span>
                <RowActions
                  canManage={isOwner(r.createdBy, user)}
                  onEdit={() => openEdit(r)}
                  onDelete={() => setConfirm(r)}
                />
              </div>
              <div className="text-lg font-semibold">{r.title}</div>
              {r.content && (
                <p className="mt-2 whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-300">{r.content}</p>
              )}
              {r.link && (
                <a href={r.link} target="_blank" rel="noreferrer" className="mt-2 inline-block text-sm font-medium text-brand-600 dark:text-brand-400">
                  বিস্তারিত →
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={(n) => updateParams({ page: n })} />

      <Modal open={showModal} onClose={closeModal} title={editingId ? "Edit resource" : "Add a resource"}>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            <select className="input capitalize" value={form.category} onChange={(e) => setForm((f) => ({ ...f, category: e.target.value }))}>
              {RESOURCE_CATEGORIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          <textarea className="input" rows={4} placeholder="Content" value={form.content} onChange={(e) => setForm((f) => ({ ...f, content: e.target.value }))} />
          <input className="input" placeholder="Reference link (optional)" value={form.link} onChange={(e) => setForm((f) => ({ ...f, link: e.target.value }))} />
          <div className="flex justify-end">
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Add resource"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this resource?"
        message={confirm ? `"${confirm.title}" মুছে যাবে।` : ""}
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
