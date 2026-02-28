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
    const { data: newInstructor, error: insertError } = await supabase
      .from("instructors")
      .insert({
        user_id: user.id,
        display_name:
          user.user_metadata?.display_name ??
          user.email?.split("@")[0] ??
          "Instructor",
      })
      .select()
      .single();

    if (insertError) {
      return NextResponse.json({ error: insertError.message }, { status: 500 });
    }
    return NextResponse.json(newInstructor);
  }

  return NextResponse.json(instructor);
}
