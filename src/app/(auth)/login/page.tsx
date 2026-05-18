"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Mail, Lock, ArrowRight, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Logo } from "@/components/shared/logo";
import { authApi } from "@/services/auth";

export default function LoginPage() {
	const router = useRouter();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState<string | null>(null);
	const [formData, setFormData] = useState({
		email: "",
		password: "",
	});

	const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setFormData({ ...formData, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		setLoading(true);
		setError(null);

		try {
			const response = await authApi.login(formData);
			toast.success(
				`Welcome back, ${response.user.profile.full_name || "User"}!`,
			);

			// Redirect based on role
			const role = response.user.role;
			switch (role) {
				case "SUPER_ADMIN":
					router.push("/admin");
					break;
				case "AGENT":
					router.push("/agent");
					break;
				case "OWNER":
					router.push("/owner");
					break;
				default:
					router.push("/tenant");
			}
		} catch (err: any) {
			const msg = err.response?.data?.message || "Invalid email or password";
			setError(msg);
			toast.error(msg);
		} finally {
			setLoading(false);
		}
	};

	return (
		<div className="min-h-screen bg-background text-foreground flex items-center justify-center p-6 md:p-12 relative overflow-hidden font-sans">
			{/* Background Orbs */}
			<div className="absolute top-0 -left-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse"></div>
			<div
				className="absolute bottom-0 -right-20 w-96 h-96 bg-primary/5 rounded-full blur-[100px] -z-10 animate-pulse"
				style={{ animationDelay: "1s" }}
			></div>

			<div className="w-full max-w-lg bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 md:p-16 backdrop-blur-xl shadow-2xl relative">
				{/* Header */}
				<div className="text-center mb-12">
					<Logo className="mb-6" />
					<h1 className="text-3xl md:text-5xl font-bold font-heading mb-4">
						Welcome back
					</h1>
					<p className="text-gray-500 font-light">
						Access your exclusive real estate dashboard.
					</p>
				</div>

				{error && (
					<div className="mb-8 p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-500 text-sm text-center animate-in fade-in duration-300">
						{error}
					</div>
				)}

				{/* Login Form */}
				<form
					onSubmit={handleSubmit}
					className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500"
				>
					<div className="space-y-4">
						<div className="space-y-2">
							<label className="text-xs font-bold uppercase tracking-widest text-gray-400 pl-4">
								Email Address
							</label>
							<div className="relative">
								<Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
								<input
									required
									name="email"
									value={formData.email}
									onChange={handleInputChange}
									type="email"
									placeholder="name@example.com"
									className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all"
								/>
							</div>
						</div>
						<div className="space-y-2">
							<div className="flex justify-between items-center px-4">
								<label className="text-xs font-bold uppercase tracking-widest text-gray-400">
									Password
								</label>
								<Link
									href="/auth/forgot-password"
									title="Forgot password?"
									className="text-[10px] font-bold text-primary hover:underline"
								>
									Forgot password?
								</Link>
							</div>
							<div className="relative">
								<Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
								<input
									required
									name="password"
									value={formData.password}
									onChange={handleInputChange}
									type="password"
									placeholder="••••••••"
									className="w-full bg-white/5 border border-white/10 rounded-2xl p-4 pl-12 focus:outline-none focus:border-primary/50 transition-all"
								/>
							</div>
						</div>
					</div>

					<button
						disabled={loading}
						type="submit"
						className="w-full bg-primary hover:bg-primary-hover text-black px-12 py-5 rounded-2xl font-bold text-lg mt-8 transition-all shadow-[0_10px_30px_rgba(193,155,118,0.2)] flex items-center justify-center gap-3"
					>
						{loading ? (
							<Loader2 className="w-5 h-5 animate-spin" />
						) : (
							<>
								Sign In <ArrowRight className="w-5 h-5" />
							</>
						)}
					</button>

					<p className="text-sm text-center text-gray-500 pt-6">
						Don&apos;t have an account?{" "}
						<Link
							href="/register"
							className="text-primary font-bold hover:underline"
						>
							Create one now
						</Link>
					</p>
				</form>
			</div>
		</div>
	);
}
