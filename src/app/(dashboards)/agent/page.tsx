"use client";

import { useEffect, useState } from "react";
import {
	Building2,
	CheckCircle2,
	ArrowUpRight,
	Clock,
	Briefcase,
	UserPlus,
	MapPin,
	ShieldCheck,
	XCircle,
	Loader2,
	FileText,
	Wallet,
} from "lucide-react";
import { api } from "@/lib/api/methods";
import { ENDPOINTS } from "@/constants/endpoints.const";
import { toast } from "sonner";
import { SaleReservationsPanel } from "@/components/workflows/sale-reservations-panel";
import Link from "next/link";

interface Property {
	id: string;
	title: string;
	location: string;
	price: number;
	status: string;
}

interface DashboardData {
	total_managed: number;
	new_invites: number;
	active_mandates: Property[];
	pending_mandates: Property[];
}

interface LeaseRequest {
	id: string;
	status: string;
	created_at: string;
	property?: {
		id: string;
		title: string;
		location?: string;
	};
	tenant?: {
		email?: string;
		profile?: {
			first_name?: string;
			last_name?: string;
		};
	};
}

interface Invoice {
	id: string;
	tenant_id: string;
	property_id: string;
	lease_id?: string | null;
	amount: number;
	type: string;
	status: string;
	paid_at?: string | null;
	property?: {
		title?: string;
	};
	tenant?: {
		email?: string;
		profile?: {
			first_name?: string;
			last_name?: string;
		};
	};
}

const formatCurrency = (amount: number) => `NGN ${amount.toLocaleString()}`;

const getTenantName = (tenant?: LeaseRequest["tenant"] | Invoice["tenant"]) => {
	const name = [tenant?.profile?.first_name, tenant?.profile?.last_name]
		.filter(Boolean)
		.join(" ");
	return name || tenant?.email || "Tenant";
};

