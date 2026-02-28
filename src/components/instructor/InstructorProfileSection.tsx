"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { InstructorConditionsForm } from "./InstructorConditionsForm";
import { AvailabilityCalendar } from "./AvailabilityCalendar";
import type { Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";
import { DEFAULT_RESORTS, DEFAULT_LANGUAGES, DEFAULT_SKILL_LEVELS, DEFAULT_IMPROVEMENT_AREAS, DEFAULT_DISCIPLINES } from "@/config/filter-options";

export function InstructorProfileSection() {
  const t = useTranslations("user.instructor.profile");
  const [resorts, setResorts] = useState<Resort[]>(DEFAULT_RESORTS);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>(DEFAULT_SKILL_LEVELS);
  const [improvementAreas, setImprovementAreas] = useState<ImprovementArea[]>(DEFAULT_IMPROVEMENT_AREAS);
  const [disciplines, setDisciplines] = useState<Discipline[]>(DEFAULT_DISCIPLINES);
  const [saved, setSaved] = useState(false);

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
    });
  }, []);

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="mb-6 text-xl font-semibold text-slate-900">{t("title")}</h2>
      <div className="space-y-6">
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700">{t("availability")}</h3>
          <AvailabilityCalendar onSaved={() => setSaved(true)} />
        </div>
        <div>
          <h3 className="mb-3 text-sm font-medium text-slate-700">{t("conditions")}</h3>
          <InstructorConditionsForm
            resorts={resorts}
            languages={languages}
            skillLevels={skillLevels}
            improvementAreas={improvementAreas}
            disciplines={disciplines}
            onSaved={() => setSaved(true)}
          />
        </div>
      </div>
      {saved && <p className="mt-4 text-sm text-green-600">{t("saved")}</p>}
    </section>
  );
}
