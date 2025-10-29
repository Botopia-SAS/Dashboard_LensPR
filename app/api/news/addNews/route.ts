import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📌 Datos recibidos en /api/addNews:", body);

    const { Español, Inglés, Portugués, media_url, news_link, client_id } = body;
    const editorial_clean = Español?.editorial
      ? Español.editorial.replace(/\s+/g, "")
      : null;

    // 📌 Incrementar el `order_number` de todas las noticias existentes
    // para que la nueva noticia tome la posición 0 (al inicio)
    const { data: existingNews, error: fetchError } = await supabase
      .from("news")
      .select("id, order_number");

    if (fetchError) {
      console.error("❌ Error al obtener noticias existentes:", fetchError);
      return NextResponse.json(
        { error: "No se pudo obtener las noticias existentes." },
        { status: 500 }
      );
    }

    // 📌 Incrementar el order_number de cada noticia existente
    if (existingNews && existingNews.length > 0) {
      const updates = existingNews.map((news) => ({
        id: news.id,
        order_number: news.order_number + 1,
      }));

      // Actualizar en lote
      for (const update of updates) {
        await supabase
          .from("news")
          .update({ order_number: update.order_number })
          .eq("id", update.id);
      }
    }

    // 📌 La nueva noticia siempre tendrá order_number = 0 (primera posición)
    const order_number = 0;

    const dataToInsert = {
      title_spanish: Español?.title?.trim() ?? null,
      description_spanish: Español?.description?.trim() ?? null,
      editorial_spanish: editorial_clean,

      title_english: Inglés?.title?.trim() ?? null,
      description_english: Inglés?.description?.trim() ?? null,

      title_portuguese: Portugués?.title?.trim() ?? null,
      description_portuguese: Portugués?.description?.trim() ?? null,

      media_url: media_url?.trim() ?? null,
      news_link: news_link?.trim() ?? null, // ⬅ Enlace de la noticia
      client_id: client_id?.trim() || null, // ⬅ ID del cliente asociado

      order_number: order_number, // 📌 Asignar el nuevo `order_number`
    };

    console.log(
      "📌 Datos formateados para insertar en Supabase:",
      dataToInsert
    );

    // 📌 Insertar en Supabase con `order_number`
    const { data, error } = await supabase
      .from("news")
      .insert([dataToInsert])
      .select("id, order_number");

    if (error) {
      console.error("❌ Error al insertar noticia en Supabase:", error);
      return NextResponse.json(
        { error: "No se pudo agregar la noticia", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Noticia agregada con éxito:", data);
    return NextResponse.json({
      message: "Noticia agregada con éxito",
      newsId: data[0].id,
      order_number: data[0].order_number, // 📌 Retornar el `order_number`
    });
  } catch (error) {
    console.error("❌ Error en /api/addNews:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
