import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import ForgotPasswordForm from "@/components/(public)/ForgotPasswordForm";

export const metadata = {
  title: "Forgot Password",
  description: "আপনার email-এ পাসওয়ার্ড রিসেট লিংক পাঠান।",
  alternates: { canonical: "/forgot-password" },
};

export default function Page() {
  return (
    <AuthShell
      title="Forgot password?"
      subtitle="আপনার email দিন — reset link পাঠানো হবে"
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Back to login
        </Link>
      }
    >
      <ForgotPasswordForm />
    </AuthShell>
  );
}
