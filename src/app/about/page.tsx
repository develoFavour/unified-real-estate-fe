import Image from "next/image";
import Link from "next/link";
import { ArrowRight, BadgeCheck, FileText, Handshake, Landmark, ShieldCheck, Wallet } from "lucide-react";
import { PublicFooter } from "@/components/shared/public-footer";
import { PublicNav } from "@/components/shared/public-nav";

const principles = [
  {
    icon: ShieldCheck,
    title: "Verified Before Commitment",
    desc: "Listings, agents, documents, lease evidence, and sale proofs are treated as workflow records, not loose promises.",
  },
  {
    icon: Wallet,
    title: "Payments With Context",
    desc: "Rent, service charges, reservation deposits, and settlements are tied to invoices or property records for clean receipts.",
  },
  {
    icon: FileText,
    title: "Documents Drive Completion",
    desc: "A property is not simply marked rented or sold because money moved. Documents, review, and acknowledgement matter.",
  },
  {
    icon: Handshake,
    title: "Everyone Has A Trail",
    desc: "Tenants, buyers, owners, and agents get a visible audit path across requests, payments, disputes, and handover.",
  },
];

const workflow = [
  "Tenant requests lease before rent payment",
  "Owner or accepted agent approves lease terms",
  "Rent invoice is paid through wallet",
  "Lease and handover documents are uploaded",
  "Tenant acknowledges documents before activation",
  "Sale buyers reserve, review documents, settle, then receive transfer proof",
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicNav />

      <main>
        <section className="px-8 md:px-16 max-w-7xl mx-auto pt-16 pb-28 grid grid-cols-1 lg:grid-cols-12 gap-14 items-center">
          <div className="lg:col-span-6 space-y-8">
            <div className="space-y-5">
              <p className="text-primary text-xs font-bold tracking-[0.3em] uppercase">About The Property</p>
              <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight">
                Real estate should feel secure before it feels fast.
              </h1>
              <p className="text-gray-400 text-lg leading-relaxed font-light max-w-2xl">
                The Property is built around the real steps of renting, buying, managing, and transferring property: applications, approvals, invoices, documents, acknowledgements, disputes, and audit trails.
              </p>
            </div>

            <div className="flex flex-wrap gap-4">
              <Link href="/properties" className="inline-flex items-center gap-3 bg-primary text-black px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary-hover transition-all">
                Explore Listings <ArrowRight size={16} />
              </Link>
              <Link href="/contact" className="inline-flex items-center gap-3 bg-white/5 border border-white/10 text-white px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-white/10 transition-all">
                Talk To Us
              </Link>
            </div>
          </div>

          <div className="lg:col-span-6">
            <div className="relative aspect-[4/5] rounded-[2rem] overflow-hidden border border-white/10 bg-white/[0.03]">
              <Image
                src="https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?q=80&w=1974&auto=format&fit=crop"
                alt="Modern verified property interior"
                fill
                priority
                className="object-cover"
              />
              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black via-black/40 to-transparent p-8">
                <div className="inline-flex items-center gap-2 rounded-full bg-primary px-4 py-2 text-[10px] font-black uppercase tracking-widest text-black">
                  <BadgeCheck size={14} /> Verified workflow
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="bg-[#070707] border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-4 gap-6">
            {principles.map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-7">
                <item.icon className="w-9 h-9 text-primary mb-6" />
                <h2 className="text-xl font-bold font-heading mb-3">{item.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>

        <section className="px-8 md:px-16 max-w-7xl mx-auto py-28 grid grid-cols-1 lg:grid-cols-12 gap-14">
          <div className="lg:col-span-5 space-y-5">
            <p className="text-primary text-xs font-bold tracking-[0.3em] uppercase">How We Think</p>
            <h2 className="text-4xl md:text-5xl font-bold font-heading leading-tight">Not an ecommerce checkout. A property lifecycle.</h2>
            <p className="text-gray-500 leading-relaxed">
              Buying or renting a home has legal, financial, and human steps. Our system keeps those steps visible so nobody has to rely on screenshots, verbal confirmation, or manual promises.
            </p>
          </div>

          <div className="lg:col-span-7 rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8">
            <div className="space-y-4">
              {workflow.map((item, index) => (
                <div key={item} className="flex items-start gap-5 rounded-2xl bg-black/20 border border-white/5 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-primary text-sm font-black text-black">
                    {index + 1}
                  </div>
                  <div>
                    <p className="text-sm font-bold text-white">{item}</p>
                    <p className="mt-1 text-xs text-gray-600">Tracked as a platform record.</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="px-8 md:px-16 max-w-7xl mx-auto pb-28">
          <div className="rounded-[2rem] border border-primary/20 bg-primary/5 p-8 md:p-12 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-2 text-primary text-xs font-black uppercase tracking-widest">
                <Landmark size={16} /> Built for serious transactions
              </div>
              <h2 className="text-3xl md:text-4xl font-bold font-heading">Ready to inspect verified listings?</h2>
            </div>
            <Link href="/properties" className="inline-flex items-center justify-center gap-3 bg-white text-black px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary transition-all">
              Browse Properties <ArrowRight size={16} />
            </Link>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
