import type { Metadata } from "next";

import { fontDisplay, fontSans } from "@/lib/fonts";

import "@/app/globals.css";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body
        className={`${fontDisplay.variable} ${fontSans.variable} font-sans antialiased`}
      >
        {children}
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Vishal Kumar — Frontend Developer",
  description:
    "A personal portfolio website of Vishal Kumar. He's a frontend developer, ui designer from India.",
};
