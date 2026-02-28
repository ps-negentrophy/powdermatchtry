import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getInstructorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data?.id ?? null;
}

const JUNCTIONS: Record<string, { table: string; fk: string }> = {
  disciplines: { table: "instructor_disciplines", fk: "discipline_id" },
  resorts: { table: "instructor_resorts", fk: "resort_id" },
  languages: { table: "instructor_languages", fk: "language_id" },
  skill_levels: { table: "instructor_skill_levels", fk: "skill_level_id" },
  improvement_areas: { table: "instructor_improvement_areas", fk: "improvement_area_id" },
};

export async function GET() {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const result: Record<string, string[]> = {};
  for (const [key, config] of Object.entries(JUNCTIONS)) {
    const { data } = await supabase
      .from(config.table)
      .select(config.fk)
      .eq("instructor_id", instructorId);
    result[key] = (data ?? []).map((r) => (r as unknown as Record<string, string>)[config.fk]);
  }
  return NextResponse.json(result);
}

export async function PUT(request: NextRequest) {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = (await request.json()) as Record<string, string[]>;
  for (const [key, ids] of Object.entries(body)) {
    const config = JUNCTIONS[key];
    if (!config || !Array.isArray(ids)) continue;

    await supabase.from(config.table).delete().eq("instructor_id", instructorId);
    if (ids.length > 0) {
      const rows = ids.map((id) => ({
        instructor_id: instructorId,
        [config.fk]: id,
      }));
      await supabase.from(config.table).insert(rows);
    }
  }
  return NextResponse.json({ success: true });
}
