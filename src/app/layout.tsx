import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
  src: "./fonts/GeistVF.woff",
  variable: "--font-geist-sans",
  weight: "100 900",
});
const geistMono = localFont({
  src: "./fonts/GeistMonoVF.woff",
  variable: "--font-geist-mono",
  weight: "100 900",
});

export const metadata: Metadata = {
  title: "Simple Mesh - Create 3D models from images",
  description: "Transform your images and text into high quality 3D models effortlessly. Used by game developers and 3D artists alike.",
  icons: {
    icon: [
      { url: '/favicon/Logo-Fox-Light.svg', type: 'image/svg+xml' },
      { url: '/favicon/Logo-Fox-Light.png', type: 'image/png' },
    ],
    apple: '/favicon/Logo-Fox-Light.png',
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
      
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
