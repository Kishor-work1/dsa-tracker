import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import { GeistMono } from "geist/font/mono";
import "./globals.css";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";
import Icon from '../public/icon.png'

export const metadata: Metadata = {
  title: "DSA Tracker",
  description: "Your DSA progress tracker",
  icons: {
    icon: "../public/",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">

      <body
        className={`${GeistSans.variable} ${GeistMono.variable} antialiased`}
      >
        <Navbar />
        <div className="pt-15">
          {children}
        </div>
        <Footer />
      </body>
    </html>
  );
}
