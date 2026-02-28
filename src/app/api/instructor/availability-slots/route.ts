import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getInstructorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("instructors").select("id").eq("user_id", user.id).single();
  return data?.id ?? null;
}

type NameItem = { id: string; name_en: string; name_zh: string | null; name_ja: string | null };

function buildMap(items: NameItem[]): Map<string, NameItem> {
  return new Map(items.map((i) => [i.id, i]));
}

export async function GET() {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: slots, error } = await supabase
    .from("availability_slots")
    .select("id, start_date, end_date, discipline_ids, resort_ids, language_ids, skill_level_id, improvement_area_ids, created_at")
    .eq("instructor_id", instructorId)
    .order("start_date", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!slots || slots.length === 0) return NextResponse.json([]);

  // Collect all unique IDs that need resolving
  const disciplineIds = [...new Set(slots.flatMap((s) => s.discipline_ids ?? []))];
  const resortIds = [...new Set(slots.flatMap((s) => s.resort_ids ?? []))];
  const languageIds = [...new Set(slots.flatMap((s) => s.language_ids ?? []))];
  const skillLevelIds = [...new Set(slots.map((s) => s.skill_level_id).filter((id): id is string => !!id))];
  const improvementAreaIds = [...new Set(slots.flatMap((s) => s.improvement_area_ids ?? []))];

  // Fetch names in parallel (skip empty sets)
  const nameSelect = "id, name_en, name_zh, name_ja";
  const [disciplines, resorts, languages, skillLevels, improvementAreas] = await Promise.all([
    disciplineIds.length ? supabase.from("disciplines").select(nameSelect).in("id", disciplineIds).then((r) => r.data ?? []) : Promise.resolve([]),
    resortIds.length ? supabase.from("resorts").select(nameSelect).in("id", resortIds).then((r) => r.data ?? []) : Promise.resolve([]),
    languageIds.length ? supabase.from("languages").select(nameSelect).in("id", languageIds).then((r) => r.data ?? []) : Promise.resolve([]),
    skillLevelIds.length ? supabase.from("skill_levels").select(nameSelect).in("id", skillLevelIds).then((r) => r.data ?? []) : Promise.resolve([]),
    improvementAreaIds.length ? supabase.from("improvement_areas").select(nameSelect).in("id", improvementAreaIds).then((r) => r.data ?? []) : Promise.resolve([]),
  ]);

  const disciplineMap = buildMap(disciplines as NameItem[]);
  const resortMap = buildMap(resorts as NameItem[]);
  const languageMap = buildMap(languages as NameItem[]);
  const skillLevelMap = buildMap(skillLevels as NameItem[]);
  const improvementAreaMap = buildMap(improvementAreas as NameItem[]);

  const enriched = slots.map((slot) => ({
    ...slot,
    resolved_disciplines: (slot.discipline_ids ?? []).map((id) => disciplineMap.get(id)).filter(Boolean),
    resolved_resorts: (slot.resort_ids ?? []).map((id) => resortMap.get(id)).filter(Boolean),
    resolved_languages: (slot.language_ids ?? []).map((id) => languageMap.get(id)).filter(Boolean),
    resolved_skill_level: slot.skill_level_id ? (skillLevelMap.get(slot.skill_level_id) ?? null) : null,
    resolved_improvement_areas: (slot.improvement_area_ids ?? []).map((id) => improvementAreaMap.get(id)).filter(Boolean),
  }));

  return NextResponse.json(enriched);
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function filterUUIDs(arr: unknown): string[] {
  if (!Array.isArray(arr)) return [];
  return arr.filter((id): id is string => typeof id === "string" && UUID_REGEX.test(id));
}

function validUUIDOrNull(val: unknown): string | null {
  if (typeof val === "string" && UUID_REGEX.test(val)) return val;
  return null;
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    start_date: string;
    end_date: string;
    discipline_ids: string[];
    resort_ids: string[];
    language_ids: string[];
    skill_level_id?: string;
    improvement_area_ids: string[];
  };

  const { start_date, end_date, discipline_ids, resort_ids, language_ids, skill_level_id, improvement_area_ids } = body;

  if (!start_date || !end_date) {
    return NextResponse.json({ error: "start_date and end_date are required" }, { status: 400 });
  }

  if (end_date < start_date) {
    return NextResponse.json({ error: "end_date must be on or after start_date" }, { status: 400 });
  }

  const { data, error } = await supabase
    .from("availability_slots")
    .insert({
      instructor_id: instructorId,
      start_date,
      end_date,
      discipline_ids: filterUUIDs(discipline_ids),
      resort_ids: filterUUIDs(resort_ids),
      language_ids: filterUUIDs(language_ids),
      skill_level_id: validUUIDOrNull(skill_level_id),
      improvement_area_ids: filterUUIDs(improvement_area_ids),
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
