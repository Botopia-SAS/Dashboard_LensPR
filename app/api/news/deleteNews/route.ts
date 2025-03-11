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
        { error: "Falta el ID de la noticia" },
        { status: 400 }
      );
    }

    console.log(`📌 Eliminando noticia con ID: ${id}`);

    // 📌 Eliminar la noticia de la base de datos
    const { error: deleteError } = await supabase
      .from("news")
      .delete()
      .eq("id", id);

    if (deleteError) {
      console.error("❌ Error al eliminar noticia:", deleteError);
      return NextResponse.json({ error: deleteError.message }, { status: 500 });
    }

    // 📌 Obtener la lista de noticias restantes ordenadas por `order_number`
    const { data: remainingNews, error: fetchError } = await supabase
      .from("news")
      .select("id, order_number")
      .order("order_number", { ascending: true });

    if (fetchError) {
      console.error("❌ Error al obtener noticias restantes:", fetchError);
      return NextResponse.json(
        { error: "Error al reordenar noticias." },
        { status: 500 }
      );
    }

    // 📌 Reasignar el `order_number` en las noticias restantes
    const updatedNews = remainingNews.map((news, index) => ({
      id: news.id,
      order_number: index, // ✅ Se asigna un nuevo orden secuencial
    }));

    // 📌 Actualizar los `order_number` en la base de datos
    const { error: updateError } = await supabase
      .from("news")
      .upsert(updatedNews, { onConflict: "id" });

    if (updateError) {
      console.error("❌ Error al actualizar `order_number`:", updateError);
      return NextResponse.json(
        { error: "Error al reordenar las noticias." },
        { status: 500 }
      );
    }

    console.log("✅ Noticia eliminada y lista reordenada:", updatedNews);

    return NextResponse.json({
      message: "Noticia eliminada y orden actualizado.",
      updatedNews,
    });
  } catch (error) {
    console.error("❌ Error en /api/deleteNews:", error);
    return NextResponse.json(
      {
        error: "Error al eliminar la noticia",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
