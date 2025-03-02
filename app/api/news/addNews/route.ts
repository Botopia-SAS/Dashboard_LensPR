import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Datos recibidos en /api/addNews:", body);

    const { Español, Inglés, Portugués, media_url } = body;

    const dataToInsert = {
      title_spanish: Español?.title ?? null,
      description_spanish: Español?.description ?? null,
      editorial_spanish: Español?.editorial ?? null,

      title_english: Inglés?.title ?? null,
      description_english: Inglés?.description ?? null,
      editorial_english: Inglés?.editorial ?? null,

      title_portuguese: Portugués?.title ?? null,
      description_portuguese: Portugués?.description ?? null,
      editorial_portuguese: Portugués?.editorial ?? null,

      media_url: media_url ?? null,
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
