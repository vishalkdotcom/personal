import type { Metadata } from "next";
import { GoogleAnalytics } from "@next/third-parties/google";
import { Analytics } from "@vercel/analytics/react";

import { fontDisplay, fontSans } from "@/lib/fonts";
import { cn } from "@/lib/utils";
import { Navbar } from "@/components/navbar";
import { TailwindIndicator } from "@/components/tailwind-indicator";

import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <GoogleAnalytics gaId="G-06C301CH3G" />
      <body
        className={cn(
          "overflow-y-scroll font-sans antialiased",
          fontDisplay.variable,
          fontSans.variable
        )}
      >
        <div className="sticky top-0 z-10">
          <Navbar />
        </div>
        <main className="container py-20">{children}</main>
        <TailwindIndicator />
        <Analytics />
      </body>
    </html>
  );
}

const siteConfig = {
  name: "Vishal Kumar — Frontend Engineer | React.js Enthusiast",
  description:
    "Explore the portfolio and achievements of Vishal Kumar, a skilled web developer with expertise in React.js. Discover innovative projects and a decade of experience in crafting responsive web solutions.",
  url: "https://vishalk.com",
};

export const metadata: Metadata = {
  title: {
    default: siteConfig.name,
    template: `%s | ${siteConfig.name}`,
  },
  description: siteConfig.description,
  keywords: [
    "Web Developer",
    "React.js",
    "Next.js",
    "TypeScript",
    "JavaScript",
    "Tailwind CSS",
    "Frontend Engineer",
    "AI Integration",
    "Project Portfolio",
    "Responsive Web Solutions",
    "Technical Expertise",
    "User Experience Design",
    "Innovative Web Development",
    "Coding Enthusiast",
  ],
  authors: [
    {
      name: "Vishal Kumar",
      url: "https://vishalk.com",
    },
  ],
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#ffffff" },
    { media: "(prefers-color-scheme: dark)", color: "#ffffff" },
  ],
  openGraph: {
    type: "website",
    locale: "en_IN",
    url: siteConfig.url,
    title: siteConfig.name,
    description: siteConfig.description,
    siteName: siteConfig.name,
    images: [
      {
        url: `${siteConfig.url}/og.png`,
        width: 800,
        height: 400,
      },
      {
        url: `${siteConfig.url}/og-alt.png`,
        width: 1200,
        height: 630,
      },
    ],
  },
  creator: siteConfig.name,
  icons: {
    icon: "/favicon.ico",
    shortcut: "/favicon-16x16.png",
    apple: "/apple-touch-icon.png",
  },
  manifest: `${siteConfig.url}/site.webmanifest`,
};
