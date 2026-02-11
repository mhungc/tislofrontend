import type { Metadata } from "next";
import { Geist } from "next/font/google";
import { AuthProvider } from "@/components/providers/auth-provider";
import { ThemeProvider } from "@/components/providers/theme-provider";
import "../globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  display: "swap",
  subsets: ["latin"],
  fallback: ["system-ui", "arial"],
});

export const metadata: Metadata = {
  title: "ReservaFácil - Gestión de Reservas",
  description: "La plataforma todo-en-uno para peluquerías, consultorios, spas y eventos",
};

export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'es' }]
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  return (
    <html lang={locale} suppressHydrationWarning>
      <body className={`${geistSans.className} antialiased`}>
        <ThemeProvider>
          <AuthProvider>
            {children}
          </AuthProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}