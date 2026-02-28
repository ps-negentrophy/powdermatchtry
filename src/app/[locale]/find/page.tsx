"use client";

import { useState, useEffect, useMemo } from "react";
import { useTranslations } from "next-intl";
import { InstructorFilters } from "@/components/InstructorFilters";
import type { InstructorFiltersState } from "@/components/InstructorFilters";
import { InstructorCard } from "@/components/InstructorCard";
import { DEFAULT_RESORTS, DEFAULT_LANGUAGES, DEFAULT_SKILL_LEVELS, DEFAULT_IMPROVEMENT_AREAS, DEFAULT_DISCIPLINES } from "@/config/filter-options";
import type { InstructorWithRelations, Resort, Language, SkillLevel, ImprovementArea, Discipline } from "@/types/database";

const MOCK_INSTRUCTORS: InstructorWithRelations[] = [
  {
    id: "1",
    display_name: "Yuki Tanaka",
    bio_en: "Certified instructor with 10+ years experience. Specializes in powder and off-piste.",
    bio_zh: null,
    bio_ja: null,
    avatar_url: null,
    is_verified: true,
    is_active: true,
    resorts: [DEFAULT_RESORTS[0], DEFAULT_RESORTS[1]],
    languages: [DEFAULT_LANGUAGES[0], DEFAULT_LANGUAGES[2]],
    skill_levels: [DEFAULT_SKILL_LEVELS[0], DEFAULT_SKILL_LEVELS[1]],
    improvement_areas: [DEFAULT_IMPROVEMENT_AREAS[1], DEFAULT_IMPROVEMENT_AREAS[3]],
    disciplines: [DEFAULT_DISCIPLINES[0], DEFAULT_DISCIPLINES[1]],
  },
  {
    id: "2",
    display_name: "James Wilson",
    bio_en: "English-speaking instructor. Great for beginners and intermediates.",
    bio_zh: null,
    bio_ja: null,
    avatar_url: null,
    is_verified: true,
    is_active: true,
    resorts: [...DEFAULT_RESORTS],
    languages: [DEFAULT_LANGUAGES[0]],
    skill_levels: [DEFAULT_SKILL_LEVELS[0], DEFAULT_SKILL_LEVELS[1]],
    improvement_areas: [DEFAULT_IMPROVEMENT_AREAS[3]],
    disciplines: [DEFAULT_DISCIPLINES[0]],
  },
];

function matchesRelation(
  instructorIds: string[],
  filterIds: string[],
  operator: "and" | "or"
): boolean {
  if (filterIds.length === 0) return true;
  if (operator === "or") {
    return filterIds.some((fid) => instructorIds.includes(fid));
  }
  return filterIds.every((fid) => instructorIds.includes(fid));
}

function filterInstructors(
  instructors: InstructorWithRelations[],
  filters: InstructorFiltersState
): InstructorWithRelations[] {
  return instructors.filter((inst) => {
    if (
      filters.resortIds.length > 0 &&
      !matchesRelation(
        inst.resorts.map((r) => r.id),
        filters.resortIds,
        filters.resortOperator
      )
    ) {
      return false;
    }
    if (
      filters.languageIds.length > 0 &&
      !matchesRelation(
        inst.languages.map((l) => l.id),
        filters.languageIds,
        filters.languageOperator
      )
    ) {
      return false;
    }
    if (filters.skillLevelId && !inst.skill_levels.some((s) => s.id === filters.skillLevelId)) {
      return false;
    }
    if (
      filters.improvementAreaIds.length > 0 &&
      !matchesRelation(
        inst.improvement_areas.map((a) => a.id),
        filters.improvementAreaIds,
        filters.improvementAreaOperator
      )
    ) {
      return false;
    }
    if (
      filters.disciplineIds.length > 0 &&
      !matchesRelation(
        (inst.disciplines ?? []).map((d) => d.id),
        filters.disciplineIds,
        filters.disciplineOperator
      )
    ) {
      return false;
    }
    return true;
  });
}

