import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'IPTV Platform',
  description: 'Piattaforma IPTV per la gestione dei contenuti',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="it">
      <body className="min-h-screen bg-gray-100">{children}</body>
    </html>
  );
}
