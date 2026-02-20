import type { Metadata } from "next";
import { Orbitron, Rajdhani, Space_Grotesk, Inter, JetBrains_Mono } from "next/font/google";
import "@/styles/globals.css";

const orbitron = Orbitron({
  subsets: ["latin"],
  variable: "--font-orbitron",
  weight: ["400", "500", "600", "700", "800", "900"],
  display: "swap",
});

const rajdhani = Rajdhani({
  subsets: ["latin"],
  variable: "--font-rajdhani",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const spaceGrotesk = Space_Grotesk({
  subsets: ["latin"],
  variable: "--font-space-grotesk",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  weight: ["300", "400", "500", "600", "700"],
  display: "swap",
});

const jetbrainsMono = JetBrains_Mono({
  subsets: ["latin"],
  variable: "--font-jetbrains-mono",
  weight: ["400", "500", "600"],
  display: "swap",
});

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_URL || "https://reservation-simulator.vercel.app"),
  title: {
    default: "Reservation Simulator — Experience Policy Outcomes Across 5 Social Classes",
    template: "%s | Reservation Simulator",
  },
  description:
    "A sci-fi simulator that lets you explore how reservation policies shape socio-economic outcomes across five fictional social classes over 100 years. Make choices, see consequences.",
  keywords: [
    "reservation policy",
    "social simulation",
    "economic inequality",
    "sci-fi",
    "education policy",
    "interactive simulation",
    "policy simulator",
  ],
  authors: [{ name: "Reservation Simulator" }],
  creator: "Reservation Simulator",
  publisher: "Reservation Simulator",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  openGraph: {
    title: "Reservation Simulator",
    description:
      "Experience how reservation policies shape outcomes across 5 fictional social classes in a sci-fi universe.",
    type: "website",
    locale: "en_US",
    siteName: "Reservation Simulator",
    images: [
      {
        url: "/og-image.png",
        width: 1200,
        height: 630,
        alt: "Reservation Simulator - Explore policy outcomes across 5 social classes",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Reservation Simulator",
    description:
      "Experience how reservation policies shape outcomes across 5 fictional social classes.",
    images: ["/og-image.png"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: "/site.webmanifest",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable} ${spaceGrotesk.variable} ${inter.variable} ${jetbrainsMono.variable}`}>
      <body className="antialiased min-h-screen">
        {/* Skip to main content link for keyboard users */}
        <a
          href="#main-content"
          className="skip-to-content font-rajdhani"
        >
          Skip to main content
        </a>
        <div id="main-content">
          {children}
        </div>
      </body>
    </html>
  );
}
