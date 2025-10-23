import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { AuthProvider } from "@/components/AuthProvider";
import GiniChat from "@/components/GiniChat";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Auraluxe - Luxury Jewelry",
  description: "Discover exquisite jewelry crafted with excellence",
  viewport: "width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className="overflow-x-hidden">
      <body className={`${inter.className} overflow-x-hidden`}>
        <AuthProvider>
          <Header />
          <main className="min-h-screen">{children}</main>
          <Footer />
          <GiniChat />
        </AuthProvider>
      </body>
    </html>
  );
}
