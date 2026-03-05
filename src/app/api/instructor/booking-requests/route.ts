import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import type { ResolvedNameItem } from "@/types/database";

async function getInstructorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("instructors").select("id").eq("user_id", user.id).single();
  return data?.id ?? null;
}

function buildMap(items: ResolvedNameItem[]): Map<string, ResolvedNameItem> {
  return new Map(items.map((i) => [i.id, i]));
}

const nameSelect = "id, name_en, name_zh, name_ja";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = request.nextUrl.searchParams.get("status");
  let query = supabase
    .from("booking_requests")
    .select(
      "id, student_id, instructor_id, requested_date, end_date, message, status, created_at, responded_at, completed_at, " +
      "booked_discipline_ids, booked_resort_ids, booked_language_ids, booked_skill_level_ids, booked_improvement_area_ids"
    )
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: bookings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bookings || bookings.length === 0) return NextResponse.json([]);

  type BookingRow = {
    id: string; student_id: string; instructor_id: string; requested_date: string; end_date?: string | null;
    message?: string | null; status: string; created_at: string; responded_at?: string | null; completed_at?: string | null;
    booked_discipline_ids?: string[]; booked_resort_ids?: string[]; booked_language_ids?: string[]; booked_skill_level_ids?: string[]; booked_improvement_area_ids?: string[];
  };
  const rows = bookings as unknown as BookingRow[];

  // Resolve student names
  const studentIds = [...new Set(rows.map((b) => b.student_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", studentIds);
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? "Student"]));

  // Collect all condition IDs across all bookings for batch resolution
  const dIds = [...new Set(rows.flatMap((b) => b.booked_discipline_ids ?? []))];
  const rIds = [...new Set(rows.flatMap((b) => b.booked_resort_ids ?? []))];
  const lIds = [...new Set(rows.flatMap((b) => b.booked_language_ids ?? []))];
  const slIds = [...new Set(rows.flatMap((b) => b.booked_skill_level_ids ?? []))];
  const iIds = [...new Set(rows.flatMap((b) => b.booked_improvement_area_ids ?? []))];

  const [disciplines, resorts, languages, skillLevels, improvementAreas] = await Promise.all([
    dIds.length ? supabase.from("disciplines").select(nameSelect).in("id", dIds).then((r) => (r.data ?? []) as ResolvedNameItem[]) : Promise.resolve([] as ResolvedNameItem[]),
    rIds.length ? supabase.from("resorts").select(nameSelect).in("id", rIds).then((r) => (r.data ?? []) as ResolvedNameItem[]) : Promise.resolve([] as ResolvedNameItem[]),
    lIds.length ? supabase.from("languages").select(nameSelect).in("id", lIds).then((r) => (r.data ?? []) as ResolvedNameItem[]) : Promise.resolve([] as ResolvedNameItem[]),
    slIds.length ? supabase.from("skill_levels").select(nameSelect).in("id", slIds).then((r) => (r.data ?? []) as ResolvedNameItem[]) : Promise.resolve([] as ResolvedNameItem[]),
    iIds.length ? supabase.from("improvement_areas").select(nameSelect).in("id", iIds).then((r) => (r.data ?? []) as ResolvedNameItem[]) : Promise.resolve([] as ResolvedNameItem[]),
  ]);

  const dMap = buildMap(disciplines);
  const rMap = buildMap(resorts);
  const lMap = buildMap(languages);
  const slMap = buildMap(skillLevels);
  const iMap = buildMap(improvementAreas);

  const result = rows.map((b) => {
    const hasConditions =
      (b.booked_discipline_ids?.length ?? 0) > 0 ||
      (b.booked_resort_ids?.length ?? 0) > 0 ||
      (b.booked_language_ids?.length ?? 0) > 0 ||
      (b.booked_skill_level_ids?.length ?? 0) > 0 ||
      (b.booked_improvement_area_ids?.length ?? 0) > 0;

    const conditions = hasConditions
      ? {
          disciplines:       (b.booked_discipline_ids ?? []).map((x) => dMap.get(x)).filter(Boolean) as ResolvedNameItem[],
          resorts:           (b.booked_resort_ids ?? []).map((x) => rMap.get(x)).filter(Boolean) as ResolvedNameItem[],
          languages:         (b.booked_language_ids ?? []).map((x) => lMap.get(x)).filter(Boolean) as ResolvedNameItem[],
          skill_levels:      (b.booked_skill_level_ids ?? []).map((x) => slMap.get(x)).filter(Boolean) as ResolvedNameItem[],
          improvement_areas: (b.booked_improvement_area_ids ?? []).map((x) => iMap.get(x)).filter(Boolean) as ResolvedNameItem[],
        }
      : null;

    return {
      id: b.id,
      student_id: b.student_id,
      instructor_id: b.instructor_id,
      start_date: b.requested_date,
      end_date: b.end_date ?? b.requested_date,
      message: b.message,
      status: b.status,
      created_at: b.created_at,
      responded_at: b.responded_at,
      completed_at: b.completed_at,
      student_name: nameMap.get(b.student_id) ?? "Student",
      conditions,
    };
  });

  return NextResponse.json(result);
}
