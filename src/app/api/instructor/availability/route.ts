import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getInstructorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("instructors").select("id").eq("user_id", user.id).single();
  return data?.id ?? null;
}

export async function GET() {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data, error } = await supabase
    .from("instructor_availability")
    .select("id, available_date, session")
    .eq("instructor_id", instructorId)
    .order("available_date", { ascending: true })
    .order("session", { ascending: true });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data ?? []);
}

// POST body: { entries: { date: string; session: "morning" | "afternoon" | "night" }[] }
export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json() as {
    entries: { date: string; session: "morning" | "afternoon" | "night" }[];
  };

  const { entries } = body;
  if (!Array.isArray(entries) || entries.length === 0) {
    return NextResponse.json({ error: "entries array required" }, { status: 400 });
  }

  const validSessions = ["morning", "afternoon", "night"];
  const rows = entries
    .filter((e) => e.date && validSessions.includes(e.session))
    .map((e) => ({
      instructor_id: instructorId,
      available_date: e.date,
      session: e.session,
    }));

  if (rows.length === 0) {
    return NextResponse.json({ error: "No valid entries" }, { status: 400 });
  }

  const { error } = await supabase
    .from("instructor_availability")
    .upsert(rows, { onConflict: "instructor_id,available_date,session" });

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}

// DELETE ?date=YYYY-MM-DD             → remove all sessions for that date
// DELETE ?date=YYYY-MM-DD&session=morning → remove specific session
export async function DELETE(request: NextRequest) {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const date = request.nextUrl.searchParams.get("date");
  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 });

  const session = request.nextUrl.searchParams.get("session");

  let query = supabase
    .from("instructor_availability")
    .delete()
    .eq("instructor_id", instructorId)
    .eq("available_date", date);

  if (session) {
    query = query.eq("session", session);
  }

  const { error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json({ success: true });
}
