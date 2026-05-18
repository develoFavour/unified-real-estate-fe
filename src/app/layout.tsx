import type { Metadata } from "next";
import { Playfair_Display, Geist } from "next/font/google";
import "./globals.css";
import { cn } from "@/lib/utils";
import QueryProvider from "@/components/providers/query-provider";
import { AuthProvider } from "@/components/providers/auth-provider";
import { Toaster } from "@/components/ui/sonner";

const playfair = Playfair_Display({ subsets: ["latin"], variable: "--font-playfair" });
const geist = Geist({ subsets: ["latin"], variable: "--font-geist-sans" });

export const metadata: Metadata = {
  title: "Unified Real Estate Management System",
  description: "Manage properties, tenants, and leases seamlessly.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={cn("dark", playfair.variable, "font-sans", geist.variable)} suppressHydrationWarning>
      <body className="font-sans antialiased bg-background text-foreground">
        <QueryProvider>
          <AuthProvider>
            {children}
            <Toaster position="top-right" expand={false} richColors />
          </AuthProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
