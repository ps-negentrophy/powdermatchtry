import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DEFAULT_IMPROVEMENT_AREAS } from "@/config/filter-options";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("improvement_areas")
      .select("*")
      .order("display_order");

    if (error) throw error;
    const improvementAreas = data && data.length > 0 ? data : DEFAULT_IMPROVEMENT_AREAS;
    return NextResponse.json(improvementAreas);
  } catch {
    return NextResponse.json(DEFAULT_IMPROVEMENT_AREAS);
  }
}
