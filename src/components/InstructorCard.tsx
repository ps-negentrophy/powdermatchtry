"use client";

import { useState } from "react";
import { useLocale } from "next-intl";
import type { InstructorWithRelations, ResolvedNameItem, ResolvedAvailabilitySlot } from "@/types/database";
import { BookingModal } from "./BookingModal";

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

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

function slotTags(slot: ResolvedAvailabilitySlot, locale: string): string[] {
  const tags: string[] = [];
  tags.push(...slot.resolved_disciplines.map((i: ResolvedNameItem) => getLocalizedName(i, locale)));
  tags.push(...slot.resolved_resorts.map((i: ResolvedNameItem) => getLocalizedName(i, locale)));
  tags.push(...slot.resolved_languages.map((i: ResolvedNameItem) => getLocalizedName(i, locale)));
  if (slot.resolved_skill_level) tags.push(getLocalizedName(slot.resolved_skill_level, locale));
  tags.push(...slot.resolved_improvement_areas.map((i: ResolvedNameItem) => getLocalizedName(i, locale)));
  return tags;
}

const MAX_VISIBLE_SLOTS = 3;

interface BookingTarget {
  slotId: string;
  slotStartDate: string;
  slotEndDate: string;
}

interface InstructorCardProps {
  instructor: InstructorWithRelations;
  defaultStartDate?: string;
  defaultEndDate?: string;
}

export function InstructorCard({ instructor, defaultStartDate, defaultEndDate }: InstructorCardProps) {
  const locale = useLocale() as Locale;
  const bio = getBio(instructor, locale);
  const [bookingTarget, setBookingTarget] = useState<BookingTarget | null>(null);
  const slots = instructor.availability_slots ?? [];
  const visibleSlots = slots.slice(0, MAX_VISIBLE_SLOTS);
  const hiddenCount = slots.length - visibleSlots.length;

  function openBooking(slot: ResolvedAvailabilitySlot) {
    setBookingTarget({
      slotId: slot.id,
      slotStartDate: slot.start_date,
      slotEndDate: slot.end_date,
    });
  }

  return (
    <article className="rounded-lg border bg-white p-6 shadow-sm transition-shadow hover:shadow-md flex flex-col gap-4">
      {/* Header: avatar + name + bio */}
      <div className="flex items-start gap-4">
        <div className="h-14 w-14 flex-shrink-0 rounded-full bg-powder-100 flex items-center justify-center text-powder-600 font-semibold text-xl">
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
          {bio && <p className="mt-1 text-sm text-slate-600 line-clamp-2">{bio}</p>}
        </div>
      </div>

      {/* Availability slots — each has its own Book button */}
      {visibleSlots.length > 0 ? (
        <div className="space-y-2">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-400">Availability</p>
          {visibleSlots.map((slot) => {
            const tags = slotTags(slot, locale);
            return (
              <div
                key={slot.id}
                className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5"
              >
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(slot.start_date)}
                      {slot.start_date !== slot.end_date && (
                        <> &ndash; {formatDate(slot.end_date)}</>
                      )}
                    </p>
                    {tags.length > 0 && (
                      <div className="mt-1.5 flex flex-wrap gap-1">
                        {tags.map((tag) => (
                          <span
                            key={tag}
                            className="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => openBooking(slot)}
                    className="shrink-0 rounded-lg bg-powder-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-powder-600 transition-colors"
                  >
                    Book
                  </button>
                </div>
              </div>
            );
          })}
          {hiddenCount > 0 && (
            <p className="text-xs text-slate-400 pl-1">
              +{hiddenCount} more availability slot{hiddenCount > 1 ? "s" : ""}
            </p>
          )}
        </div>
      ) : (
        <p className="text-xs text-slate-400">No upcoming availability.</p>
      )}

      {bookingTarget && (
        <BookingModal
          instructorId={instructor.id}
          instructorName={instructor.display_name}
          slotId={bookingTarget.slotId}
          defaultStartDate={defaultStartDate ?? bookingTarget.slotStartDate}
          defaultEndDate={defaultEndDate ?? bookingTarget.slotEndDate}
          onClose={() => setBookingTarget(null)}
        />
      )}
    </article>
  );
}
