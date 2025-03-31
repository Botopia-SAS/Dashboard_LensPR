// app/api/tailor-made/updateTailorMadeOrder/route.ts
import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function POST(req: Request) {
  try {
    // 1. Obtener la lista de items con sus nuevos órdenes
    const items = await req.json();
    console.log("📩 Datos recibidos en updateTailorMadeOrder:", items);

    // 2. Validar que hay datos
    if (!items || !Array.isArray(items)) {
      return NextResponse.json(
        { error: "Datos de orden inválidos" },
        { status: 400 }
      );
    }

    // 3. Preparar transacción de actualización
    const updatePromises = items.map((item) =>
      supabase
        .from("tailor_made")
        .update({ order: item.order })
        .eq("id", item.id)
    );

    // 4. Ejecutar todas las actualizaciones
    const results = await Promise.all(updatePromises);

    // 5. Verificar errores
    const hasErrors = results.some((result) => result.error);
    if (hasErrors) {
      const errors = results.map((r) => r.error).filter(Boolean);
      console.error("❌ Errores en Supabase:", errors);
      return NextResponse.json(
        { error: "Error al actualizar órdenes", details: errors },
        { status: 500 }
      );
    }

    console.log("✅ Orden de Tailor-made actualizado correctamente");
    return NextResponse.json(
      { message: "Orden actualizado correctamente" },
      { status: 200 }
    );
  } catch (err) {
    console.error("❌ Error en el servidor:", err);
    return NextResponse.json(
      {
        error: "Error interno del servidor",
        details: err instanceof Error ? err.message : String(err),
      },
      { status: 500 }
    );
  }
}
