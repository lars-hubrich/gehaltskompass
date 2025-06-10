import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Gehaltskompass",
  description:
    "Unsere Website ermöglicht es dir, deine Gehaltsabrechnungen hochzuladen und zu speichern, um dir aufbereitete Graphen und Statistiken zu bieten. Mit KI-gestützten Antworten erhältst du wertvolle Informationen zu all deinen Gehaltsfragen, und unsere benutzerfreundliche Oberfläche sorgt für eine nahtlose Erfahrung auf allen Geräten.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
