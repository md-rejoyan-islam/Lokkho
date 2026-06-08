"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import Modal from "@/components/shared/Modal";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { DetailSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { MODULE_CATEGORIES, PROGRESS_STATUSES, STATUS_META, isOwner as checkOwner } from "@/lib/constants";

export default function ExamGuideDetailPage() {
  return (
    <>
      <Content />
    </>
  );
}

function Content() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [module, setModule] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [progressMap, setProgressMap] = useState({});

  // modals
  const [showInfo, setShowInfo] = useState(false);
  const [subjectModal, setSubjectModal] = useState(null); // {mode, data}
  const [confirmSubject, setConfirmSubject] = useState(null);
  const [confirmGuide, setConfirmGuide] = useState(false);

  async function deleteGuide() {
    await api(`/modules/${id}`, { method: "DELETE" });
    router.push("/modules");
  }

  async function load() {
    const d = await api(`/modules/${id}`);
    setModule(d.module);
    setSubjects(d.subjects);
    if (user) {
      const p = await api(`/subject-progress?moduleId=${id}`).catch(() => ({ progress: [] }));
      const map = {};
      for (const pr of p.progress) map[pr.subjectId] = pr.status;
      setProgressMap(map);
    }
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  if (!module) return <DetailSkeleton />;

  const owner = checkOwner(module.createdBy, user);

  async function setStatus(subjectId, status) {
    setProgressMap((m) => ({ ...m, [subjectId]: status }));
    await api(`/subject-progress/${subjectId}`, { method: "PUT", body: { status } });
  }

  async function savePattern(rows) {
    const examPattern = rows
      .filter((r) => r.section.trim())
      .map((r) => ({
        section: r.section,
        marks: Number(r.marks) || 0,
        questionCount: Number(r.questionCount) || 0,
      }));
    await api(`/modules/${id}`, { method: "PUT", body: { examPattern } });
    load();
  }

  async function saveSubject(form) {
    if (subjectModal.mode === "edit") {
      await api(`/subjects/${subjectModal.data._id}`, {
        method: "PUT",
        body: { name: form.name, marks: Number(form.marks) || 0, note: form.note },
      });
    } else {
      await api(`/modules/${id}/subjects`, {
        method: "POST",
        body: { name: form.name, marks: Number(form.marks) || 0, note: form.note },
      });
    }
    setSubjectModal(null);
    load();
  }

  async function deleteSubject(s) {
    await api(`/subjects/${s._id}`, { method: "DELETE" });
    load();
  }

  async function saveInfo(form) {
    await api(`/modules/${id}`, {
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
    setShowInfo(false);
    load();
  }

  const hasRequirements = module.minCgpa || module.degree || module.eligibility;

  return (
    <>
      <PageHeader
        title={module.title}
        subtitle={`${module.category} · ${module.totalMarks || 0} marks · ${module.durationMinutes || 0} min`}
        action={
          owner && (
            <div className="flex gap-2">
              <button onClick={() => setShowInfo(true)} className="btn-outline">
                ✏️ Edit guide
              </button>
              <button onClick={() => setConfirmGuide(true)} className="btn-danger">
                🗑️ Delete
              </button>
            </div>
          )
        }
      />
      {module.description && <p className="mb-6 text-gray-600 dark:text-slate-300">{module.description}</p>}

      {/* Minimum requirements */}
      {hasRequirements && (
        <div className="card mb-6">
          <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
            Minimum Requirement to Apply
          </h2>
          <div className="grid gap-4 sm:grid-cols-3">
            <Req label="Minimum CGPA" value={module.minCgpa} />
            <Req label="Degree" value={module.degree} />
            <Req label="Eligibility" value={module.eligibility} />
          </div>
        </div>
      )}

      <div className="space-y-8">
        <MarkDistribution module={module} owner={owner} onSave={savePattern} />

        <div>
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold">Subjects</h2>
            <button
              onClick={() => setSubjectModal({ mode: "add", data: { name: "", marks: "", note: "" } })}
              className="btn-primary py-1.5 text-xs"
            >
              + Add subject
            </button>
          </div>

          <div className="space-y-2">
            {subjects.length === 0 && <Empty>কোনো subject নেই।</Empty>}
            {subjects.map((s) => (
              <div key={s._id} className="rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{s.name}</span>
                      {s.marks > 0 && <span className="text-xs text-gray-400 dark:text-slate-500">{s.marks} marks</span>}
                    </div>
                    {s.note && <p className="mt-1 text-sm text-gray-600 dark:text-slate-300">{s.note}</p>}
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <Link
                      href={`/modules/${id}/subjects/${s._id}`}
                      className="rounded-md px-2 py-1 text-xs font-medium text-brand-600 dark:text-brand-400 hover:bg-brand-50 dark:hover:bg-brand-500/15"
                    >
                      Topics →
                    </Link>
                    {checkOwner(s.createdBy, user) && (
                      <RowActions
                        canManage
                        onEdit={() => setSubjectModal({ mode: "edit", data: { _id: s._id, name: s.name, marks: s.marks || "", note: s.note || "" } })}
                        onDelete={() => setConfirmSubject(s)}
                      />
                    )}
                  </div>
                </div>

                {/* Personal study status */}
                <div className="mt-3 flex flex-wrap gap-1">
                  {PROGRESS_STATUSES.map((st) => {
                    const cur = progressMap[s._id] || "not_started";
                    return (
                      <button
                        key={st}
                        onClick={() => setStatus(s._id, st)}
                        className={`badge cursor-pointer ${
                          cur === st ? STATUS_META[st].cls : "bg-gray-50 dark:bg-slate-800/60 text-gray-400 dark:text-slate-500 hover:bg-gray-100 dark:hover:bg-slate-800"
                        }`}
                      >
                        {STATUS_META[st].label}
                      </button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Edit guide info modal */}
      {showInfo && (
        <Modal open onClose={() => setShowInfo(false)} title="Edit exam guide" maxWidth="max-w-2xl">
          <InfoForm module={module} onSave={saveInfo} onClose={() => setShowInfo(false)} />
        </Modal>
      )}

      {/* Add/Edit subject modal */}
      {subjectModal && (
        <Modal open onClose={() => setSubjectModal(null)} title={subjectModal.mode === "edit" ? "Edit subject" : "Add subject"}>
          <SubjectForm initial={subjectModal.data} onSave={saveSubject} onClose={() => setSubjectModal(null)} />
        </Modal>
      )}

      <ConfirmDialog
        open={!!confirmSubject}
        title="Delete this subject?"
        message={confirmSubject ? `"${confirmSubject.name}" ও এর সব topic মুছে যাবে।` : ""}
        onConfirm={() => deleteSubject(confirmSubject)}
        onClose={() => setConfirmSubject(null)}
      />

      <ConfirmDialog
        open={confirmGuide}
        title="Delete this exam guide?"
        message={`"${module.title}" ও এর সব subject/topic স্থায়ীভাবে মুছে যাবে।`}
        onConfirm={deleteGuide}
        onClose={() => setConfirmGuide(false)}
      />
    </>
  );
}

function Req({ label, value }: any) {
  return (
    <div>
      <div className="text-xs text-gray-400 dark:text-slate-500">{label}</div>
      <div className="text-sm font-medium text-gray-800 dark:text-slate-200">{value || "—"}</div>
    </div>
  );
}

function MarkDistribution({ module, owner, onSave }: any) {
  const [editing, setEditing] = useState(false);
  const [rows, setRows] = useState([]);
  const [busy, setBusy] = useState(false);

  function startEdit() {
    setRows(
      (module.examPattern || []).map((r) => ({
        section: r.section,
        marks: String(r.marks ?? ""),
        questionCount: String(r.questionCount ?? ""),
      }))
    );
    setEditing(true);
  }
  function setRow(i, k, v) {
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, [k]: v } : r)));
  }
  const addRow = () => setRows((rs) => [...rs, { section: "", marks: "", questionCount: "" }]);
  const removeRow = (i) => setRows((rs) => rs.filter((_, idx) => idx !== i));

  async function save() {
    setBusy(true);
    try {
      await onSave(rows);
      setEditing(false);
    } finally {
      setBusy(false);
    }
  }

  return (
    <div>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-lg font-semibold">Mark Distribution</h2>
        {owner && !editing && (
          <button onClick={startEdit} className="btn-outline py-1.5 text-xs">
            ✏️ Edit
          </button>
        )}
      </div>

      {!editing ? (
        <div className="card overflow-hidden p-0">
          {module.examPattern?.length ? (
            <table className="w-full text-sm">
              <thead className="bg-gray-50 dark:bg-slate-800/60 text-left text-xs uppercase text-gray-500 dark:text-slate-400">
                <tr>
                  <th className="px-4 py-2">Section</th>
                  <th className="px-4 py-2">Marks</th>
                  <th className="px-4 py-2">Questions</th>
                </tr>
              </thead>
              <tbody>
                {module.examPattern.map((r, i) => (
                  <tr key={i} className="border-t border-gray-100 dark:border-slate-800">
                    <td className="px-4 py-2 font-medium">{r.section}</td>
                    <td className="px-4 py-2">{r.marks}</td>
                    <td className="px-4 py-2">{r.questionCount}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          ) : (
            <p className="p-4 text-sm text-gray-500 dark:text-slate-400">কোনো mark distribution যোগ করা হয়নি।</p>
          )}
        </div>
      ) : (
        <div className="card space-y-2">
          {rows.map((r, i) => (
            <div key={i} className="flex gap-2">
              <input className="input flex-1" placeholder="Section" value={r.section} onChange={(e) => setRow(i, "section", e.target.value)} />
              <input type="number" className="input w-20" placeholder="Marks" value={r.marks} onChange={(e) => setRow(i, "marks", e.target.value)} />
              <input type="number" className="input w-16" placeholder="Qs" value={r.questionCount} onChange={(e) => setRow(i, "questionCount", e.target.value)} />
              <button type="button" onClick={() => removeRow(i)} className="px-2 text-gray-400 dark:text-slate-500 hover:text-red-600">✕</button>
            </div>
          ))}
          <button type="button" onClick={addRow} className="btn-outline w-full py-1.5 text-xs">
            + Add section
          </button>
          <div className="flex justify-end gap-2 pt-1">
            <button onClick={() => setEditing(false)} className="btn-outline" disabled={busy}>Cancel</button>
            <button onClick={save} className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
          </div>
        </div>
      )}
    </div>
  );
}

function SubjectForm({ initial, onSave, onClose }: any) {
  const [form, setForm] = useState({ name: initial.name || "", marks: initial.marks ?? "", note: initial.note || "" });
  const [busy, setBusy] = useState(false);

  async function submit(e) {
    e.preventDefault();
    if (!form.name.trim()) return;
    setBusy(true);
    try {
      await onSave(form);
    } finally {
      setBusy(false);
    }
  }

  return (
    <form onSubmit={submit} className="space-y-3">
      <div className="grid gap-3 sm:grid-cols-3">
        <input className="input sm:col-span-2" placeholder="Subject name * (e.g. English)" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} required />
        <input type="number" className="input" placeholder="Marks" value={form.marks} onChange={(e) => setForm((f) => ({ ...f, marks: e.target.value }))} />
      </div>
      <textarea className="input" rows={3} placeholder="Note (e.g. কোন টপিক বেশি আসে, টিপস…)" value={form.note} onChange={(e) => setForm((f) => ({ ...f, note: e.target.value }))} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save"}</button>
      </div>
    </form>
  );
}

function InfoForm({ module, onSave, onClose }: any) {
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
        <input className="input" placeholder="Category (e.g. BCS)" list="module-categories" value={form.category} onChange={(e) => set("category", e.target.value)} />
        <datalist id="module-categories">
          {MODULE_CATEGORIES.map((c) => <option key={c} value={c} />)}
        </datalist>
        <input type="number" className="input" placeholder="Total marks" value={form.totalMarks} onChange={(e) => set("totalMarks", e.target.value)} />
        <input type="number" className="input" placeholder="Duration (min)" value={form.durationMinutes} onChange={(e) => set("durationMinutes", e.target.value)} />
      </div>
      <textarea className="input" rows={2} placeholder="Description" value={form.description} onChange={(e) => set("description", e.target.value)} />
      <div className="grid gap-3 sm:grid-cols-2">
        <input className="input" placeholder="Minimum CGPA (e.g. 2.50)" value={form.minCgpa} onChange={(e) => set("minCgpa", e.target.value)} />
        <input className="input" placeholder="Degree required" value={form.degree} onChange={(e) => set("degree", e.target.value)} />
      </div>
      <textarea className="input" rows={2} placeholder="Eligibility / other requirements" value={form.eligibility} onChange={(e) => set("eligibility", e.target.value)} />
      <div className="flex justify-end gap-2">
        <button type="button" onClick={onClose} className="btn-outline">Cancel</button>
        <button className="btn-primary" disabled={busy}>{busy ? "Saving…" : "Save changes"}</button>
      </div>
    </form>
  );
}
