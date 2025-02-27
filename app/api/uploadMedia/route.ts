import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

// Configurar Supabase
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;

    if (!file) {
      return NextResponse.json(
        { error: "No se recibió ningún archivo" },
        { status: 400 }
      );
    }

    // Crear un nombre único para el archivo
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(7)}`;

    // Subir el archivo a Supabase Storage
    const { data, error } = await supabase.storage
      .from("clients-media")
      .upload(fileName, file);

    if (error) {
      console.error("❌ Error al subir archivo a Supabase:", error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    // Obtener la URL pública del archivo
    const publicUrl = `${supabaseUrl}/storage/v1/object/public/clients-media/${fileName}`;

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("❌ Error en la API de subida:", error);
    return NextResponse.json(
      { error: "Error al subir archivo" },
      { status: 500 }
    );
  }
}
