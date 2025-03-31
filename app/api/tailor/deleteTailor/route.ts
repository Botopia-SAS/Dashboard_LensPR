// app/api/tailor-made/deleteTailorMade/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function DELETE(req: Request) {
  try {
    // 1. Obtener el ID del item a eliminar
    const { id } = await req.json();

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del item Tailor-made" },
        { status: 400 }
      );
    }

    console.log(`📌 Eliminando item Tailor-made con ID: ${id}`);

    // 2. Eliminar el item de la base de datos
    const { error: deleteError } = await supabase
      .from("tailor_made") // Nombre de tu tabla en Supabase
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("❌ Error al eliminar item:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 3. Obtener los items restantes ordenados
    const { data: remainingItems, error: fetchError } = await supabase
      .from("tailor_made")
      .select("id, order")
      .order("order", { ascending: true });

    if (fetchError) {
      console.error("❌ Error al obtener items restantes:", fetchError);
      return NextResponse.json(
        { error: "Error al reordenar items." },
        { status: 500 }
      );
    }

    // 4. Reasignar order_number secuencial
    const updatedItems = remainingItems.map((item, index) => ({
      id: item.id,
      order: index, // Nuevo orden secuencial
    }));

    // 5. Actualizar los order_numbers en la base de datos
    const { error: updateError } = await supabase
      .from("tailor_made")
      .upsert(updatedItems, { onConflict: "id" });

    if (updateError) {
      console.error("❌ Error al actualizar order:", updateError);
      return NextResponse.json(
        { error: "Error al reordenar los items." },
        { status: 500 }
      );
    }

    console.log("✅ Item eliminado y lista reordenada:", updatedItems);

    return NextResponse.json({
      message: "Item Tailor-made eliminado y orden actualizado.",
      updatedItems,
    });
  } catch (error) {
    console.error("❌ Error en deleteTailorMade:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
