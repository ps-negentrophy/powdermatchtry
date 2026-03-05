import { Inter } from "next/font/google";
import { NextIntlClientProvider } from "next-intl";
import { getMessages } from "next-intl/server";
import { notFound } from "next/navigation";
import { routing } from "@/i18n/routing";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import "../globals.css";

const inter = Inter({ subsets: ["latin"] });

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  if (!routing.locales.includes(locale as "en" | "zh" | "ja")) {
    notFound();
  }
  const messages = await getMessages();

  const isEnglish = locale === "en";

  return (
    <html lang={locale}>
      <body className={`flex min-h-screen flex-col bg-slate-50 text-slate-900 antialiased ${isEnglish ? inter.className : ""}`}>
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="container mx-auto flex-1 px-4 py-8">{children}</main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
