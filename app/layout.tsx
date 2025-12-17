import type { Metadata } from "next";
import { Inter, Roboto_Mono } from "next/font/google";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { CandidateProvider } from "@/components/candidate-context";
import { SiteHeader } from "@/components/site-header";
import { ChatWidget } from "@/components/chat-widget";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin", "vietnamese"],
  display: "swap",
});

const robotoMono = Roboto_Mono({
  variable: "--font-roboto-mono",
  subsets: ["latin", "vietnamese"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "TalentIQ - AI Recruitment Dashboard",
  description: "AI-powered Applicant Tracking System",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${robotoMono.variable} antialiased`}
      >
        <CandidateProvider>
          <SiteHeader />
          <main className="min-h-[calc(100vh-3.5rem)]">
            {children}
          </main>
          <ChatWidget />
          <Toaster />
        </CandidateProvider>
      </body>
    </html>
  );
}
