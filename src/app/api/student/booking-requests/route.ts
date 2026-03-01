import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ResolvedNameItem } from "@/types/database";

function buildMap(items: ResolvedNameItem[]): Map<string, ResolvedNameItem> {
  return new Map(items.map((i) => [i.id, i]));
}

const nameSelect = "id, name_en, name_zh, name_ja";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("booking_requests")
    .select(
      "id, instructor_id, requested_date, end_date, message, status, created_at, responded_at, completed_at, " +
      "booked_discipline_ids, booked_resort_ids, booked_language_ids, booked_skill_level_ids, booked_improvement_area_ids, " +
      "instructors(display_name)"
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: bookings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bookings || bookings.length === 0) return NextResponse.json([]);

  // Batch-resolve condition names for all bookings
  const dIds  = [...new Set(bookings.flatMap((b) => b.booked_discipline_ids ?? []))];
  const rIds  = [...new Set(bookings.flatMap((b) => b.booked_resort_ids ?? []))];
  const lIds  = [...new Set(bookings.flatMap((b) => b.booked_language_ids ?? []))];
  const slIds = [...new Set(bookings.flatMap((b) => b.booked_skill_level_ids ?? []))];
  const iIds  = [...new Set(bookings.flatMap((b) => b.booked_improvement_area_ids ?? []))];

  const [disciplines, resorts, languages, skillLevels, improvementAreas] = await Promise.all([
    dIds.length  ? supabase.from("disciplines").select(nameSelect).in("id", dIds).then((r) => (r.data ?? []) as ResolvedNameItem[])         : Promise.resolve([] as ResolvedNameItem[]),
    rIds.length  ? supabase.from("resorts").select(nameSelect).in("id", rIds).then((r) => (r.data ?? []) as ResolvedNameItem[])              : Promise.resolve([] as ResolvedNameItem[]),
    lIds.length  ? supabase.from("languages").select(nameSelect).in("id", lIds).then((r) => (r.data ?? []) as ResolvedNameItem[])            : Promise.resolve([] as ResolvedNameItem[]),
    slIds.length ? supabase.from("skill_levels").select(nameSelect).in("id", slIds).then((r) => (r.data ?? []) as ResolvedNameItem[])        : Promise.resolve([] as ResolvedNameItem[]),
    iIds.length  ? supabase.from("improvement_areas").select(nameSelect).in("id", iIds).then((r) => (r.data ?? []) as ResolvedNameItem[])    : Promise.resolve([] as ResolvedNameItem[]),
  ]);

  const dMap  = buildMap(disciplines);
  const rMap  = buildMap(resorts);
  const lMap  = buildMap(languages);
  const slMap = buildMap(skillLevels);
  const iMap  = buildMap(improvementAreas);

  const result = (bookings ?? []).map((b) => {
    const instructorData = b.instructors as { display_name: string } | null;

    const hasConditions =
      (b.booked_discipline_ids?.length ?? 0) > 0 ||
      (b.booked_resort_ids?.length ?? 0) > 0 ||
      (b.booked_language_ids?.length ?? 0) > 0 ||
      (b.booked_skill_level_ids?.length ?? 0) > 0 ||
      (b.booked_improvement_area_ids?.length ?? 0) > 0;

    const conditions = hasConditions ? {
      disciplines:       (b.booked_discipline_ids ?? []).map((x) => dMap.get(x)).filter(Boolean) as ResolvedNameItem[],
      resorts:           (b.booked_resort_ids ?? []).map((x) => rMap.get(x)).filter(Boolean) as ResolvedNameItem[],
      languages:         (b.booked_language_ids ?? []).map((x) => lMap.get(x)).filter(Boolean) as ResolvedNameItem[],
      skill_levels:      (b.booked_skill_level_ids ?? []).map((x) => slMap.get(x)).filter(Boolean) as ResolvedNameItem[],
      improvement_areas: (b.booked_improvement_area_ids ?? []).map((x) => iMap.get(x)).filter(Boolean) as ResolvedNameItem[],
    } : null;

    return {
      id: b.id,
      instructor_id: b.instructor_id,
      instructor_name: instructorData?.display_name ?? "Instructor",
      start_date: b.requested_date,
      end_date: b.end_date ?? b.requested_date,
      message: b.message,
      status: b.status,
      created_at: b.created_at,
      responded_at: b.responded_at,
      completed_at: b.completed_at,
      conditions,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const {
    instructor_id,
    start_date,
    end_date,
    message,
    availability_slot_id,
    selected_discipline_ids,
    selected_resort_ids,
    selected_language_ids,
    selected_skill_level_ids,
    selected_improvement_area_ids,
  } = body as {
    instructor_id: string;
    start_date: string;
    end_date: string;
    message?: string;
    availability_slot_id?: string;
    selected_discipline_ids?: string[];
    selected_resort_ids?: string[];
    selected_language_ids?: string[];
    selected_skill_level_ids?: string[];
    selected_improvement_area_ids?: string[];
  };

  if (!instructor_id || !start_date || !end_date) {
    return NextResponse.json(
      { error: "instructor_id, start_date and end_date are required" },
      { status: 400 }
    );
  }

  if (end_date < start_date) {
    return NextResponse.json(
      { error: "end_date must be on or after start_date" },
      { status: 400 }
    );
  }

  // Snapshot teaching conditions.
  // Use what the student explicitly selected; fall back per-category to the slot's conditions
  // when the student chose "Any" (empty array) for that category.
  let slotDisciplineIds: string[] = [];
  let slotResortIds: string[] = [];
  let slotLanguageIds: string[] = [];
  let slotSkillLevelIds: string[] = [];
  let slotImprovementAreaIds: string[] = [];

  if (availability_slot_id) {
    const { data: slot } = await supabase
      .from("availability_slots")
      .select("discipline_ids, resort_ids, language_ids, skill_level_ids, improvement_area_ids")
      .eq("id", availability_slot_id)
      .single();
    if (slot) {
      slotDisciplineIds      = slot.discipline_ids      ?? [];
      slotResortIds          = slot.resort_ids          ?? [];
      slotLanguageIds        = slot.language_ids        ?? [];
      slotSkillLevelIds      = slot.skill_level_ids     ?? [];
      slotImprovementAreaIds = slot.improvement_area_ids ?? [];
    }
  }

  // Prefer the student's explicit selection; fall back to the slot's full list when "Any" was chosen.
  const bookedDisciplineIds      = (selected_discipline_ids      ?? []).length > 0 ? selected_discipline_ids!      : slotDisciplineIds;
  const bookedResortIds          = (selected_resort_ids          ?? []).length > 0 ? selected_resort_ids!          : slotResortIds;
  const bookedLanguageIds        = (selected_language_ids        ?? []).length > 0 ? selected_language_ids!        : slotLanguageIds;
  const bookedSkillLevelIds      = (selected_skill_level_ids     ?? []).length > 0 ? selected_skill_level_ids!     : slotSkillLevelIds;
  const bookedImprovementAreaIds = (selected_improvement_area_ids ?? []).length > 0 ? selected_improvement_area_ids! : slotImprovementAreaIds;

  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      student_id: user.id,
      instructor_id,
      requested_date: start_date,
      end_date,
      message: message ?? null,
      availability_slot_id: availability_slot_id ?? null,
      booked_discipline_ids:      bookedDisciplineIds,
      booked_resort_ids:          bookedResortIds,
      booked_language_ids:        bookedLanguageIds,
      booked_skill_level_ids:     bookedSkillLevelIds,
      booked_improvement_area_ids: bookedImprovementAreaIds,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
