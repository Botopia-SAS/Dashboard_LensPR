import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, Español, Inglés, Portugués, media_url, news_link } = body;

    // Validación mínima
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
    // Mapeamos a las columnas de tu tabla "news"
    const dataToUpdate = {
      title_spanish: Español?.title ?? null,
      description_spanish: Español?.description ?? null,
      editorial_spanish: editorial_clean,

      title_english: Inglés?.title ?? null,
      description_english: Inglés?.description ?? null,

      title_portuguese: Portugués?.title ?? null,
      description_portuguese: Portugués?.description ?? null,

      media_url: media_url ?? null,
      news_link: news_link ?? null, // ⬅ Se agrega el campo de enlace
    };

    const { data, error } = await supabase
      .from("news")
      .update(dataToUpdate)
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar la noticia:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Noticia actualizada con éxito",
      data,
    });
  } catch (error) {
    console.error("Error en /api/updateNews:", error);
    return NextResponse.json(
      { error: "Error al actualizar la noticia", details: error },
      { status: 500 }
    );
  }
}
