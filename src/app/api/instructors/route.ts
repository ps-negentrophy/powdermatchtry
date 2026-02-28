import { NextRequest, NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import type { ResolvedAvailabilitySlot, ResolvedNameItem } from "@/types/database";

function parseIds(param: string | null): string[] {
  if (!param) return [];
  return param.split(",").map((s) => s.trim()).filter(Boolean);
}

function buildMap(items: ResolvedNameItem[]): Map<string, ResolvedNameItem> {
  return new Map(items.map((i) => [i.id, i]));
}

const nameSelect = "id, name_en, name_zh, name_ja";

/** Fetch all upcoming availability slots for a set of instructors, with names resolved. */
async function fetchResolvedSlots(
  instructorIds: string[]
): Promise<Map<string, ResolvedAvailabilitySlot[]>> {
  if (instructorIds.length === 0) return new Map();

  const today = new Date().toISOString().slice(0, 10);

  const { data: slots } = await supabase
    .from("availability_slots")
    .select(
      "id, instructor_id, start_date, end_date, discipline_ids, resort_ids, language_ids, skill_level_id, improvement_area_ids"
    )
    .in("instructor_id", instructorIds)
    .gte("end_date", today)
    .order("start_date", { ascending: true });

  if (!slots || slots.length === 0) return new Map();

  // Collect all unique IDs across all slots
  const disciplineIds = [...new Set(slots.flatMap((s) => s.discipline_ids ?? []))];
  const resortIds = [...new Set(slots.flatMap((s) => s.resort_ids ?? []))];
  const languageIds = [...new Set(slots.flatMap((s) => s.language_ids ?? []))];
  const skillLevelIds = [...new Set(slots.map((s) => s.skill_level_id).filter((id): id is string => !!id))];
  const improvementAreaIds = [...new Set(slots.flatMap((s) => s.improvement_area_ids ?? []))];

  const [disciplines, resorts, languages, skillLevels, improvementAreas] = await Promise.all([
    disciplineIds.length
      ? supabase.from("disciplines").select(nameSelect).in("id", disciplineIds).then((r) => (r.data ?? []) as ResolvedNameItem[])
      : Promise.resolve([] as ResolvedNameItem[]),
    resortIds.length
      ? supabase.from("resorts").select(nameSelect).in("id", resortIds).then((r) => (r.data ?? []) as ResolvedNameItem[])
      : Promise.resolve([] as ResolvedNameItem[]),
    languageIds.length
      ? supabase.from("languages").select(nameSelect).in("id", languageIds).then((r) => (r.data ?? []) as ResolvedNameItem[])
      : Promise.resolve([] as ResolvedNameItem[]),
    skillLevelIds.length
      ? supabase.from("skill_levels").select(nameSelect).in("id", skillLevelIds).then((r) => (r.data ?? []) as ResolvedNameItem[])
      : Promise.resolve([] as ResolvedNameItem[]),
    improvementAreaIds.length
      ? supabase.from("improvement_areas").select(nameSelect).in("id", improvementAreaIds).then((r) => (r.data ?? []) as ResolvedNameItem[])
      : Promise.resolve([] as ResolvedNameItem[]),
  ]);

  const disciplineMap = buildMap(disciplines);
  const resortMap = buildMap(resorts);
  const languageMap = buildMap(languages);
  const skillLevelMap = buildMap(skillLevels);
  const improvementAreaMap = buildMap(improvementAreas);

  // Group resolved slots by instructor_id
  const byInstructor = new Map<string, ResolvedAvailabilitySlot[]>();
  for (const slot of slots) {
    const resolved: ResolvedAvailabilitySlot = {
      id: slot.id,
      start_date: slot.start_date,
      end_date: slot.end_date,
      resolved_disciplines: (slot.discipline_ids ?? []).map((id: string) => disciplineMap.get(id)).filter(Boolean) as ResolvedNameItem[],
      resolved_resorts: (slot.resort_ids ?? []).map((id: string) => resortMap.get(id)).filter(Boolean) as ResolvedNameItem[],
      resolved_languages: (slot.language_ids ?? []).map((id: string) => languageMap.get(id)).filter(Boolean) as ResolvedNameItem[],
      resolved_skill_level: slot.skill_level_id ? (skillLevelMap.get(slot.skill_level_id) ?? null) : null,
      resolved_improvement_areas: (slot.improvement_area_ids ?? []).map((id: string) => improvementAreaMap.get(id)).filter(Boolean) as ResolvedNameItem[],
    };
    const list = byInstructor.get(slot.instructor_id) ?? [];
    list.push(resolved);
    byInstructor.set(slot.instructor_id, list);
  }
  return byInstructor;
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const startDate = searchParams.get("startDate");
  const endDate = searchParams.get("endDate");
  const resortIds = parseIds(searchParams.get("resortIds"));
  const resortOperator = (searchParams.get("resortOperator") || "or") as "and" | "or";
  const languageIds = parseIds(searchParams.get("languageIds"));
  const languageOperator = (searchParams.get("languageOperator") || "or") as "and" | "or";
  const skillLevelId = searchParams.get("skillLevelId");
  const improvementAreaIds = parseIds(searchParams.get("improvementAreaIds"));
  const improvementAreaOperator = (searchParams.get("improvementAreaOperator") || "or") as "and" | "or";
  const disciplineIds = parseIds(searchParams.get("disciplineIds"));
  const disciplineOperator = (searchParams.get("disciplineOperator") || "or") as "and" | "or";

  const hasDateFilter = !!(startDate || endDate);
  const hasConditionFilter = !!(
    disciplineIds.length || resortIds.length || languageIds.length ||
    skillLevelId || improvementAreaIds.length
  );

  try {
    let filteredInstructorIds: string[] | null = null;

    if (hasDateFilter || hasConditionFilter) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      let slotQuery: any = supabase.from("availability_slots").select("instructor_id");

      // Date containment: the student's full date range must fall inside the instructor's slot.
      if (hasDateFilter) {
        const lo = startDate ?? endDate!;
        const hi = endDate ?? startDate!;
        slotQuery = slotQuery.lte("start_date", lo).gte("end_date", hi);
      }

      // Condition filters
      if (disciplineIds.length) {
        slotQuery = disciplineOperator === "and"
          ? slotQuery.contains("discipline_ids", disciplineIds)
          : slotQuery.overlaps("discipline_ids", disciplineIds);
      }
      if (resortIds.length) {
        slotQuery = resortOperator === "and"
          ? slotQuery.contains("resort_ids", resortIds)
          : slotQuery.overlaps("resort_ids", resortIds);
      }
      if (languageIds.length) {
        slotQuery = languageOperator === "and"
          ? slotQuery.contains("language_ids", languageIds)
          : slotQuery.overlaps("language_ids", languageIds);
      }
      if (skillLevelId) {
        slotQuery = slotQuery.eq("skill_level_id", skillLevelId);
      }
      if (improvementAreaIds.length) {
        slotQuery = improvementAreaOperator === "and"
          ? slotQuery.contains("improvement_area_ids", improvementAreaIds)
          : slotQuery.overlaps("improvement_area_ids", improvementAreaIds);
      }

      const { data: slotData } = await slotQuery;
      filteredInstructorIds = [
        ...new Set((slotData ?? []).map((s: { instructor_id: string }) => s.instructor_id)),
      ];

      if (filteredInstructorIds.length === 0) return NextResponse.json([]);
    }

    // Fetch instructor profiles
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

    if (filteredInstructorIds !== null) {
      query = query.in("id", filteredInstructorIds);
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
      availability_slots: [] as ResolvedAvailabilitySlot[],
    }));

    // Attach resolved availability slots to each instructor
    const instructorIds = normalized.map((i) => i.id as string);
    const slotsByInstructor = await fetchResolvedSlots(instructorIds);
    for (const inst of normalized) {
      inst.availability_slots = slotsByInstructor.get(inst.id) ?? [];
    }

    return NextResponse.json(normalized);
  } catch {
    return NextResponse.json([], { status: 200 });
  }
}
