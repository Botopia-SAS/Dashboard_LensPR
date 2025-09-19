import { NextResponse } from "next/server";
import { createClient } from "@supabase/supabase-js";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
const supabase = createClient(supabaseUrl, supabaseAnonKey);

export async function PATCH(req: Request) {
  try {
    const body = await req.json();
  const { id, Español, Inglés, Portugués, slug, cover_image_url, og_image_url, canonical_url, published, order_number, client_id, social_links } = body;

    if (!id) return NextResponse.json({ error: 'Falta id' }, { status: 400 });

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const dataToUpdate: Record<string, any> = {
      slug: slug?.trim(),
      // ES
      title_spanish: Español?.title?.trim(),
      excerpt_spanish: Español?.excerpt?.trim(),
      content_spanish: Español?.content,
      meta_title_spanish: Español?.metaTitle?.trim() || null,
      meta_description_spanish: Español?.metaDescription?.trim() || null,
      category_spanish: Español?.category?.trim() || null,
      tags_spanish: Array.isArray(Español?.tags) && Español.tags.length ? Español.tags : null,
      // EN
      title_english: Inglés?.title?.trim() || null,
      excerpt_english: Inglés?.excerpt?.trim() || null,
      content_english: Inglés?.content || null,
      meta_title_english: Inglés?.metaTitle?.trim() || null,
      meta_description_english: Inglés?.metaDescription?.trim() || null,
      category_english: Inglés?.category?.trim() || null,
      tags_english: Array.isArray(Inglés?.tags) && Inglés.tags.length ? Inglés.tags : null,
      // PT
      title_portuguese: Portugués?.title?.trim() || null,
      excerpt_portuguese: Portugués?.excerpt?.trim() || null,
      content_portuguese: Portugués?.content || null,
      meta_title_portuguese: Portugués?.metaTitle?.trim() || null,
      meta_description_portuguese: Portugués?.metaDescription?.trim() || null,
      category_portuguese: Portugués?.category?.trim() || null,
      tags_portuguese: Array.isArray(Portugués?.tags) && Portugués.tags.length ? Portugués.tags : null,
      // Generales
      cover_image_url: cover_image_url?.trim() || null,
      og_image_url: og_image_url?.trim() || null,
      canonical_url: canonical_url?.trim() || null,
      published: typeof published === 'boolean' ? published : undefined,
      order_number: typeof order_number === 'number' ? order_number : undefined,
      client_id: client_id || null,
      social_links: social_links ? social_links : undefined
    };

    const { error } = await supabase
      .from('blogs')
      .update(dataToUpdate)
      .eq('id', id);

    if (error) return NextResponse.json({ error: error.message }, { status: 500 });

    return NextResponse.json({ success: true });
  } catch (e: unknown) {
    const errorMessage = e instanceof Error ? e.message : 'Error desconocido';
    return NextResponse.json({ error: errorMessage }, { status: 500 });
  }
}
