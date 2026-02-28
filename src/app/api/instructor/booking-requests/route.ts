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
    .select("id, student_id, instructor_id, requested_date, end_date, message, status, created_at, responded_at, completed_at, availability_slot_id")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);

  const { data: bookings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bookings || bookings.length === 0) return NextResponse.json([]);

  // Resolve student names
  const studentIds = [...new Set(bookings.map((b) => b.student_id))];
  const { data: profiles } = await supabase
    .from("profiles")
    .select("id, display_name")
    .in("id", studentIds);
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? "Student"]));

  // Fetch conditions from linked availability slots
  const slotIds = [...new Set(bookings.map((b) => b.availability_slot_id).filter(Boolean))] as string[];
  type SlotRow = {
    id: string;
    discipline_ids: string[];
    resort_ids: string[];
    language_ids: string[];
    skill_level_id: string | null;
    improvement_area_ids: string[];
  };
  let slotMap = new Map<string, SlotRow>();

  if (slotIds.length > 0) {
    const { data: slots } = await supabase
      .from("availability_slots")
      .select("id, discipline_ids, resort_ids, language_ids, skill_level_id, improvement_area_ids")
      .in("id", slotIds);

    if (slots && slots.length > 0) {
      slotMap = new Map((slots as SlotRow[]).map((s) => [s.id, s]));

      // Collect all IDs to resolve
      const dIds = [...new Set((slots as SlotRow[]).flatMap((s) => s.discipline_ids ?? []))];
      const rIds = [...new Set((slots as SlotRow[]).flatMap((s) => s.resort_ids ?? []))];
      const lIds = [...new Set((slots as SlotRow[]).flatMap((s) => s.language_ids ?? []))];
      const slIds = [...new Set((slots as SlotRow[]).map((s) => s.skill_level_id).filter((x): x is string => !!x))];
      const iIds = [...new Set((slots as SlotRow[]).flatMap((s) => s.improvement_area_ids ?? []))];

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

      // Attach resolved names back onto each slot entry in slotMap
      for (const [id, slot] of slotMap) {
        (slot as SlotRow & { resolved?: unknown }).resolved = {
          disciplines: (slot.discipline_ids ?? []).map((x) => dMap.get(x)).filter(Boolean),
          resorts: (slot.resort_ids ?? []).map((x) => rMap.get(x)).filter(Boolean),
          languages: (slot.language_ids ?? []).map((x) => lMap.get(x)).filter(Boolean),
          skill_level: slot.skill_level_id ? (slMap.get(slot.skill_level_id) ?? null) : null,
          improvement_areas: (slot.improvement_area_ids ?? []).map((x) => iMap.get(x)).filter(Boolean),
        };
        slotMap.set(id, slot);
      }
    }
  }

  const result = bookings.map((b) => {
    const slot = b.availability_slot_id ? slotMap.get(b.availability_slot_id) : undefined;
    return {
      ...b,
      start_date: b.requested_date,
      end_date: b.end_date ?? b.requested_date,
      student_name: nameMap.get(b.student_id) ?? "Student",
      conditions: slot ? (slot as SlotRow & { resolved?: unknown }).resolved ?? null : null,
    };
  });

  return NextResponse.json(result);
}
