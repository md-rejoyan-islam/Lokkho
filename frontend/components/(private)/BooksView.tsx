"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, ListSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const LIMIT = 12;
const EMPTY = { title: "", author: "", subject: "", description: "", buyLink: "" };

function toForm(b) {
  return {
    title: b.title || "",
    author: b.author || "",
    subject: b.subject || "",
    description: b.description || "",
    buyLink: b.buyLink || "",
  };
}

export default function BooksPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <BooksContent />
      </Suspense>
    </>
  );
}

function BooksContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const qParam = searchParams.get("q") || "";

  const [books, setBooks] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState("grid");
  const [searchInput, setSearchInput] = useState(qParam);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  function fetchBooks() {
    const params = new URLSearchParams();
    if (qParam) params.set("search", qParam);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    setLoading(true);
    api(`/books?${params}`)
      .then((d) => {
        setBooks(d.books);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchBooks();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, qParam]);

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
  function openEdit(b) {
    setForm(toForm(b));
    setEditingId(b._id);
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
      if (editingId) await api(`/books/${editingId}`, { method: "PUT", body: form });
      else await api("/books", { method: "POST", body: form });
      closeModal();
      fetchBooks();
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(book) {
    await api(`/books/${book._id}`, { method: "DELETE" });
    if (books.length === 1 && page > 1) updateParams({ page: page - 1 });
    else fetchBooks();
  }

  return (
    <>
      <PageHeader
        title="Recommended Books"
        subtitle="প্রস্তুতির জন্য বইয়ের তালিকা — community recommended"
        action={
          <button onClick={openAdd} className="btn-primary">
            + Recommend a book
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <form onSubmit={submitSearch} className="flex gap-2">
          <input
            className="input max-w-xs"
            placeholder="Search title / author…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
          />
          <button className="btn-outline shrink-0">Search</button>
        </form>
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
        {meta.total} books · page {meta.page} of {meta.totalPages}
      </p>

      {loading ? (
        view === "grid" ? <GridSkeleton count={6} /> : <ListSkeleton count={6} />
      ) : books.length === 0 ? (
        <Empty>কোনো বই নেই।</Empty>
      ) : view === "grid" ? (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {books.map((b) => (
            <div key={b._id} className="card">
              <div className="flex items-start justify-between">
                {b.subject ? (
                  <span className="badge mb-2 bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{b.subject}</span>
                ) : (
                  <span />
                )}
                <RowActions
                  canManage={isOwner(b.recommendedBy, user)}
                  onEdit={() => openEdit(b)}
                  onDelete={() => setConfirm(b)}
                />
              </div>
              <div className="text-lg font-semibold">{b.title}</div>
              {b.author && <div className="text-sm text-gray-500 dark:text-slate-400">{b.author}</div>}
              {b.description && (
                <p className="mt-2 line-clamp-3 text-sm text-gray-600 dark:text-slate-300">{b.description}</p>
              )}
              <div className="mt-3 flex items-center justify-between text-xs text-gray-400 dark:text-slate-500">
                {b.recommendedBy?.name ? <span>by {b.recommendedBy.name}</span> : <span />}
                {b.buyLink && (
                  <a href={b.buyLink} target="_blank" rel="noreferrer" className="font-medium text-brand-600 dark:text-brand-400">
                    Buy →
                  </a>
                )}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-2">
          {books.map((b) => (
            <div key={b._id} className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-3 dark:border-slate-800 dark:bg-slate-900">
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2">
                  {b.subject && <span className="badge bg-brand-50 text-brand-700 dark:bg-brand-500/15 dark:text-brand-300">{b.subject}</span>}
                  <span className="font-medium text-slate-800 dark:text-slate-100">{b.title}</span>
                </div>
                <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
                  {b.author || "—"}{b.recommendedBy?.name ? ` · by ${b.recommendedBy.name}` : ""}
                </div>
              </div>
              <div className="flex shrink-0 items-center gap-2">
                {b.buyLink && (
                  <a href={b.buyLink} target="_blank" rel="noreferrer" className="text-xs font-medium text-brand-600 dark:text-brand-400">
                    Buy →
                  </a>
                )}
                <RowActions
                  canManage={isOwner(b.recommendedBy, user)}
                  onEdit={() => openEdit(b)}
                  onDelete={() => setConfirm(b)}
                />
              </div>
            </div>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={(n) => updateParams({ page: n })} />

      <Modal open={showModal} onClose={closeModal} title={editingId ? "Edit book" : "Recommend a book"}>
        <form onSubmit={submit} className="space-y-3">
          <div className="grid gap-3 sm:grid-cols-2">
            <input className="input" placeholder="Title *" value={form.title} onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} required />
            <input className="input" placeholder="Author" value={form.author} onChange={(e) => setForm((f) => ({ ...f, author: e.target.value }))} />
            <input className="input" placeholder="Subject (e.g. English)" value={form.subject} onChange={(e) => setForm((f) => ({ ...f, subject: e.target.value }))} />
            <input className="input" placeholder="Buy link" value={form.buyLink} onChange={(e) => setForm((f) => ({ ...f, buyLink: e.target.value }))} />
          </div>
          <textarea className="input" rows={3} placeholder="Description" value={form.description} onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))} />
          <div className="flex justify-end">
            <button className="btn-primary" disabled={saving}>
              {saving ? "Saving…" : editingId ? "Save changes" : "Add book"}
            </button>
          </div>
        </form>
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this book?"
        message={confirm ? `"${confirm.title}" তালিকা থেকে মুছে যাবে।` : ""}
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}
