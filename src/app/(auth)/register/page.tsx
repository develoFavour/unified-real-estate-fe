"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { User, Building, Briefcase, ArrowRight, Loader2, CheckCircle2 } from "lucide-react";
import { cn } from "@/lib/utils";

import { Logo } from "@/components/shared/logo";
import { RoleCard } from "@/components/auth/role-card";
import { authApi } from "@/services/auth";
import { api } from "@/lib/api/methods";
import { CustomSelect } from "@/components/ui/custom-select";



const roles = [
  {
    id: "TENANT",
    title: "I am a Tenant",
    description: "I want to find and rent the perfect home.",
    icon: User,
  },
  {
    id: "OWNER",
    title: "I am a Property Owner",
    description: "I want to list and manage my properties.",
    icon: Building,
  },
  {
    id: "AGENT",
    title: "I am an Estate Agent",
    description: "I want to manage listings and leases.",
    icon: Briefcase,
  },
];

const NATIONALITY_OPTIONS = [
  { id: "Nigerian", label: "Nigerian" },
  { id: "Other", label: "Other" },
];

export default function RegisterPage() {
  const searchParams = useSearchParams();
  const invitationToken = searchParams.get("token");
  const invitedRole = searchParams.get("role");

  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [formData, setFormData] = useState({
    email: "",
    password: "",
    full_name: "",
    phone: "",
    role: invitedRole || "TENANT",
    address: "",
    nin: "",
    license_number: "",
    agency_name: "",
    nationality: "Nigerian",
    bio: "",
  });

  const [isInvited, setIsInvited] = useState(false);

  useEffect(() => {
    if (invitationToken && invitedRole === "AGENT") {
      const validateInvite = async () => {
        try {
          const res = await api.get<any>(`/auth/invitation/${invitationToken}`);
          if (res) {
            setFormData(prev => ({ ...prev, email: res.email, role: "AGENT" }));
            setIsInvited(true);
            setStep(2); // Jump to details
          }
        } catch (err) {
          console.error("Invalid invitation token");
        }
      };
      validateInvite();
    }
  }, [invitationToken, invitedRole]);

  const handleRoleSelect = (roleId: string) => {
    setFormData({ ...formData, role: roleId });
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      await authApi.register({
        ...formData,
        invitation_token: invitationToken || undefined
      } as any);
      setSuccess(true);
      setStep(3);
    } catch (err: any) {
      setError(err.response?.data?.message || "Registration failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans">
      {/* Background Orbs */}
      <div className="absolute top-0 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
      <div className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse" style={{ animationDelay: '1s' }}></div>

      <div className="w-full max-w-4xl bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative">

        {/* Header */}
        <div className="text-center mb-12">
          <Logo className="mb-6" />
          <h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
            {success ? "Welcome to the Platform" : "Create your account"}
          </h1>
          <p className="text-gray-500 font-light">
            {success ? "Your elite real estate journey begins now." : "Join the most exclusive real estate network today."}
          </p>
        </div>

        {error && (
          <div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm text-center animate-in fade-in duration-300">
            {error}
          </div>
        )}

        {/* Step 1: Role Selection */}
        {step === 1 && (
          <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {roles.map((role) => (
                <RoleCard
                  key={role.id}
                  {...role}
                  selected={formData.role === role.id}
                  onSelect={handleRoleSelect}
                />
              ))}
            </div>

            <div className="flex flex-col items-center gap-6 mt-12">
              <button
                onClick={() => setStep(2)}
                className="bg-primary hover:bg-primary-hover text-black px-12 py-4 rounded-full font-bold text-lg transition-all flex items-center gap-3 shadow-[0_10px_30px_rgba(193,155,118,0.2)]"
              >
                Continue <ArrowRight className="w-5 h-5" />
              </button>
              <p className="text-sm text-gray-500">
                Already have an account? <Link href="/login" className="text-primary font-bold hover:underline">Log in</Link>
              </p>
            </div>
          </div>
        )}

        {/* Step 2: Form Details */}
        {step === 2 && (
          <form onSubmit={handleSubmit} className="animate-in fade-in slide-in-from-right-4 duration-500">
            {!isInvited && (
              <button
                type="button"
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:text-primary transition-colors flex items-center gap-1 mb-6"
              >
                ← Back to role selection
              </button>
            )}

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Common Fields */}
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Full Name</label>
                <input
                  required
                  name="full_name"
                  value={formData.full_name}
                  onChange={handleInputChange}
                  type="text"
                  placeholder="John Doe"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Email Address</label>
                <input
                  required
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  type="email"
                  placeholder="john@example.com"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Phone Number</label>
                <input
                  required
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  type="tel"
                  placeholder="+234..."
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Password</label>
                <input
                  required
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  type="password"
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                />
              </div>

              {/* Role Specific Fields */}
              {formData.role === 'AGENT' ? (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Agency Name</label>
                    <input
                      required
                      name="agency_name"
                      value={formData.agency_name}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="Luxury Realty Ltd"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">License Number</label>
                    <input
                      required
                      name="license_number"
                      value={formData.license_number}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="RE-12345678"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Brief Bio</label>
                    <textarea
                      name="bio"
                      value={formData.bio}
                      onChange={handleInputChange}
                      placeholder="Tell us about your experience..."
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all min-h-[100px]"
                    />
                  </div>
                </>
              ) : (
                <>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">NIN (Identity Number)</label>
                    <input
                      required
                      name="nin"
                      value={formData.nin}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="12345678901"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Nationality</label>
                    <CustomSelect
                      value={formData.nationality}
                      onChange={(value) => setFormData((current) => ({ ...current, nationality: value }))}
                      options={NATIONALITY_OPTIONS}
                      icon={<User size={15} />}
                    />
                  </div>
                  <div className="md:col-span-2 space-y-2">
                    <label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">Physical Address</label>
                    <input
                      required
                      name="address"
                      value={formData.address}
                      onChange={handleInputChange}
                      type="text"
                      placeholder="123 Luxury Lane, Victoria Island, Lagos"
                      className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:outline-none focus:border-primary/50 transition-all"
                    />
                  </div>
                </>
              )}
            </div>

            <button
              disabled={loading}
              type="submit"
              className="w-full bg-primary hover:bg-primary-hover text-black px-12 py-5 rounded-2xl font-bold text-lg mt-10 transition-all shadow-[0_10px_30px_rgba(193,155,118,0.2)] flex items-center justify-center gap-3"
            >
              {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Complete Registration"}
            </button>

            <p className="text-[10px] text-center text-gray-600 font-medium uppercase tracking-[0.2em] leading-relaxed pt-6">
              By registering, you agree to our <br /> terms of service and privacy policy.
            </p>
          </form>
        )}

        {/* Step 3: Success State */}
        {step === 3 && (
          <div className="text-center py-12 animate-in fade-in zoom-in duration-500">
            <div className="w-20 h-20 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-8 shadow-[0_0_50px_rgba(193,155,118,0.1)]">
              <CheckCircle2 className="w-10 h-10 text-primary" />
            </div>
            <h2 className="text-3xl font-bold mb-4">Registration Successful!</h2>
            <p className="text-gray-500 max-w-md mx-auto mb-10 leading-relaxed">
              We've sent a verification link to <span className="text-primary font-bold">{formData.email}</span>.
              Please verify your account to unlock full access to the platform.
            </p>
            <div className="flex flex-col gap-4">
              <Link href="/login" className="bg-primary hover:bg-primary-hover text-black px-12 py-4 rounded-full font-bold text-lg transition-all inline-block mx-auto">
                Go to Login
              </Link>
              <button onClick={() => setStep(2)} className="text-sm text-gray-500 hover:text-primary transition-colors">
                Didn't get the email? Resend link
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
