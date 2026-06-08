const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Only list publicly crawlable + indexable pages. The app pages (/modules,
// /jobs, /questions, …) live under the (private) layout — they are auth-gated
// and marked noindex, so listing them here would trigger Search Console
// "Submitted URL marked noindex" errors.
export default function sitemap() {
  const now = new Date();
  const routes = [
    { path: "", priority: 1.0, changeFrequency: "weekly" as const },
    { path: "/register", priority: 0.8, changeFrequency: "monthly" as const },
    { path: "/login", priority: 0.6, changeFrequency: "monthly" as const },
  ];
  return routes.map((r) => ({
    url: `${SITE_URL}${r.path}`,
    lastModified: now,
    changeFrequency: r.changeFrequency,
    priority: r.priority,
  }));
}
