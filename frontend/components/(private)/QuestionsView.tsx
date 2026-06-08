"use client";

import { Suspense, useEffect, useState } from "react";
import { useRouter, usePathname, useSearchParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import Pagination from "@/components/shared/Pagination";
import { GridSkeleton, PageSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { isOwner } from "@/lib/constants";
import { useAuth } from "@/lib/auth";

const LIMIT = 10;

const EMPTY = {
  moduleId: "",
  year: "",
  examName: "",
  questionText: "",
  options: ["", "", "", ""],
  correctAnswer: "",
  explanation: "",
};

function toForm(q) {
  const opts = [...(q.options || [])];
  while (opts.length < 4) opts.push("");
  return {
    moduleId: q.moduleId?._id || q.moduleId || "",
    year: q.year ? String(q.year) : "",
    examName: q.examName || "",
    questionText: q.questionText || "",
    options: opts,
    correctAnswer: q.correctAnswer || "",
    explanation: q.explanation || "",
  };
}

export default function QuestionsPage() {
  return (
    <>
      <Suspense fallback={<PageSkeleton />}>
        <QuestionsContent />
      </Suspense>
    </>
  );
}

function QuestionsContent() {
  const { user } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const page = Math.max(1, parseInt(searchParams.get("page") || "1", 10));
  const moduleId = searchParams.get("moduleId") || "";
  const year = searchParams.get("year") || "";
  const type = searchParams.get("type") || "";

  const [modules, setModules] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [meta, setMeta] = useState({ total: 0, totalPages: 1, page: 1 });
  const [loading, setLoading] = useState(true);
  const [yearInput, setYearInput] = useState(year);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [form, setForm] = useState(EMPTY);
  const [saving, setSaving] = useState(false);
  const [confirm, setConfirm] = useState(null);

  useEffect(() => {
    api("/modules?limit=100").then((d) => setModules(d.modules)).catch(() => {});
  }, []);

  function fetchQuestions() {
    const params = new URLSearchParams();
    if (moduleId) params.set("moduleId", moduleId);
    if (year) params.set("year", year);
    if (type) params.set("type", type);
    params.set("page", String(page));
    params.set("limit", String(LIMIT));
    setLoading(true);
    api(`/questions?${params}`)
      .then((d) => {
        setQuestions(d.questions);
        setMeta({ total: d.total, totalPages: d.totalPages, page: d.page });
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }

  useEffect(() => {
    fetchQuestions();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, moduleId, year, type]);

  useEffect(() => setYearInput(year), [year]);

  function updateParams(updates) {
    const params = new URLSearchParams(searchParams.toString());
    Object.entries(updates).forEach(([k, v]) => {
      if (v === "" || v == null) params.delete(k);
      else params.set(k, String(v));
    });
    router.push(`${pathname}?${params.toString()}`);
  }

  function openAdd() {
    setForm(EMPTY);
    setEditingId(null);
    setShowModal(true);
  }
  function openEdit(q) {
    setForm(toForm(q));
    setEditingId(q._id);
    setShowModal(true);
  }
  function closeModal() {
    setShowModal(false);
    setEditingId(null);
    setForm(EMPTY);
  }

  async function submit(e) {
    e.preventDefault();
    if (!form.moduleId || !form.questionText.trim()) return;
    setSaving(true);
    const body = {
      moduleId: form.moduleId,
      year: form.year ? Number(form.year) : undefined,
      examName: form.examName || undefined,
      type: "mcq",
      questionText: form.questionText,
      options: form.options.filter((o) => o.trim()),
      correctAnswer: form.correctAnswer,
      explanation: form.explanation,
    };
    try {
      if (editingId) await api(`/questions/${editingId}`, { method: "PUT", body });
      else await api("/questions", { method: "POST", body });
      closeModal();
      fetchQuestions();
    } finally {
      setSaving(false);
    }
  }

  async function doDelete(q) {
    await api(`/questions/${q._id}`, { method: "DELETE" });
    if (questions.length === 1 && page > 1) updateParams({ page: page - 1 });
    else fetchQuestions();
  }

  return (
    <>
      <PageHeader
        title="Question Bank"
        subtitle="পূর্ববর্তী বছরের ও practice প্রশ্ন — filter করে খুঁজুন"
        action={
          <button onClick={openAdd} className="btn-primary">
            + Add question
          </button>
        }
      />

      <div className="mb-5 flex flex-wrap gap-3">
        <select
          className="input max-w-[240px]"
          value={moduleId}
          onChange={(e) => updateParams({ moduleId: e.target.value, page: 1 })}
        >
          <option value="">All modules</option>
          {modules.map((m) => (
            <option key={m._id} value={m._id}>{m.title}</option>
          ))}
        </select>
        <form
          onSubmit={(e) => {
            e.preventDefault();
            updateParams({ year: yearInput.trim(), page: 1 });
          }}
          className="flex gap-2"
        >
          <input
            type="number"
            className="input max-w-[120px]"
            placeholder="Year"
            value={yearInput}
            onChange={(e) => setYearInput(e.target.value)}
          />
          <button className="btn-outline">Go</button>
        </form>
        <select
          className="input max-w-[140px]"
          value={type}
          onChange={(e) => updateParams({ type: e.target.value, page: 1 })}
        >
          <option value="">All types</option>
          <option value="mcq">MCQ</option>
          <option value="written">Written</option>
        </select>
      </div>

      <p className="mb-3 text-sm text-slate-500 dark:text-slate-400">
        {meta.total} questions · page {meta.page} of {meta.totalPages}
      </p>

      {loading ? (
        <GridSkeleton count={5} cols="" />
      ) : questions.length === 0 ? (
        <Empty>কোনো প্রশ্ন পাওয়া যায়নি।</Empty>
      ) : (
        <div className="space-y-3">
          {questions.map((q) => (
            <div key={q._id} className="card">
              <div className="flex items-start justify-between gap-2">
                <div className="flex flex-wrap gap-2 text-xs text-gray-500 dark:text-slate-400">
                  {q.year && <span>{q.year}</span>}
                  {q.examName && <span>· {q.examName}</span>}
                  <span className="badge bg-gray-100 dark:bg-slate-800 text-gray-600 dark:text-slate-300">{q.type}</span>
                </div>
                <RowActions
                  canManage={isOwner(q.createdBy, user)}
                  onEdit={() => openEdit(q)}
                  onDelete={() => setConfirm(q)}
                />
              </div>
              <div className="mt-1 font-medium">{q.questionText}</div>
              {q.options?.length > 0 && (
                <ul className="mt-2 grid gap-1 text-sm sm:grid-cols-2">
                  {q.options.map((o, i) => (
                    <li key={i} className={o === q.correctAnswer ? "font-medium text-green-700" : "text-gray-600 dark:text-slate-300"}>
                      {String.fromCharCode(65 + i)}. {o}
                      {o === q.correctAnswer && " ✓"}
                    </li>
                  ))}
                </ul>
              )}
              {q.explanation && <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">💡 {q.explanation}</p>}
            </div>
          ))}
        </div>
      )}

      <Pagination page={meta.page} totalPages={meta.totalPages} onPage={(n) => updateParams({ page: n })} />

      <Modal
        open={showModal}
        onClose={closeModal}
        title={editingId ? "Edit question" : "Add a question"}
        maxWidth="max-w-2xl"
      >
        <QuestionForm modules={modules} form={form} setForm={setForm} submit={submit} saving={saving} editing={!!editingId} />
      </Modal>

      <ConfirmDialog
        open={!!confirm}
        title="Delete this question?"
        message="প্রশ্নটি স্থায়ীভাবে মুছে যাবে।"
        onConfirm={() => doDelete(confirm)}
        onClose={() => setConfirm(null)}
      />
    </>
  );
}

function QuestionForm({ modules, form, setForm, submit, saving, editing }: any) {
  function setOpt(i, v) {
    setForm((s) => ({ ...s, options: s.options.map((o, idx) => (idx === i ? v : o)) }));
  }
  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <select className="input" value={form.moduleId} onChange={(e) => setForm((s) => ({ ...s, moduleId: e.target.value }))} required>
          <option value="">Select module *</option>
          {modules.map((m) => (
            <option key={m._id} value={m._id}>{m.title}</option>
          ))}
        </select>
        <input type="number" className="input" placeholder="Year" value={form.year} onChange={(e) => setForm((s) => ({ ...s, year: e.target.value }))} />
        <input className="input" placeholder="Exam name" value={form.examName} onChange={(e) => setForm((s) => ({ ...s, examName: e.target.value }))} />
      </div>
      <textarea className="input" rows={2} placeholder="Question text *" value={form.questionText} onChange={(e) => setForm((s) => ({ ...s, questionText: e.target.value }))} required />
      <div className="grid gap-2 sm:grid-cols-2">
        {form.options.map((o, i) => (
          <input key={i} className="input" placeholder={`Option ${String.fromCharCode(65 + i)}`} value={o} onChange={(e) => setOpt(i, e.target.value)} />
        ))}
      </div>
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Correct answer (exact option text)" value={form.correctAnswer} onChange={(e) => setForm((s) => ({ ...s, correctAnswer: e.target.value }))} />
        <input className="input" placeholder="Explanation" value={form.explanation} onChange={(e) => setForm((s) => ({ ...s, explanation: e.target.value }))} />
      </div>
      <div className="flex justify-end">
        <button className="btn-primary" disabled={saving}>
          {saving ? "Saving…" : editing ? "Save changes" : "Add question"}
        </button>
      </div>
    </form>
  );
}
