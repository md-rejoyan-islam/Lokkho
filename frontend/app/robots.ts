const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

// Public pages: /, /login, /register. Everything else is the auth-gated app
// (per-user data, noindex) or sensitive token pages — keep crawlers out.
export default function robots() {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: [
          "/dashboard",
          "/settings",
          "/applications",
          "/planner",
          "/modules",
          "/subjects",
          "/topics",
          "/questions",
          "/important-topics",
          "/jobs",
          "/books",
          "/resources",
          "/reset-password",
          "/verify-email",
        ],
      },
    ],
    sitemap: `${SITE_URL}/sitemap.xml`,
    host: SITE_URL,
  };
}
