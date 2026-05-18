"use client";

import { type FormEvent, useEffect, useState } from "react";
import { 
  User, 
  TrendingUp, 
  Target, 
  Save, 
  Loader2, 
  CreditCard, 
  Wallet,
  ShieldCheck,
  Percent,
  KeyRound
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { toast } from "sonner";
import { cn } from "@/lib/utils";
import { CustomSelect } from "@/components/ui/custom-select";

interface UserProfile {
  id: string;
  email: string;
  profile: {
    full_name: string;
    phone_number: string;
    address: string;
    monthly_income: number;
    saving_percentage: number;
    bank_name: string;
    bank_account_number: string;
  };
}

interface WalletData {
  balance: number;
  pin_set_at?: string | null;
  pin_locked_until?: string | null;
}

const onlyFourPinDigits = (value: string) => value.replace(/\D/g, "").slice(0, 4);

const BANK_OPTIONS = [
  { id: "", label: "Select Bank" },
  { id: "access", label: "Access Bank" },
  { id: "gtb", label: "GTBank" },
  { id: "zenith", label: "Zenith Bank" },
  { id: "firstbank", label: "First Bank" },
  { id: "kuda", label: "Kuda Bank" },
  { id: "opay", label: "OPay" },
];

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

export default function TenantSettingsPage() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [wallet, setWallet] = useState<WalletData | null>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [savingPin, setSavingPin] = useState(false);
  const [pinForm, setPinForm] = useState({ pin: "", confirmPin: "", currentPin: "", newPin: "" });

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const [profileRes, walletRes] = await Promise.allSettled([
          api.get<UserProfile>("/auth/me"),
          api.get<WalletData>("/wallet"),
        ]);

        if (profileRes.status === "fulfilled") {
          setProfile(profileRes.value);
        } else {
          toast.error("Failed to load profile");
        }

        if (walletRes.status === "fulfilled") {
          setWallet(walletRes.value);
        }
      } catch {
        toast.error("Failed to load settings");
      } finally {
        setLoading(false);
      }
    };
    fetchSettings();
  }, []);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!profile) return;

    setSaving(true);
    try {
      await api.put("/auth/update-profile", profile.profile);
      toast.success("Financial profile updated successfully!");
    } catch {
      toast.error("Failed to update profile");
    } finally {
      setSaving(false);
    }
  };

  const handleSetPin = async (e: FormEvent) => {
    e.preventDefault();
    if (pinForm.pin.length !== 4 || pinForm.confirmPin.length !== 4) {
      toast.error("Wallet PIN must be exactly 4 digits");
      return;
    }
    if (pinForm.pin !== pinForm.confirmPin) {
      toast.error("PIN confirmation does not match");
      return;
    }

    setSavingPin(true);
    try {
      const updated = await api.post<WalletData>("/wallet/pin", { pin: pinForm.pin });
      setWallet(updated);
      setPinForm({ pin: "", confirmPin: "", currentPin: "", newPin: "" });
      toast.success("Wallet PIN set successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Unable to set wallet PIN"));
    } finally {
      setSavingPin(false);
    }
  };

  const handleChangePin = async (e: FormEvent) => {
    e.preventDefault();
    if (pinForm.currentPin.length !== 4 || pinForm.newPin.length !== 4) {
      toast.error("Wallet PIN must be exactly 4 digits");
      return;
    }

    setSavingPin(true);
    try {
      const updated = await api.patch<WalletData>("/wallet/pin", {
        current_pin: pinForm.currentPin,
        new_pin: pinForm.newPin,
      });
      setWallet(updated);
      setPinForm({ pin: "", confirmPin: "", currentPin: "", newPin: "" });
      toast.success("Wallet PIN changed successfully");
    } catch (err: unknown) {
      toast.error(getErrorMessage(err, "Unable to change wallet PIN"));
    } finally {
      setSavingPin(false);
    }
  };

  if (loading) {
    return (
      <div className="h-[80vh] flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="p-8 max-w-4xl mx-auto space-y-10 animate-in fade-in duration-700">
      <div>
        <h1 className="text-4xl font-bold font-heading mb-2">Account Settings</h1>
        <p className="text-gray-500 font-light italic">Personalize your property acquisition profile.</p>
      </div>

      {/* Wallet Activation Alert */}
      {(!profile?.profile.full_name || !profile?.profile.phone_number) && (
        <div className="bg-primary/10 border border-primary/30 rounded-[2.5rem] p-8 flex items-center gap-6 animate-pulse">
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center text-primary shrink-0">
            <Wallet size={32} />
          </div>
          <div className="space-y-2">
            <h3 className="text-lg font-bold font-heading text-primary">Unlock Your Savings Wallet</h3>
            <p className="text-xs text-gray-400 leading-relaxed max-w-2xl">
              To activate your dedicated <span className="text-white font-bold">Paystack virtual account</span> and start saving, 
              please provide your <span className="text-primary font-black underline underline-offset-4">Full Name</span> and 
              <span className="text-primary font-black underline underline-offset-4"> Phone Number</span> below.
            </p>
          </div>
        </div>
      )}

      <form onSubmit={handleUpdate} className="grid grid-cols-1 md:grid-cols-12 gap-8">
        {/* Basic Info */}
        <div className="md:col-span-12 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <User size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading">Basic Information</h3>
              <p className="text-xs text-gray-500">Your public-facing profile details.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">
                Full Name <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={profile?.profile.full_name || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, profile: { ...prev.profile, full_name: e.target.value } } : null)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">
                Phone Number <span className="text-primary">*</span>
              </label>
              <input
                type="text"
                required
                value={profile?.profile.phone_number || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, profile: { ...prev.profile, phone_number: e.target.value } } : null)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none"
              />
            </div>
          </div>
        </div>

        {/* Financial Profile */}
        <div className="md:col-span-7 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-green-500/10 rounded-2xl flex items-center justify-center text-green-500">
              <TrendingUp size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading">Financial Profile</h3>
              <p className="text-xs text-gray-500">This powers your Smart Saving calculations.</p>
            </div>
          </div>

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex items-center gap-2">
                Monthly Income (₦)
                <span className="text-[8px] bg-primary/10 text-primary px-2 py-0.5 rounded-full">Secure</span>
              </label>
              <div className="relative">
                <input
                  type="number"
                  value={profile?.profile.monthly_income || 0}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, profile: { ...prev.profile, monthly_income: parseFloat(e.target.value) } } : null)}
                  className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-10 focus:border-primary/50 transition-all outline-none text-lg font-bold"
                />
                <Target className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600" size={16} />
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4 flex justify-between items-center">
                Saving Percentage
                <span className="font-bold text-primary">{profile?.profile.saving_percentage || 0}%</span>
              </label>
              <div className="space-y-4">
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={profile?.profile.saving_percentage || 0}
                  onChange={(e) => setProfile(prev => prev ? { ...prev, profile: { ...prev.profile, saving_percentage: parseInt(e.target.value) } } : null)}
                  className="w-full accent-primary h-2 bg-white/10 rounded-lg appearance-none cursor-pointer"
                />
                <div className="flex justify-between text-[8px] font-bold text-gray-600 uppercase tracking-widest">
                  <span>Conservative (0%)</span>
                  <span>Aggressive (100%)</span>
                </div>
              </div>
            </div>

            <div className="p-6 bg-primary/5 border border-primary/10 rounded-2xl flex items-start gap-4">
              <Percent size={18} className="text-primary shrink-0 mt-1" />
              <div>
                <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Impact Analysis</p>
                <p className="text-[10px] text-gray-400 leading-relaxed italic">
                  By saving <strong>{profile?.profile.saving_percentage || 0}%</strong> of your <strong>₦{(profile?.profile.monthly_income || 0).toLocaleString()}</strong> income, 
                  you&apos;ll be adding <strong>₦{((profile?.profile.monthly_income || 0) * (profile?.profile.saving_percentage || 0) / 100).toLocaleString()}</strong> to your wallet every month.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Withdrawal Info */}
        <div className="md:col-span-5 bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8 flex flex-col">
          <div className="flex items-center gap-4 mb-4">
            <div className="w-12 h-12 bg-blue-500/10 rounded-2xl flex items-center justify-center text-blue-500">
              <CreditCard size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading">Payout Method</h3>
              <p className="text-xs text-gray-500">Where we&apos;ll send your funds when you withdraw.</p>
            </div>
          </div>

          <div className="space-y-6 flex-1">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Bank Name</label>
              <CustomSelect
                value={profile?.profile.bank_name || ""}
                onChange={(value) => setProfile(prev => prev ? { ...prev, profile: { ...prev.profile, bank_name: value } } : null)}
                options={BANK_OPTIONS}
                icon={<CreditCard size={15} />}
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Account Number</label>
              <input
                type="text"
                maxLength={10}
                value={profile?.profile.bank_account_number || ""}
                onChange={(e) => setProfile(prev => prev ? { ...prev, profile: { ...prev.profile, bank_account_number: e.target.value } } : null)}
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none font-bold tracking-[0.2em]"
                placeholder="0123456789"
              />
            </div>
          </div>

          <div className="pt-8 mt-auto">
            <button
              type="submit"
              disabled={saving}
              className="w-full bg-primary hover:bg-primary-hover text-black font-black py-5 rounded-[2rem] transition-all flex items-center justify-center gap-3 shadow-[0_20px_50px_rgba(193,155,118,0.2)]"
            >
              {saving ? <Loader2 className="animate-spin" /> : <><Save size={20} /> Save Changes</>}
            </button>
          </div>
        </div>
      </form>

      <section id="wallet-pin" className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-12 space-y-8 scroll-mt-28">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
              <KeyRound size={24} />
            </div>
            <div>
              <h3 className="text-xl font-bold font-heading">Wallet PIN</h3>
              <p className="text-xs text-gray-500">Required for deposits, withdrawals, invoice payments, and property reservations.</p>
            </div>
          </div>
          <div className={cn(
            "px-4 py-2 rounded-2xl border text-[10px] font-black uppercase tracking-widest",
            wallet?.pin_set_at
              ? "bg-green-500/10 border-green-500/20 text-green-500"
              : "bg-primary/10 border-primary/20 text-primary"
          )}>
            {wallet?.pin_set_at ? "PIN Enabled" : "PIN Required"}
          </div>
        </div>

        {!wallet?.pin_set_at ? (
          <form onSubmit={handleSetPin} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Create 4-digit PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinForm.pin}
                onChange={(e) => setPinForm((current) => ({ ...current, pin: onlyFourPinDigits(e.target.value) }))}
                placeholder="1234"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Confirm PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinForm.confirmPin}
                onChange={(e) => setPinForm((current) => ({ ...current, confirmPin: onlyFourPinDigits(e.target.value) }))}
                placeholder="1234"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={savingPin || pinForm.pin.length !== 4 || pinForm.confirmPin.length !== 4}
              className="bg-primary text-black font-black px-8 py-4 rounded-2xl hover:bg-primary-hover transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {savingPin ? <Loader2 className="animate-spin" size={16} /> : "Set PIN"}
            </button>
          </form>
        ) : (
          <form onSubmit={handleChangePin} className="grid grid-cols-1 md:grid-cols-[1fr_1fr_auto] gap-4 items-end">
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">Current PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinForm.currentPin}
                onChange={(e) => setPinForm((current) => ({ ...current, currentPin: onlyFourPinDigits(e.target.value) }))}
                placeholder="Current PIN"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none text-sm font-bold"
              />
            </div>
            <div className="space-y-2">
              <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 pl-4">New PIN</label>
              <input
                type="password"
                inputMode="numeric"
                maxLength={4}
                value={pinForm.newPin}
                onChange={(e) => setPinForm((current) => ({ ...current, newPin: onlyFourPinDigits(e.target.value) }))}
                placeholder="New PIN"
                className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 focus:border-primary/50 transition-all outline-none text-sm font-bold"
              />
            </div>
            <button
              type="submit"
              disabled={savingPin || pinForm.currentPin.length !== 4 || pinForm.newPin.length !== 4}
              className="bg-white/5 text-white border border-white/10 font-black px-8 py-4 rounded-2xl hover:bg-white/10 transition-all uppercase tracking-widest text-xs flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {savingPin ? <Loader2 className="animate-spin" size={16} /> : "Change PIN"}
            </button>
          </form>
        )}
      </section>

      {/* Security Banner */}
      <div className="bg-white/[0.01] border border-dashed border-white/10 p-8 rounded-[3rem] flex flex-col md:flex-row items-center gap-6 text-center md:text-left">
        <div className="w-16 h-16 bg-primary/5 rounded-full flex items-center justify-center text-primary/40 shrink-0">
          <ShieldCheck size={32} />
        </div>
        <div className="space-y-1">
          <h4 className="text-sm font-bold uppercase tracking-widest text-white">Bank-Grade Encryption</h4>
          <p className="text-xs text-gray-500 leading-relaxed max-w-xl italic">
            Your financial information is never stored in plain text and is only used to provide accurate timelines for your property acquisition goals. 
            All payments are processed through our PCI-DSS compliant partner, Paystack.
          </p>
        </div>
      </div>
    </div>
  );
}
