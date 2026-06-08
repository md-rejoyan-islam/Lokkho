// Frontend-readable hint cookie mirroring auth state (read by middleware.ts).
export const AUTH_COOKIE = "lokkho_auth";

export const MODULE_CATEGORIES = [
  "BCS",
  "Bank",
  "Primary",
  "NTRCA",
  "Railway",
  "Other",
];

export const PROGRESS_STATUSES = [
  "not_started",
  "in_progress",
  "completed",
  "need_revision",
  "weak",
];

export const STATUS_META = {
  not_started: { label: "Not started", cls: "bg-gray-100 text-gray-600" },
  in_progress: { label: "In progress", cls: "bg-blue-100 text-blue-700" },
  completed: { label: "Completed", cls: "bg-green-100 text-green-700" },
  need_revision: { label: "Need revision", cls: "bg-amber-100 text-amber-700" },
  weak: { label: "Weak", cls: "bg-red-100 text-red-700" },
};

export const JOB_CATEGORY_META = {
  government: { label: "Govt", cls: "bg-green-100 text-green-700" },
  non_government: { label: "Non-Govt", cls: "bg-purple-100 text-purple-700" },
  other: { label: "Other", cls: "bg-gray-100 text-gray-600" },
};

export const RESOURCE_CATEGORIES = [
  "documents",
  "process",
  "tips",
  "circular",
  "general",
];

export const PRIORITIES = ["high", "medium", "low"];

export const PRIORITY_META = {
  high: { label: "High", cls: "bg-red-100 text-red-700" },
  medium: { label: "Medium", cls: "bg-amber-100 text-amber-700" },
  low: { label: "Low", cls: "bg-green-100 text-green-700" },
};

// True if `owner` (raw ObjectId string OR a populated {_id} object) belongs to `user`.
export function isOwner(owner, user) {
  if (!user || !owner) return false;
  const id = owner._id || owner;
  return String(id) === String(user._id);
}
