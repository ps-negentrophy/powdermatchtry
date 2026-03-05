"use client";

import { useState, useEffect } from "react";
import { useTranslations, useLocale } from "next-intl";
import { InstructorConditionsForm, type ConditionsState } from "./InstructorConditionsForm";
import { SlotTagsDisplay } from "@/components/SlotTagsDisplay";
import type { Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";
import {
  DEFAULT_RESORTS,
  DEFAULT_LANGUAGES,
  DEFAULT_SKILL_LEVELS,
  DEFAULT_IMPROVEMENT_AREAS,
  DEFAULT_DISCIPLINES,
} from "@/config/filter-options";

interface ResolvedNameItem {
  id: string;
  name_en: string;
  name_zh: string | null;
  name_ja: string | null;
}

interface AvailabilitySlot {
  id: string;
  start_date: string;
  end_date: string;
  discipline_ids: string[];
  resort_ids: string[];
  language_ids: string[];
  skill_level_ids: string[];
  improvement_area_ids: string[];
  created_at: string;
  resolved_disciplines: ResolvedNameItem[];
  resolved_resorts: ResolvedNameItem[];
  resolved_languages: ResolvedNameItem[];
  resolved_skill_levels: ResolvedNameItem[];
  resolved_improvement_areas: ResolvedNameItem[];
}

const EMPTY_CONDITIONS: ConditionsState = {
  disciplineIds: [],
  disciplineOperator: "or",
  resortIds: [],
  resortOperator: "or",
  languageIds: [],
  languageOperator: "or",
  skillLevelIds: [],
  skillLevelOperator: "or",
  improvementAreaIds: [],
  improvementAreaOperator: "or",
};

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function isRealDBData(items: { id: string }[]): boolean {
  return items.length > 0 && UUID_REGEX.test(items[0].id);
}

function localizedName(item: { name_en: string; name_zh: string | null; name_ja: string | null }, locale: string): string {
  if (locale === "zh" && item.name_zh) return item.name_zh;
  if (locale === "ja" && item.name_ja) return item.name_ja;
  return item.name_en;
}

function formatDate(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
}

export function InstructorProfileSection({ reloadTrigger = 0 }: { reloadTrigger?: number }) {
  const t = useTranslations("user.instructor.profile");
  const tFilters = useTranslations("filters");
  const locale = useLocale();

  const [resorts, setResorts] = useState<Resort[]>(DEFAULT_RESORTS);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>(DEFAULT_SKILL_LEVELS);
  const [improvementAreas, setImprovementAreas] = useState<ImprovementArea[]>(DEFAULT_IMPROVEMENT_AREAS);
  const [disciplines, setDisciplines] = useState<Discipline[]>(DEFAULT_DISCIPLINES);
  const [loadingOptions, setLoadingOptions] = useState(true);

  const [slots, setSlots] = useState<AvailabilitySlot[]>([]);
  const [loadingSlots, setLoadingSlots] = useState(true);

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [conditions, setConditions] = useState<ConditionsState>(EMPTY_CONDITIONS);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);
  const [deletingId, setDeletingId] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([
      fetch("/api/resorts").then((r) => r.ok ? r.json() : DEFAULT_RESORTS),
      fetch("/api/languages").then((r) => r.ok ? r.json() : DEFAULT_LANGUAGES),
      fetch("/api/skill-levels").then((r) => r.ok ? r.json() : DEFAULT_SKILL_LEVELS),
      fetch("/api/improvement-areas").then((r) => r.ok ? r.json() : DEFAULT_IMPROVEMENT_AREAS),
      fetch("/api/disciplines").then((r) => r.ok ? r.json() : DEFAULT_DISCIPLINES),
    ]).then(([r, l, s, i, d]) => {
      setResorts(r);
      setLanguages(l);
      setSkillLevels(s);
      setImprovementAreas(i);
      setDisciplines(d);
    }).finally(() => setLoadingOptions(false));

    setLoadingSlots(true);
    fetch("/api/instructor/availability-slots")
      .then((r) => r.json())
      .then((data) => setSlots(Array.isArray(data) ? data : []))
      .finally(() => setLoadingSlots(false));
  }, [reloadTrigger]); // re-fetch slots whenever parent signals (e.g. after booking accepted)

  const today = new Date().toISOString().slice(0, 10);

  async function reloadSlots() {
    const r = await fetch("/api/instructor/availability-slots");
    const data = await r.json();
    setSlots(Array.isArray(data) ? data : []);
  }

  async function handleSaveSlot() {
    if (!startDate || !endDate) return;
    setSaving(true);
    setSaveError(null);

    // "Any" means the instructor can fulfil ALL options in that category (OR logic).
    // Expand empty selections to the full list of available IDs before saving.
    const effectiveDisciplineIds  = conditions.disciplineIds.length      > 0 ? conditions.disciplineIds      : disciplines.map((d) => d.id);
    const effectiveResortIds      = conditions.resortIds.length          > 0 ? conditions.resortIds          : resorts.map((r) => r.id);
    const effectiveLanguageIds    = conditions.languageIds.length        > 0 ? conditions.languageIds        : languages.map((l) => l.id);
    const effectiveSkillLevelIds  = conditions.skillLevelIds.length      > 0 ? conditions.skillLevelIds      : skillLevels.map((s) => s.id);
    const effectiveImprovementIds = conditions.improvementAreaIds.length > 0 ? conditions.improvementAreaIds : improvementAreas.map((a) => a.id);

    const res = await fetch("/api/instructor/availability-slots", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        start_date: startDate,
        end_date: endDate,
        discipline_ids:       effectiveDisciplineIds,
        resort_ids:           effectiveResortIds,
        language_ids:         effectiveLanguageIds,
        skill_level_ids:      effectiveSkillLevelIds,
        improvement_area_ids: effectiveImprovementIds,
      }),
    });
    if (res.ok) {
      // Reload from GET so the new slot has resolved names attached
      await reloadSlots();
      setStartDate("");
      setEndDate("");
      setConditions(EMPTY_CONDITIONS);
    } else {
      const body = await res.json();
      setSaveError(body.error ?? t("saveError"));
    }
    setSaving(false);
  }

  async function handleDeleteSlot(id: string) {
    setDeletingId(id);
    const res = await fetch(`/api/instructor/availability-slots/${id}`, { method: "DELETE" });
    if (res.ok) {
      setSlots((prev) => prev.filter((s) => s.id !== id));
    }
    setDeletingId(null);
  }

  function getSlotPrimaryTags(slot: AvailabilitySlot): string[] {
    return [
      ...(slot.resolved_disciplines ?? []).map((i) => localizedName(i, locale)),
      ...(slot.resolved_resorts ?? []).map((i) => localizedName(i, locale)),
      ...(slot.resolved_languages ?? []).map((i) => localizedName(i, locale)),
    ];
  }

  function getSlotExpandedTags(slot: AvailabilitySlot): string[] {
    return [
      ...(slot.resolved_skill_levels ?? []).map((i) => localizedName(i, locale)),
      ...(slot.resolved_improvement_areas ?? []).map((i) => localizedName(i, locale)),
    ];
  }

  // True when the DB reference tables have not been seeded yet (IDs are fake defaults like "1").
  const usingFallbackData = !loadingOptions && !isRealDBData(disciplines);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-1 text-xl font-semibold text-slate-900">{t("title")}</h2>
      <p className="mb-6 text-sm text-slate-500">{t("subtitle")}</p>

      {/* DB not seeded warning */}
      {usingFallbackData && (
        <div className="mb-6 rounded-lg border border-amber-300 bg-amber-50 px-4 py-3 text-sm text-amber-800">
          <strong>{t("seedWarningTitle")}</strong>
          <p className="mt-1">{t("seedWarningBody")}</p>
        </div>
      )}

      {/* Add availability form */}
      <div className="rounded-lg border border-slate-200 bg-slate-50 p-5 space-y-5">
        <h3 className="text-sm font-semibold text-slate-700">{t("addAvailability")}</h3>

        {/* Date range */}
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">{t("dateRange")}</p>
          <div className="flex flex-wrap items-end gap-3">
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">{t("startDate")}</label>
              <input
                type="date"
                value={startDate}
                min={today}
                onChange={(e) => {
                  setStartDate(e.target.value);
                  if (endDate && e.target.value > endDate) setEndDate(e.target.value);
                }}
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <div className="flex flex-col gap-1">
              <label className="text-xs text-slate-500">{t("endDate")}</label>
              <input
                type="date"
                value={endDate}
                min={startDate || today}
                onChange={(e) => setEndDate(e.target.value)}
                className="rounded border border-slate-300 px-3 py-2 text-sm"
              />
            </div>
            <button
              type="button"
              onClick={() => { setStartDate(""); setEndDate(""); }}
              className="text-xs text-slate-400 hover:text-red-500 shrink-0"
            >
              {tFilters("clearDates")}
            </button>
          </div>
        </div>

        {/* What the instructor can teach on these dates */}
        <div>
          <p className="mb-2 text-xs font-medium text-slate-600">{t("whatITeach")}</p>
          {loadingOptions ? (
            <p className="text-sm text-slate-500">{t("loadingOptions")}</p>
          ) : (
            <div className="flex flex-wrap items-end gap-3">
              <div className="flex-1 min-w-0">
                <InstructorConditionsForm
                  resorts={resorts}
                  languages={languages}
                  skillLevels={skillLevels}
                  improvementAreas={improvementAreas}
                  disciplines={disciplines}
                  conditions={conditions}
                  onChange={setConditions}
                />
              </div>
              <button
                type="button"
                onClick={() => setConditions(EMPTY_CONDITIONS)}
                className="text-xs text-slate-400 hover:text-red-500 shrink-0"
              >
                {tFilters("clearConditions")}
              </button>
            </div>
          )}
        </div>

        {saveError && <p className="text-xs text-red-600">{saveError}</p>}

        <button
          type="button"
          onClick={handleSaveSlot}
          disabled={!startDate || !endDate || saving || loadingOptions || usingFallbackData}
          className="rounded-lg bg-powder-500 px-5 py-2 text-sm font-medium text-white hover:bg-powder-600 disabled:opacity-50"
        >
          {saving ? "..." : t("saveSlot")}
        </button>
      </div>

      {/* Saved availability slots */}
      <div className="mt-8">
        <h3 className="mb-3 text-sm font-semibold text-slate-700">{t("savedSlots")}</h3>

        {loadingSlots ? (
          <p className="text-sm text-slate-500">{t("loading")}</p>
        ) : slots.length === 0 ? (
          <p className="text-sm text-slate-400">{t("noSlots")}</p>
        ) : (
          <ul className="space-y-3">
            {slots.map((slot) => {
              const primaryTags  = getSlotPrimaryTags(slot);
              const expandedTags = getSlotExpandedTags(slot);
              return (
                <li
                  key={slot.id}
                  className="flex items-start justify-between gap-4 rounded-lg border border-slate-200 bg-white px-4 py-4"
                >
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-slate-800">
                      {formatDate(slot.start_date)}
                      {slot.start_date !== slot.end_date && (
                        <> &ndash; {formatDate(slot.end_date)}</>
                      )}
                    </p>
                    {primaryTags.length > 0 || expandedTags.length > 0 ? (
                      <SlotTagsDisplay primaryTags={primaryTags} expandedTags={expandedTags} />
                    ) : (
                      <p className="mt-1 text-xs text-slate-400">{t("noConditions")}</p>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={() => handleDeleteSlot(slot.id)}
                    disabled={deletingId === slot.id}
                    className="shrink-0 text-xs text-slate-400 hover:text-red-500 disabled:opacity-50"
                  >
                    {t("deleteSlot")}
                  </button>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </section>
  );
}
