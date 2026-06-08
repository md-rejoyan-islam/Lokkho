import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { AUTH_COOKIE } from "@/lib/constants";

export default async function Home() {
  const authed = (await cookies()).get(AUTH_COOKIE)?.value === "1";
  redirect(authed ? "/dashboard" : "/login");
}
