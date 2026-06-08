"use client";

import Link from "next/link";

const FEATURES = [
  {
    title: "Smart progress tracking",
    desc: "প্রতিটি topic-এর status, revision ও weak area এক নজরে।",
  },
  {
    title: "Community exam modules",
    desc: "BCS, Bank, Primary, Railway সহ যেকোনো module — pattern ও mark distribution সহ।",
  },
  {
    title: "Question bank & planner",
    desc: "পূর্ববর্তী বছরের প্রশ্ন, daily study plan ও mock test।",
  },
];

// Premium split-screen layout shared by login & register.
export default function AuthShell({ title, subtitle, children, footer }: any) {
  return (
    <div className="flex min-h-screen bg-white dark:bg-slate-900">
      {/* Brand panel — hidden on small screens */}
      <aside className="relative hidden w-1/2 flex-col justify-between overflow-hidden bg-gradient-to-br from-brand-500 via-brand-600 to-brand-900 p-12 text-white lg:flex">
        {/* decorative glows */}
        <div className="pointer-events-none absolute -right-24 -top-24 h-80 w-80 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-32 -left-20 h-96 w-96 rounded-full bg-brand-300/20 blur-3xl" />

        <div className="relative z-10 flex items-center gap-2 text-xl font-bold">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-white/15 backdrop-blur">
            📚
          </span>
          Lokkho
        </div>

        <div className="relative z-10 max-w-md">
          <h2 className="text-3xl font-bold leading-snug">
            আপনার চাকরির প্রস্তুতি,
            <br />
            এক জায়গায় সাজানো।
          </h2>
          <p className="mt-3 text-sm text-white/70">
            পড়া কতটুকু হলো, কী বাকি, কোথায় দুর্বল — সব track করুন একটি smart
            workspace-এ।
          </p>

          <ul className="mt-8 space-y-5">
            {FEATURES.map((f) => (
              <li key={f.title} className="flex gap-3">
                <span className="mt-0.5 grid h-6 w-6 shrink-0 place-items-center rounded-full bg-white/15">
                  <svg viewBox="0 0 20 20" className="h-3.5 w-3.5 fill-white">
                    <path d="M16.7 5.3a1 1 0 010 1.4l-7.5 7.5a1 1 0 01-1.4 0L3.3 9.7a1 1 0 011.4-1.4l3.1 3.1 6.8-6.8a1 1 0 011.4 0z" />
                  </svg>
                </span>
                <div>
                  <div className="font-semibold">{f.title}</div>
                  <div className="text-sm text-white/65">{f.desc}</div>
                </div>
              </li>
            ))}
          </ul>
        </div>

        <div className="relative z-10 text-xs text-white/50">
          © {new Date().getFullYear()} Lokkho — প্রস্তুতি হোক পরিকল্পিত।
        </div>
      </aside>

      {/* Form panel */}
      <main className="flex w-full flex-col items-center justify-center px-6 py-12 lg:w-1/2">
        <div className="w-full max-w-sm">
          {/* mobile logo */}
          <div className="mb-8 flex items-center gap-2 text-lg font-bold text-brand-600 dark:text-brand-400 lg:hidden">
            <span className="grid h-8 w-8 place-items-center rounded-lg bg-brand-50 dark:bg-brand-500/15">
              📚
            </span>
            Lokkho
          </div>

          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-slate-100">
            {title}
          </h1>
          {subtitle && <p className="mt-1.5 text-sm text-gray-500 dark:text-slate-400">{subtitle}</p>}

          <div className="mt-8">{children}</div>

          {footer && (
            <p className="mt-6 text-center text-sm text-gray-500 dark:text-slate-400">{footer}</p>
          )}
        </div>
      </main>
    </div>
  );
}

export function AuthField({ label, hint, icon, rightSlot, ...props }: any) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-gray-700 dark:text-slate-300">
        {label}
      </label>
      <div className="relative">
        {icon && (
          <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 dark:text-slate-500">
            {icon}
          </span>
        )}
        <input
          {...props}
          className={`w-full rounded-md border border-gray-300 dark:border-slate-700 bg-gray-50/50 dark:bg-slate-800/50 py-2.5 text-sm text-gray-900 dark:text-slate-100 outline-none transition placeholder:text-gray-400 dark:placeholder:text-slate-500 focus:border-brand-500 focus:bg-white dark:focus:bg-slate-800 focus:ring-4 focus:ring-brand-100 dark:focus:ring-brand-500/20 ${
            icon ? "pl-10" : "pl-3.5"
          } ${rightSlot ? "pr-11" : "pr-3.5"}`}
        />
        {rightSlot && (
          <div className="absolute right-2 top-1/2 -translate-y-1/2">
            {rightSlot}
          </div>
        )}
      </div>
      {hint && <p className="mt-1 text-xs text-gray-400 dark:text-slate-500">{hint}</p>}
    </div>
  );
}

export const Icons = {
  mail: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </svg>
  ),
  lock: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <rect x="4" y="11" width="16" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  ),
  user: (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <circle cx="12" cy="8" r="4" />
      <path d="M4 20a8 8 0 0 1 16 0" />
    </svg>
  ),
  eye: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ),
  eyeOff: (
    <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9.9 4.2A10.9 10.9 0 0 1 12 4c6.5 0 10 7 10 7a18 18 0 0 1-3.2 4.1M6.6 6.6A18 18 0 0 0 2 11s3.5 7 10 7a10.9 10.9 0 0 0 4-.8" strokeLinecap="round" />
      <path d="m9.9 9.9a3 3 0 0 0 4.2 4.2M3 3l18 18" strokeLinecap="round" />
    </svg>
  ),
};

// Reusable eye toggle button — render only when there's a value.
export function PasswordToggle({ show, onToggle }: any) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-label={show ? "Hide password" : "Show password"}
      className="grid h-7 w-7 place-items-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 dark:hover:bg-slate-800 dark:hover:text-slate-300"
    >
      {show ? Icons.eyeOff : Icons.eye}
    </button>
  );
}
