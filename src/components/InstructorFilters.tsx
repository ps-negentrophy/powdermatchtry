"use client";

import { useLocale, useTranslations } from "next-intl";
import { MultiSelectFilter } from "./MultiSelectFilter";
import type { Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";

export type FilterOperator = "and" | "or";

export interface InstructorFiltersState {
  resortIds: string[];
  resortOperator: FilterOperator;
  languageIds: string[];
  languageOperator: FilterOperator;
  skillLevelId?: string;
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

  return (
    <div className="rounded-lg border bg-white p-4 shadow-sm">
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
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
          placeholder={t("allResorts")}
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
          placeholder={t("anyLanguage")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => update({ languageIds: ids, languageOperator: op })}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t("skillLevel")}</label>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            value={filters.skillLevelId ?? ""}
            onChange={(e) => update({ skillLevelId: e.target.value || undefined })}
          >
            <option value="">{t("anyLevel")}</option>
            {skillLevels.map((s) => (
              <option key={s.id} value={s.id}>
                {getLocalizedName(s, locale)}
              </option>
            ))}
          </select>
        </div>
        <MultiSelectFilter
          label={t("areaToImprove")}
          options={improvementAreas}
          selectedIds={filters.improvementAreaIds}
          operator={filters.improvementAreaOperator}
          placeholder={t("anyArea")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => update({ improvementAreaIds: ids, improvementAreaOperator: op })}
        />
      </div>
    </div>
  );
}
