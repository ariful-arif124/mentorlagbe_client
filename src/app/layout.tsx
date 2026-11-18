
import type { Metadata } from "next";
import { Inter, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";
import { Suspense } from "react";
import Navbar from "@/components/layout/navbar";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
});

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-plus-jakarta-sans",
});

export const metadata: Metadata = {
  title: "MentorLagbe | Find Your Ideal Tutor",
  description:
    "Connect with qualified tutors and discover personalized learning opportunities with MentorLagbe.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${plusJakartaSans.variable} antialiased`}
      >
        <Suspense fallback={<div className="h-20" />}>
          <Navbar />
        </Suspense>        {children}
      </body>
    </html>
  );
}
