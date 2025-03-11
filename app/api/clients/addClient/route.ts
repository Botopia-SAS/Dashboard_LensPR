import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    // 📌 Parsear el cuerpo de la solicitud
    const body = await req.json();
    console.log("📌 Datos recibidos en /api/clients/addClient:", body);

    // 📌 Verificar que el body contiene los datos esperados
    if (!body.Español || !body.Inglés || !body.Portugués) {
      return NextResponse.json(
        { error: "Faltan datos obligatorios en la solicitud." },
        { status: 400 }
      );
    }

    // 📌 Extraer datos con validación
    const { Español, Inglés, Portugués, media_url } = body;

    // 📌 Obtener la cantidad actual de clientes para asignar `order_number`
    const { count, error: countError } = await supabase
      .from("clients")
      .select("*", { count: "exact", head: true });

    if (countError) {
      console.error("❌ Error al contar clientes:", countError);
      return NextResponse.json(
        { error: "No se pudo calcular el orden del cliente." },
        { status: 500 }
      );
    }

    // 📌 Asignar un número de orden basado en la cantidad actual de clientes
    const order_number = count ?? 0; // Si no hay clientes, empieza en 0

    const dataToInsert = {
      name_spanish: Español?.name?.trim() || null,
      job_title_spanish: Español?.job_title?.trim() || null,
      description_spanish: Español?.description?.trim() || null,

      name_english: Inglés?.name?.trim() || null,
      job_title_english: Inglés?.job_title?.trim() || null,
      description_english: Inglés?.description?.trim() || null,

      name_portuguese: Portugués?.name?.trim() || null,
      job_title_portuguese: Portugués?.job_title?.trim() || null,
      description_portuguese: Portugués?.description?.trim() || null,

      media_url: media_url?.trim() || null,
      order_number: order_number, // 📌 Se asigna el nuevo order_number
    };

    console.log(
      "📌 Datos formateados para insertar en Supabase:",
      dataToInsert
    );

    // 📌 Insertar en Supabase
    const { data, error } = await supabase
      .from("clients")
      .insert([dataToInsert])
      .select("id, order_number");

    if (error) {
      console.error("❌ Error al insertar cliente en Supabase:", error);
      return NextResponse.json(
        { error: "No se pudo agregar el cliente", details: error.message },
        { status: 500 }
      );
    }

    console.log("✅ Cliente agregado con éxito:", data);
    return NextResponse.json({
      message: "Cliente agregado con éxito",
      clientId: data[0].id,
      order_number: data[0].order_number, // 📌 Retornar el order_number asignado
    });
  } catch (error) {
    console.error("❌ Error en /api/clients/addClient:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
