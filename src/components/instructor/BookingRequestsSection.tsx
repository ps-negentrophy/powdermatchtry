"use client";

import { useState, useEffect, useCallback } from "react";
import { useTranslations, useLocale } from "next-intl";
import type { ResolvedNameItem } from "@/types/database";
import { SlotTagsDisplay } from "@/components/SlotTagsDisplay";
import { createClient } from "@/lib/supabase/client";

interface SlotConditions {
  disciplines: ResolvedNameItem[];
  resorts: ResolvedNameItem[];
  languages: ResolvedNameItem[];
  skill_levels: ResolvedNameItem[];
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

function conditionPrimaryTags(conditions: SlotConditions, locale: string): string[] {
  return [
    ...conditions.disciplines.map((i) => getLocalizedName(i, locale)),
    ...conditions.resorts.map((i) => getLocalizedName(i, locale)),
    ...conditions.languages.map((i) => getLocalizedName(i, locale)),
  ];
}

function conditionExpandedTags(conditions: SlotConditions, locale: string): string[] {
  return [
    ...conditions.skill_levels.map((i) => getLocalizedName(i, locale)),
    ...conditions.improvement_areas.map((i) => getLocalizedName(i, locale)),
  ];
}

export function BookingRequestsSection({ status, onAccept, onDecline, onComplete }: {
  status: "pending" | "accepted" | "declined" | "completed";
  onAccept?: (id: string) => void;
  onDecline?: (id: string) => void;
  onComplete?: (id: string) => void;
}) {
  const t = useTranslations("user.instructor");
  const locale = useLocale();
  const [bookings, setBookings] = useState<BookingRequest[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchBookings = useCallback(() => {
    fetch(`/api/instructor/booking-requests?status=${status}`)
      .then((r) => r.json())
      .then((data) => setBookings(Array.isArray(data) ? data : []))
      .finally(() => setLoading(false));
  }, [status]);

  useEffect(() => {
    fetchBookings();

    // Real-time: re-fetch immediately when a booking row is deleted (student cancels).
    const supabase = createClient();
    let channel: ReturnType<NonNullable<typeof supabase>["channel"]> | null = null;
    if (supabase) {
      channel = supabase
        .channel(`booking-requests-${status}`)
        .on(
          "postgres_changes",
          { event: "DELETE", schema: "public", table: "booking_requests" },
          () => fetchBookings()
        )
        .subscribe();
    }

    // Fallback polling every 15 s for the pending tab (handles cases where
    // real-time isn't configured yet).
    let pollTimer: ReturnType<typeof setInterval> | null = null;
    if (status === "pending") {
      pollTimer = setInterval(() => fetchBookings(), 15_000);
    }

    return () => {
      if (supabase && channel) supabase.removeChannel(channel);
      if (pollTimer) clearInterval(pollTimer);
    };
  }, [fetchBookings, status]);

  if (loading) return <p className="text-sm text-slate-500">{t("loading")}</p>;
  if (bookings.length === 0) return <p className="text-sm text-slate-500">{t("noBookings")}</p>;

  return (
    <ul className="space-y-3">
      {bookings.map((b) => {
        const primaryTags  = b.conditions ? conditionPrimaryTags(b.conditions, locale) : [];
        const expandedTags = b.conditions ? conditionExpandedTags(b.conditions, locale) : [];
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

            {/* Teaching conditions */}
            {(primaryTags.length > 0 || expandedTags.length > 0) && (
              <SlotTagsDisplay primaryTags={primaryTags} expandedTags={expandedTags} />
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
