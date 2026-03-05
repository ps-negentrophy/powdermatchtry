"use client";

import { useLocale } from "next-intl";
import { Link } from "@/i18n/navigation";
import { usePathname } from "@/i18n/navigation";
import { useRouter } from "next/navigation";
import { AuthSection } from "./AuthSection";

const LOCALE_LABELS: Record<string, string> = {
  en: "English",
  zh: "简体",
  ja: "日本語",
};

export function Header() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    return `/${newLocale}${pathname}`;
  };

  return (
    <header className="border-b bg-white sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Link href="/" className="text-base font-bold text-slate-800">
          Powder Match
        </Link>
        <nav className="flex items-center gap-6 text-sm">
          {/* Language dropdown */}
          <select
            value={locale}
            onChange={(e) => router.push(switchLocale(e.target.value))}
            className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-600 hover:border-slate-400 focus:outline-none focus:ring-2 focus:ring-powder-400 cursor-pointer"
            aria-label="Select language"
          >
            {Object.entries(LOCALE_LABELS).map(([loc, label]) => (
              <option key={loc} value={loc}>
                {label}
              </option>
            ))}
          </select>

          <Link
            href="/find"
            className="text-slate-600 hover:text-slate-900 transition-colors"
          >
            Find Instructor
          </Link>
          <AuthSection />
        </nav>
      </div>
    </header>
  );
}
