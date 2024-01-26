import type { Metadata } from "next";

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
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Vishal Kumar — Frontend Engineer",
  description:
    "A personal portfolio website of Vishal Kumar. He's a frontend developer, ui designer from India.",
};
