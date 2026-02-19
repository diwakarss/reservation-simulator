import type { Metadata } from "next";
import { Orbitron, Rajdhani } from "next/font/google";
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

export const metadata: Metadata = {
  title: "Reservation Simulator — Experience Policy Outcomes Across 5 Social Classes",
  description:
    "A satirical sci-fi simulator that lets you explore how reservation policies shape socio-economic outcomes across five fictional social classes over 100 years. Make choices, see consequences.",
  keywords: [
    "reservation policy",
    "social simulation",
    "economic inequality",
    "satirical sci-fi",
    "education policy",
  ],
  authors: [{ name: "Reservation Simulator" }],
  openGraph: {
    title: "Reservation Simulator",
    description:
      "Experience how reservation policies shape outcomes across 5 fictional social classes in a satirical sci-fi universe.",
    type: "website",
    locale: "en_US",
  },
  twitter: {
    card: "summary_large_image",
    title: "Reservation Simulator",
    description:
      "Experience how reservation policies shape outcomes across 5 fictional social classes.",
  },
  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${orbitron.variable} ${rajdhani.variable}`}>
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
