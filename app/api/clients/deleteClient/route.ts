import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function DELETE(req: Request) {
  try {
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del cliente" },
        { status: 400 }
      );
    }

    const { error } = await supabase.from("clients").delete().eq("id", id);

    if (error) {
      console.error("Error al eliminar cliente:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ message: "Cliente eliminado con éxito" });
  } catch (error) {
    console.error("Error en /api/clients/deleteClient:", error);
    return NextResponse.json(
      { error: "Error al eliminar cliente", details: error },
      { status: 500 }
    );
  }
}
