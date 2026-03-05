"use client";

import { useLocale, useTranslations } from "next-intl";
import { MultiSelectFilter } from "./MultiSelectFilter";
import type { Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";

export type FilterOperator = "and" | "or";

export interface InstructorFiltersState {
  startDate?: string;
  endDate?: string;
  resortIds: string[];
  resortOperator: FilterOperator;
  languageIds: string[];
  languageOperator: FilterOperator;
  skillLevelIds: string[];
  skillLevelOperator: FilterOperator;
  improvementAreaIds: string[];
  improvementAreaOperator: FilterOperator;
  disciplineIds: string[];
  disciplineOperator: FilterOperator;
}

type Locale = "en" | "zh" | "ja";

function getLocalizedName(
  item: { name_en: string; name_zh: string | null; name_ja: string | null },
  locale: string
): string {
  if (locale === "zh" && item.name_zh) return item.name_zh;
  if (locale === "ja" && item.name_ja) return item.name_ja;
  return item.name_en;
}

interface InstructorFiltersProps {
  resorts: Resort[];
  languages: Language[];
  skillLevels: SkillLevel[];
  improvementAreas: ImprovementArea[];
  disciplines: Discipline[];
  filters: InstructorFiltersState;
  onFiltersChange: (filters: InstructorFiltersState) => void;
}

export function InstructorFilters({
  resorts,
  languages,
  skillLevels,
  improvementAreas,
  disciplines,
  filters,
  onFiltersChange,
}: InstructorFiltersProps) {
  const locale = useLocale() as Locale;
  const t = useTranslations("filters");

  const update = (partial: Partial<InstructorFiltersState>) => {
    onFiltersChange({ ...filters, ...partial });
  };

  const today = new Date().toISOString().slice(0, 10);

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm space-y-4">
      {/* Date range row */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">{t("travelDates")}</p>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">{t("fromDate")}</label>
            <input
              type="date"
              value={filters.startDate ?? ""}
              min={today}
              onChange={(e) => {
                const val = e.target.value;
                update({
                  startDate: val || undefined,
                  endDate: filters.endDate && val && filters.endDate < val ? val : filters.endDate,
                });
              }}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-xs text-slate-500">{t("toDate")}</label>
            <input
              type="date"
              value={filters.endDate ?? ""}
              min={filters.startDate || today}
              onChange={(e) => update({ endDate: e.target.value || undefined })}
              className="rounded border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
          <button
            type="button"
            onClick={() => update({ startDate: undefined, endDate: undefined })}
            className="text-xs text-slate-400 hover:text-red-500"
          >
            {t("clearDates")}
          </button>
        </div>
      </div>

      {/* Condition filters row */}
      <div>
        <p className="mb-2 text-sm font-medium text-slate-700">{t("lessonConditions")}</p>
      </div>
      <div className="flex flex-wrap items-end gap-3">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5 flex-1 min-w-0">
        <MultiSelectFilter
          label={t("discipline")}
          options={disciplines}
          selectedIds={filters.disciplineIds}
          operator={filters.disciplineOperator}
          placeholder={t("any")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => update({ disciplineIds: ids, disciplineOperator: op })}
        />
        <MultiSelectFilter
          label={t("resort")}
          options={resorts}
          selectedIds={filters.resortIds}
          operator={filters.resortOperator}
          placeholder={t("any")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => update({ resortIds: ids, resortOperator: op })}
        />
        <MultiSelectFilter
          label={t("language")}
          options={languages}
          selectedIds={filters.languageIds}
          operator={filters.languageOperator}
          placeholder={t("any")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => update({ languageIds: ids, languageOperator: op })}
        />
        <MultiSelectFilter
          label={t("skillLevel")}
          options={skillLevels}
          selectedIds={filters.skillLevelIds}
          operator={filters.skillLevelOperator}
          placeholder={t("any")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => update({ skillLevelIds: ids, skillLevelOperator: op })}
        />
        <MultiSelectFilter
          label={t("areaToImprove")}
          options={improvementAreas}
          selectedIds={filters.improvementAreaIds}
          operator={filters.improvementAreaOperator}
          placeholder={t("any")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => update({ improvementAreaIds: ids, improvementAreaOperator: op })}
        />
        </div>
        <button
          type="button"
          onClick={() =>
            update({
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
            })
          }
          className="text-xs text-slate-400 hover:text-red-500 shrink-0"
        >
          {t("clearConditions")}
        </button>
      </div>
    </div>
  );
}