export default function FindInstructorPage() {
  const t = useTranslations("filters");
  const [instructors, setInstructors] = useState<InstructorWithRelations[]>([]);
  const [resorts, setResorts] = useState<Resort[]>(DEFAULT_RESORTS);
  const [languages, setLanguages] = useState<Language[]>(DEFAULT_LANGUAGES);
  const [skillLevels, setSkillLevels] = useState<SkillLevel[]>(DEFAULT_SKILL_LEVELS);
  const [improvementAreas, setImprovementAreas] = useState<ImprovementArea[]>(DEFAULT_IMPROVEMENT_AREAS);
  const [disciplines, setDisciplines] = useState<Discipline[]>(DEFAULT_DISCIPLINES);
  const [loading, setLoading] = useState(true);
  const [useMockData, setUseMockData] = useState(false);
  const [filters, setFilters] = useState<InstructorFiltersState>({
    resortIds: [],
    resortOperator: "or",
    languageIds: [],
    languageOperator: "or",
    improvementAreaIds: [],
    improvementAreaOperator: "or",
    disciplineIds: [],
    disciplineOperator: "or",
  });

  useEffect(() => {
    async function fetchFilters() {
      try {
        const [rRes, lRes, sRes, iRes, dRes] = await Promise.all([
          fetch("/api/resorts"),
          fetch("/api/languages"),
          fetch("/api/skill-levels"),
          fetch("/api/improvement-areas"),
          fetch("/api/disciplines"),
        ]);
        if (rRes.ok) setResorts(await rRes.json());
        if (lRes.ok) setLanguages(await lRes.json());
        if (sRes.ok) setSkillLevels(await sRes.json());
        if (iRes.ok) setImprovementAreas(await iRes.json());
        if (dRes.ok) setDisciplines(await dRes.json());
      } catch {
        setResorts(DEFAULT_RESORTS);
        setLanguages(DEFAULT_LANGUAGES);
        setSkillLevels(DEFAULT_SKILL_LEVELS);
        setImprovementAreas(DEFAULT_IMPROVEMENT_AREAS);
        setDisciplines(DEFAULT_DISCIPLINES);
      }
      setLoading(false);
    }
    fetchFilters();
  }, []);

  useEffect(() => {
    async function fetchInstructors() {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (filters.resortIds.length) {
          params.set("resortIds", filters.resortIds.join(","));
          params.set("resortOperator", filters.resortOperator);
        }
        if (filters.languageIds.length) {
          params.set("languageIds", filters.languageIds.join(","));
          params.set("languageOperator", filters.languageOperator);
        }
        if (filters.skillLevelId) params.set("skillLevelId", filters.skillLevelId);
        if (filters.improvementAreaIds.length) {
          params.set("improvementAreaIds", filters.improvementAreaIds.join(","));
          params.set("improvementAreaOperator", filters.improvementAreaOperator);
        }
        if (filters.disciplineIds.length) {
          params.set("disciplineIds", filters.disciplineIds.join(","));
          params.set("disciplineOperator", filters.disciplineOperator);
        }
        const res = await fetch(`/api/instructors?${params}`);
        if (res.ok) {
          const data = await res.json();
          setInstructors(Array.isArray(data) ? data : []);
          setUseMockData(false);
        } else {
          setInstructors(MOCK_INSTRUCTORS);
          setUseMockData(true);
        }
      } catch {
        setInstructors(MOCK_INSTRUCTORS);
        setUseMockData(true);
      }
      setLoading(false);
    }
    fetchInstructors();
  }, [filters]);

  const displayedInstructors = useMemo(() => {
    if (!useMockData) return instructors;
    return filterInstructors(instructors, filters);
  }, [instructors, filters, useMockData]);

  return (
    <div className="space-y-8">
      <h1 className="text-3xl font-bold">{t("title")}</h1>
      <InstructorFilters
        resorts={resorts}
        languages={languages}
        skillLevels={skillLevels}
        improvementAreas={improvementAreas}
        disciplines={disciplines}
        filters={filters}
        onFiltersChange={setFilters}
      />
      <section>
        {loading ? (
          <p className="text-slate-500">Loading...</p>
        ) : displayedInstructors.length === 0 ? (
          <p className="text-slate-500">No instructors match your criteria. Try adjusting your filters.</p>
        ) : (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {displayedInstructors.map((instructor) => (
              <InstructorCard key={instructor.id} instructor={instructor} />
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
