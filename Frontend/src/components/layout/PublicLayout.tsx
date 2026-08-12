import React from 'react';
import { Navbar } from './Navbar';
import { Footer } from './Footer';

export function PublicLayout({
  children,
  flushTop = false,
}: {
  children: React.ReactNode;
  /** When true, content can sit under the fixed navbar (e.g. home / movie hero). */
  flushTop?: boolean;
}) {
  return (
    <div className="min-h-screen flex flex-col bg-background text-foreground transition-colors duration-200">
      <Navbar />
      <main className={`flex-1 ${flushTop ? '' : 'pt-24'}`}>{children}</main>
      <Footer />
    </div>
  );
}
