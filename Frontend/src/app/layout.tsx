import type { Metadata } from "next";
import "./globals.css";
import { ReactQueryProvider } from "@/components/layout/Providers";

export const metadata: Metadata = {
  title: "Majnoon | Crystal Entertainment",
  description: "Reserve seats for Majnoon with Crystal Entertainment. Unconfirmed reservations until payment.",
  openGraph: {
    title: "Majnoon | Crystal Entertainment",
    description: "Book Majnoon showtimes with Crystal Entertainment — up to 15 seats per person.",
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
      <body className="min-h-full flex flex-col bg-background text-foreground font-sans">
        <ReactQueryProvider>{children}</ReactQueryProvider>
      </body>
    </html>
  );
}
