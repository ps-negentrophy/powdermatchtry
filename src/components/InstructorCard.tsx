"use client";

import { useLocale } from "next-intl";
import type { InstructorWithRelations } from "@/types/database";

type Locale = "en" | "zh" | "ja";

function getLocalizedName(
  item: { name_en: string; name_zh: string | null; name_ja: string | null },
  locale: string
): string {
  if (locale === "zh" && item.name_zh) return item.name_zh;
  if (locale === "ja" && item.name_ja) return item.name_ja;
  return item.name_en;
}

function getBio(instructor: InstructorWithRelations, locale: string): string {
  if (locale === "zh" && instructor.bio_zh) return instructor.bio_zh;
  if (locale === "ja" && instructor.bio_ja) return instructor.bio_ja;
  return instructor.bio_en ?? "";
}

interface InstructorCardProps {
  instructor: InstructorWithRelations;
}

export function InstructorCard({ instructor }: InstructorCardProps) {
  const locale = useLocale() as Locale;
  const bio = getBio(instructor, locale);

  return (
    <article className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md">
      <div className="flex items-start gap-4">
        <div className="h-16 w-16 flex-shrink-0 rounded-full bg-powder-100 flex items-center justify-center text-powder-600 font-semibold text-xl">
          {instructor.display_name.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <h3 className="font-semibold text-slate-900">{instructor.display_name}</h3>
            {instructor.is_verified && (
              <span className="rounded bg-powder-100 px-2 py-0.5 text-xs font-medium text-powder-700">
                Verified
              </span>
            )}
          </div>
          {bio && <p className="mt-1 text-sm text-slate-600 line-clamp-3">{bio}</p>}
          <div className="mt-3 flex flex-wrap gap-2">
            {instructor.languages.map((l) => (
              <span
                key={l.id}
                className="rounded bg-slate-100 px-2 py-1 text-xs text-slate-600"
              >
                {getLocalizedName(l, locale)}
              </span>
            ))}
            {instructor.resorts.map((r) => (
              <span
                key={r.id}
                className="rounded bg-powder-50 px-2 py-1 text-xs text-powder-700"
              >
                {getLocalizedName(r, locale)}
              </span>
            ))}
            {instructor.improvement_areas.slice(0, 2).map((a) => (
              <span
                key={a.id}
                className="rounded bg-slate-50 px-2 py-1 text-xs text-slate-500"
              >
                {getLocalizedName(a, locale)}
              </span>
            ))}
          </div>
          <button
            type="button"
            className="mt-4 w-full rounded-lg bg-powder-500 py-2 text-sm font-medium text-white hover:bg-powder-600 transition-colors"
          >
            Contact / Book
          </button>
        </div>
      </div>
    </article>
  );
}
