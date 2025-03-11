import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
    const { id, Español, Inglés, Portugués, media_url, order_number } = body;

    if (!id) {
      return NextResponse.json(
        { error: "Falta el ID del cliente" },
        { status: 400 }
      );
    }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: Record<string, any> = {
      name_spanish: Español?.name?.trim() ?? null,
      job_title_spanish: Español?.job_title?.trim() ?? null,
      description_spanish: Español?.description?.trim() ?? null,

      name_english: Inglés?.name?.trim() ?? null,
      job_title_english: Inglés?.job_title?.trim() ?? null,
      description_english: Inglés?.description?.trim() ?? null,

      name_portuguese: Portugués?.name?.trim() ?? null,
      job_title_portuguese: Portugués?.job_title?.trim() ?? null,
      description_portuguese: Portugués?.description?.trim() ?? null,

      media_url: media_url?.trim() ?? null,
    };

    // 📌 Solo actualizar `order_number` si se envía en la solicitud
    if (order_number !== undefined) {
      dataToUpdate.order_number = order_number;
    }

    // 📌 Actualizar el cliente en Supabase
    const { error } = await supabase
      .from("clients")
      .update(dataToUpdate)
      .eq("id", id);

    if (error) {
      console.error("❌ Error al actualizar el cliente:", error);
      return NextResponse.json(
        { error: "No se pudo actualizar el cliente", details: error.message },
        { status: 500 }
      );
    }

    // 📌 Si se actualizó el `order_number`, reorganizamos los clientes
    if (order_number !== undefined) {
      const { data: sortedClients, error: fetchError } = await supabase
        .from("clients")
        .select("id, order_number")
        .order("order_number", { ascending: true });

      if (fetchError) {
        console.error("❌ Error al obtener clientes ordenados:", fetchError);
        return NextResponse.json(
          { error: "Error al reordenar clientes." },
          { status: 500 }
        );
      }

      // 📌 Reasignar `order_number` para que sea secuencial
      const updatedClients = sortedClients.map((client, index) => ({
        id: client.id,
        order_number: index,
      }));

      const { error: updateError } = await supabase
        .from("clients")
        .upsert(updatedClients, { onConflict: "id" });

      if (updateError) {
        console.error("❌ Error al actualizar `order_number`:", updateError);
        return NextResponse.json(
          { error: "Error al reordenar los clientes." },
          { status: 500 }
        );
      }

      console.log("✅ Clientes reordenados correctamente:", updatedClients);
    }

    return NextResponse.json({
      message: "Cliente actualizado con éxito",
    });
  } catch (error) {
    console.error("❌ Error en /api/clients/updateClient:", error);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: error instanceof Error ? error.message : error,
      },
      { status: 500 }
    );
  }
}
