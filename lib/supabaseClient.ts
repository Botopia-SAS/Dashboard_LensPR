import { createClient } from "@supabase/supabase-js";

// Importar las variables de entorno
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;

// Crear la conexión con Supabase
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
