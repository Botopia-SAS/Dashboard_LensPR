"use client";
import { useRouter } from "next/navigation";
import BlogForm from "@/components/forms/blogForms/BlogForm";
import type { FormDataBlog } from "@/types/blogs";

export default function CreateBlogPage(){
  const router = useRouter();

  const handleSubmit = async (data: FormDataBlog) => {
    try{
      const res = await fetch("/api/blogs/addBlog",{ method:"POST", headers:{"Content-Type":"application/json"}, body: JSON.stringify(data) });
      if(!res.ok){ const r = await res.json(); alert(`Error: ${r.error}`); return; }
      alert("Blog creado con éxito");
      router.push("/Dashboard_desktopView/blogs");
    }catch(e){ console.error(e); }
  };

  return (
    <div className="min-h-screen w-full flex flex-col">
      <header className="px-4 sm:px-6 py-4 border-b bg-white sticky top-0 z-10">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <h1 className="text-2xl font-arsenal">Crear Blog</h1>
          <button onClick={()=>router.push('/Dashboard_desktopView/blogs')} className="px-4 py-2 border rounded-lg">Volver</button>
        </div>
      </header>
      <main className="px-4 sm:px-6 py-6">
        <div className="max-w-5xl mx-auto">
          <div className="bg-white border rounded-xl shadow-sm p-4 sm:p-6">
            <BlogForm onSubmit={(data)=>handleSubmit(data)} />
          </div>
        </div>
      </main>
    </div>
  );
}
