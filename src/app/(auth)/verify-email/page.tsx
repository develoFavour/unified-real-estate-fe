"use client";

import { useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react";
import Link from "next/link";
import { Logo } from "@/components/shared/logo";
import { authApi } from "@/services/auth";

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const token = searchParams.get("token");

  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");
  const [message, setMessage] = useState("Verifying your elite access...");

  useEffect(() => {
    if (!token) {
      setStatus("error");
      setMessage("No verification token found.");
      return;
    }

    const verify = async () => {
      try {
        await authApi.verifyEmail(token);
        setStatus("success");
        setMessage("Your account has been verified successfully!");
      } catch (err: any) {
        setStatus("error");
        setMessage(err.response?.data?.message || "Verification failed. The link may be expired.");
      }
    };

    verify();
  }, [token]);

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
          <div className="w-20 h-20 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-8">
            <CheckCircle2 className="w-10 h-10 text-green-500" />
          </div>
          <h1 className="text-3xl font-bold mb-4 tracking-tight">Success!</h1>
          <p className="text-gray-500 font-light mb-10">{message}</p>
          <Link href="/login" className="bg-primary hover:bg-primary-hover text-black px-12 py-4 rounded-full font-bold text-lg transition-all inline-flex items-center gap-2">
            Continue to Login <ArrowRight className="w-5 h-5" />
          </Link>
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
