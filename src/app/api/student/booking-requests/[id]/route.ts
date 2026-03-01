import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;

  // Only allow cancellation of own pending requests
  const { data: booking, error: fetchError } = await supabase
    .from("booking_requests")
    .select("id, student_id, status")
    .eq("id", id)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 });
  }
  if (booking.student_id !== user.id) {
    return NextResponse.json({ error: "Forbidden" }, { status: 403 });
  }
  if (booking.status !== "pending") {
    return NextResponse.json(
      { error: "Only pending requests can be cancelled" },
      { status: 400 }
    );
  }

  const { error, count } = await supabase
    .from("booking_requests")
    .delete({ count: "exact" })
    .eq("id", id)
    .eq("student_id", user.id)   // belt-and-suspenders — matches the RLS policy
    .eq("status", "pending");

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (count === 0) {
    return NextResponse.json(
      { error: "Could not cancel the request. It may have already been accepted or removed." },
      { status: 409 }
    );
  }
  return NextResponse.json({ success: true });
}
