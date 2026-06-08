"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AuthField, Icons, PasswordToggle } from "@/components/shared/AuthShell";

export default function RegisterPage() {
  const { register } = useAuth();
  const router = useRouter();
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await register(form.name, form.email, form.password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.details?.map((d) => d.message).join(", ") || err.message);
    } finally {
      setBusy(false);
    }
  }

  const pwLen = form.password.length;
  const strength = pwLen === 0 ? 0 : pwLen < 6 ? 1 : pwLen < 10 ? 2 : 3;
  const strengthMeta = [
    { label: "", cls: "" },
    { label: "Weak", cls: "bg-red-500 w-1/3" },
    { label: "Good", cls: "bg-amber-500 w-2/3" },
    { label: "Strong", cls: "bg-green-500 w-full" },
  ][strength];

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField
          label="Full name"
          icon={Icons.user}
          placeholder="আপনার নাম"
          value={form.name}
          onChange={(e) => update("name", e.target.value)}
          required
          autoComplete="name"
        />
        <AuthField
          label="Email"
          type="email"
          icon={Icons.mail}
          placeholder="you@example.com"
          value={form.email}
          onChange={(e) => update("email", e.target.value)}
          required
          autoComplete="email"
        />
        <div>
          <AuthField
            label="Password"
            type={show ? "text" : "password"}
            icon={Icons.lock}
            placeholder="কমপক্ষে ৬ অক্ষর"
            value={form.password}
            onChange={(e) => update("password", e.target.value)}
            required
            autoComplete="new-password"
            rightSlot={form.password ? <PasswordToggle show={show} onToggle={() => setShow((s) => !s)} /> : null}
          />
          {pwLen > 0 && (
            <div className="mt-2 flex items-center gap-2">
              <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-gray-200">
                <div className={`h-full rounded-full transition-all ${strengthMeta.cls}`} />
              </div>
              <span className="text-xs text-gray-400 dark:text-slate-500">{strengthMeta.label}</span>
            </div>
          )}
        </div>

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 px-3.5 py-2.5 text-sm text-red-600">
            {error}
          </div>
        )}

        <button
          className="flex w-full items-center justify-center gap-2 rounded-md bg-brand-600 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-700 disabled:opacity-60"
          disabled={busy}
        >
          {busy ? "Creating account…" : "Create account"}
        </button>

        <p className="text-center text-xs text-gray-400 dark:text-slate-500">
          Register করার মাধ্যমে আপনি আমাদের terms মেনে নিচ্ছেন।
        </p>
      </form>
    </>
  );
}
