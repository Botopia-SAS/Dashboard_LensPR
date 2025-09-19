"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import BlogForm from "@/components/forms/blogForms/BlogForm";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner, faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import { BlogRecord, FormDataBlog } from "@/types/blogs";

// Tarjeta simple para listado de blogs (puedes mejorarla o moverla a components/forms/blogForms/BlogCard.tsx)
function BlogCard({ blog, onDelete }:{ blog: BlogRecord; onDelete:(id:string)=>void; }){
  return (
    <div className="relative border rounded-lg shadow p-4 mb-6 bg-white">
      <div className="absolute top-2 right-2 flex space-x-3">
        <button
          onClick={() => onDelete(blog.id)}
          className="text-black hover:text-red-700"
          aria-label="Eliminar"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <Link
          href={`/Dashboard_desktopView/blogs/${blog.id}/edit`}
          className="text-black hover:text-blue-700"
          aria-label="Editar"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </Link>
      </div>
      <h3 className="text-xl font-arsenal pr-12">{blog.title_spanish}</h3>
      <p className="text-gray-600 text-sm break-all">/{blog.slug}</p>
      <p className="text-gray-700 mt-2 line-clamp-2">{blog.excerpt_spanish}</p>
      <div className="mt-2 text-xs text-gray-500">{blog.published ? 'Publicado' : 'Borrador'} • Orden: {blog.order_number}</div>
    </div>
  );
}

export default function BlogsPage(){
  const [blogs, setBlogs] = useState<BlogRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [editing, setEditing] = useState<BlogRecord | null>(null);
  const [search, setSearch] = useState("");

  const fetchBlogs = async () => {
    setIsLoading(true);
    try{
      const res = await fetch("/api/blogs/getBlogs", { cache: "no-store" });
      if(!res.ok) throw new Error("Error al obtener blogs");
      const data: BlogRecord[] = await res.json();
      setBlogs(data.sort((a,b)=>a.order_number - b.order_number));
    }catch(e){
      console.error(e);
    }finally{ setIsLoading(false); }
  };

  useEffect(()=>{ fetchBlogs(); },[]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = async (result:any) => {
    if (!result.destination) return;
    const updated = [...blogs];
    const [moved] = updated.splice(result.source.index, 1);
    updated.splice(result.destination.index, 0, moved);
    const reordered = updated.map((b, i) => ({ ...b, order_number: i }));
    setBlogs(reordered);
    try{
      const response = await fetch("/api/blogs/updateBlogOrder",{
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify(reordered)
      });
      await response.json();
    }catch(err){ console.error("Error actualizando orden", err); }
  };


  const handleDelete = async (id:string) => {
    if(!confirm("¿Eliminar este blog?")) return;
    try{
      const res = await fetch("/api/blogs/deleteBlog",{
        method:"DELETE",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ id })
      });
      if(!res.ok){ const r = await res.json(); alert(`Error: ${r.error}`); return; }
      fetchBlogs();
    }catch(e){ console.error(e); }
  };

  const mapRecordToForm = (rec: BlogRecord): FormDataBlog => ({
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
    client_id: rec.client_id || ''
  });

  const handleFormSubmit = async (data: FormDataBlog, isEdit: boolean) => {
    try{
      const url = isEdit ? "/api/blogs/updateBlog" : "/api/blogs/addBlog";
      const method = isEdit ? "PATCH" : "POST";
      const payload = isEdit && editing ? { ...data, id: editing.id } : data;
      const res = await fetch(url, { method, headers:{"Content-Type":"application/json"}, body: JSON.stringify(payload) });
      if(!res.ok){ const r = await res.json(); alert(`Error: ${r.error}`); return; }
      setShowModal(false); setEditing(null); fetchBlogs();
    }catch(e){ console.error(e); }
  };

  const filtered = blogs.filter(b => (b.title_spanish || '').toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="p-6">
      <h1 className="text-3xl font-arsenal mb-4">Gestión de Blogs</h1>

      <div className="flex gap-3 items-center mb-4">
        <input value={search} onChange={e=>setSearch(e.target.value)} placeholder="Buscar por título (ES)" className="border p-2 w-full max-w-sm" />
  <Link href="/Dashboard_desktopView/blogs/create" className="bg-black text-white px-4 py-2 rounded-lg font-arsenal flex items-center"><span className="mr-2 text-xl">+</span>Agregar Blog</Link>
      </div>

      <Modal isOpen={showModal} onClose={()=>{ setShowModal(false); setEditing(null); }}>
        <BlogForm initialData={editing ? mapRecordToForm(editing) : undefined} onSubmit={handleFormSubmit} />
      </Modal>

      {isLoading ? (
        <div className="flex flex-col justify-center items-center min-h-[200px]">
          <FontAwesomeIcon icon={faSpinner} spin size="3x" className="text-gray-500" />
          <p className="text-gray-500 mt-2 font-arsenal">Cargando datos...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="blogs-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {filtered.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div ref={provided.innerRef} {...provided.draggableProps} {...provided.dragHandleProps}>
                        <BlogCard blog={item} onDelete={handleDelete} />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
