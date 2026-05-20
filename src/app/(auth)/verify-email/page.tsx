"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Clock3 } from "lucide-react";
import { Logo } from "@/components/shared/logo";
import { authApi } from "@/services/auth";
import type { User } from "@/services/auth";

const getErrorMessage = (err: unknown, fallback: string) => {
  if (
    typeof err === "object" &&
    err !== null &&
    "response" in err &&
    typeof err.response === "object" &&
    err.response !== null &&
    "data" in err.response &&
    typeof err.response.data === "object" &&
    err.response.data !== null &&
    "message" in err.response.data &&
    typeof err.response.data.message === "string"
  ) {
    return err.response.data.message;
  }

  return err instanceof Error ? err.message : fallback;
};

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your elite access...");
  const [verifiedUser, setVerifiedUser] = useState<User | null>(null);

  useEffect(() => {
    if (!token) {
      queueMicrotask(() => {
        setStatus("error");
        setMessage("No verification token found.");
      });
      return;
    }

    const verify = async () => {
      try {
        const user = await authApi.verifyEmail(token);
        setVerifiedUser(user);
        setStatus("success");
        setMessage(
          user.role === "AGENT" && user.status === "PENDING"
            ? "Your email has been verified. Your agent account is now waiting for admin approval."
            : "Your account has been verified successfully!"
        );
      } catch (err: unknown) {
        setStatus("error");
        setMessage(getErrorMessage(err, "Verification failed. The link may be expired."));
      }
    };

    verify();
  }, [token]);

  const agentPendingApproval = verifiedUser?.role === "AGENT" && verifiedUser.status === "PENDING";

  return (
    <div className="w-full max-w-lg bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative text-center">
      <Logo className="mx-auto mb-10" />

      {status === "loading" && (
        <div className="py-12 animate-in fade-in duration-500">
          <Loader2 className="w-12 h-12 text-primary animate-spin mx-auto mb-6" />
          <h1 className="text-2xl font-bold mb-2 tracking-tight">Verifying...</h1>
          <p className="text-gray-500 font-light">{message}</p>
        </div>
      )}

      {status === "success" && (
        <div className="py-12 animate-in zoom-in fade-in duration-500">
          <div className={`w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-8 ${
            agentPendingApproval ? "bg-primary/20" : "bg-green-500/20"
          }`}>
            {agentPendingApproval ? (
              <Clock3 className="w-10 h-10 text-primary" />
            ) : (
              <CheckCircle2 className="w-10 h-10 text-green-500" />
            )}
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">
            {agentPendingApproval ? "Awaiting Admin Approval" : "Success!"}
          </h1>
          <p className="text-gray-500 font-light mb-10">{message}</p>
          {agentPendingApproval ? (
            <div className="space-y-5">
              <div className="rounded-2xl border border-primary/20 bg-primary/10 p-5 text-left">
                <p className="text-sm font-bold text-primary mb-2">What happens next?</p>
                <p className="text-xs text-gray-500 leading-relaxed">
                  A platform admin will review your agent profile, agency details, and license information. You will be able to sign in once your account is approved.
                </p>
              </div>
              <Link href="/" className="bg-white/5 border border-white/10 hover:bg-white/10 text-white px-10 py-4 rounded-full font-bold text-sm transition-all inline-flex items-center gap-2">
                Back to Home
              </Link>
            </div>
          ) : (
            <Link href="/login" className="bg-primary hover:bg-primary-hover text-black px-12 py-4 rounded-full font-bold text-lg transition-all inline-flex items-center gap-2">
              Continue to Login <ArrowRight className="w-5 h-5" />
            </Link>
          )}
        </div>
      )}

      {status === "error" && (
        <div className="py-12 animate-in shake duration-500">
          <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <XCircle className="w-10 h-10 text-red-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Verification Failed</h1>
          <p className="text-gray-500 font-light mb-10">{message}</p>
          <div className="flex flex-col gap-4">
            <Link href="/register" className="text-primary font-bold hover:underline">
              Try Registering Again
            </Link>
            <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors">
              Back to Login
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>
      <Suspense fallback={<Loader2 className="w-12 h-12 text-primary animate-spin" />}>
        <VerifyEmailContent />
      </Suspense>
    </div>
  );
}
