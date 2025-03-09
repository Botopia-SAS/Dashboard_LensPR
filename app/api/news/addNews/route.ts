import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Datos recibidos en /api/addNews:", body);

    const { Español, Inglés, Portugués, media_url, news_link } = body;
    const editorial_clean = Español?.editorial
      ? Español.editorial.replace(/\s+/g, "")
      : null;

    const dataToInsert = {
      title_spanish: Español?.title ?? null,
      description_spanish: Español?.description ?? null,
      editorial_spanish: editorial_clean,

      title_english: Inglés?.title ?? null,
      description_english: Inglés?.description ?? null,

      title_portuguese: Portugués?.title ?? null,
      description_portuguese: Portugués?.description ?? null,

      media_url: media_url ?? null,
      news_link: news_link ?? null, // ⬅ Agregamos el nuevo campo de enlace
    };

    const { data, error } = await supabase.from("news").insert([dataToInsert]);

    if (error) {
      console.error("Error al insertar noticia:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Noticia agregada con éxito:", data);
    return NextResponse.json({ message: "Noticia agregada con éxito", data });
  } catch (error) {
    console.error("Error en /api/addNews:", error);
    return NextResponse.json(
      { error: "Error al agregar la noticia", details: error },
      { status: 500 }
    );
  }
}
