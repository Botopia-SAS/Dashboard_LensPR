import { NextResponse } from "next/server";
import { supabase } from "@/lib/supabaseClient";

export async function GET() {
  try {
    console.log("🔍 Iniciando consulta de blogs...");

    const { data, error } = await supabase
      .from("blogs")
      .select("*")
      .order("order_number", { ascending: true });

    if (error) {
      console.error("❌ Error de Supabase:", error);
      throw error;
    }

    console.log("✅ Blogs obtenidos:", data?.length || 0);

    // Asegurar que order_number sea un número
    const processedData = data?.map(blog => ({
      ...blog,
      order_number: blog.order_number || 0,
      tags_spanish: blog.tags_spanish || [],
      tags_english: blog.tags_english || [],
      tags_portuguese: blog.tags_portuguese || []
    })) || [];

    return NextResponse.json(processedData);
  } catch (err) {
    console.error("❌ Error al obtener blogs:", err);
    return NextResponse.json(
      { error: "Error al obtener blogs", details: err instanceof Error ? err.message : String(err) },
      { status: 500 }
    );
  }
}
