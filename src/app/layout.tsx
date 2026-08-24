import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { getSiteSettings } from "@/lib/settings";
import { SITE_URL } from "@/lib/site-url";
import { MediaGuard } from "@/components/MediaGuard";

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

    // Para instalar el sitio en el celular.
    manifest: "/manifest.webmanifest",
    // iOS no lee el manifiesto: necesita estas dos por separado.
    appleWebApp: {
      capable: true,
      title: settings.logo_text,
      statusBarStyle: "default",
    },
    icons: {
      icon: [
        { url: "/icons/icon-192.png", sizes: "192x192", type: "image/png" },
        { url: "/icons/icon-512.png", sizes: "512x512", type: "image/png" },
      ],
      apple: "/icons/apple-touch-icon.png",
    },
  };
}

/**
 * Pinta la barra de estado del celular del color del sitio.
 *
 * Va aparte de la metadata porque Next lo exporta por separado, y `width` con
 * `initial-scale` evitan que la página arranque alejada en móviles.
 */
export async function generateViewport(): Promise<Viewport> {
  const settings = await getSiteSettings();
  return {
    width: "device-width",
    initialScale: 1,
    themeColor: settings.color_accent,
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
        <MediaGuard />
        {children}
      </body>
    </html>
  );
}
