"use client";

import { Suspense, useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { api } from "@/lib/api";
import { Skeleton } from "@/components/shared/Skeleton";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <VerifyContent />
    </Suspense>
  );
}

function VerifyContent() {
  const token = useSearchParams().get("token") || "";
  const [status, setStatus] = useState("verifying"); // verifying | ok | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("Verification token missing.");
      return;
    }
    api("/auth/verify-email", { method: "POST", auth: false, body: { token } })
      .then(() => setStatus("ok"))
      .catch((err) => {
        setStatus("error");
        setMessage(err.message);
      });
  }, [token]);

  return (
    <>
      {status === "verifying" && (
        <div className="space-y-2">
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-4 w-2/3" />
        </div>
      )}
      {status === "ok" && (
        <div className="rounded-md border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
          ✅ আপনার email verified হয়েছে! ধন্যবাদ।
        </div>
      )}
      {status === "error" && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
          {message || "Verification failed."} link মেয়াদোত্তীর্ণ হলে settings থেকে আবার পাঠান।
        </div>
      )}
    </>
  );
}
