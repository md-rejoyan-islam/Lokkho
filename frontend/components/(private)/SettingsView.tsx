"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { PageHeader } from "@/components/shared/ui";
import ConfirmDialog from "@/components/shared/ConfirmDialog";
import { api, setAccessToken } from "@/lib/api";
import { useAuth } from "@/lib/auth";
import { useTheme } from "@/lib/theme";
import { Icons } from "@/components/shared/AuthShell";

// Password input with an eye show/hide toggle (icon appears only when there's a value).
function PasswordField({ value, onChange, ...props }: any) {
  const [show, setShow] = useState(false);
  return (
    <div className="relative">
      <input
        type={show ? "text" : "password"}
        className={`input ${value ? "pr-11" : ""}`}
        value={value}
        onChange={onChange}
        {...props}
      />
      {value && (
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Hide password" : "Show password"}
          className="absolute inset-y-0 right-0 grid w-11 place-items-center text-slate-400 transition hover:text-slate-600 dark:hover:text-slate-300"
        >
          {show ? Icons.eyeOff : Icons.eye}
        </button>
      )}
    </div>
  );
}

const TABS = [
  { key: "profile", label: "Profile", icon: "👤" },
  { key: "security", label: "Security", icon: "🔒" },
  { key: "appearance", label: "Appearance", icon: "🎨" },
  { key: "account", label: "Account", icon: "⚠️" },
];

export default function SettingsPage() {
  return (
    <>
      <SettingsContent />
    </>
  );
}

function Banner({ kind, children }: any) {
  const cls =
    kind === "success"
      ? "border-emerald-200 bg-emerald-50 text-emerald-700 dark:border-emerald-900/50 dark:bg-emerald-900/20 dark:text-emerald-300"
      : "border-rose-200 bg-rose-50 text-rose-600 dark:border-rose-900/50 dark:bg-rose-900/20 dark:text-rose-300";
  return <div className={`rounded-lg border px-3.5 py-2.5 text-sm ${cls}`}>{children}</div>;
}

function SettingsContent() {
  const { user, refreshUser, logout } = useAuth();
  const router = useRouter();
  const [tab, setTab] = useState("profile");

  return (
    <>
      <PageHeader title="Settings" subtitle="অ্যাকাউন্ট, নিরাপত্তা ও থিম" />

      {/* Horizontal tab bar */}
      <nav className="mb-6 flex gap-1 overflow-x-auto border-b border-slate-200 dark:border-slate-800">
        {TABS.map((t) => (
          <button
            key={t.key}
            onClick={() => setTab(t.key)}
            className={`flex shrink-0 items-center gap-2 border-b-2 px-4 py-2.5 text-sm font-medium transition -mb-px ${
              tab === t.key
                ? "border-brand-600 text-brand-700 dark:border-brand-400 dark:text-brand-300"
                : "border-transparent text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200"
            }`}
          >
            <span>{t.icon}</span>
            {t.label}
          </button>
        ))}
      </nav>

      {/* Tab content */}
      <div className="max-w-2xl">
        {tab === "profile" && <ProfileTab user={user} refreshUser={refreshUser} />}
        {tab === "security" && <SecurityTab />}
        {tab === "appearance" && <AppearanceTab />}
        {tab === "account" && <AccountTab logout={logout} router={router} />}
      </div>
    </>
  );
}

