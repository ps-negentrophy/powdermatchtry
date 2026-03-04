import { NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";

export async function GET() {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Unauthorized" }, { status: 401 });

  const { data: instructor, error } = await supabase
    .from("instructors")
    .select("*")
    .eq("user_id", user.id)
    .single();

  if (error && error.code !== "PGRST116") {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  if (!instructor) {
    const meta = user.user_metadata ?? {};
    const { data: newInstructor, error: insertError } = await supabase
      .from("instructors")
      .insert({
        user_id: user.id,
        display_name: meta.display_name ?? user.email?.split("@")[0] ?? "Instructor",
        gender:      meta.gender      ?? null,
        birth_year:  meta.birth_year  ?? null,
        birth_month: meta.birth_month ?? null,
        certification_body:   meta.certification_body   ?? null,
        certification_number: meta.certification_number ?? null,
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json(newInstructor);
  }

  // Sync certification from signup metadata to DB when missing (so Eligible Lessons shows it)
  const meta = user.user_metadata ?? {};
  const metaHasCert =
    (meta.certification_body && String(meta.certification_body).trim()) ||
    (meta.certification_number && String(meta.certification_number).trim());
  const dbHasCert =
    (instructor.certification_body && String(instructor.certification_body).trim()) ||
    (instructor.certification_number && String(instructor.certification_number).trim());
  if (metaHasCert && !dbHasCert) {
    await supabase
      .from("instructors")
      .update({
        certification_body: meta.certification_body ? String(meta.certification_body).trim() || null : null,
        certification_number: meta.certification_number ? String(meta.certification_number).trim() || null : null,
      })
      .eq("id", instructor.id);
    // Return instructor with synced certification
    return NextResponse.json({
      ...instructor,
      certification_body: meta.certification_body ? String(meta.certification_body).trim() || null : null,
      certification_number: meta.certification_number ? String(meta.certification_number).trim() || null : null,
    });
  }

  return NextResponse.json(instructor);
}
