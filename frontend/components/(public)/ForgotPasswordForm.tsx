"use client";

import { useState } from "react";
import { AuthField, Icons } from "@/components/shared/AuthShell";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/auth/forgot-password", {
        method: "POST",
        auth: false,
        body: { email },
      });
      setDone(true);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {done ? (
        <div className="space-y-4">
          <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            যদি এই email-এ অ্যাকাউন্ট থাকে, একটি reset link পাঠানো হয়েছে। inbox চেক করুন।
          </div>
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField
            label="Email"
            type="email"
            icon={Icons.mail}
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          {error && (
            <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
              {error}
            </div>
          )}
          <button
            className="flex w-full items-center justify-center rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white transition hover:bg-brand-700 disabled:opacity-60"
            disabled={busy}
          >
            {busy ? "Sending…" : "Send reset link"}
          </button>
        </form>
      )}
    </>
  );
}
