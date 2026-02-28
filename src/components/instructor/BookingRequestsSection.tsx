"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ResolvedNameItem } from "@/types/database";

interface SlotConditions {
  disciplines: ResolvedNameItem[];
  resorts: ResolvedNameItem[];
  languages: ResolvedNameItem[];
  skill_level: ResolvedNameItem | null;
  improvement_areas: ResolvedNameItem[];
}

interface BookingRequest {
  id: string;
  student_name?: string;
  start_date: string;
  end_date: string;
  message?: string;
  status: string;
  conditions: SlotConditions | null;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function getLocalizedName(
  item: { name_en: string; name_zh: string | null; name_ja: string | null },
  locale: string
): string {
  if (locale === "zh" && item.name_zh) return item.name_zh;
  if (locale === "ja" && item.name_ja) return item.name_ja;
  return item.name_en;
}

function conditionTags(conditions: SlotConditions, locale: string): string[] {
  const tags: string[] = [];
  tags.push(...conditions.disciplines.map((i) => getLocalizedName(i, locale)));
  tags.push(...conditions.resorts.map((i) => getLocalizedName(i, locale)));
  tags.push(...conditions.languages.map((i) => getLocalizedName(i, locale)));
  if (conditions.skill_level) tags.push(getLocalizedName(conditions.skill_level, locale));
  tags.push(...conditions.improvement_areas.map((i) => getLocalizedName(i, locale)));
  return tags;
}

export function BookingRequestsSection({ status, onAccept, onDecline, onComplete }: {
  status: "pending" | "accepted" | "completed";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onComplete?: (id: string) => void;
}) {
  const t = useTranslations("user.instructor");
  const locale = useLocale();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/instructor/booking-requests?status=${status}`)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [status]);

  if (loading) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  if (bookings.length === 0) return <p className="text-sm text-slate-500">{t("noBookings")}</p>;

  return (
    <ul className="space-y-3">
      {bookings.map((b) => {
        const tags = b.conditions ? conditionTags(b.conditions, locale) : [];
        return (
          <li key={b.id} className="rounded-lg border border-slate-200 bg-white p-4">
            <p className="font-semibold text-slate-900">{b.student_name ?? "Student"}</p>

            {/* Dates */}
            <p className="mt-0.5 text-sm font-medium text-slate-700">
              {formatDate(b.start_date)}
              {b.end_date && b.end_date !== b.start_date && (
                <> &ndash; {formatDate(b.end_date)}</>
              )}
            </p>

            {/* Teaching conditions from the linked availability slot */}
            {tags.length > 0 && (
              <div className="mt-2 flex flex-wrap gap-1">
                {tags.map((tag) => (
                  <span
                    key={tag}
                    className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs text-slate-600"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {b.message && (
              <p className="mt-2 text-sm text-slate-500 line-clamp-2 border-t border-slate-100 pt-2">
                {b.message}
              </p>
            )}

            {status === "pending" && onAccept && onDecline && (
              <div className="mt-3 flex gap-2">
                <button
                  type="button"
                  onClick={() => onAccept(b.id)}
                  className="rounded-lg bg-green-600 px-4 py-1.5 text-sm font-medium text-white hover:bg-green-700"
                >
                  {t("accept")}
                </button>
                <button
                  type="button"
                  onClick={() => onDecline(b.id)}
                  className="rounded-lg border border-red-300 px-4 py-1.5 text-sm font-medium text-red-600 hover:bg-red-50"
                >
                  {t("decline")}
                </button>
              </div>
            )}
            {status === "accepted" && onComplete && (
              <button
                type="button"
                onClick={() => onComplete(b.id)}
                className="mt-3 rounded-lg bg-powder-500 px-4 py-1.5 text-sm font-medium text-white hover:bg-powder-600"
              >
                {t("markComplete")}
              </button>
            )}
          </li>
        );
      })}
    </ul>
  );
}
