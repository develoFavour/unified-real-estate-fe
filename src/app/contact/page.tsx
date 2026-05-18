"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { ArrowRight, Building2, Clock, Mail, MapPin, MessageSquare, Phone, Send } from "lucide-react";
import { toast } from "sonner";
import { PublicFooter } from "@/components/shared/public-footer";
import { PublicNav } from "@/components/shared/public-nav";

const contactChannels = [
  {
    icon: Mail,
    title: "Email",
    value: "info@theproperty.com",
    href: "mailto:info@theproperty.com",
  },
  {
    icon: Phone,
    title: "Phone",
    value: "+234 800 000 0000",
    href: "tel:+2348000000000",
  },
  {
    icon: MapPin,
    title: "Office",
    value: "Victoria Island, Lagos",
    href: "https://maps.google.com",
  },
  {
    icon: Clock,
    title: "Hours",
    value: "Mon - Fri, 9AM - 6PM",
    href: "/contact",
  },
];

export default function ContactPage() {
  const [submitting, setSubmitting] = useState(false);

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSubmitting(true);

    window.setTimeout(() => {
      setSubmitting(false);
      event.currentTarget.reset();
      toast.success("Message captured. Our team will respond shortly.");
    }, 600);
  };

  return (
    <div className="min-h-screen bg-background text-foreground overflow-x-hidden">
      <PublicNav />

      <main>
        <section className="px-8 md:px-16 max-w-7xl mx-auto pt-16 pb-24">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-14">
            <div className="lg:col-span-5 space-y-8">
              <div className="space-y-5">
                <p className="text-primary text-xs font-bold tracking-[0.3em] uppercase">Contact Us</p>
                <h1 className="text-5xl md:text-7xl font-bold font-heading leading-tight">
                  Let&apos;s make the next property step clearer.
                </h1>
                <p className="text-gray-400 text-lg leading-relaxed font-light">
                  Ask about listings, lease requests, agent mandates, wallet payments, sale reservations, document review, or ownership transfer records.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {contactChannels.map((channel) => (
                  <Link key={channel.title} href={channel.href} className="rounded-[1.5rem] border border-white/5 bg-white/[0.03] p-5 hover:border-primary/30 hover:bg-white/[0.05] transition-all">
                    <channel.icon className="w-6 h-6 text-primary mb-4" />
                    <p className="text-[10px] font-black uppercase tracking-widest text-gray-500">{channel.title}</p>
                    <p className="mt-2 text-sm font-bold text-white">{channel.value}</p>
                  </Link>
                ))}
              </div>
            </div>

            <div className="lg:col-span-7">
              <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-white/[0.03] p-6 md:p-8 space-y-6">
                <div className="flex items-center gap-3 border-b border-white/5 pb-6">
                  <div className="h-12 w-12 rounded-2xl bg-primary/10 flex items-center justify-center text-primary">
                    <MessageSquare size={22} />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold font-heading text-white">Send a message</h2>
                    <p className="text-xs text-gray-500">We usually reply within one business day.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Full Name</label>
                    <input required name="name" className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm outline-none transition focus:border-primary/50" placeholder="Your name" />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Email</label>
                    <input required type="email" name="email" className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm outline-none transition focus:border-primary/50" placeholder="you@example.com" />
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Reason</label>
                    <input name="reason" className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm outline-none transition focus:border-primary/50" placeholder="Listing, payment, lease..." />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Phone</label>
                    <input name="phone" className="w-full h-14 rounded-2xl border border-white/10 bg-white/[0.04] px-5 text-sm outline-none transition focus:border-primary/50" placeholder="+234..." />
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[10px] font-black uppercase tracking-widest text-gray-500 ml-4">Message</label>
                  <textarea required name="message" rows={6} className="w-full rounded-2xl border border-white/10 bg-white/[0.04] p-5 text-sm outline-none transition focus:border-primary/50 resize-none" placeholder="Tell us what you need help with." />
                </div>

                <button disabled={submitting} className="inline-flex w-full md:w-auto items-center justify-center gap-3 bg-primary text-black px-8 py-4 rounded-full text-sm font-black uppercase tracking-widest hover:bg-primary-hover transition-all disabled:opacity-60">
                  {submitting ? "Sending..." : "Send Message"} <Send size={16} />
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="bg-[#070707] border-y border-white/5 py-24">
          <div className="max-w-7xl mx-auto px-8 md:px-16 grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              { icon: Building2, title: "Owners", desc: "List verified properties, assign agents, issue invoices, and track lease or sale completion." },
              { icon: MessageSquare, title: "Tenants", desc: "Request leases, pay invoices securely, review documents, and manage maintenance requests." },
              { icon: ArrowRight, title: "Agents", desc: "Accept mandates, manage handover evidence, respond to workflows, and support property owners." },
            ].map((item) => (
              <div key={item.title} className="rounded-[2rem] border border-white/5 bg-white/[0.03] p-7">
                <item.icon className="w-8 h-8 text-primary mb-5" />
                <h2 className="text-xl font-bold font-heading mb-3">{item.title}</h2>
                <p className="text-sm text-gray-500 leading-relaxed">{item.desc}</p>
              </div>
            ))}
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
