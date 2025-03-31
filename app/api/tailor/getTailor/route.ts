import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TailorMadeItem } from "@/types/tailor";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function GET() {
  try {
    const { data, error } = await supabase
      .from("tailor_made")
      .select("*")
      .order("order", { ascending: true });

    if (error) {
      console.error("Error de Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json(data as TailorMadeItem[]);
  } catch (err) {
    console.error("Error al obtener items tailor:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
