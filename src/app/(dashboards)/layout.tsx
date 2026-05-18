"use client";

import { Sidebar } from "@/components/shared/sidebar";
import { Bell, Menu, Search, User } from "lucide-react";
import { useState } from "react";
import Cookies from "js-cookie";
import { useAuthStore } from "@/store/useAuthStore";

const roleLabelMap: Record<string, { title: string; subtitle: string }> = {
	SUPER_ADMIN: { title: "Super Admin", subtitle: "System Overseer" },
	OWNER: { title: "Owner", subtitle: "Property Manager" },
	AGENT: { title: "Agent", subtitle: "Mandate Manager" },
	TENANT: { title: "Tenant", subtitle: "Resident Portal" },
};

export default function DashboardLayout({
	children,
}: {
	children: React.ReactNode;
}) {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { user } = useAuthStore();
	const role = user?.role || Cookies.get("user_role") || "";
	const roleLabel = roleLabelMap[role] || { title: "Dashboard", subtitle: "Workspace" };

	return (
		<div className="flex min-h-screen bg-[#050505] text-foreground font-sans overflow-x-hidden">
			<Sidebar className="hidden lg:flex sticky top-0 shrink-0" />

			{sidebarOpen && (
				<div className="fixed inset-0 z-[90] lg:hidden">
					<button
						type="button"
						aria-label="Close navigation"
						className="absolute inset-0 bg-black/70 backdrop-blur-sm"
						onClick={() => setSidebarOpen(false)}
					/>
					<div className="relative h-full w-[min(18rem,85vw)] animate-in slide-in-from-left duration-200">
						<Sidebar onNavigate={() => setSidebarOpen(false)} className="h-dvh border-r border-white/10 shadow-2xl" />
					</div>
				</div>
			)}

			<div className="min-w-0 flex-1 flex flex-col lg:h-screen">
				{/* Top Header */}
				<header className="h-16 lg:h-20 border-b border-white/5 flex items-center justify-between gap-3 px-4 sm:px-6 lg:px-8 sticky top-0 bg-[#050505]/90 backdrop-blur-md z-40 flex-shrink-0">
					<div className="flex items-center gap-3 min-w-0">
						<button
							type="button"
							onClick={() => setSidebarOpen(true)}
							className="lg:hidden h-10 w-10 rounded-2xl border border-white/10 bg-white/5 flex items-center justify-center text-gray-300 hover:text-primary hover:border-primary/40 transition-all"
							aria-label="Open navigation"
						>
							<Menu size={20} />
						</button>
						<div className="min-w-0 lg:hidden">
							<p className="text-sm font-black text-white truncate">{roleLabel.title}</p>
							<p className="text-[10px] font-bold uppercase tracking-widest text-gray-600 truncate">{roleLabel.subtitle}</p>
						</div>
					</div>

					<div className="relative w-96 hidden md:block">
						<Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
						<input
							type="text"
							placeholder="Search properties, transactions, users..."
							className="w-full bg-white/5 border border-white/10 rounded-full py-2.5 pl-12 pr-6 text-sm focus:outline-none focus:border-primary/50 transition-colors"
						/>
					</div>

					<div className="flex items-center gap-3 sm:gap-6">
						<button className="relative p-2.5 hover:bg-white/5 rounded-xl transition-colors group">
							<Bell
								size={20}
								className="text-gray-400 group-hover:text-white"
							/>
							<span className="absolute top-2.5 right-2.5 w-2 h-2 bg-primary rounded-full border-2 border-[#050505]"></span>
						</button>
						<div className="hidden sm:block w-[1px] h-6 bg-white/10"></div>
						<div className="flex items-center gap-3 cursor-pointer group">
							<div className="text-right hidden sm:block">
								<p className="text-sm font-bold group-hover:text-primary transition-colors">
									{roleLabel.title}
								</p>
								<p className="text-[10px] text-gray-500 font-medium uppercase tracking-widest">
									{roleLabel.subtitle}
								</p>
							</div>
							<div className="w-10 h-10 rounded-xl bg-primary/20 border border-primary/20 flex items-center justify-center text-primary group-hover:bg-primary group-hover:text-black transition-all">
								<User size={20} />
							</div>
						</div>
					</div>
				</header>

				{/* Main Content Area */}
				<main className="flex-1 p-4 sm:p-6 lg:p-8 overflow-y-auto overflow-x-hidden">
					<div className="max-w-7xl mx-auto min-w-0">{children}</div>
				</main>
			</div>
		</div>
	);
}
