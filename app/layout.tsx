import type { Metadata } from "next";
import { Inter, Instrument_Serif } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";
import PageTransition from "@/components/PageTransition";
import Providers from "@/components/Providers";
import Preloader from "@/components/Preloader";

const inter = Inter({
  subsets: ["latin"],
  variable: '--font-sans',
});

const instrumentSerif = Instrument_Serif({
  weight: "400",
  subsets: ["latin"],
  variable: '--font-serif',
});

export const metadata: Metadata = {
  title: "Touch Grass",
  description: "Prove you went outside to unlock DeFi yield.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${instrumentSerif.variable}`}>
      <body className="antialiased bg-black text-white selection:bg-fresh-grass selection:text-black min-h-screen flex flex-col font-sans">
        <Providers>
          <Preloader />
          <Navigation />
          <div className="flex-1 relative z-10 flex flex-col pt-20">
            <PageTransition>
              <main className="flex-1">{children}</main>
            </PageTransition>
          </div>
        </Providers>
      </body>
    </html>
  );
}
