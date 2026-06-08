import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { AUTH_COOKIE } from "@/lib/constants";

const PUBLIC = ["/login", "/register", "/forgot-password", "/reset-password", "/verify-email"];
const AUTH_ENTRY = ["/login", "/register", "/forgot-password"];

export function proxy(req: NextRequest) {
  const { pathname } = req.nextUrl;
  const authed = req.cookies.get(AUTH_COOKIE)?.value === "1";

  if (pathname === "/") {
    return NextResponse.redirect(new URL(authed ? "/dashboard" : "/login", req.url));
  }

  const isPublic = PUBLIC.some((p) => pathname === p || pathname.startsWith(p + "/"));

  if (authed && AUTH_ENTRY.includes(pathname)) {
    return NextResponse.redirect(new URL("/dashboard", req.url));
  }
  if (!authed && !isPublic) {
    return NextResponse.redirect(new URL("/login", req.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)"],
};
