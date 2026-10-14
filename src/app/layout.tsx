import type { Metadata, Viewport } from "next";
import { Bricolage_Grotesque, Geist, Geist_Mono } from "next/font/google";
import { dict } from "@/lib/dictionary";
import { siteOrigin } from "@/lib/site-url";
import { THEME_SCRIPT } from "@/lib/theme";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin", "latin-ext"],
});

// Brand display face: the wordmark and headings.
const bricolage = Bricolage_Grotesque({
  variable: "--font-bricolage",
  subsets: ["latin", "latin-ext"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// Browser chrome (e.g. the mobile address bar) matches the page in both themes.
export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#FAF7F5" },
    { media: "(prefers-color-scheme: dark)", color: "#1A100C" },
  ],
};

export const metadata: Metadata = {
  // Absolute URLs for the link-preview image.
  metadataBase: new URL(siteOrigin()),
  title: { default: dict.meta.title, template: `%s · ${dict.meta.title}` },
  description: dict.meta.description,
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    // The theme script adds .dark before React hydrates, hence suppressHydrationWarning.
    <html
      lang="tr"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${bricolage.variable} h-full antialiased`}
    >
      <head>
        <script dangerouslySetInnerHTML={{ __html: THEME_SCRIPT }} />
      </head>
      <body className="min-h-full flex flex-col">
        {children}
      </body>
    </html>
  );
}
