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

    const { error } = await supabase.from("events").delete().eq("id", id);
    if (error) {
      console.error("Error al eliminar evento:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Evento eliminado con éxito" });
  } catch (error) {
    console.error("Error en /api/events/deleteEvent:", error);
    return NextResponse.json(
      { error: "Error al eliminar evento", details: error },
      { status: 500 }
    );
  }
}
