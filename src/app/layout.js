import "./globals.css";

export const metadata = {
  title: "TITIK RUANG",
  description: "Platform Aman & Anonim Untuk Pemulihan Psikososial Berbagi cerita, akses edukasi, dan pulih bersama komunitas yang memahami. DENGAR, PULIH, BANGKIT",
  icons: {
    icon: "/logo3.png", // favicon utama
    apple: "/logo3.png", // untuk iOS
  },
  openGraph: {
    title: "TITIK RUANG",
    description: "Platform Aman & Anonim Untuk Pemulihan Psikososial Berbagi cerita, akses edukasi, dan pulih bersama komunitas yang memahami. DENGAR, PULIH, BANGKIT",
    url: "https://titikruang.com",
    siteName: "TITIK RUANG",
    images: [
      {
        url: "https://titikruang.com/logo.png", // logo untuk social/Google
        width: 1200,
        height: 630,
      },
    ],
    locale: "id_ID",
    type: "website",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="id">
      <head>
        {/* Structured Data untuk Google */}
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              "@context": "https://schema.org",
              "@type": "Organization",
              url: "https://titikruang.com",
              logo: "https://titikruang.com/logo.png",
            }),
          }}
        />
      </head>
      <body>{children}</body>
    </html>
  );
}