import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, Español, Inglés, Portugués, media_url } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del cliente" },
        { status: 400 }
      );
    }

    const dataToUpdate = {
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
      .update(dataToUpdate)
      .eq("id", id);

    if (error) {
      console.error("Error al actualizar el cliente:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Cliente actualizado con éxito",
      data,
    });
  } catch (error) {
    console.error("Error en /api/clients/updateClient:", error);
    return NextResponse.json(
      { error: "Error al actualizar cliente", details: error },
      { status: 500 }
    );
  }
}
