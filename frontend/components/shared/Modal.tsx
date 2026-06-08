"use client";

import { useEffect } from "react";

// Generic centered modal/dialog. Closes on overlay click or Escape.
export default function Modal({ open, onClose, title, children, maxWidth = "max-w-lg" }: any) {
  useEffect(() => {
    if (!open) return;
    function onKey(e) {
      if (e.key === "Escape") onClose?.();
    }
    window.addEventListener("keydown", onKey);
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = "";
    };
  }, [open, onClose]);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-start justify-center overflow-y-auto p-4 sm:items-center">
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm" onClick={onClose} />
      <div
        role="dialog"
        aria-modal="true"
        className={`relative z-10 w-full ${maxWidth} rounded-lg border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-xl`}
      >
        <div className="flex items-center justify-between border-b border-gray-100 dark:border-slate-800 px-5 py-3.5">
          <h3 className="text-base font-semibold text-gray-900 dark:text-slate-100">{title}</h3>
          <button
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1.5 text-gray-400 dark:text-slate-500 transition hover:bg-gray-100 dark:hover:bg-slate-800 hover:text-gray-600 dark:hover:text-slate-300"
          >
            <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 6l12 12M18 6L6 18" strokeLinecap="round" />
            </svg>
          </button>
        </div>
        <div className="px-5 py-4">{children}</div>
      </div>
    </div>
  );
}
