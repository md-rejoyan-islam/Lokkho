"use client";

// Windowed pagination. Prev/Next are arrow icon buttons. Calls onPage(n).
export default function Pagination({ page, totalPages, onPage }: any) {
  if (!totalPages || totalPages <= 1) return null;

  const pages = [];
  const window = 1; // neighbours on each side
  for (let p = 1; p <= totalPages; p++) {
    if (p === 1 || p === totalPages || (p >= page - window && p <= page + window)) {
      pages.push(p);
    } else if (pages[pages.length - 1] !== "…") {
      pages.push("…");
    }
  }

  const base =
    "inline-flex h-9 min-w-[36px] items-center justify-center rounded-md border px-3 text-sm font-medium transition disabled:cursor-not-allowed disabled:opacity-40";
  const idle =
    "border-slate-300 bg-white text-slate-600 hover:bg-slate-50 dark:border-slate-700 dark:bg-slate-900 dark:text-slate-300 dark:hover:bg-slate-800";
  const active = "border-brand-600 bg-brand-600 text-white";

  const ChevronLeft = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M15 18l-6-6 6-6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
  const ChevronRight = (
    <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M9 6l6 6-6 6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );

  return (
    <nav className="mt-auto flex flex-wrap items-center justify-center gap-1.5 pt-8">
      <button
        onClick={() => onPage(page - 1)}
        disabled={page <= 1}
        aria-label="Previous page"
        className={`${base} px-2 ${idle}`}
      >
        {ChevronLeft}
      </button>

      {pages.map((p, i) =>
        p === "…" ? (
          <span key={`gap-${i}`} className="px-1.5 text-slate-400 dark:text-slate-600">
            …
          </span>
        ) : (
          <button
            key={p}
            onClick={() => onPage(p)}
            aria-current={p === page ? "page" : undefined}
            className={`${base} ${p === page ? active : idle}`}
          >
            {p}
          </button>
        )
      )}

      <button
        onClick={() => onPage(page + 1)}
        disabled={page >= totalPages}
        aria-label="Next page"
        className={`${base} px-2 ${idle}`}
      >
        {ChevronRight}
      </button>
    </nav>
  );
}
