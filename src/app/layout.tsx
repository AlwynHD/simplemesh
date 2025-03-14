import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import { SpeedInsights } from "@vercel/speed-insights/next"
import Script from "next/script";

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
const projectId = "qmt26bxy0k"
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

      <head>


        <script
          type="text/javascript"
          dangerouslySetInnerHTML={{
            __html: `
                (function(c,l,a,r,i,t,y){
                    c[a]=c[a]||function(){(c[a].q=c[a].q||[]).push(arguments)};
                    t=l.createElement(r);t.async=1;t.src="https://www.clarity.ms/tag/"+i;
                    y=l.getElementsByTagName(r)[0];y.parentNode.insertBefore(t,y);
                })(window, document, "clarity", "script", "${projectId}");
            `
          }}
        />



        <Script
          async
          src="https://www.googletagmanager.com/gtag/js?id=G-M69EEW396C"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', 'G-M69EEW396C');
    `
          }}
        />


        <script async src="https://scripts.simpleanalyticscdn.com/latest.js"></script>

      </head>
      <body

        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <SpeedInsights />

        {children}
      </body>
    </html>
  );
}
