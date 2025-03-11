import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("clients")
      .select("*")
      .order("order_number", { ascending: true }); // 👈 Ahora ordenamos por `order_number`

    if (error) throw error;

    return NextResponse.json(data);
  } catch (err) {
    console.error("Error al obtener clients:", err);
    return NextResponse.json(
      { error: "Error al obtener clients" },
      { status: 500 }
    );
  }
}