function ProfileTab({ user, refreshUser }: any) {
  const [name, setName] = useState("");
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);
  const [verifyMsg, setVerifyMsg] = useState(null);

  useEffect(() => {
    if (user) setName(user.name || "");
  }, [user]);

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      await api("/auth/profile", { method: "PUT", body: { name } });
      await refreshUser();
      setMsg({ kind: "success", text: "Name updated." });
    } catch (err) {
      setMsg({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  async function resend() {
    setVerifyMsg(null);
    try {
      await api("/auth/resend-verification", { method: "POST" });
      setVerifyMsg({ kind: "success", text: "Verification email sent." });
    } catch (err) {
      setVerifyMsg({ kind: "error", text: err.message });
    }
  }

  return (
    <div className="space-y-6">
      <div className="card">
        <h2 className="mb-1 text-lg font-semibold">Email</h2>
        <p className="text-sm text-slate-500 dark:text-slate-400">{user?.email}</p>
        <div className="mt-3 flex flex-wrap items-center gap-3">
          {user?.emailVerified ? (
            <span className="badge bg-emerald-100 text-emerald-700">✓ Verified</span>
          ) : (
            <>
              <span className="badge bg-amber-100 text-amber-700">Not verified</span>
              <button onClick={resend} className="btn-outline py-1.5 text-xs">Resend verification</button>
            </>
          )}
        </div>
        {verifyMsg && <div className="mt-3"><Banner kind={verifyMsg.kind}><span className="break-all">{verifyMsg.text}</span></Banner></div>}
      </div>

      <form onSubmit={save} className="card space-y-3">
        <h2 className="text-lg font-semibold">Profile</h2>
        <div>
          <label className="label">Name</label>
          <input className="input" value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        {msg && <Banner kind={msg.kind}>{msg.text}</Banner>}
        <div className="flex justify-end">
          <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Save"}</button>
        </div>
      </form>
    </div>
  );
}

function SecurityTab() {
  const [pw, setPw] = useState({ currentPassword: "", newPassword: "" });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState(null);

  async function save(e) {
    e.preventDefault();
    setMsg(null);
    setSaving(true);
    try {
      const res = await api("/auth/password", { method: "PUT", body: pw });
      if (res.accessToken) setAccessToken(res.accessToken);
      setPw({ currentPassword: "", newPassword: "" });
      setMsg({ kind: "success", text: "Password changed. Other sessions logged out." });
    } catch (err) {
      setMsg({ kind: "error", text: err.message });
    } finally {
      setSaving(false);
    }
  }

  return (
    <form onSubmit={save} className="card space-y-3">
      <h2 className="text-lg font-semibold">Change password</h2>
      <div>
        <label className="label">Current password</label>
        <PasswordField value={pw.currentPassword} onChange={(e) => setPw((p) => ({ ...p, currentPassword: e.target.value }))} required />
      </div>
      <div>
        <label className="label">New password (min 6)</label>
        <PasswordField value={pw.newPassword} onChange={(e) => setPw((p) => ({ ...p, newPassword: e.target.value }))} required />
      </div>
      {msg && <Banner kind={msg.kind}>{msg.text}</Banner>}
      <div className="flex justify-end">
        <button className="btn-primary" disabled={saving}>{saving ? "Saving…" : "Change password"}</button>
      </div>
    </form>
  );
}

const THEME_OPTIONS = [
  { key: "light", label: "Light", desc: "উজ্জ্বল থিম", swatch: "bg-white border-slate-300" },
  { key: "dark", label: "Dark", desc: "গাঢ় থিম", swatch: "bg-slate-900 border-slate-700" },
  { key: "system", label: "System", desc: "OS অনুযায়ী", swatch: "bg-gradient-to-br from-white to-slate-900 border-slate-400" },
];

function AppearanceTab() {
  const { theme, setTheme } = useTheme();
  return (
    <div className="card">
      <h2 className="text-lg font-semibold">Theme</h2>
      <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">আপনার পছন্দের থিম বেছে নিন।</p>
      <div className="mt-4 grid gap-3 sm:grid-cols-3">
        {THEME_OPTIONS.map((o) => (
          <button
            key={o.key}
            onClick={() => setTheme(o.key)}
            className={`rounded-xl border p-4 text-left transition ${
              theme === o.key
                ? "border-brand-500 ring-2 ring-brand-500/20"
                : "border-slate-200 hover:border-slate-300 dark:border-slate-700 dark:hover:border-slate-600"
            }`}
          >
            <div className={`mb-3 h-12 w-full rounded-lg border ${o.swatch}`} />
            <div className="flex items-center justify-between">
              <span className="font-semibold">{o.label}</span>
              {theme === o.key && <span className="text-brand-600 dark:text-brand-400">✓</span>}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">{o.desc}</div>
          </button>
        ))}
      </div>
    </div>
  );
}

function AccountTab({ logout, router }: any) {
  const [confirmDelete, setConfirmDelete] = useState(false);

  async function deleteAccount() {
    await api("/auth/account", { method: "DELETE" });
    setAccessToken(null);
    router.push("/register");
  }

  return (
    <div className="space-y-6">
      <div className="card border-rose-200 dark:border-rose-900/50">
        <h2 className="text-lg font-semibold text-rose-600">Danger zone</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
          অ্যাকাউন্ট মুছলে আপনার সব personal data (progress, notes, planner, applications) স্থায়ীভাবে চলে যাবে।
        </p>
        <button onClick={() => setConfirmDelete(true)} className="btn-danger mt-3">Delete account</button>
      </div>

      <div className="card">
        <h2 className="text-lg font-semibold">Session</h2>
        <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">এই device থেকে log out করুন।</p>
        <button onClick={logout} className="btn-outline mt-3">Logout</button>
      </div>

      <ConfirmDialog
        open={confirmDelete}
        title="Delete your account?"
        message="এই কাজটি ফেরানো যাবে না — সব personal data মুছে যাবে।"
        confirmLabel="Delete account"
        onConfirm={deleteAccount}
        onClose={() => setConfirmDelete(false)}
      />
    </div>
  );
}
