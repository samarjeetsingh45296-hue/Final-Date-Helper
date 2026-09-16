import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Festival Calendar",
  description:
    "A premium month-view calendar with automatic Sunday highlighting and an Indian festival intelligence engine.",
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f5f6fa" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0e17" },
  ],
};

/** Applies the saved theme before first paint to avoid a flash of light mode. */
const themeInitScript = `
try {
  var t = localStorage.getItem("theme");
  var dark = t ? t === "dark" : window.matchMedia("(prefers-color-scheme: dark)").matches;
  if (dark) document.documentElement.classList.add("dark");
} catch (e) {}
`;

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} h-full`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body className="ambient flex min-h-full flex-col">
        {/* Slow-drifting ambient colour blobs */}
        <div aria-hidden className="blob blob-a" />
        <div aria-hidden className="blob blob-b" />
        <div aria-hidden className="blob blob-c" />
        {children}
      </body>
    </html>
  );
}
