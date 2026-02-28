"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { useLocale } from "next-intl";
import { MultiSelectFilter } from "@/components/MultiSelectFilter";
import type { Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";

interface InstructorConditionsFormProps {
  resorts: Resort[];
  languages: Language[];
  skillLevels: SkillLevel[];
  improvementAreas: ImprovementArea[];
  disciplines: Discipline[];
  onSaved?: () => void;
}

export function InstructorConditionsForm({
  resorts,
  languages,
  skillLevels,
  improvementAreas,
  disciplines,
  onSaved,
}: InstructorConditionsFormProps) {
  const t = useTranslations("filters");
  const tProfile = useTranslations("user.instructor.profile");
  const locale = useLocale() as "en" | "zh" | "ja";
  const [conditions, setConditions] = useState({
    disciplineIds: [] as string[],
    disciplineOperator: "or" as "and" | "or",
    resortIds: [] as string[],
    resortOperator: "or" as "and" | "or",
    languageIds: [] as string[],
    languageOperator: "or" as "and" | "or",
    skillLevelId: "" as string,
    improvementAreaIds: [] as string[],
    improvementAreaOperator: "or" as "and" | "or",
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetch("/api/instructor/conditions")
      .then((r) => r.json())
      .then((data) => {
        if (data && typeof data === "object") {
          setConditions({
            disciplineIds: data.disciplines ?? [],
            disciplineOperator: "or",
            resortIds: data.resorts ?? [],
            resortOperator: "or",
            languageIds: data.languages ?? [],
            languageOperator: "or",
            skillLevelId: Array.isArray(data.skill_levels) && data.skill_levels[0] ? data.skill_levels[0] : "",
            improvementAreaIds: data.improvement_areas ?? [],
            improvementAreaOperator: "or",
          });
        }
      })
      .finally(() => setLoading(false));
  }, []);

  async function handleSave() {
    setSaving(true);
    try {
      const res = await fetch("/api/instructor/conditions", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          disciplines: conditions.disciplineIds,
          resorts: conditions.resortIds,
          languages: conditions.languageIds,
          skill_levels: conditions.skillLevelId ? [conditions.skillLevelId] : [],
          improvement_areas: conditions.improvementAreaIds,
        }),
      });
      if (res.ok) onSaved?.();
    } finally {
      setSaving(false);
    }
  }

  if (loading) return <p className="text-sm text-slate-500">{tProfile("loading")}</p>;

  return (
    <div className="space-y-4">
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
          onSelectionChange={(ids, op) => setConditions((c) => ({ ...c, disciplineIds: ids, disciplineOperator: op }))}
        />
        <MultiSelectFilter
          label={t("resort")}
          options={resorts}
          selectedIds={conditions.resortIds}
          operator={conditions.resortOperator}
          placeholder={t("allResorts")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => setConditions((c) => ({ ...c, resortIds: ids, resortOperator: op }))}
        />
        <MultiSelectFilter
          label={t("language")}
          options={languages}
          selectedIds={conditions.languageIds}
          operator={conditions.languageOperator}
          placeholder={t("anyLanguage")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => setConditions((c) => ({ ...c, languageIds: ids, languageOperator: op }))}
        />
        <div>
          <label className="mb-1 block text-sm font-medium text-slate-700">{t("skillLevel")}</label>
          <select
            className="w-full rounded border border-slate-300 px-3 py-2 text-sm"
            value={conditions.skillLevelId}
            onChange={(e) => setConditions((c) => ({ ...c, skillLevelId: e.target.value }))}
          >
            <option value="">{t("anyLevel")}</option>
            {skillLevels.map((s) => (
              <option key={s.id} value={s.id}>{s.name_en}</option>
            ))}
          </select>
        </div>
        <MultiSelectFilter
          label={t("areaToImprove")}
          options={improvementAreas}
          selectedIds={conditions.improvementAreaIds}
          operator={conditions.improvementAreaOperator}
          placeholder={t("anyArea")}
          locale={locale}
          matchLabel={t("matchLabel")}
          andAll={t("andAll")}
          orAny={t("orAny")}
          onSelectionChange={(ids, op) => setConditions((c) => ({ ...c, improvementAreaIds: ids, improvementAreaOperator: op }))}
        />
      </div>
      <button
        type="button"
        onClick={handleSave}
        disabled={saving}
        className="rounded-lg bg-powder-500 px-4 py-2 text-sm font-medium text-white hover:bg-powder-600 disabled:opacity-50"
      >
        {saving ? "..." : tProfile("saveConditions")}
      </button>
    </div>
  );
}
