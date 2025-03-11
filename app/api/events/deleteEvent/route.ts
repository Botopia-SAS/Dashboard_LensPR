import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();
    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del evento" },
        { status: 400 }
      );
    }

    // Obtener el order_number del evento a eliminar
    const { data: eventData, error: eventError } = await supabase
      .from("events")
      .select("order_number")
      .eq("id", id)
      .single();

    if (eventError || !eventData) {
      console.error("Error al obtener evento:", eventError);
      return NextResponse.json(
        { error: "Evento no encontrado" },
        { status: 404 }
      );
    }

    const deletedOrder = eventData.order_number;

    // Eliminar el evento
    const { error: deleteError } = await supabase
      .from("events")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("Error al eliminar evento:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // Reordenar los eventos restantes
    const { data: remainingEvents, error: fetchError } = await supabase
      .from("events")
      .select("id, order_number")
      .gt("order_number", deletedOrder)
      .order("order_number", { ascending: true });

    if (fetchError) {
      console.error("Error al obtener eventos restantes:", fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    // Actualizar los order_number de los eventos restantes
    for (const event of remainingEvents) {
      await supabase
        .from("events")
        .update({ order_number: event.order_number - 1 })
        .eq("id", event.id);
    }

    return NextResponse.json({
      message: "Evento eliminado y orden actualizado",
    });
  } catch (error) {
    console.error("Error en /api/events/deleteEvent:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento", details: error },
      { status: 500 }
    );
  }
}
