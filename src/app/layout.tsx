import type { Metadata, Viewport } from "next";
import { Plus_Jakarta_Sans } from "next/font/google";
import "./globals.css";

const jakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "800"],
  variable: "--font-jakarta",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kindoc · Lo que hicimos",
  description: "Bitácora de avance de Kindoc para socios.",
  // El sitio es privado por URL: no debe aparecer en buscadores.
  robots: { index: false, follow: false, nocache: true },
};

export const viewport: Viewport = {
  themeColor: "#ffffff",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="es">
      <body className={jakarta.variable}>
        <div className="mx-auto min-h-screen max-w-[680px] bg-kd-paper shadow-[0_0_60px_rgba(29,58,66,0.08)]">
          {children}
        </div>
      </body>
    </html>
  );
}
