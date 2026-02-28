import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getInstructorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase.from("instructors").select("id").eq("user_id", user.id).single();
  return data?.id ?? null;
}

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  const status = request.nextUrl.searchParams.get("status");
  let query = supabase
    .from("booking_requests")
    .select("id, student_id, instructor_id, requested_date, requested_time_slot, message, status, created_at, responded_at, completed_at")
    .eq("instructor_id", instructorId)
    .order("created_at", { ascending: false });
  if (status) query = query.eq("status", status);
  const { data: bookings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!bookings || bookings.length === 0) return NextResponse.json([]);
  const studentIds = [...new Set(bookings.map((b) => b.student_id))];
  const { data: profiles } = await supabase.from("profiles").select("id, display_name").in("id", studentIds);
  const nameMap = new Map((profiles ?? []).map((p) => [p.id, p.display_name ?? "Student"]));
  const result = bookings.map((b) => ({ ...b, student_name: nameMap.get(b.student_id) ?? "Student" }));
  return NextResponse.json(result);
}
