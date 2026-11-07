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

const title = "Tejas Mali — Automation & Robotics Student";
const description =
  "Tejas Mali — Automation & Robotics student from Surat. Building open-source robotics projects, educational platforms, and web tools through MLH and Hack Club.";

const keywords = [
  "Tejas Mali",
  "Tejas Portfolio",
  "Web Developer",
  "Automation and Robotics",
  "Robotics Student",
  "Open Source",
  "Hack Club",
  "MLH",
  "Surat Web Development",
  "Educational Website",
  "Website Optimization",
  "HTML",
  "CSS",
  "JavaScript",
  "Python",
  "C++",
  "Responsive Design",
  "Portfolio",
  "SEO Specialist",
  "Student Learning Platforms",
  "Custom Websites",
  "Digital Presence",
];

const personJsonLd = {
  "@context": "https://schema.org",
  "@type": "Person",
  name: "Tejas Mali",
  url: siteUrl,
  image: `${siteUrl}/headshot-mirrored.jpg`,
  email: "tejasmmali.me@gmail.com",
  jobTitle: "Automation & Robotics Student",
  description,
  address: {
    "@type": "PostalAddress",
    addressLocality: "Surat",
    addressRegion: "Gujarat",
    addressCountry: "IN",
  },
  sameAs: [
    "https://github.com/tejasmmali",
    "https://linkedin.com/in/tejasmmali",
    "https://instagram.com/tejasmmali",
    "https://x.com/tejazmali",
    "https://www.snapchat.com/add/tejazmali",
  ],
};

const websiteJsonLd = {
  "@context": "https://schema.org",
  "@type": "WebSite",
  name: "Tejas Mali",
  url: siteUrl,
  description,
  inLanguage: "en",
  publisher: {
    "@type": "Person",
    name: "Tejas Mali",
  },
};

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: title,
    template: "%s · Tejas Mali",
  },
  description,
  applicationName: "Tejas Mali",
  authors: [{ name: "Tejas Mali", url: siteUrl }],
  creator: "Tejas Mali",
  publisher: "Tejas Mali",
  category: "portfolio",
  keywords,
  referrer: "origin-when-cross-origin",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  icons: {
    icon: [
      { url: "/favicon.ico", sizes: "any" },
      { url: "/favicon.png", type: "image/png", sizes: "32x32" },
      { url: "/icon-192.png", type: "image/png", sizes: "192x192" },
    ],
    apple: [{ url: "/apple-icon.png", sizes: "180x180", type: "image/png" }],
  },
  manifest: "/site.webmanifest",
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteUrl,
    siteName: "Tejas Mali",
    title,
    description,
    images: [
      {
        url: "/headshot-mirrored.jpg",
        width: 800,
        height: 800,
        alt: "Portrait of Tejas Mali",
        type: "image/jpeg",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    site: "@tejazmali",
    creator: "@tejazmali",
    title,
    description,
    images: ["/headshot-mirrored.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-image-preview": "large",
      "max-snippet": -1,
      "max-video-preview": -1,
    },
  },
  alternates: {
    canonical: "/",
  },
  verification: {
    other: {
      "msvalidate.01": "FA5BDC29B4044E9E711C255D731AD84C",
    },
  },
  other: {
    "instagram:card": "summary_large_image",
    "instagram:site": "@tejazmali",
    "instagram:title": title,
    "instagram:description": description,
    "instagram:image": `${siteUrl}/headshot-mirrored.jpg`,
    "snap:card": "summary_large_image",
    "snap:site": "@tejazmali",
    "snap:title": title,
    "snap:description": description,
    "snap:image": `${siteUrl}/headshot-mirrored.jpg`,
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify([personJsonLd, websiteJsonLd]),
          }}
        />
        <SmoothScroll />
        {children}
      </body>
    </html>
  );
}
