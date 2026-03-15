import type { Metadata } from "next";
import { Playfair_Display, DM_Sans } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import GrainOverlay from "@/components/GrainOverlay";
import PageTransition from "@/components/PageTransition";
import Providers from "@/components/Providers";

const playfair = Playfair_Display({
  subsets: ["latin"],
  variable: "--font-playfair",
  display: "swap",
});

const dmSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-dm-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Touch Grass | Stake STRK, Go Outside, Earn Yield",
  description: "A DeFi app that verifies your outdoor activity via Groq AI vision and GPS to unlock staking yield on Starknet.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${playfair.variable} ${dmSans.variable} font-sans antialiased min-h-screen text-parchment bg-near-black selection:bg-fresh-grass selection:text-near-black overflow-x-hidden flex flex-col`}>
        <Providers>
          <GrainOverlay />
          <Navigation />
          <main className="relative z-10 w-full min-h-screen flex flex-col">
            <PageTransition>
              {children}
            </PageTransition>
          </main>
        </Providers>
      </body>
    </html>
  );
}

