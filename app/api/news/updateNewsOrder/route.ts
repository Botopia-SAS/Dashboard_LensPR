import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const newsItems = await req.json();
    console.log("📩 Datos recibidos en updateNewsOrder:", newsItems);

    for (const news of newsItems) {
      const { error } = await supabase
        .from("news")
        .update({ order_number: news.order_number })
        .eq("id", news.id);

      if (error) {
        console.error("❌ Error en Supabase:", error);
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }

    return NextResponse.json(
      { message: "Orden de noticias actualizado correctamente" },
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
