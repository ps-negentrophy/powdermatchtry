import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DEFAULT_SKILL_LEVELS } from "@/config/filter-options";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("skill_levels")
      .select("*")
      .order("display_order");

    if (error) throw error;
    const skillLevels = data && data.length > 0 ? data : DEFAULT_SKILL_LEVELS;
    return NextResponse.json(skillLevels);
  } catch {
    return NextResponse.json(DEFAULT_SKILL_LEVELS);
  }
}
