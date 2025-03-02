import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const {
      id,
      Español,
      Inglés,
      Portugués,
      media_url,
      date_time,
      duration,
      cost,
      register_link,
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del evento" },
        { status: 400 }
      );
    }

    const dataToUpdate = {
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
    };

    const { data, error } = await supabase
      .from("events")
      .update(dataToUpdate)
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Evento actualizado con éxito", data });
  } catch (error) {
    console.error("Error en /api/events/updateEvent:", error);
    return NextResponse.json(
      { error: "Error al actualizar evento", details: error },
      { status: 500 }
    );
  }
}
