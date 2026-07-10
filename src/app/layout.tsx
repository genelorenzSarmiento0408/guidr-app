import type { Metadata } from "next";
import { Geist, Geist_Mono, League_Spartan } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const leagueSpartan = League_Spartan({
  variable: "--font-league-spartan",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
  ),
  title: {
    default: "Guidr - Guide Platform",
    template: "%s | Guidr",
  },
  description:
    "Guidr helps students and organizations discover opportunities, connect, and collaborate with purpose.",
  openGraph: {
    title: "Guidr - Guide Platform",
    description:
      "Discover internships, mentorships, and collaboration opportunities on Guidr.",
    type: "website",
    siteName: "Guidr",
    url: "/",
  },
  twitter: {
    card: "summary_large_image",
    title: "Guidr - Guide Platform",
    description:
      "Discover internships, mentorships, and collaboration opportunities on Guidr.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} ${leagueSpartan.variable} antialiased`}
      >
        <Navigation />
        <main className="min-h-screen">{children}</main>
      </body>
    </html>
  );
}
