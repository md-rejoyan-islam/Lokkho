"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { AuthField, Icons, PasswordToggle } from "@/components/shared/AuthShell";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [show, setShow] = useState(false);
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  async function onSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await login(email, password);
      router.replace("/dashboard");
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  function fillDemo() {
    setEmail("demo@lokkho.com");
    setPassword("demo123");
  }

  return (
    <>
      <form onSubmit={onSubmit} className="space-y-5">
        <AuthField
          label="Email"
          type="email"
          icon={Icons.mail}
          placeholder="you@example.com"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          autoComplete="email"
        />
        <AuthField
          label="Password"
          type={show ? "text" : "password"}
          icon={Icons.lock}
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          autoComplete="current-password"
          rightSlot={password ? <PasswordToggle show={show} onToggle={() => setShow((s) => !s)} /> : null}
        />

        <div className="text-right">
          <Link href="/forgot-password" className="text-xs font-medium text-brand-600 hover:text-brand-700 dark:text-brand-400">
            Forgot password?
          </Link>
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
          {busy ? "Logging in…" : "Login"}
        </button>
      </form>

      <button
        onClick={fillDemo}
        type="button"
        className="mt-4 flex w-full items-center justify-center gap-2 rounded-md border border-dashed border-gray-300 dark:border-slate-700 py-2.5 text-xs font-medium text-gray-500 dark:text-slate-400 transition hover:border-brand-300 hover:text-brand-600"
      >
        ✨ Demo দিয়ে চেষ্টা করুন
      </button>
      <p className="mt-2 text-center text-[11px] leading-relaxed text-gray-400 dark:text-slate-500">
        Email: <span className="font-medium text-gray-500 dark:text-slate-300">demo@lokkho.com</span>
        {" · "}
        Password: <span className="font-medium text-gray-500 dark:text-slate-300">demo123</span>
      </p>
    </>
  );
}