export default function AgentDashboard() {
	const [data, setData] = useState<DashboardData | null>(null);
	const [leaseRequests, setLeaseRequests] = useState<LeaseRequest[]>([]);
	const [invoices, setInvoices] = useState<Invoice[]>([]);
	const [loading, setLoading] = useState(true);
	const [processingId, setProcessingId] = useState<string | null>(null);

	const fetchDashboard = async () => {
		try {
			const [summaryRes, requestRes, invoiceRes] = await Promise.allSettled([
				api.get<DashboardData>(ENDPOINTS.AGENT.SUMMARY),
				api.get<LeaseRequest[]>("/lease-requests/incoming"),
				api.get<Invoice[]>("/invoices/incoming"),
			]);

			if (summaryRes.status === "fulfilled") {
				setData(summaryRes.value);
			}
			if (requestRes.status === "fulfilled") {
				setLeaseRequests(requestRes.value || []);
			}
			if (invoiceRes.status === "fulfilled") {
				setInvoices(invoiceRes.value || []);
			}
		} catch (err) {
			console.error("Failed to fetch dashboard", err);
		} finally {
			setLoading(false);
		}
	};

	useEffect(() => {
		queueMicrotask(() => {
			fetchDashboard();
		});
	}, []);

	const handleAcceptMandate = async (id: string) => {
		setProcessingId(id);
		try {
			await api.post(ENDPOINTS.AGENT.ACCEPT_MANDATE(id), {});
			toast.success("Mandate accepted! You now manage this property.");

			// Optimistic Update: Immediately remove from pending and move to active
			if (data) {
				const acceptedProp = data.pending_mandates.find((p) => p.id === id);
				setData({
					...data,
					pending_mandates: data.pending_mandates.filter((p) => p.id !== id),
					active_mandates: acceptedProp
						? [...data.active_mandates, acceptedProp]
						: data.active_mandates,
					total_managed: data.total_managed + 1,
				});
			}

			// Still fetch the latest data after a small delay to be safe
			setTimeout(fetchDashboard, 1000);
		} catch (err) {
			console.error("Failed to accept mandate", err);
			toast.error("Failed to accept mandate.");
		} finally {
			setProcessingId(null);
		}
	};

	if (loading) {
		return (
			<div className="space-y-10 animate-pulse">
				<div className="h-20 w-1/3 bg-white/5 rounded-2xl" />
				<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
					{[1, 2, 3].map((i) => (
						<div key={i} className="h-32 bg-white/5 rounded-[2rem]" />
					))}
				</div>
				<div className="h-96 w-full bg-white/5 rounded-[3rem]" />
			</div>
		);
	}

	// Safe variables with fallbacks
	const pendingMandates = data?.pending_mandates || [];
	const activeMandates = data?.active_mandates || [];
	const paidInvoices = invoices
		.filter((invoice) => invoice.status === "PAID")
		.slice(0, 4);
	const openInvoices = invoices.filter(
		(invoice) => invoice.status === "PENDING" || invoice.status === "OVERDUE",
	);

	return (
		<div className="space-y-10 animate-in fade-in duration-700">
			{/* Header */}
			<div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
				<div className="space-y-2">
					<h1 className="text-3xl md:text-4xl font-bold font-heading text-white tracking-tight">
						Agent Command Center
					</h1>
					<p className="text-gray-500 font-light">
						Managing your professional real estate mandates.
					</p>
				</div>
			</div>

			{/* Stats */}
			<div className="grid grid-cols-1 md:grid-cols-3 gap-6">
				<div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
					<div className="flex justify-between items-start mb-4">
						<div className="w-12 h-12 bg-primary/10 rounded-2xl flex items-center justify-center text-primary">
							<Briefcase size={24} />
						</div>
						<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							Mandates
						</span>
					</div>
					<p className="text-3xl font-bold text-white">
						{data?.total_managed || 0}
					</p>
					<p className="text-xs text-gray-500 font-light">Active Properties</p>
				</div>
				<div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8 relative overflow-hidden group">
					<div className="flex justify-between items-start mb-4">
						<div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
							<UserPlus size={24} />
						</div>
						<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							Offers
						</span>
					</div>
					<p className="text-3xl font-bold text-white">
						{pendingMandates.length}
					</p>
					<p className="text-xs text-gray-500 font-light">
						Awaiting Acceptance
					</p>
					{pendingMandates.length > 0 && (
						<div className="absolute top-4 right-4 w-2 h-2 bg-primary rounded-full animate-ping" />
					)}
				</div>
				<div className="bg-white/[0.02] border border-white/5 rounded-[2rem] p-8">
					<div className="flex justify-between items-start mb-4">
						<div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400">
							<Clock size={24} />
						</div>
						<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							Workflows
						</span>
					</div>
					<p className="text-3xl font-bold text-white">
						{data?.new_invites || 0}
					</p>
					<p className="text-xs text-gray-500 font-light">
						Pending Invitations
					</p>
				</div>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
				<Link
					href="/agent/leases"
					className="bg-white/[0.02] border border-white/5 rounded-[2.5rem] p-8 group hover:bg-white/[0.04] transition-all"
				>
					<div className="flex items-start justify-between gap-4 mb-8">
						<div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
							<FileText size={20} />
						</div>
						<span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">
							{leaseRequests.length} pending
						</span>
					</div>
					<h2 className="text-lg font-bold text-white">Lease Management</h2>
					<p className="text-xs text-gray-500 mt-2 leading-relaxed">
						Review tenant lease requests and upload handover documents.
					</p>
					<span className="mt-8 inline-flex items-center gap-2 text-xs font-bold text-primary group-hover:gap-3 transition-all">
						Manage leases <ArrowUpRight size={14} />
					</span>
				</Link>

				<div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
					<div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
						<h2 className="text-lg font-bold text-white flex items-center gap-2">
							<Wallet size={18} className="text-green-500" />
							Paid Rent
						</h2>
						<Link
							href="/agent/payments"
							className="text-[10px] font-black text-primary uppercase tracking-widest hover:text-primary-hover transition-colors"
						>
							{openInvoices.length} open
						</Link>
					</div>
					<div className="p-2">
						{paidInvoices.map((invoice) => (
							<div
								key={invoice.id}
								className="flex items-center justify-between gap-4 p-6 hover:bg-white/[0.02] rounded-3xl transition-all"
							>
								<div>
									<p className="text-sm font-bold text-white">
										{invoice.property?.title || "Property invoice"}
									</p>
									<p className="text-[10px] text-gray-500 uppercase tracking-widest font-black mt-1">
										{getTenantName(invoice.tenant)} •{" "}
										{invoice.type.replaceAll("_", " ")}
									</p>
								</div>
								<div className="text-right">
									<p className="text-sm font-bold text-green-500">
										{formatCurrency(invoice.amount)}
									</p>
									<p className="text-[10px] text-gray-500 font-bold">
										{invoice.paid_at
											? new Date(invoice.paid_at).toLocaleDateString()
											: "Paid"}
									</p>
								</div>
							</div>
						))}
						{paidInvoices.length === 0 && (
							<div className="p-10 text-center text-gray-600">
								<p>
									Paid rent invoices from managed properties will appear here.
								</p>
							</div>
						)}
					</div>
				</div>
			</div>

			<SaleReservationsPanel mode="stakeholder" />

			{/* Handshake Section (New Mandates) */}
			{pendingMandates.length > 0 && (
				<div className="space-y-6">
					<div className="flex items-center gap-4 px-4">
						<ShieldCheck className="text-primary" size={20} />
						<h2 className="text-xl font-bold text-white tracking-tight">
							New Mandate Offers
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-4">
						{pendingMandates.map((prop) => (
							<div
								key={prop.id}
								className="bg-primary/5 border border-primary/10 rounded-[2.5rem] p-8 flex flex-col lg:flex-row justify-between items-center gap-8 animate-in slide-in-from-right-4 duration-500"
							>
								<div className="flex items-center gap-6">
									<div className="w-16 h-16 bg-primary/20 rounded-2xl flex items-center justify-center text-primary">
										<Building2 size={28} />
									</div>
									<div className="space-y-1">
										<h3 className="text-xl font-bold text-white">
											{prop.title}
										</h3>
										<p className="text-sm text-gray-400 flex items-center gap-1.5">
											<MapPin size={12} /> {prop.location || "Location pending"}
										</p>
										<p className="text-primary font-bold text-xs">
											{formatCurrency(prop.price || 0)} Annual Value
										</p>
									</div>
								</div>
								<div className="flex gap-4">
									<button className="px-8 py-4 bg-white/5 border border-white/10 rounded-2xl text-gray-400 font-bold text-sm hover:bg-red-500/10 hover:text-red-500 transition-all flex items-center gap-2">
										<XCircle size={18} /> Decline
									</button>
									<button
										disabled={processingId === prop.id}
										onClick={() => handleAcceptMandate(prop.id)}
										className="px-10 py-4 bg-primary text-black rounded-2xl font-black text-sm hover:bg-primary-hover transition-all flex items-center gap-2 shadow-xl shadow-primary/20"
									>
										{processingId === prop.id ? (
											<Loader2 size={18} className="animate-spin" />
										) : (
											<>
												<CheckCircle2 size={18} /> Accept Mandate
											</>
										)}
									</button>
								</div>
							</div>
						))}
					</div>
				</div>
			)}

			{/* Active Mandates Mini-List */}
			<div className="bg-white/[0.02] border border-white/5 rounded-[3rem] overflow-hidden">
				<div className="p-8 border-b border-white/5 flex justify-between items-center bg-white/[0.01]">
					<h2 className="text-lg font-bold text-white">Managed Portfolio</h2>
					<button className="text-xs font-bold text-primary hover:underline">
						View All Mandates
					</button>
				</div>
				<div className="divide-y divide-white/5">
					{activeMandates.map((prop) => (
						<div
							key={prop.id}
							className="p-8 hover:bg-white/[0.03] transition-all group"
						>
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-6">
									<div className="w-12 h-12 bg-white/5 rounded-2xl flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors">
										<Building2 size={20} />
									</div>
									<div>
										<h4 className="font-bold text-white">{prop.title}</h4>
										<p className="text-xs text-gray-500">{prop.status}</p>
									</div>
								</div>
								<button className="p-2 text-gray-600 hover:text-white">
									<ArrowUpRight size={20} />
								</button>
							</div>
						</div>
					))}
					{activeMandates.length === 0 && (
						<div className="p-20 text-center text-gray-600">
							<Building2 className="mx-auto mb-4 opacity-10" size={40} />
							<p>No active properties under your management.</p>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
