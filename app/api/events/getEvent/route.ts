import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase.from("events").select("*");
    if (error) throw error;
    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al obtener events:", err);
    return NextResponse.json(
      { error: "Error al obtener events" },
      { status: 500 }
    );
  }
}
