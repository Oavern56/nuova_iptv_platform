import "./globals.css";

export const metadata = {
  title: "Piattaforma IPTV",
  description: "La tua piattaforma IPTV di fiducia",
};

export default function RootLayout({ children }) {
  return (
    <html lang="it">
      <body>{children}</body>
    </html>
  );
}
