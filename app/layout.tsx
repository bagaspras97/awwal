import type { Metadata } from "next";
import { Inter, Crimson_Text } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

const crimsonText = Crimson_Text({
  weight: ["400", "600"],
  variable: "--font-crimson",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Awwal - Mendahulukan Shalat di Awal Waktu",
  description: "Awwal membantu kita mendahulukan shalat, satu waktu dalam satu hari. Teman pengingat yang lembut untuk konsistensi shalat.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${inter.variable} ${crimsonText.variable} antialiased`}
      >
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
