import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import ResetPasswordForm from "@/components/(public)/ResetPasswordForm";

export const metadata = {
  title: "Reset Password",
  description: "নতুন পাসওয়ার্ড সেট করুন।",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthShell
      title="Set a new password"
      subtitle="নতুন password দিন (কমপক্ষে ৬ অক্ষর)"
      footer={
        <Link href="/login" className="font-semibold text-brand-600 hover:text-brand-700">
          ← Back to login
        </Link>
      }
    >
      <ResetPasswordForm />
    </AuthShell>
  );
}
