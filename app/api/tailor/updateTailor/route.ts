// app/api/tailor-made/updateTailorMade/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PATCH(req: Request) {
  try {
    // 1. Parsear el cuerpo de la solicitud
    const body = await req.json();
    const { id, Español, Inglés, Portugués, image, order } = body;

    // 2. Validar ID
    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del item Tailor-made" },
        { status: 400 }
      );
    }

    console.log(`📌 Actualizando item Tailor-made ID: ${id}`);

    // 3. Preparar datos para actualizar
    const dataToUpdate = {
      title_spanish: Español?.title?.trim() ?? null,
      subtitle_spanish: Español?.subtitle?.trim() ?? null,
      description_spanish: Español?.description?.trim() ?? null,

      title_english: Inglés?.title?.trim() ?? null,
      subtitle_english: Inglés?.subtitle?.trim() ?? null,
      description_english: Inglés?.description?.trim() ?? null,

      title_portuguese: Portugués?.title?.trim() ?? null,
      subtitle_portuguese: Portugués?.subtitle?.trim() ?? null,
      description_portuguese: Portugués?.description?.trim() ?? null,

      image: image?.trim() ?? null,
      order,
    };

    // 4. Actualizar order_number si viene en la solicitud
    if (order !== undefined) {
      dataToUpdate.order = order;
    }

    // 5. Ejecutar actualización en Supabase
    const { error } = await supabase
      .from("tailor_made")
      .update(dataToUpdate)
      .eq("id", id);

    if (error) {
      console.error("❌ Error al actualizar item:", error);
      return NextResponse.json(
        { error: "Error al actualizar item", details: error.message },
        { status: 500 }
      );
    }

    // 6. Reordenar si se cambió el order_number
    if (order !== undefined) {
      const { data: sortedItems, error: fetchError } = await supabase
        .from("tailor_made")
        .select("id, order")
        .order("order", { ascending: true });

      if (fetchError) {
        console.error("❌ Error al obtener items ordenados:", fetchError);
        return NextResponse.json(
          { error: "Error al reordenar items." },
          { status: 500 }
        );
      }

      // 7. Reasignar order_numbers secuenciales
      const updatedItems = sortedItems.map((item, index) => ({
        id: item.id,
        order: index,
      }));

      const { error: updateError } = await supabase
        .from("tailor_made")
        .upsert(updatedItems, { onConflict: "id" });

      if (updateError) {
        console.error("❌ Error al actualizar order:", updateError);
        return NextResponse.json(
          { error: "Error al reordenar items." },
          { status: 500 }
        );
      }

      console.log("✅ Items reordenados:", updatedItems);
    }

    return NextResponse.json({
      message: "Item Tailor-made actualizado con éxito",
    });
  } catch (error) {
    console.error("❌ Error en updateTailorMade:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
