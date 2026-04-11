import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: {
    default: "WorkLin — Conectamos talento con empresas",
    template: "%s | WorkLin",
  },
  description:
    "Plataforma de empleo sectorial que conecta profesionales del sector servicios con empresas que necesitan contratar. Hostelería, construcción, peluquería y más.",
  keywords: ["empleo", "trabajo", "hostelería", "construcción", "profesionales", "España"],
  openGraph: {
    title: "WorkLin — Conectamos talento con empresas",
    description:
      "Plataforma de empleo sectorial para profesionales del sector servicios en España.",
    type: "website",
    locale: "es_ES",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased bg-[#0a0a0f]`}
    >
      <body className="min-h-full bg-[#0a0a0f] text-white">{children}</body>
    </html>
  );
}