import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Configura tu conexión con Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("📌 Datos recibidos en la API:", body);

    const { Español, Inglés, Portugués, media_url } = body; // ✅ Agregar media_url

    // Mapeo de datos para insertarlos en la base de datos
    const dataToInsert = {
      name_spanish: Español?.name || null,
      name_english: Inglés?.name || null,
      name_portuguese: Portugués?.name || null,
      country_spanish: Español?.country || null,
      country_english: Inglés?.country || null,
      country_portuguese: Portugués?.country || null,
      job_title_spanish: Español?.job_title || null,
      job_title_english: Inglés?.job_title || null,
      job_title_portuguese: Portugués?.job_title || null,
      description_spanish: Español?.description || null,
      description_english: Inglés?.description || null,
      description_portuguese: Portugués?.description || null,
      media_url: media_url || null, // ✅ Guardar el link de la imagen o video
    };

    console.log("📌 Datos a insertar en Supabase:", dataToInsert);

    const { data, error } = await supabase
      .from("clients")
      .insert([dataToInsert]);

    if (error) {
      console.error("❌ Error al insertar en Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("✅ Cliente agregado con éxito:", data);
    return NextResponse.json({ message: "Cliente agregado con éxito", data });
  } catch (error) {
    console.error("❌ Error en la API:", error);
    return NextResponse.json(
      { error: "Error al agregar cliente", details: error },
      { status: 500 }
    );
  }
}
