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
      order_number, // ✅ Asegurar que también recibimos el nuevo order_number
    } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del evento" },
        { status: 400 }
      );
    }

    // Obtener el order_number actual del evento
    const { data: oldEvent, error: fetchError } = await supabase
      .from("events")
      .select("order_number")
      .eq("id", id)
      .single();

    if (fetchError || !oldEvent) {
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const oldOrder = oldEvent.order_number;

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
      order_number: order_number, // ✅ Guardar el nuevo order_number si es distinto
    };

    // Si el número de orden cambió, reordenamos los demás eventos
    if (order_number !== oldOrder) {
      // Mover otros eventos hacia adelante o atrás
      const { error: reorderError } = await supabase
        .from("events")
        .update({ order_number: oldOrder })
        .neq("id", id)
        .gte("order_number", Math.min(oldOrder, order_number))
        .lte("order_number", Math.max(oldOrder, order_number));

      if (reorderError) {
        console.error("Error al reordenar eventos:", reorderError);
        return NextResponse.json(
          { error: reorderError.message },
          { status: 500 }
        );
      }
    }

    // Actualizar el evento
    const { error: updateError } = await supabase
      .from("events")
      .update(dataToUpdate)
      .eq("id", id);

    if (updateError) {
      console.error("Error al actualizar evento:", updateError);
      return NextResponse.json({ error: updateError.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Evento actualizado con éxito" });
  } catch (error) {
    console.error("Error en /api/events/updateEvent:", error);
    return NextResponse.json(
      { error: "Error al actualizar evento", details: error },
      { status: 500 }
    );
  }
}
