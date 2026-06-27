import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "พอร์ทัลบุคลากร MTC | คริสตจักรไมตรีจิต",
  description:
    "ระบบจัดการบุคลากร คริสตจักรไมตรีจิต 1837 - Staff Management Portal",
  keywords: ["MTC", "Maitrichit Church", "Staff Management", "LIFF"],
  robots: "noindex, nofollow",
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  themeColor: "#C62828",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th">
      <body className={`${inter.variable} antialiased`}>{children}</body>
    </html>
  );
}
