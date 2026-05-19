"use client";

import { FormEvent, Suspense, useMemo, useState } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Lock, XCircle } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { authApi } from "@/services/auth";

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

function ResetPasswordContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  const validationMessage = useMemo(() => {
    if (!password) return "";
    if (password.length < 6) return "Password must be at least 6 characters.";
    if (confirmPassword && password !== confirmPassword) return "Passwords do not match.";
    return "";
  }, [password, confirmPassword]);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    if (!token) {
      toast.error("Reset token is missing.");
      return;
    }
    if (password.length < 6) {
      toast.error("Password must be at least 6 characters.");
      return;
    }
    if (password !== confirmPassword) {
      toast.error("Passwords do not match.");
      return;
    }

    setLoading(true);
    try {
      await authApi.resetPassword({ token, new_password: password });
      setDone(true);
      toast.success("Password reset successfully.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Invalid or expired reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative">
      <div className="text-center mb-10">
        <Logo className="mb-6" />
        <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
          New password
        </h1>
        <p className="text-gray-500 font-light">
          Create a new password for your account.
        </p>
      </div>

      {!token ? (
        <div className="space-y-8 text-center animate-in fade-in duration-500">
          <div className="w-16 h-16 rounded-2xl bg-red-500/10 text-red-500 flex items-center justify-center mx-auto">
            <XCircle size={30} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Invalid reset link</h2>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              This reset link is missing its token. Request a new password reset link to continue.
            </p>
          </div>
          <Link href="/auth/forgot-password" className="w-full bg-primary hover:bg-primary-hover text-black px-8 py-4 rounded-2xl font-bold transition-all inline-flex items-center justify-center gap-2">
            Request New Link <ArrowRight size={18} />
          </Link>
        </div>
      ) : done ? (
        <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
            <CheckCircle2 size={30} />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Password updated</h2>
            <p className="text-sm text-gray-500 mt-3 leading-relaxed">
              You can now sign in with your new password.
            </p>
          </div>
          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full bg-primary hover:bg-primary-hover text-black px-8 py-4 rounded-2xl font-bold transition-all inline-flex items-center justify-center gap-2"
          >
            Continue to Login <ArrowRight size={18} />
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">
              New Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                required
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                type="password"
                minLength={6}
                placeholder="Enter new password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">
              Confirm Password
            </label>
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                required
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                type="password"
                minLength={6}
                placeholder="Confirm new password"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all"
              />
            </div>
            {validationMessage && (
              <p className="text-xs text-red-400 pl-4 pt-1">{validationMessage}</p>
            )}
          </div>

          <button
            disabled={loading || Boolean(validationMessage) || !password || !confirmPassword}
            type="submit"
            className="w-full bg-primary hover:bg-primary-hover text-black px-12 py-5 rounded-2xl font-bold text-lg transition-all shadow-[0_10px_30px_rgba(193,155,118,0.2)] flex items-center justify-center gap-3 disabled:opacity-60"
          >
            {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Reset Password <ArrowRight className="w-5 h-5" /></>}
          </button>

          <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2 justify-center w-full">
            <ArrowLeft size={14} /> Back to login
          </Link>
        </form>
      )}
    </div>
  );
}

export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: "1s" }} />
      <Suspense fallback={<Loader2 className="w-12 h-12 text-primary animate-spin" />}>
        <ResetPasswordContent />
      </Suspense>
    </div>
  );
}
