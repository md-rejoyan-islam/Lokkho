"use client";

import { STATUS_META, JOB_CATEGORY_META } from "@/lib/constants";

export function StatusBadge({ status }: any) {
  const meta = STATUS_META[status] || STATUS_META.not_started;
  return <span className={`badge ${meta.cls}`}>{meta.label}</span>;
}

export function JobBadge({ category }: any) {
  const meta = JOB_CATEGORY_META[category] || JOB_CATEGORY_META.other;
  return <span className={`badge ${meta.cls}`}>{meta.label}</span>;
}

export function PageHeader({ title, subtitle, action }: any) {
  return (
    <div className="mb-7 flex flex-wrap items-end justify-between gap-4 border-b border-slate-200/70 pb-5 dark:border-slate-800">
      <div>
        <h1 className="text-[1.6rem] font-bold leading-tight tracking-tight text-slate-900 dark:text-slate-50">
          {title}
        </h1>
        {subtitle && <p className="mt-1.5 text-sm text-slate-500 dark:text-slate-400">{subtitle}</p>}
      </div>
      {action && <div className="flex flex-wrap items-center gap-2">{action}</div>}
    </div>
  );
}

export function Empty({ children }: any) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white/60 py-14 text-center text-sm text-slate-500 dark:border-slate-700 dark:bg-slate-900/40 dark:text-slate-400">
      {children}
    </div>
  );
}

export function ErrorText({ children }: any) {
  if (!children) return null;
  return <p className="mt-2 text-sm text-red-600">{children}</p>;
}

const EditIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M12 20h9M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);
const TrashIcon = (
  <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// Edit + delete icon buttons, shown only when `canManage` (owner).
export function RowActions({ canManage, onEdit, onDelete }: any) {
  if (!canManage) return null;
  return (
    <div className="flex items-center gap-1">
      {onEdit && (
        <button
          onClick={onEdit}
          aria-label="Edit"
          className="rounded-md p-1.5 text-gray-400 dark:text-slate-500 transition hover:bg-brand-50 dark:hover:bg-brand-500/15 hover:text-brand-600"
        >
          {EditIcon}
        </button>
      )}
      {onDelete && (
        <button
          onClick={onDelete}
          aria-label="Delete"
          className="rounded-md p-1.5 text-gray-400 dark:text-slate-500 transition hover:bg-red-50 dark:hover:bg-red-500/10 hover:text-red-600"
        >
          {TrashIcon}
        </button>
      )}
    </div>
  );
}

export function ProgressBar({ value }: any) {
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-gray-200">
      <div
        className="h-full rounded-full bg-brand-500 transition-all"
        style={{ width: `${Math.min(100, Math.max(0, value))}%` }}
      />
    </div>
  );
}
