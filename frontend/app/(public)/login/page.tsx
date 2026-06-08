import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import LoginForm from "@/components/(public)/LoginForm";

export const metadata = {
  title: "Login",
  description: "Lokkho অ্যাকাউন্টে লগইন করে আপনার চাকরির প্রস্তুতি manage করুন।",
  alternates: { canonical: "/login" },
};

export default function Page() {
  return (
    <AuthShell
      title="স্বাগতম 👋"
      subtitle="আপনার প্রস্তুতি অ্যাকাউন্টে লগইন করুন"
      footer={
        <>
          অ্যাকাউন্ট নেই?{" "}
          <Link href="/register" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">
            Register করুন
          </Link>
        </>
      }
    >
      <LoginForm />
    </AuthShell>
  );
}
