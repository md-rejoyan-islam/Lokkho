// Animated placeholder blocks shown while data loads.
export function Skeleton({ className = "" }: any) {
  return <div className={`animate-pulse rounded-md bg-slate-200/80 dark:bg-slate-800 ${className}`} />;
}

function CardSkeleton() {
  return (
    <div className="card space-y-3">
      <Skeleton className="h-3 w-16" />
      <Skeleton className="h-5 w-3/4" />
      <Skeleton className="h-3 w-full" />
      <Skeleton className="h-3 w-1/2" />
    </div>
  );
}

export function GridSkeleton({ count = 6, cols = "sm:grid-cols-2 lg:grid-cols-3" }: any) {
  return (
    <div className={`grid gap-4 ${cols}`}>
      {Array.from({ length: count }).map((_, i) => (
        <CardSkeleton key={i} />
      ))}
    </div>
  );
}

export function ListSkeleton({ count = 6 }: any) {
  return (
    <div className="space-y-2">
      {Array.from({ length: count }).map((_, i) => (
        <div
          key={i}
          className="flex items-center justify-between gap-3 rounded-lg border border-slate-200 bg-white px-4 py-4 dark:border-slate-800 dark:bg-slate-900"
        >
          <Skeleton className="h-4 w-1/3" />
          <Skeleton className="h-5 w-28" />
        </div>
      ))}
    </div>
  );
}

// Whole-page placeholder (header + content) — used for Suspense/route fallbacks.
export function PageSkeleton({ variant = "grid" }: any) {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-72 max-w-full" />
      </div>
      {variant === "list" ? <ListSkeleton /> : variant === "table" ? <TableSkeleton /> : <GridSkeleton />}
    </div>
  );
}

// Detail-page placeholder (header + a content card + related grid).
export function DetailSkeleton() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <Skeleton className="h-7 w-64 max-w-full" />
        <Skeleton className="h-4 w-40" />
      </div>
      <div className="card space-y-3">
        <Skeleton className="h-4 w-1/3" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-5/6" />
        <Skeleton className="h-3 w-2/3" />
      </div>
      <GridSkeleton count={3} />
    </div>
  );
}

export function TableSkeleton({ rows = 8 }: any) {
  return (
    <div className="overflow-hidden rounded-lg border border-slate-200 dark:border-slate-800">
      {Array.from({ length: rows }).map((_, i) => (
        <div
          key={i}
          className="flex items-center gap-4 border-b border-slate-100 bg-white px-4 py-4 last:border-0 dark:border-slate-800 dark:bg-slate-900"
        >
          <Skeleton className="h-4 flex-1" />
          <Skeleton className="hidden h-4 w-24 sm:block" />
          <Skeleton className="hidden h-4 w-28 md:block" />
          <Skeleton className="h-4 w-16" />
        </div>
      ))}
    </div>
  );
}
