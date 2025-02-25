import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const title = formData.get("title") as string;
    const description = formData.get("description") as string;
    const editorial = formData.get("editorial") as string;
    const file = formData.get("file") as Blob | null;

    if (!title || !description || !editorial) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Si se sube una imagen, la enviamos a Cloudinary
    if (file) {
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      const result: any = await new Promise((resolve, reject) => {
        cloudinary.uploader
          .upload_stream({ resource_type: "auto" }, (error, result) => {
            if (error) reject(error);
            else resolve(result);
          })
          .end(buffer);
      });

      if (!result.secure_url) {
        return NextResponse.json(
          { error: "Error subiendo imagen" },
          { status: 500 }
        );
      }

      imageUrl = result.secure_url;
    }

    // Insertar la noticia en Supabase
    const { data, error } = await supabase
      .from("news")
      .insert([{ title, description, editorial, image_url: imageUrl }])
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      message: "Noticia guardada con éxito",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
