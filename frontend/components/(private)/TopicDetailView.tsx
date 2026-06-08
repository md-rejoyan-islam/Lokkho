"use client";

import { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { PageHeader, Empty, RowActions } from "@/components/shared/ui";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { DetailSkeleton } from "@/components/shared/Skeleton";
import { api } from "@/lib/api";
import { PROGRESS_STATUSES, STATUS_META } from "@/lib/constants";

export default function TopicDetailPage() {
  return (
    <>
      <TopicDetailContent />
    </>
  );
}

function TopicDetailContent() {
  const { id } = useParams();
  const [topic, setTopic] = useState(null);
  const [status, setStatusState] = useState("not_started");
  const [notes, setNotes] = useState([]);
  const [questions, setQuestions] = useState([]);
  const [noteForm, setNoteForm] = useState({ title: "", content: "" });
  const [editingNoteId, setEditingNoteId] = useState(null);
  const [confirmNote, setConfirmNote] = useState(null);

  async function load() {
    const t = await api(`/topics/${id}`);
    setTopic(t.topic);
    const [n, q, p] = await Promise.all([
      api(`/notes?topicId=${id}`),
      api(`/questions?topicId=${id}`),
      api(`/progress?moduleId=${t.topic.moduleId}`).catch(() => ({ progress: [] })),
    ]);
    setNotes(n.notes);
    setQuestions(q.questions);
    const pr = p.progress.find((x) => (x.topicId?._id || x.topicId) === id);
    if (pr) setStatusState(pr.status);
  }

  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id]);

  async function setStatus(s) {
    setStatusState(s);
    await api(`/progress/${id}`, { method: "PUT", body: { status: s } });
  }

  async function saveNote(e) {
    e.preventDefault();
    if (!noteForm.title.trim()) return;
    const body = { topicId: id, title: noteForm.title, content: noteForm.content };
    if (editingNoteId) await api(`/notes/${editingNoteId}`, { method: "PUT", body });
    else await api("/notes", { method: "POST", body });
    cancelNoteEdit();
    const n = await api(`/notes?topicId=${id}`);
    setNotes(n.notes);
  }

  function openNoteEdit(note) {
    setEditingNoteId(note._id);
    setNoteForm({ title: note.title || "", content: note.content || "" });
  }

  function cancelNoteEdit() {
    setEditingNoteId(null);
    setNoteForm({ title: "", content: "" });
  }

  async function deleteNote(note) {
    await api(`/notes/${note._id}`, { method: "DELETE" });
    setNotes((ns) => ns.filter((n) => n._id !== note._id));
  }

  if (!topic) return <DetailSkeleton />;

  return (
    <>
      <PageHeader
        title={topic.title}
        subtitle={`${topic.priority} priority · ${topic.difficulty} difficulty`}
      />

      <div className="mb-6">
        <div className="mb-2 text-sm font-medium text-gray-700 dark:text-slate-300">Your progress</div>
        <div className="flex flex-wrap gap-2">
          {PROGRESS_STATUSES.map((s) => (
            <button
              key={s}
              onClick={() => setStatus(s)}
              className={`badge cursor-pointer ${
                status === s ? STATUS_META[s].cls : "bg-gray-50 dark:bg-slate-800/60 text-gray-500 dark:text-slate-400 hover:bg-gray-100 dark:hover:bg-slate-800"
              }`}
            >
              {STATUS_META[s].label}
            </button>
          ))}
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <div>
          <h2 className="mb-3 text-lg font-semibold">My Notes</h2>
          <form onSubmit={saveNote} className="card mb-3 space-y-2">
            {editingNoteId && (
              <div className="text-xs font-medium text-brand-600 dark:text-brand-400">Editing note…</div>
            )}
            <input
              className="input"
              placeholder="Note title"
              value={noteForm.title}
              onChange={(e) => setNoteForm((f) => ({ ...f, title: e.target.value }))}
            />
            <textarea
              className="input"
              rows={3}
              placeholder="Write your note…"
              value={noteForm.content}
              onChange={(e) => setNoteForm((f) => ({ ...f, content: e.target.value }))}
            />
            <div className="flex gap-2">
              <button className="btn-primary flex-1">
                {editingNoteId ? "Save changes" : "Save note"}
              </button>
              {editingNoteId && (
                <button type="button" onClick={cancelNoteEdit} className="btn-outline">
                  Cancel
                </button>
              )}
            </div>
          </form>
          <div className="space-y-2">
            {notes.length === 0 && <Empty>কোনো নোট নেই।</Empty>}
            {notes.map((n) => (
              <div key={n._id} className="card">
                <div className="flex items-start justify-between gap-2">
                  <div className="font-semibold">{n.title}</div>
                  <RowActions
                    canManage
                    onEdit={() => openNoteEdit(n)}
                    onDelete={() => setConfirmNote(n)}
                  />
                </div>
                {n.content && (
                  <p className="mt-1 whitespace-pre-wrap text-sm text-gray-600 dark:text-slate-300">
                    {n.content}
                  </p>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="mb-3 text-lg font-semibold">Related Questions</h2>
          <div className="space-y-2">
            {questions.length === 0 && <Empty>এই topic-এ কোনো প্রশ্ন নেই।</Empty>}
            {questions.map((q) => (
              <div key={q._id} className="card">
                <div className="font-medium">{q.questionText}</div>
                {q.options?.length > 0 && (
                  <ul className="mt-2 space-y-1 text-sm">
                    {q.options.map((o, i) => (
                      <li
                        key={i}
                        className={
                          o === q.correctAnswer
                            ? "font-medium text-green-700"
                            : "text-gray-600 dark:text-slate-300"
                        }
                      >
                        {String.fromCharCode(65 + i)}. {o}
                        {o === q.correctAnswer && " ✓"}
                      </li>
                    ))}
                  </ul>
                )}
                {q.explanation && (
                  <p className="mt-2 text-xs text-gray-500 dark:text-slate-400">💡 {q.explanation}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      <ConfirmDialog
        open={!!confirmNote}
        title="Delete this note?"
        message={confirmNote ? `"${confirmNote.title}" নোটটি মুছে যাবে।` : ""}
        onConfirm={() => deleteNote(confirmNote)}
        onClose={() => setConfirmNote(null)}
      />
    </>
  );
}
