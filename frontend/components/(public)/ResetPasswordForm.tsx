"use client";

import { Suspense, useState } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { AuthField, Icons, PasswordToggle } from "@/components/shared/AuthShell";
import { api } from "@/lib/api";

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={null}>
      <ResetContent />
    </Suspense>
  );
}

function ResetContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token") || "";

  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await api("/auth/reset-password", {
        method: "POST",
        auth: false,
        body: { token, password },
      });
      setDone(true);
      setTimeout(() => router.push("/login"), 1500);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      {!token ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          এই link অবৈধ — token নেই। আবার reset request করুন।
        </div>
      ) : done ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          Password reset হয়েছে! login পেজে নিয়ে যাচ্ছি…
        </div>
      ) : (
        <form onSubmit={onSubmit} className="space-y-5">
          <AuthField
            label="New password"
            type={show ? "text" : "password"}
            icon={Icons.lock}
            placeholder="কমপক্ষে ৬ অক্ষর"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            rightSlot={password ? <PasswordToggle show={show} onToggle={() => setShow((s) => !s)} /> : null}
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
            {busy ? "Resetting…" : "Reset password"}
          </button>
        </form>
      )}
    </>
  );
}
