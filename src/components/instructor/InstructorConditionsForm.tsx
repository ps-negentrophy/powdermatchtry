"use client";

import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import type { Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";

export interface ConditionsState {
  disciplineIds: string[];
  disciplineOperator: "and" | "or";
  resortIds: string[];
  resortOperator: "and" | "or";
  languageIds: string[];
  languageOperator: "and" | "or";
  skillLevelIds: string[];
  skillLevelOperator: "and" | "or";
  improvementAreaIds: string[];
  improvementAreaOperator: "and" | "or";
}

interface InstructorConditionsFormProps {
  resorts: Resort[];
  languages: Language[];
  skillLevels: SkillLevel[];
  improvementAreas: ImprovementArea[];
  disciplines: Discipline[];
  conditions: ConditionsState;
  onChange: (conditions: ConditionsState) => void;
}

export function InstructorConditionsForm({
  resorts,
  languages,
  skillLevels,
  improvementAreas,
  disciplines,
  conditions,
  onChange,
}: InstructorConditionsFormProps) {
  const t = useTranslations("filters");
  const locale = useLocale() as "en" | "zh" | "ja";

  function update(partial: Partial<ConditionsState>) {
    onChange({ ...conditions, ...partial });
  }

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
      <MultiSelectFilter
        label={t("discipline")}
        options={disciplines}
        selectedIds={conditions.disciplineIds}
        operator={conditions.disciplineOperator}
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
        selectedIds={conditions.resortIds}
        operator={conditions.resortOperator}
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
        selectedIds={conditions.languageIds}
        operator={conditions.languageOperator}
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
        selectedIds={conditions.skillLevelIds}
        operator={conditions.skillLevelOperator}
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
        selectedIds={conditions.improvementAreaIds}
        operator={conditions.improvementAreaOperator}
        placeholder={t("any")}
        locale={locale}
        matchLabel={t("matchLabel")}
        andAll={t("andAll")}
        orAny={t("orAny")}
        onSelectionChange={(ids, op) => update({ improvementAreaIds: ids, improvementAreaOperator: op })}
      />
    </div>
  );
}
