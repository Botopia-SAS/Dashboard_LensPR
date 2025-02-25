import { supabase } from "@/lib/supabaseClient";

export default async function Home() {
  const { data, error } = await supabase.from("clients").select("*");

  if (error) {
    console.error("Error conectando con Supabase:", error);
    return <p>Error al conectar con la base de datos</p>;
  }

  console.log("Clientes obtenidos:", data);
  return <p>Verifica la consola para ver los datos</p>;
}
