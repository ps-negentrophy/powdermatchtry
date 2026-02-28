"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { AuthSection } from "./AuthSection";

const LOCALE_LABELS: Record<string, string> = {
  en: "EN",
  zh: "简体",
  ja: "日本語",
};

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();

  const switchLocale = (newLocale: string) => {
    return `/${newLocale}${pathname}`;
  };

  return (
    <header className="border-b bg-white sticky top-0 z-10">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold text-slate-800">
          Powder Match
        </Link>
        <nav className="flex items-center gap-6 text-base">
          <Link
            href="/"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Home
          </Link>
          <Link
            href="/find"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Find Instructor
          </Link>
          <AuthSection />
          <div className="flex gap-2">
            {["en", "zh", "ja"].map((loc) => (
              <a
                key={loc}
                href={switchLocale(loc)}
                className={`px-3 py-1 rounded transition-colors ${
                  locale === loc
                    ? "bg-powder-100 text-powder-700 font-medium"
                    : "text-slate-500 hover:text-slate-700"
                }`}
              >
                {LOCALE_LABELS[loc]}
              </a>
            ))}
          </div>
        </nav>
      </div>
    </header>
  );
}
