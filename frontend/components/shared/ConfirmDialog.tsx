"use client";

import { useState } from "react";
import Modal from "./Modal";

// Delete-confirmation dialog. `onConfirm` may be async; errors are surfaced inline.
export default function ConfirmDialog({
  open,
  title = "Delete entry?",
  message,
  confirmLabel = "Delete",
  onConfirm,
  onClose,
}: any) {
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  async function handle() {
    setBusy(true);
    setError("");
    try {
      await onConfirm();
      onClose();
    } catch (e) {
      setError(e.message || "Delete failed");
    } finally {
      setBusy(false);
    }
  }

  return (
    <Modal open={open} onClose={busy ? () => {} : onClose} title={title} maxWidth="max-w-sm">
      <div className="flex gap-3">
        <span className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-red-100 text-red-600">
          <svg viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </span>
        <p className="pt-1 text-sm text-gray-600 dark:text-slate-300">
          {message || "এই এন্ট্রিটি স্থায়ীভাবে মুছে যাবে। আপনি কি নিশ্চিত?"}
        </p>
      </div>

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}

      <div className="mt-5 flex justify-end gap-2">
        <button onClick={onClose} className="btn-outline" disabled={busy}>
          Cancel
        </button>
        <button onClick={handle} className="btn-danger" disabled={busy}>
          {busy ? "Deleting…" : confirmLabel}
        </button>
      </div>
    </Modal>
  );
}
