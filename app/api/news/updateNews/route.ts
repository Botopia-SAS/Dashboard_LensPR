import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

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
      news_link,
      client_id,
      order_number,
    } = body;

    // 📌 Validación mínima
    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID de la noticia" },
        { status: 400 }
      );
    }

    const editorial_clean =
      Español?.editorial?.trim() ||
      Inglés?.editorial?.trim() ||
      Portugués?.editorial?.trim() ||
      null;

    // 📌 Mapeamos los datos para actualizar
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: Record<string, any> = {
      title_spanish: Español?.title?.trim() ?? null,
      description_spanish: Español?.description?.trim() ?? null,
      editorial_spanish: editorial_clean,

      title_english: Inglés?.title?.trim() ?? null,
      description_english: Inglés?.description?.trim() ?? null,

      title_portuguese: Portugués?.title?.trim() ?? null,
      description_portuguese: Portugués?.description?.trim() ?? null,

      media_url: media_url?.trim() ?? null,
      news_link: news_link?.trim() ?? null,
      client_id: client_id?.trim() || null, // ⬅ Agregamos el client_id
    };

    // 📌 Solo actualizar `order_number` si se envía en la solicitud
    if (order_number !== undefined) {
      dataToUpdate.order_number = order_number;
    }

    // 📌 Actualizar la noticia en Supabase
    const { error } = await supabase
      .from("news")
      .update(dataToUpdate)
      .eq("id", id);

    if (error) {
      console.error("❌ Error al actualizar la noticia:", error);
      return NextResponse.json(
        { error: "No se pudo actualizar la noticia", details: error.message },
        { status: 500 }
      );
    }

    // 📌 Si se actualizó el `order_number`, reorganizamos las noticias
    if (order_number !== undefined) {
      const { data: sortedNews, error: fetchError } = await supabase
        .from("news")
        .select("id, order_number")
        .order("order_number", { ascending: true });

      if (fetchError) {
        console.error("❌ Error al obtener noticias ordenadas:", fetchError);
        return NextResponse.json(
          { error: "Error al reordenar noticias." },
          { status: 500 }
        );
      }

      // 📌 Reasignar `order_number` para que sea secuencial
      const updatedNews = sortedNews.map((news, index) => ({
        id: news.id,
        order_number: index,
      }));

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

      console.log("✅ Noticias reordenadas correctamente:", updatedNews);
    }

    return NextResponse.json({
      message: "Noticia actualizada con éxito",
    });
  } catch (error) {
    console.error("❌ Error en /api/updateNews:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
