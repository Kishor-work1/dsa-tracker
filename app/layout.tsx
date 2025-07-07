import type { Metadata } from "next";
import { Inter } from "next/font/google";  // closest to GeistSans
import { Roboto_Mono } from "next/font/google";  // closest to GeistMono
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-sans",
});

const mono = Roboto_Mono({
  subsets: ["latin"],
  variable: "--font-mono",
});

export const metadata: Metadata = {
  title: "DSA Tracker",
  description: "Your DSA progress tracker",
  icons: {
    icon: "/icon.png", // fixed icon path
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${mono.variable}`}>
      <body className="antialiased">
        <Navbar />
        <div className="pt-15">{children}</div>
        <Footer />
      </body>
    </html>
  );
}
