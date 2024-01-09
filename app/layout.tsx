import type { Metadata } from "next";

import { fontDisplay, fontSans } from "@/lib/fonts";

import "@/app/globals.css";

import { cn } from "@/lib/utils";

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className="h-full">
      <body
        className={cn(
          "relative h-full bg-background font-sans antialiased",
          fontDisplay.variable,
          fontSans.variable
        )}
      >
        <main className="h-full">{children}</main>

        <div className="absolute right-12 top-0 h-60 border-x border-foreground" />
        <div className="absolute left-12 top-12 w-[calc(100%_-_3rem)] border-y border-foreground" />
      </body>
    </html>
  );
}

export const metadata: Metadata = {
  title: "Vishal Kumar — Frontend Developer",
  description:
    "A personal portfolio website of Vishal Kumar. He's a frontend developer, ui designer from India.",
};
