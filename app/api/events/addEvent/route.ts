import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Datos recibidos en /api/events/addEvent:", body);

    const {
      Español,
      Inglés,
      Portugués,
      media_url,
      date_time,
      duration,
      cost,
      register_link,
    } = body;
    // Obtener el mayor order_number actual
    const { data: maxOrderData, error: maxOrderError } = await supabase
      .from("events")
      .select("order_number")
      .order("order_number", { ascending: false })
      .limit(1);

    if (maxOrderError) {
      console.error("Error al obtener el máximo order_number:", maxOrderError);
      return NextResponse.json(
        { error: maxOrderError.message },
        { status: 500 }
      );
    }

    const maxOrder = maxOrderData?.[0]?.order_number ?? -1;

    const dataToInsert = {
      name_spanish: Español?.name ?? null,
      location_spanish: Español?.location ?? null,
      category_spanish: Español?.category ?? null,
      description_spanish: Español?.description ?? null,

      name_english: Inglés?.name ?? null,
      location_english: Inglés?.location ?? null,
      category_english: Inglés?.category ?? null,
      description_english: Inglés?.description ?? null,

      name_portuguese: Portugués?.name ?? null,
      location_portuguese: Portugués?.location ?? null,
      category_portuguese: Portugués?.category ?? null,
      description_portuguese: Portugués?.description ?? null,

      date_time: date_time ?? null,
      duration: duration ?? null,
      cost: cost ?? null,
      register_link: register_link ?? null,
      media_url: media_url ?? null,
      order_number: maxOrder + 1, // 📌 Asignar el siguiente número en orden
    };

    const { data, error } = await supabase
      .from("events")
      .insert([dataToInsert]);
    if (error) {
      console.error("Error al insertar evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Evento agregado con éxito", data });
  } catch (error) {
    console.error("Error en /api/events/addEvent:", error);
    return NextResponse.json(
      { error: "Error al agregar evento", details: error },
      { status: 500 }
    );
  }
}
