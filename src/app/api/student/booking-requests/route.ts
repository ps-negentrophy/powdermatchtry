import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET(request: NextRequest) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const status = request.nextUrl.searchParams.get("status");

  let query = supabase
    .from("booking_requests")
    .select(
      "id, instructor_id, requested_date, end_date, message, status, created_at, responded_at, completed_at, instructors(display_name)"
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
      start_date: b.requested_date,
      end_date: b.end_date ?? b.requested_date,
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
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const body = await request.json();
  const { instructor_id, start_date, end_date, message, availability_slot_id } = body as {
    instructor_id: string;
    start_date: string;
    end_date: string;
    message?: string;
    availability_slot_id?: string;
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

  const { data, error } = await supabase
    .from("booking_requests")
    .insert({
      student_id: user.id,
      instructor_id,
      requested_date: start_date,
      end_date,
      message: message ?? null,
      availability_slot_id: availability_slot_id ?? null,
    })
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  return NextResponse.json(data, { status: 201 });
}
