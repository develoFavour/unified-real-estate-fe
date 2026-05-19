"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Mail } from "lucide-react";
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

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [sent, setSent] = useState(false);

  const handleSubmit = async (event: FormEvent) => {
    event.preventDefault();
    setLoading(true);

    try {
      await authApi.forgotPassword(email.trim());
      setSent(true);
      toast.success("If that email exists, a reset link has been sent.");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Unable to send reset link."));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans">
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" />
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: "1s" }} />

      <div className="w-full max-w-lg bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative">
        <div className="text-center mb-10">
          <Logo className="mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
            Reset access
          </h1>
          <p className="text-gray-500 font-light">
            Enter your account email and we will send a secure reset link.
          </p>
        </div>

        {sent ? (
          <div className="space-y-8 text-center animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="w-16 h-16 rounded-2xl bg-green-500/10 text-green-500 flex items-center justify-center mx-auto">
              <CheckCircle2 size={30} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Check your email</h2>
              <p className="text-sm text-gray-500 mt-3 leading-relaxed">
                If an account exists for <span className="text-white font-bold">{email}</span>, a password reset link has been sent. The link expires in 1 hour.
              </p>
            </div>
            <div className="space-y-3">
              <Link href="/login" className="w-full bg-primary hover:bg-primary-hover text-black px-8 py-4 rounded-2xl font-bold transition-all inline-flex items-center justify-center gap-2">
                Back to Login <ArrowRight size={18} />
              </Link>
              <button
                type="button"
                onClick={() => setSent(false)}
                className="w-full bg-white/5 border border-white/10 text-white px-8 py-4 rounded-2xl font-bold hover:bg-white/10 transition-all"
              >
                Use another email
              </button>
            </div>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="space-y-2">
              <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                <input
                  required
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  type="email"
                  placeholder="name@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-black px-12 py-5 rounded-2xl font-bold text-lg transition-all shadow-[0_10px_30px_rgba(193,155,118,0.2)] flex items-center justify-center gap-3 disabled:opacity-60"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : <>Send Reset Link <ArrowRight className="w-5 h-5" /></>}
            </button>

            <Link href="/login" className="text-sm text-gray-500 hover:text-white transition-colors inline-flex items-center gap-2 justify-center w-full">
              <ArrowLeft size={14} /> Back to login
            </Link>
          </form>
        )}
      </div>
    </div>
  );
}
