import type { Metadata, Viewport } from "next";
import { Geist_Mono, Instrument_Serif } from "next/font/google";
import { SmoothScroll } from "@/components/SmoothScroll";
import "./globals.css";

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? "https://tejasmali.dev";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "Tejas Mali",
    template: "%s · Tejas Mali",
  },
  description:
    "Tejas Mali — Automation & Robotics student from Surat. Building open-source robotics projects through MLH and Hack Club.",
  applicationName: "Tejas Mali",
  authors: [{ name: "Tejas Mali", url: siteUrl }],
  creator: "Tejas Mali",
  keywords: [
    "Tejas Mali",
    "automation",
    "robotics",
    "open source",
    "Hack Club",
    "MLH",
    "Surat",
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Tejas Mali",
    title: "Tejas Mali — Automation & Robotics Student",
    description:
      "Robotics-first. Open-source projects and hack programs. Based in Surat, India.",
    images: [
      {
        url: "/headshot-mirrored.jpg",
        width: 800,
        height: 800,
        alt: "Portrait of Tejas Mali",
      },
    ],
  },
  twitter: {
    card: "summary",
    title: "Tejas Mali — Automation & Robotics Student",
    description:
      "Robotics-first. Open-source projects and hack programs. Based in Surat, India.",
    images: ["/headshot-mirrored.jpg"],
  },
  robots: {
    index: true,
    follow: true,
  },
  alternates: {
    canonical: "/",
  },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#000000" },
  ],
  colorScheme: "light dark",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistMono.variable} ${instrumentSerif.variable} h-full`}
      suppressHydrationWarning
    >
      <body className="min-h-full font-mono antialiased">
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
