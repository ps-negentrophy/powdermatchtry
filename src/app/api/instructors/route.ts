import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";

function parseIds(param: string | null): string[] {
  if (!param) return [];
  return param.split(",").map((s) => s.trim()).filter(Boolean);
}

async function getInstructorIdsForIds(
  junctionTable: "instructor_resorts" | "instructor_languages" | "instructor_skill_levels" | "instructor_improvement_areas" | "instructor_disciplines",
  fkColumn: "resort_id" | "language_id" | "skill_level_id" | "improvement_area_id" | "discipline_id",
  ids: string[],
  operator: "and" | "or"
): Promise<string[] | null> {
  if (ids.length === 0) return null;
  if (ids.length === 1) {
    const { data } = await supabase
      .from(junctionTable)
      .select("instructor_id")
      .eq(fkColumn, ids[0]);
    return data?.map((r) => r.instructor_id) ?? [];
  }
  const results: string[][] = [];
  for (const id of ids) {
    const { data } = await supabase
      .from(junctionTable)
      .select("instructor_id")
      .eq(fkColumn, id);
    const instructorIds = data?.map((r) => r.instructor_id) ?? [];
    if (instructorIds.length === 0 && operator === "and") return [];
    results.push(instructorIds);
  }
  if (operator === "or") {
    const union = [...new Set(results.flat())];
    return union;
  }
  const [first, ...rest] = results;
  const intersection = first.filter((id) => rest.every((arr) => arr.includes(id)));
  return intersection;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const resortIds = parseIds(searchParams.get("resortIds"));
  const resortOperator = (searchParams.get("resortOperator") || "or") as "and" | "or";
  const languageIds = parseIds(searchParams.get("languageIds"));
  const languageOperator = (searchParams.get("languageOperator") || "or") as "and" | "or";
  const skillLevelId = searchParams.get("skillLevelId");
  const improvementAreaIds = parseIds(searchParams.get("improvementAreaIds"));
  const improvementAreaOperator = (searchParams.get("improvementAreaOperator") || "or") as "and" | "or";
  const disciplineIds = parseIds(searchParams.get("disciplineIds"));
  const disciplineOperator = (searchParams.get("disciplineOperator") || "or") as "and" | "or";

  try {
    let query = supabase
      .from("instructors")
      .select(`
        *,
        resorts:instructor_resorts(resorts(*)),
        languages:instructor_languages(languages(*)),
        skill_levels:instructor_skill_levels(skill_levels(*)),
        improvement_areas:instructor_improvement_areas(improvement_areas(*)),
        disciplines:instructor_disciplines(disciplines(*))
      `)
      .eq("is_active", true);

    if (resortIds.length > 0) {
      const instructorIds = await getInstructorIdsForIds(
        "instructor_resorts",
        "resort_id",
        resortIds,
        resortOperator
      );
      if (instructorIds === null || instructorIds.length === 0) return NextResponse.json([]);
      query = query.in("id", instructorIds);
    }
    if (languageIds.length > 0) {
      const instructorIds = await getInstructorIdsForIds(
        "instructor_languages",
        "language_id",
        languageIds,
        languageOperator
      );
      if (instructorIds === null || instructorIds.length === 0) return NextResponse.json([]);
      query = query.in("id", instructorIds);
    }
    if (skillLevelId) {
      const instructorIds = await getInstructorIdsForIds(
        "instructor_skill_levels",
        "skill_level_id",
        [skillLevelId],
        "or"
      );
      if (instructorIds === null || instructorIds.length === 0) return NextResponse.json([]);
      query = query.in("id", instructorIds);
    }
    if (improvementAreaIds.length > 0) {
      const instructorIds = await getInstructorIdsForIds(
        "instructor_improvement_areas",
        "improvement_area_id",
        improvementAreaIds,
        improvementAreaOperator
      );
      if (instructorIds === null || instructorIds.length === 0) return NextResponse.json([]);
      query = query.in("id", instructorIds);
    }
    if (disciplineIds.length > 0) {
      const instructorIds = await getInstructorIdsForIds(
        "instructor_disciplines",
        "discipline_id",
        disciplineIds,
        disciplineOperator
      );
      if (instructorIds === null || instructorIds.length === 0) return NextResponse.json([]);
      query = query.in("id", instructorIds);
    }

    const { data, error } = await query;

    if (error) throw error;

    const normalized = (data ?? []).map((row) => ({
      ...row,
      resorts: row.resorts?.map((r: { resorts: unknown }) => r.resorts).filter(Boolean) ?? [],
      languages: row.languages?.map((l: { languages: unknown }) => l.languages).filter(Boolean) ?? [],
      skill_levels: row.skill_levels?.map((s: { skill_levels: unknown }) => s.skill_levels).filter(Boolean) ?? [],
      improvement_areas: row.improvement_areas?.map((i: { improvement_areas: unknown }) => i.improvement_areas).filter(Boolean) ?? [],
      disciplines: row.disciplines?.map((d: { disciplines: unknown }) => d.disciplines).filter(Boolean) ?? [],
    }));

    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
