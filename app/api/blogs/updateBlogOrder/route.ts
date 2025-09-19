import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

interface BlogOrderUpdate {
  id: string;
  order_number: number;
}

export async function POST(req: Request) {
  try {
    const blogs: BlogOrderUpdate[] = await req.json();

    for (const b of blogs) {
      const { error } = await supabase
        .from('blogs')
        .update({ order_number: b.order_number })
        .eq('id', b.id);
      if (error) return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
