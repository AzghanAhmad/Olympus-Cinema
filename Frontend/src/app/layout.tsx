import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { ReactQueryProvider } from "@/components/layout/Providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "Majunoon | Crystal Entertainment · Olympus Cinema",
  description: "Reserve seats for Majunoon at Olympus Cinema. Presented by Crystal Entertainment. Unconfirmed reservations until payment.",
  openGraph: {
    title: "Majunoon | Crystal Entertainment",
    description: "Book Majunoon showtimes at Olympus Cinema — up to 15 seats per person.",
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
