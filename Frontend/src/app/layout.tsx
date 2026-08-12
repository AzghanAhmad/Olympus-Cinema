import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/layout/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "OLYMPUS CINEMA | Ultra Cinematic Cinema & Movie Booking Platform",
  description: "Experience modern cinema at Olympus. IMAX 3D Dual Laser, Dolby Atmos Spatial Audio, recliner lounge seating, and instant e-ticketing.",
  openGraph: {
    title: "OLYMPUS CINEMA | Premium Cinema Experience",
    description: "Book tickets for Dune Part Two, Oppenheimer, Interstellar in IMAX & Dolby Atmos.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="dark h-full antialiased" suppressHydrationWarning>
      <body className={`${inter.className} min-h-full flex flex-col bg-background text-foreground`}>
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
