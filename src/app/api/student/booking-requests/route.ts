import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("booking_requests")
    .select(
      "id, instructor_id, requested_date, requested_time_slot, message, status, created_at, responded_at, completed_at, instructors(display_name)"
    )
    .eq("student_id", user.id)
    .order("created_at", { ascending: false });

  if (status) query = query.eq("status", status);

  const { data: bookings, error } = await query;
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  const result = (bookings ?? []).map((b) => {
    const instructorData = b.instructors as { display_name: string } | null;
    return {
      id: b.id,
      instructor_id: b.instructor_id,
      instructor_name: instructorData?.display_name ?? "Instructor",
      requested_date: b.requested_date,
      requested_time_slot: b.requested_time_slot,
      message: b.message,
      status: b.status,
      created_at: b.created_at,
      responded_at: b.responded_at,
      completed_at: b.completed_at,
    };
  });

  return NextResponse.json(result);
}

export async function POST(request: NextRequest) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { instructor_id, requested_date, requested_time_slot, message } = body as {
    instructor_id: string;
    requested_date: string;
    requested_time_slot?: string;
    message?: string;
  };

  if (!instructor_id || !requested_date) {
    return NextResponse.json(
      { error: "instructor_id and requested_date are required" },
      { status: 400 }
    );
  }

  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      student_id: user.id,
      instructor_id,
      requested_date,
      requested_time_slot: requested_time_slot ?? null,
      message: message ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
