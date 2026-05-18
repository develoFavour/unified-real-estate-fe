import Link from "next/link";
import { Logo } from "@/components/shared/logo";

export function PublicNav() {
	return (
		<nav className="flex items-center justify-between px-8 md:px-16 py-8 max-w-7xl mx-auto w-full z-50">
			<Logo />

			<div className="hidden md:flex items-center gap-10 text-sm text-gray-400 font-medium">
				<Link href="/" className="hover:text-primary transition-colors">
					Home
				</Link>
				<Link href="/about" className="hover:text-primary transition-colors">
					About
				</Link>
				<Link
					href="/properties"
					className="hover:text-primary transition-colors"
				>
					Properties
				</Link>
				<Link href="/contact" className="hover:text-primary transition-colors">
					Contact
				</Link>
			</div>

			<Link
				href="/login"
				className="bg-gradient-to-r from-[#1a1512] to-primary/30 border border-primary/20 px-6 md:px-8 py-2.5 rounded-full text-sm font-medium hover:from-primary/20 hover:to-primary/40 transition-all text-white/90 shadow-[0_0_15px_rgba(193,155,118,0.1)]"
			>
				login
			</Link>
		</nav>
	);
}
