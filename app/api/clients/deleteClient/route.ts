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

    console.log(`📌 Eliminando cliente con ID: ${id}`);

    // 📌 Eliminar el cliente de la base de datos
    const { error: deleteError } = await supabase
      .from("clients")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("❌ Error al eliminar cliente:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 📌 Obtener la lista de clientes restantes ordenados por `order_number`
    const { data: remainingClients, error: fetchError } = await supabase
      .from("clients")
      .select("id, order_number")
      .order("order_number", { ascending: true });

    if (fetchError) {
      console.error("❌ Error al obtener clientes restantes:", fetchError);
      return NextResponse.json(
        { error: "Error al reordenar clientes." },
        { status: 500 }
      );
    }

    // 📌 Reasignar el `order_number` en los clientes restantes
    const updatedClients = remainingClients.map((client, index) => ({
      id: client.id,
      order_number: index, // ✅ Se asigna un nuevo orden secuencial
    }));

    // 📌 Actualizar los `order_number` en la base de datos
    const { error: updateError } = await supabase
      .from("clients")
      .upsert(updatedClients, { onConflict: "id" });

    if (updateError) {
      console.error("❌ Error al actualizar order_number:", updateError);
      return NextResponse.json(
        { error: "Error al reordenar los clientes." },
        { status: 500 }
      );
    }

    console.log("✅ Cliente eliminado y lista reordenada:", updatedClients);

    return NextResponse.json({
      message: "Cliente eliminado y orden actualizado.",
      updatedClients,
    });
  } catch (error) {
    console.error("❌ Error en /api/clients/deleteClient:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar cliente",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
