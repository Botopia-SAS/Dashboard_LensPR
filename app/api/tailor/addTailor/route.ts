import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";
import { TailorMadeItem } from "@/types/tailor";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const body = await req.json();
    console.log("Datos recibidos:", body);

    // Validación básica
    if (!body.Español || !body.Inglés || !body.Portugués) {
      return NextResponse.json(
        { error: "Faltan datos de idiomas en la solicitud" },
        { status: 400 }
      );
    }

    const { Español, Inglés, Portugués, image } = body;

    // Validación de campos requeridos
    if (!Español.title || !image) {
      return NextResponse.json(
        { error: "Título en español e imagen son requeridos" },
        { status: 400 }
      );
    }

    // Obtener el próximo order_number
    const { count, error: countError } = await supabase
      .from("tailor_made")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("Error al contar items:", countError);
      throw countError;
    }

    const dataToInsert: Omit<TailorMadeItem, "id"> = {
      title_spanish: Español.title.trim(),
      subtitle_spanish: Español.subtitle?.trim() || null,
      description_spanish: Español.description?.trim() || null,
      title_english: Inglés.title?.trim() || null,
      subtitle_english: Inglés.subtitle?.trim() || null,
      description_english: Inglés.description?.trim() || null,
      title_portuguese: Portugués.title?.trim() || null,
      subtitle_portuguese: Portugués.subtitle?.trim() || null,
      description_portuguese: Portugués.description?.trim() || null,
      image: image.trim(),
      order: count ?? 0,
    };

    console.log("Insertando datos:", dataToInsert);

    const { data, error } = await supabase
      .from("tailor_made")
      .insert([dataToInsert])
      .select();

    if (error) {
      console.error("Error de Supabase:", error);
      return NextResponse.json(
        {
          error: "Error al insertar en la base de datos",
          details: error.message,
          hint: error.details,
        },
        { status: 500 }
      );
    }

    return NextResponse.json({
      message: "Item creado con éxito",
      item: data[0] as TailorMadeItem,
    });
  } catch (error) {
    console.error("Error en addTailor:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : "Error desconocido",
      },
      { status: 500 }
    );
  }
}
