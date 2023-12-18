import {
  Sulphur_Point as FontDisplay,
  Plus_Jakarta_Sans as FontSans,
} from "next/font/google";

export const fontDisplay = FontDisplay({
  subsets: ["latin"],
  display: "swap",
  weight: ["300", "400", "700"],
  variable: "--font-display",
});

export const fontSans = FontSans({
  subsets: ["latin"],
  display: "swap",
  variable: "--font-sans",
});
