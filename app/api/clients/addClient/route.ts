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

    // 📌 Incrementar el order_number de todos los clientes existentes
    const { data: allClients, error: fetchError } = await supabase
      .from("clients")
      .select("id, order_number")
      .order("order_number", { ascending: true });

    if (fetchError) {
      console.error("❌ Error al obtener clientes:", fetchError);
      return NextResponse.json(
        { error: "No se pudo obtener la lista de clientes." },
        { status: 500 }
      );
    }

    // 📌 Incrementar el order_number de cada cliente existente
    if (allClients && allClients.length > 0) {
      const updates = allClients.map((client) => ({
        id: client.id,
        order_number: client.order_number + 1,
      }));

      for (const update of updates) {
        const { error: updateError } = await supabase
          .from("clients")
          .update({ order_number: update.order_number })
          .eq("id", update.id);

        if (updateError) {
          console.error("❌ Error al actualizar order_number:", updateError);
        }
      }
    }

    // 📌 Asignar order_number = 0 al nuevo cliente (aparecerá primero)
    const order_number = 0;

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
