import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📌 Datos recibidos en /api/addNews:", body);

    const { Español, Inglés, Portugués, media_url, news_link } = body;
    const editorial_clean = Español?.editorial
      ? Español.editorial.replace(/\s+/g, "")
      : null;

    // 📌 Obtener la cantidad actual de noticias para calcular el `order_number`
    const { count, error: countError } = await supabase
      .from("news")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error al contar noticias:", countError);
      return NextResponse.json(
        { error: "No se pudo calcular el orden de la noticia." },
        { status: 500 }
      );
    }

    // 📌 Asignar un `order_number` secuencial basado en la cantidad de noticias existentes
    const order_number = count ?? 0; // Si no hay noticias, empieza en 0

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
