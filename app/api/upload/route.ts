import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient"; // Importar Supabase
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as Blob | null;
    const name = formData.get("name") as string; // Obtener nombre del usuario (opcional)

    if (!file) {
      return NextResponse.json({ error: "No file uploaded" }, { status: 400 });
    }

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Subir la imagen a Cloudinary
    const result: any = await new Promise((resolve, reject) => {
      cloudinary.uploader
        .upload_stream({ resource_type: "auto" }, (error, result) => {
          if (error) reject(error);
          else resolve(result);
        })
        .end(buffer);
    });

    if (!result.secure_url) {
      return NextResponse.json({ error: "Upload failed" }, { status: 500 });
    }

    // Guardar la URL en Supabase
    const { error } = await supabase.from("clients").insert([
      {
        name: name || "Sin nombre",
        image_url: result.secure_url,
      },
    ]);

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      message: "Imagen subida y guardada con éxito",
      url: result.secure_url,
    });
  } catch (error) {
    return NextResponse.json({ error: "Upload failed" }, { status: 500 });
  }
}
