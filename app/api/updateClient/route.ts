import { supabase } from "@/lib/supabaseClient";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    // 1. Obtenemos la data del body
    const { id, Español, Inglés, Portugués, media_url } = await req.json();

    // 2. Mapeamos a las columnas de tu tabla "clients"
    const dataToUpdate = {
      name_spanish: Español?.name ?? null,
      country_spanish: Español?.country ?? null,
      job_title_spanish: Español?.job_title ?? null,
      description_spanish: Español?.description ?? null,
      name_english: Inglés?.name ?? null,
      country_english: Inglés?.country ?? null,
      job_title_english: Inglés?.job_title ?? null,
      description_english: Inglés?.description ?? null,
      name_portuguese: Portugués?.name ?? null,
      country_portuguese: Portugués?.country ?? null,
      job_title_portuguese: Portugués?.job_title ?? null,
      description_portuguese: Portugués?.description ?? null,
      media_url: media_url ?? null,
    };

    // 3. Hacemos el update usando la columna "id"
    const { data, error } = await supabase
      .from("clients")
      .update(dataToUpdate)
      .eq("id", id);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Cliente actualizado",
      data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error al actualizar cliente" },
      { status: 500 }
    );
  }
}
