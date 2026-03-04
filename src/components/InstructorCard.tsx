"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import type { InstructorWithRelations, ResolvedNameItem, ResolvedAvailabilitySlot } from "@/types/database";
import { BookingModal } from "./BookingModal";
import { SlotTagsDisplay } from "./SlotTagsDisplay";

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

function slotPrimaryTags(slot: ResolvedAvailabilitySlot, locale: string): string[] {
  return [
    ...slot.resolved_disciplines.map((i: ResolvedNameItem) => getLocalizedName(i, locale)),
    ...slot.resolved_resorts.map((i: ResolvedNameItem) => getLocalizedName(i, locale)),
    ...slot.resolved_languages.map((i: ResolvedNameItem) => getLocalizedName(i, locale)),
  ];
}

function slotExpandedTags(slot: ResolvedAvailabilitySlot, locale: string): string[] {
  return [
    ...slot.resolved_skill_levels.map((i: ResolvedNameItem) => getLocalizedName(i, locale)),
    ...slot.resolved_improvement_areas.map((i: ResolvedNameItem) => getLocalizedName(i, locale)),
  ];
}

interface SelectedConditionIds {
  disciplineIds: string[];
  resortIds: string[];
  languageIds: string[];
  skillLevelIds: string[];
  improvementAreaIds: string[];
}

interface InstructorCardProps {
  instructor: InstructorWithRelations;
  slot: ResolvedAvailabilitySlot;
  defaultStartDate?: string;
  defaultEndDate?: string;
  selectedConditionPrimaryTags?: string[];
  selectedConditionExpandedTags?: string[];
  selectedConditionIds?: SelectedConditionIds;
}

export function InstructorCard({
  instructor,
  slot,
  defaultStartDate,
  defaultEndDate,
  selectedConditionPrimaryTags,
  selectedConditionExpandedTags,
  selectedConditionIds,
}: InstructorCardProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("common");
  const bio = getBio(instructor, locale);
  const qualificationText = instructor.certification_body ?? t("qualificationNotSpecified");
  const [modalOpen, setModalOpen] = useState(false);
  const primaryTags  = slotPrimaryTags(slot, locale);
  const expandedTags = slotExpandedTags(slot, locale);

  // Show what the student actually selected; fall back to the full slot tags if nothing selected.
  const modalPrimaryTags  = (selectedConditionPrimaryTags  ?? []).length > 0 ? selectedConditionPrimaryTags!  : primaryTags;
  const modalExpandedTags = (selectedConditionExpandedTags ?? []).length > 0 ? selectedConditionExpandedTags! : expandedTags;

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
          <p className="mt-0.5 text-sm text-slate-600">{qualificationText}</p>
          {bio && <p className="mt-1 text-sm text-slate-600 line-clamp-2">{bio}</p>}
        </div>
      </div>

      {/* Single availability slot */}
      <div>
        <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-slate-400">Availability</p>
        <div className="rounded-md border border-slate-100 bg-slate-50 px-3 py-2.5">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-semibold text-slate-800">
                {formatDate(slot.start_date)}
                {slot.start_date !== slot.end_date && (
                  <> &ndash; {formatDate(slot.end_date)}</>
                )}
              </p>
                    {(primaryTags.length > 0 || expandedTags.length > 0) && (
                      <SlotTagsDisplay
                        primaryTags={primaryTags}
                        expandedTags={expandedTags}
                        tagClassName="rounded-full bg-white border border-slate-200 px-2 py-0.5 text-xs text-slate-600"
                      />
                    )}
            </div>
            <button
              type="button"
              onClick={() => setModalOpen(true)}
              className="shrink-0 rounded-lg bg-powder-500 px-3 py-1.5 text-xs font-semibold text-white hover:bg-powder-600 transition-colors"
            >
              Book
            </button>
          </div>
        </div>
      </div>

      {modalOpen && (
        <BookingModal
          instructorId={instructor.id}
          instructorName={instructor.display_name}
          slotId={slot.id}
          defaultStartDate={defaultStartDate ?? slot.start_date}
          defaultEndDate={defaultEndDate ?? slot.end_date}
          slotStartDate={slot.start_date}
          slotEndDate={slot.end_date}
          conditionPrimaryTags={modalPrimaryTags}
          conditionExpandedTags={modalExpandedTags}
          selectedConditionIds={selectedConditionIds}
          onClose={() => setModalOpen(false)}
        />
      )}
    </article>
  );
}
