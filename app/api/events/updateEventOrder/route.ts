import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const events = await req.json();
    console.log("📩 Datos recibidos en updateEventOrder:", events); // 🔍 Verifica los datos recibidos

    for (const event of events) {
      const { error } = await supabase
        .from("events")
        .update({ order_number: event.order_number })
        .eq("id", event.id);

      if (error) {
        console.error("❌ Error en Supabase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json(
      { message: "Orden actualizado correctamente" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error en el servidor:", err);
    return NextResponse.json(
      { error: "Error interno del servidor" },
      { status: 500 }
    );
  }
}
