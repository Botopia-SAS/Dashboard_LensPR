import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    const formData = await req.formData();
    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const country = formData.get("country") as string;
    const job_title = formData.get("job_title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as Blob | null;

    if (!name || !email || !country || !job_title || !description) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const { data: existingClient } = await supabase
      .from("clients")
      .select("id")
      .eq("email", email)
      .single();

    if (existingClient) {
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
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

    // Insertar el cliente con la imagen en Supabase
    const { data, error } = await supabase
      .from("clients")
      .insert([
        { name, email, country, job_title, description, image_url: imageUrl },
      ])
      .select("id")
      .single();

    if (error) throw error;

    return NextResponse.json({
      id: data.id,
      message: "Cliente guardado con éxito",
    });
  } catch (error) {
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
