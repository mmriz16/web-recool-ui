import type { Metadata } from "next";
import { Manrope } from "next/font/google";
import "./globals.css";
import { PaletteProvider } from "@/components/context/palette-context";

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-manrope",
});

export const metadata: Metadata = {
  title: "Recool UI",
  description: "Design Tools for Developers & Designers",
  icons: {
    icon: "/svg/favicon.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${manrope.variable} antialiased`}>
        <PaletteProvider>{children}</PaletteProvider>
      </body>
    </html>
  );
}
