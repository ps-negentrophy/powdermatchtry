import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

async function getInstructorId(supabase: Awaited<ReturnType<typeof createClient>>) {
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return null;
  const { data } = await supabase
    .from("instructors")
    .select("id")
    .eq("user_id", user.id)
    .single();
  return data?.id ?? null;
}

function addDays(dateStr: string, days: number): string {
  const d = new Date(dateStr + "T00:00:00Z");
  d.setUTCDate(d.getUTCDate() + days);
  return d.toISOString().slice(0, 10);
}

type SlotRow = {
  id: string;
  instructor_id: string;
  start_date: string;
  end_date: string;
  discipline_ids: string[];
  resort_ids: string[];
  language_ids: string[];
  skill_level_id: string | null;
  improvement_area_ids: string[];
};

async function amendSlot(
  supabase: Awaited<ReturnType<typeof createClient>>,
  slot: SlotRow,
  bookingStart: string,
  bookingEnd: string
) {
  const conditionFields = {
    instructor_id:        slot.instructor_id,
    discipline_ids:       slot.discipline_ids,
    resort_ids:           slot.resort_ids,
    language_ids:         slot.language_ids,
    skill_level_id:       slot.skill_level_id,
    improvement_area_ids: slot.improvement_area_ids,
  };

  const residuals = [
    // Dates before the booking (if any)
    slot.start_date < bookingStart
      ? { ...conditionFields, start_date: slot.start_date,          end_date: addDays(bookingStart, -1) }
      : null,
    // Dates after the booking (if any)
    slot.end_date > bookingEnd
      ? { ...conditionFields, start_date: addDays(bookingEnd, 1),   end_date: slot.end_date }
      : null,
  ].filter(Boolean);

  // Delete the consumed slot first
  await supabase.from("availability_slots").delete().eq("id", slot.id);

  // Re-insert residuals (may be empty if the booking exactly consumed the slot)
  if (residuals.length > 0) {
    await supabase.from("availability_slots").insert(residuals);
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  const supabase = await createClient();
  const instructorId = await getInstructorId(supabase);
  if (!instructorId) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { id } = await params;
  const body = await request.json();
  const { status } = body as { status: "accepted" | "declined" | "completed" };

  if (!["accepted", "declined", "completed"].includes(status)) {
    return NextResponse.json({ error: "Invalid status" }, { status: 400 });
  }

  // Fetch the booking (need dates + slot link for the amend logic)
  const { data: booking, error: fetchError } = await supabase
    .from("booking_requests")
    .select("id, requested_date, end_date, availability_slot_id, instructor_id")
    .eq("id", id)
    .eq("instructor_id", instructorId)
    .single();

  if (fetchError || !booking) {
    return NextResponse.json({ error: fetchError?.message ?? "Not found" }, { status: 404 });
  }

  // Update booking status
  const updates: Record<string, unknown> = { status };
  if (status === "accepted" || status === "declined") updates.responded_at = new Date().toISOString();
  if (status === "completed")                          updates.completed_at = new Date().toISOString();

  const { data, error } = await supabase
    .from("booking_requests")
    .update(updates)
    .eq("id", id)
    .eq("instructor_id", instructorId)
    .select()
    .single();

  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // ── Auto-amend availability when accepting ────────────────────────────────
  if (status === "accepted") {
    const bookingStart = booking.requested_date;
    const bookingEnd   = booking.end_date ?? booking.requested_date;

    let slot: SlotRow | null = null;

    // Primary path: booking has a direct slot reference
    if (booking.availability_slot_id) {
      const { data: s } = await supabase
        .from("availability_slots")
        .select("id, instructor_id, start_date, end_date, discipline_ids, resort_ids, language_ids, skill_level_id, improvement_area_ids")
        .eq("id", booking.availability_slot_id)
        .eq("instructor_id", instructorId)
        .single();
      slot = (s as SlotRow) ?? null;
    }

    // Fallback: find the slot that contains the booking's date range
    // (handles bookings created before availability_slot_id was added)
    if (!slot) {
      const { data: matches } = await supabase
        .from("availability_slots")
        .select("id, instructor_id, start_date, end_date, discipline_ids, resort_ids, language_ids, skill_level_id, improvement_area_ids")
        .eq("instructor_id", instructorId)
        .lte("start_date", bookingStart)
        .gte("end_date",   bookingEnd);

      // Only amend unambiguously — if exactly one slot covers these dates
      if (matches && matches.length === 1) {
        slot = matches[0] as SlotRow;
      }
    }

    if (slot) {
      await amendSlot(supabase, slot, bookingStart, bookingEnd);
    }
  }

  return NextResponse.json(data);
}
