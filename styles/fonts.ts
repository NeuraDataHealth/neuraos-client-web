import { Geist, Geist_Mono } from "next/font/google";

// Variable fonts: every weight the design uses (300–600) ships in one file.
const geistSans = Geist({
  subsets: ["latin"],
  variable: "--font-geist-sans",
  display: "swap",
});

const geistMono = Geist_Mono({
  subsets: ["latin"],
  variable: "--font-geist-mono",
  display: "swap",
});

/** Class names that expose the font CSS variables; apply once on <html>. */
export const fontVariables = `${geistSans.variable} ${geistMono.variable}`;
