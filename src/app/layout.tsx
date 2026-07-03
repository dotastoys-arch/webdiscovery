import type { Metadata } from "next";
import { Fraunces, Hanken_Grotesk, Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

// Display: karaktervolle "old style" serif met soft/wonky settings.
const display = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  style: ["normal", "italic"],
  axes: ["SOFT", "WONK", "opsz"],
});

// Body: strakke, moderne grotesk.
const body = Hanken_Grotesk({
  variable: "--font-body",
  subsets: ["latin"],
});

// Modern sans voor de SaaS-homepage.
const jakarta = Plus_Jakarta_Sans({
  variable: "--font-jakarta",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WebDiscovery — Premium Webdesign & Rebranding",
  description:
    "WebDiscovery ontwerpt premium websites en rebrandings die door mensen én AI-zoekmachines gevonden worden. Erkend Nederlands webbureau. Vanaf €500.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="nl"
      className={`${display.variable} ${body.variable} ${jakarta.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">{children}</body>
    </html>
  );
}
