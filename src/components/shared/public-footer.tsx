import Link from "next/link";
import { Logo } from "@/components/shared/logo";

const footerColumns = [
  {
    title: "Navigation",
    links: [
      { label: "Home", href: "/" },
      { label: "Properties", href: "/properties" },
      { label: "About Us", href: "/about" },
      { label: "Contact", href: "/contact" },
    ],
  },
  {
    title: "Platform",
    links: [
      { label: "Tenant Wallet", href: "/login" },
      { label: "Owner Tools", href: "/login" },
      { label: "Agent Mandates", href: "/login" },
      { label: "Secure Payments", href: "/properties" },
    ],
  },
  {
    title: "Contact",
    links: [
      { label: "info@theproperty.com", href: "mailto:info@theproperty.com" },
      { label: "+234 800 000 0000", href: "tel:+2348000000000" },
      { label: "Lagos, Nigeria", href: "/contact" },
      { label: "Support Desk", href: "/contact" },
    ],
  },
];

export function PublicFooter() {
  return (
    <footer className="bg-[#050505] pt-24 pb-12 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-8 md:px-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-16 mb-20">
          <div className="space-y-6">
            <Logo className="items-start" size="lg" />
            <p className="text-gray-500 text-sm leading-relaxed">
              A secure property marketplace for verified listings, lease workflows, wallet payments, sale reservations, and ownership transfer records.
            </p>
          </div>

          {footerColumns.map((col) => (
            <div key={col.title} className="space-y-6">
              <h4 className="text-sm font-bold uppercase tracking-[0.2em] text-white">
                {col.title}
              </h4>
              <ul className="space-y-4">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link href={link.href} className="text-gray-500 text-sm hover:text-primary transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="pt-12 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-6 text-xs text-gray-600 uppercase tracking-widest font-medium">
          <p>© 2026 The Property Real Estate Platform. All rights reserved.</p>
          <div className="flex gap-8">
            <span>Verified Workflows</span>
            <span>Est. 2024</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
