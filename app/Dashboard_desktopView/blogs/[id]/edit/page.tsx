"use client";
import { useParams, useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import BlogForm from "@/components/forms/blogForms/BlogForm";
import { BlogRecord, FormDataBlog } from "@/types/blogs";

function mapRecordToForm(rec: BlogRecord): FormDataBlog {
  return {
    Español: { 
      title: rec.title_spanish, 
      excerpt: rec.excerpt_spanish, 
      content: rec.content_spanish, 
      metaTitle: rec.meta_title_spanish || '', 
      metaDescription: rec.meta_description_spanish || '',
      category: rec.category_spanish || '',
      tags: rec.tags_spanish || []
    },
    Inglés: { 
      title: rec.title_english || '', 
      excerpt: rec.excerpt_english || '', 
      content: rec.content_english || '', 
      metaTitle: rec.meta_title_english || '', 
      metaDescription: rec.meta_description_english || '',
      category: rec.category_english || '',
      tags: rec.tags_english || []
    },
    Portugués: { 
      title: rec.title_portuguese || '', 
      excerpt: rec.excerpt_portuguese || '', 
      content: rec.content_portuguese || '', 
      metaTitle: rec.meta_title_portuguese || '', 
      metaDescription: rec.meta_description_portuguese || '',
      category: rec.category_portuguese || '',
      tags: rec.tags_portuguese || []
    },
    slug: rec.slug,
    cover_image_url: rec.cover_image_url || '',
    og_image_url: rec.og_image_url || '',
    canonical_url: rec.canonical_url || '',
    published: rec.published,
    order_number: rec.order_number,
    client_id: rec.client_id || '',
    social_links: rec.social_links || {}
  };
}

export default function EditBlogPage(){
  const params = useParams();
  const id = params?.id as string;
  const router = useRouter();
  const [initial, setInitial] = useState<FormDataBlog | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(()=>{
    const load = async () => {
      try{
        const res = await fetch(`/api/blogs/getBlogs`);
        const data: BlogRecord[] = await res.json();
        const found = data.find(b => b.id === id);
        if (found) setInitial(mapRecordToForm(found));
      } finally { setLoading(false); }
    };
    load();
  },[id]);

  const handleSubmit = async (data: FormDataBlog) => {
    try{
  const res = await fetch('/api/blogs/updateBlog', { method:'PATCH', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ ...data, id }) });
      if(!res.ok){ const r = await res.json(); alert(`Error: ${r.error}`); return; }
      alert('Blog actualizado');
      router.push('/Dashboard_desktopView/blogs');
    }catch(e){ console.error(e); }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="px-4 sm:px-6 py-4 border-b bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-arsenal">Editar Blog</h1>
          <button onClick={()=>router.push('/Dashboard_desktopView/blogs')} className="px-4 py-2 border rounded-lg">Volver</button>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            {loading ? <p>Cargando…</p> : initial ? (
              <BlogForm initialData={initial} onSubmit={handleSubmit} />
            ) : <p>No encontrado</p>}
          </div>
        </div>
      </main>
    </div>
  );
}
