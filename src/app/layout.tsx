import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site-url";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const fraunces = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  axes: ["opsz"],
});

export async function generateMetadata(): Promise<Metadata> {
  const settings = await getSiteSettings();
  const ogImage = settings.hero_image_url ?? settings.logo_url ?? undefined;

  return {
    metadataBase: new URL(SITE_URL),
    title: {
      default: settings.seo_title,
      template: `%s — ${settings.logo_text}`,
    },
    description: settings.seo_description,
    alternates: { canonical: "/" },
    openGraph: {
      type: "website",
      locale: "es_AR",
      siteName: settings.logo_text,
      title: settings.seo_title,
      description: settings.seo_description,
      url: "/",
      images: ogImage ? [{ url: ogImage }] : undefined,
    },
    twitter: {
      card: "summary_large_image",
      title: settings.seo_title,
      description: settings.seo_description,
      images: ogImage ? [ogImage] : undefined,
    },
  };
}

export default async function RootLayout({ children }: LayoutProps<"/">) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="es"
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body
        className="min-h-full flex flex-col bg-paper text-ink"
        style={
          {
            "--accent": settings.color_accent,
            "--lime": settings.color_lime,
          } as React.CSSProperties
        }
      >
        {children}
      </body>
    </html>
  );
}
