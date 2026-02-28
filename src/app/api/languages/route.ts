import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabase";
import { DEFAULT_LANGUAGES } from "@/config/filter-options";

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("languages")
      .select("*")
      .order("display_order");

    if (error) throw error;
    const languages = data && data.length > 0 ? data : DEFAULT_LANGUAGES;
    return NextResponse.json(languages);
  } catch {
    return NextResponse.json(DEFAULT_LANGUAGES);
  }
}
