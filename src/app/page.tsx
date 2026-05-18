import Image from "next/image";
import Link from "next/link";
import {
	Search,
	ArrowRight,
	ShieldCheck,
	Zap,
	Globe,
	Mail,
} from "lucide-react";
import { PublicFooter } from "@/components/shared/public-footer";
import { PublicNav } from "@/components/shared/public-nav";

export default function Home() {
	return (
		<div className="min-h-screen bg-background text-foreground flex flex-col font-sans overflow-x-hidden">
			<PublicNav />

			<section className="flex flex-col lg:flex-row items-center justify-between px-8 md:px-16 max-w-7xl mx-auto w-full pt-12 pb-24 gap-16 relative">
				<div className="absolute top-1/4 left-10 w-96 h-96 bg-primary/5 rounded-full blur-3xl -z-10" />

				<div className="flex-1 space-y-10 z-10 w-full">
					<div className="space-y-6">
						<h3 className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
							Secure Property Workflows
						</h3>
						<h1 className="text-5xl md:text-6xl lg:text-[76px] font-bold leading-[1.05] tracking-tight font-heading">
							Discover Your Future: <br />
							<span className="text-transparent bg-clip-text bg-gradient-to-r from-white via-gray-200 to-gray-500">
								Find The Perfect Estate
							</span>
						</h1>
						<p className="text-gray-400 max-w-xl text-base md:text-lg leading-relaxed font-light">
							Find verified properties, request leases, reserve sale listings, make wallet-backed payments, and keep every document in one auditable record.
						</p>
					</div>

					<div className="flex flex-wrap gap-6">
						<Link href="/properties" className="bg-gradient-to-r from-[#1a1512] to-primary/30 border border-primary/20 px-10 py-4 rounded-full text-sm font-semibold hover:from-primary/20 hover:to-primary/50 transition-all flex items-center gap-3 group shadow-[0_0_20px_rgba(193,155,118,0.1)]">
							Explore Now
							<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform text-primary" />
						</Link>
						<Link href="/about" className="bg-white/5 border border-white/10 px-10 py-4 rounded-full text-sm font-semibold hover:bg-white/10 transition-all">
							How It Works
						</Link>
					</div>

					<div className="mt-16 bg-[#141414]/80 border border-[#2A2A2A] rounded-2xl p-2 max-w-[600px] backdrop-blur-md shadow-2xl">
						<div className="flex gap-4 mb-3 px-6 pt-3">
							<button className="text-sm font-semibold border-b-2 border-primary pb-2 text-white">
								Buy
							</button>
							<button className="text-sm font-medium border-b-2 border-transparent pb-2 text-gray-500 hover:text-gray-300 transition-colors">
								Rent
							</button>
						</div>

						<div className="flex items-center gap-6 bg-gradient-to-r from-[#1E1A17] to-[#12100E] rounded-xl p-4 border border-[#2A2A2A]/50">
							<div className="flex-1 pl-2">
								<p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-tighter">
									Location
								</p>
								<p className="text-sm text-gray-200 font-medium font-heading tracking-wide text-nowrap overflow-hidden">
									Lagos, Nigeria
								</p>
							</div>
							<div className="w-[1px] h-10 bg-gray-800" />
							<div className="flex-1">
								<p className="text-xs text-gray-500 mb-1.5 font-medium uppercase tracking-tighter">
									Workflow
								</p>
								<p className="text-sm text-gray-200 font-medium font-heading tracking-wide">
									Rent or Sale
								</p>
							</div>
							<Link href="/properties" className="bg-primary hover:bg-primary-hover p-4 rounded-xl transition-colors shadow-lg">
								<Search size={20} className="text-black stroke-[2.5]" />
							</Link>
						</div>
					</div>
				</div>

				<div className="flex-1 relative w-full h-[500px] lg:h-[700px] flex justify-center items-center">
					<div className="absolute inset-0 bg-primary/10 rounded-full blur-[100px] -z-10" />

					<div className="relative w-full h-full lg:scale-125 lg:translate-x-12 translate-y-8">
						<Image
							src="/images/house.png"
							alt="Modern luxury house render"
							fill
							className="object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
							priority
							sizes="(max-width: 768px) 100vw, 50vw"
						/>
					</div>
				</div>
			</section>

			<section className="py-20 bg-[#070707] border-y border-white/5">
				<div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-2 md:grid-cols-4 gap-12">
					{[
						{ label: "Verified Listings", value: "1.2K+" },
						{ label: "Completed Workflows", value: "980+" },
						{ label: "Expert Agents", value: "45+" },
						{ label: "Audit Records", value: "12K+" },
					].map((stat) => (
						<div key={stat.label} className="text-center space-y-2">
							<h4 className="text-4xl font-bold font-heading text-primary">
								{stat.value}
							</h4>
							<p className="text-gray-500 text-xs uppercase tracking-[0.2em]">
								{stat.label}
							</p>
						</div>
					))}
				</div>
			</section>

			<section className="py-32 px-8 md:px-16 max-w-7xl mx-auto w-full">
				<div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-6">
					<div className="space-y-4">
						<h3 className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
							Featured Estates
						</h3>
						<h2 className="text-4xl md:text-5xl font-bold font-heading">
							Our Exclusive Selection
						</h2>
					</div>
					<Link href="/properties" className="text-sm font-semibold text-gray-400 hover:text-white flex items-center gap-2 group border-b border-white/10 pb-1">
						View All Properties
						<ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
					</Link>
				</div>

				<div className="grid grid-cols-1 md:grid-cols-3 gap-8">
					{[
						{ title: "Lekki Glass House", location: "Lekki, Lagos", price: "NGN 120,000,000" },
						{ title: "Ikoyi Terrace", location: "Ikoyi, Lagos", price: "NGN 8,500,000" },
						{ title: "Abuja Smart Villa", location: "Maitama, Abuja", price: "NGN 240,000,000" },
					].map((item) => (
						<Link href="/properties" key={item.title} className="group cursor-pointer">
							<div className="relative aspect-[4/5] overflow-hidden rounded-2xl mb-6">
								<div className="absolute inset-0 bg-black/20 group-hover:bg-black/0 transition-colors z-10" />
								<Image
									src="https://images.unsplash.com/photo-1600585154340-be6161a56a0c?q=80&w=2070&auto=format&fit=crop"
									alt={item.title}
									fill
									className="object-cover group-hover:scale-110 transition-transform duration-700"
								/>
								<div className="absolute bottom-6 left-6 z-20 text-white">
									<span className="bg-primary/90 backdrop-blur-sm text-black text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-tighter mb-2 inline-block">
										Featured
									</span>
									<h4 className="text-2xl font-bold font-heading">
										{item.title}
									</h4>
									<p className="text-sm font-light text-gray-200">
										{item.location}
									</p>
								</div>
							</div>
							<div className="flex justify-between items-center px-2">
								<p className="text-xl font-bold font-heading text-primary">
									{item.price}
								</p>
								<div className="flex gap-4 text-xs text-gray-500 font-medium">
									<span>Verified</span>
									<span>Documents</span>
								</div>
							</div>
						</Link>
					))}
				</div>
			</section>

			<section className="py-32 bg-[#070707] relative overflow-hidden">
				<div className="absolute top-0 right-0 w-1/2 h-full bg-primary/5 blur-[120px] -z-10" />
				<div className="max-w-7xl mx-auto px-8 md:px-16 flex flex-col lg:flex-row gap-20">
					<div className="lg:w-1/3 space-y-8">
						<div className="space-y-4">
							<h3 className="text-primary text-xs font-bold tracking-[0.3em] uppercase">
								Why Us
							</h3>
							<h2 className="text-4xl font-bold font-heading leading-tight">
								Setting New Standards In Real Estate
							</h2>
						</div>
						<p className="text-gray-400 font-light leading-relaxed">
							We keep real estate workflows grounded in approvals, invoices, document handover, dispute handling, and final confirmation.
						</p>
						<Link href="/about" className="inline-flex text-primary font-bold border-b-2 border-primary/20 pb-1 hover:border-primary transition-all">
							Learn More About Us
						</Link>
					</div>

					<div className="flex-1 grid grid-cols-1 md:grid-cols-2 gap-8">
						{[
							{
								icon: ShieldCheck,
								title: "Secure Transactions",
								desc: "Wallet payments are tied to invoices, reservations, and receipts with clear references.",
							},
							{
								icon: Zap,
								title: "Fast Processing",
								desc: "Applications, approvals, uploads, and acknowledgements move through guided workflows.",
							},
							{
								icon: Globe,
								title: "Property-Level Ownership",
								desc: "Sale completion creates ownership transfer records without forcing role confusion.",
							},
							{
								icon: Mail,
								title: "Workflow Notifications",
								desc: "Stakeholders receive updates as leases, documents, maintenance, and sale records move forward.",
							},
						].map((service) => (
							<div key={service.title} className="bg-white/5 border border-white/5 p-8 rounded-3xl hover:bg-white/[0.08] transition-colors group">
								<service.icon className="w-10 h-10 text-primary mb-6 group-hover:scale-110 transition-transform" />
								<h4 className="text-xl font-bold font-heading mb-3">
									{service.title}
								</h4>
								<p className="text-sm text-gray-500 leading-relaxed">
									{service.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			<section className="py-32 px-8 md:px-16 max-w-5xl mx-auto text-center space-y-10">
				<h2 className="text-5xl md:text-7xl font-bold font-heading">
					Ready to find your <br />
					<span className="italic text-primary">dream home?</span>
				</h2>
				<p className="text-gray-400 max-w-2xl mx-auto text-lg font-light">
					Browse verified listings and move through rent or sale workflows with records you can trust.
				</p>
				<Link href="/properties" className="inline-flex bg-primary hover:bg-primary-hover text-black px-12 py-5 rounded-full font-bold text-lg transition-all shadow-[0_10px_40px_rgba(193,155,118,0.3)]">
					Get Started Today
				</Link>
			</section>

			<PublicFooter />
		</div>
	);
}
