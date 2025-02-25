import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";
import cloudinary from "@/lib/cloudinary";

export async function POST(req: Request) {
  try {
    console.log("📌 Recibiendo solicitud...");
    const formData = await req.formData();

    const name = formData.get("name") as string;
    const email = formData.get("email") as string;
    const country = formData.get("country") as string;
    const job_title = formData.get("job_title") as string;
    const description = formData.get("description") as string;
    const file = formData.get("file") as Blob | null;

    console.log("📌 Datos recibidos:", {
      name,
      email,
      country,
      job_title,
      description,
    });

    if (!name || !email || !country || !job_title || !description) {
      console.error("⚠️ Faltan datos obligatorios");
      return NextResponse.json(
        { error: "Faltan datos obligatorios" },
        { status: 400 }
      );
    }

    // Verificar si el email ya existe
    const { data: existingClient, error: emailError } = await supabase
      .from("clients")
      .select("id")
      .eq("email", email)
      .single();

    if (emailError) {
      console.error(
        "⚠️ Error verificando email en Supabase:",
        emailError.message
      );
    }

    if (existingClient) {
      console.error("⚠️ El correo ya está registrado:", email);
      return NextResponse.json(
        { error: "El correo electrónico ya está registrado" },
        { status: 400 }
      );
    }

    let imageUrl = null;

    // Si se sube una imagen, la enviamos a Cloudinary
    if (file) {
      console.log("📌 Subiendo imagen a Cloudinary...");
      const arrayBuffer = await file.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);

      try {
        const result: any = await new Promise((resolve, reject) => {
          cloudinary.uploader
            .upload_stream({ resource_type: "auto" }, (error, result) => {
              if (error) reject(error);
              else resolve(result);
            })
            .end(buffer);
        });

        if (!result.secure_url) {
          console.error("⚠️ Error subiendo imagen a Cloudinary");
          return NextResponse.json(
            { error: "Error subiendo imagen" },
            { status: 500 }
          );
        }

        imageUrl = result.secure_url;
        console.log("✅ Imagen subida con éxito:", imageUrl);
      } catch (uploadError) {
        console.error("⚠️ Error en Cloudinary:", uploadError);
        return NextResponse.json(
          { error: "Error al subir imagen" },
          { status: 500 }
        );
      }
    }

    // Insertar el cliente con la imagen en Supabase
    console.log("📌 Insertando en Supabase...");
    const { data, error } = await supabase
      .from("clients")
      .insert([
        { name, email, country, job_title, description, image_url: imageUrl },
      ])
      .select("id")
      .single();

    if (error) {
      console.error("⚠️ Error insertando en Supabase:", error.message);
      throw error;
    }

    console.log("✅ Cliente guardado con éxito:", data.id);
    return NextResponse.json({
      id: data.id,
      message: "Cliente guardado con éxito",
    });
  } catch (error) {
    console.error("⚠️ Error general en el servidor:", error);
    return NextResponse.json(
      { error: "Error en el servidor" },
      { status: 500 }
    );
  }
}
