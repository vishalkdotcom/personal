import {
  Sulphur_Point as FontDisplay,
  Plus_Jakarta_Sans as FontSans,
} from "next/font/google";

export const fontDisplay = FontDisplay({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-display",
});

export const fontSans = FontSans({
  subsets: ["latin"],
  variable: "--font-sans",
});
