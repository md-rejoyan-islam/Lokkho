import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import RegisterForm from "@/components/(public)/RegisterForm";

export const metadata = {
  title: "Register",
  description: "বিনামূল্যে Lokkho অ্যাকাউন্ট তৈরি করুন — BCS, ব্যাংক, প্রাইমারি সহ সব চাকরির প্রস্তুতি এক জায়গায়।",
  alternates: { canonical: "/register" },
};

export default function Page() {
  return (
    <AuthShell
      title="নতুন অ্যাকাউন্ট তৈরি করুন"
      subtitle="কয়েক সেকেন্ডেই শুরু করুন আপনার প্রস্তুতি"
      footer={
        <>
          আগে থেকেই অ্যাকাউন্ট আছে?{" "}
          <Link href="/login" className="font-semibold text-brand-600 dark:text-brand-400 hover:text-brand-700">
            Login করুন
          </Link>
        </>
      }
    >
      <RegisterForm />
    </AuthShell>
  );
}
