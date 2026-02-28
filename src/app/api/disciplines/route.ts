import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DEFAULT_DISCIPLINES } from "@/config/filter-options";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("disciplines")
      .select("*")
      .order("display_order");

    if (error) throw error;
    const disciplines = data && data.length > 0 ? data : DEFAULT_DISCIPLINES;
    return NextResponse.json(disciplines);
  } catch {
    return NextResponse.json(DEFAULT_DISCIPLINES);
  }
}
