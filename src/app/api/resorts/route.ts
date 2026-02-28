import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DEFAULT_RESORTS } from "@/config/filter-options";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("resorts")
      .select("*")
      .eq("is_active", true)
      .order("display_order");

    if (error) throw error;
    const resorts = data && data.length > 0 ? data : DEFAULT_RESORTS;
    return NextResponse.json(resorts);
  } catch {
    return NextResponse.json(DEFAULT_RESORTS);
  }
}
