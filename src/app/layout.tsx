import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { ThemeProvider } from "next-themes";
import "./globals.css";
import { Toaster } from "@/components/ui/sonner";
import { LanguageProvider } from "@/components/shared/language-context";
import { RouteProgress } from "@/components/shared/route-progress";
import { RouteOverlay } from "@/components/shared/route-overlay";
import { getLang } from "@/lib/get-lang";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "D&Z Platform — Workshop OS + Rider",
  description: "AI-native motorcycle workshop and rider ecosystem.",
};

/** Apply persisted font-size before first paint (no flash). */
const fontScript = `(function(){try{var s=localStorage.getItem("dz-font-size");if(s&&["sm","md","lg","xl"].includes(s)){document.documentElement.setAttribute("data-font-size",s);}}catch(e){}})();`;

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const lang = await getLang();
  return (
    <html lang={lang} suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <head>
        <script dangerouslySetInnerHTML={{ __html: fontScript }} />
      </head>
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <RouteProgress />
        <RouteOverlay />
        <div aria-hidden className="grain-overlay" />
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem={false} disableTransitionOnChange>
          <LanguageProvider lang={lang}>{children}</LanguageProvider>
        </ThemeProvider>
        <Toaster position="top-center" />
      </body>
    </html>
  );
}
