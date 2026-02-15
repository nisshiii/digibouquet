import type React from "react";
import "../styles/globals.css";
import type { Metadata } from "next";
import {
  Crimson_Text,
  DM_Serif_Display,
  Martian_Mono,
  Playfair_Display,
} from "next/font/google";

const martianMono = Martian_Mono({
  weight: ["100", "200", "300", "400", "500", "600", "700", "800"],
  subsets: ["latin"],
  variable: "--font-martian",
});

const playfair = Playfair_Display({
  weight: ["400", "500", "600", "700", "800", "900"],
  subsets: ["latin"],
  variable: "--font-playfair",
});

const crimsonText = Crimson_Text({
  weight: ["400", "600", "700"],
  subsets: ["latin"],
  variable: "--font-crimson",
});

const dmSerif = DM_Serif_Display({
  weight: ["400"],
  subsets: ["latin"],
  variable: "--font-dmserif",
});

export const metadata: Metadata = {
  icons: {
    icon: "/favicon.ico",
  },
  title: "digibouquet",
  description: "create and share a digital flower bouquet",
  openGraph: {
    title: "digibouquet",
    description: "create and share a digital flower bouquet",
    images: ["https://digibouquet.vercel.app/metapreview.png"],
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${martianMono.variable} ${playfair.variable} ${crimsonText.variable} ${dmSerif.variable}`}
    >
      <body className="font-martian">{children}</body>
    </html>
  );
}
