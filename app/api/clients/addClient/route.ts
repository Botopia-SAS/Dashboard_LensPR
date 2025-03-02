import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Datos recibidos en /api/clients/addClient:", body);

    const { Español, Inglés, Portugués, media_url } = body;

    const dataToInsert = {
      name_spanish: Español?.name ?? null,
      job_title_spanish: Español?.job_title ?? null,
      description_spanish: Español?.description ?? null,

      name_english: Inglés?.name ?? null,
      job_title_english: Inglés?.job_title ?? null,
      description_english: Inglés?.description ?? null,

      name_portuguese: Portugués?.name ?? null,
      job_title_portuguese: Portugués?.job_title ?? null,
      description_portuguese: Portugués?.description ?? null,

      media_url: media_url ?? null,
    };

    const { data, error } = await supabase
      .from("clients")
      .insert([dataToInsert]);

    if (error) {
      console.error("Error al insertar cliente:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log("Cliente agregado con éxito:", data);
    return NextResponse.json({ message: "Cliente agregado con éxito", data });
  } catch (error) {
    console.error("Error en /api/clients/addClient:", error);
    return NextResponse.json(
      { error: "Error al agregar cliente", details: error },
      { status: 500 }
    );
  }
}
