import Link from "next/link";
import AuthShell from "@/components/shared/AuthShell";
import VerifyEmailForm from "@/components/(public)/VerifyEmailForm";

export const metadata = {
  title: "Verify Email",
  description: "আপনার email ঠিকানা যাচাই করুন।",
  robots: { index: false, follow: false },
};

export default function Page() {
  return (
    <AuthShell
      title="Email verification"
      subtitle=""
      footer={
        <Link href="/dashboard" className="font-semibold text-brand-600 hover:text-brand-700">
          Go to dashboard →
        </Link>
      }
    >
      <VerifyEmailForm />
    </AuthShell>
  );
}
