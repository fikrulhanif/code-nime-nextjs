import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Providers } from "./providers";
import { Toaster } from "sonner";
import { Header } from "@/components/navigation/header";
import { MobileNav } from "@/components/navigation/mobile-nav";
import { TrailerModal } from "@/components/ui/trailer-modal";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "CodeNime",
  description:
    "Discover, browse, and track anime with CodeNime discovery platform",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <Providers>
          <Header />
          <MobileNav />
          <main className="flex-1">{children}</main>
          <TrailerModal />
          <Toaster position="top-right" richColors />
        </Providers>
      </body>
    </html>
  );
}
