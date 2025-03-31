"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import NewsForm from "@/components/forms/newsForms/NewsForm";
import NewsCard from "@/components/forms/newsForms/NewsCard"; // Ajusta la ruta si tu NewsCard está en el mismo folder
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

// 📌 Interfaz para representar cada noticia
interface NewsItem {
  id: string;
  title_spanish: string;
  title_english: string;
  title_portuguese: string;
  description_spanish: string;
  description_english: string;
  description_portuguese: string;
  editorial_spanish: string;
  editorial_english: string;
  editorial_portuguese: string;
  media_url: string;
  news_link: string;
  order_number: number; // ✅ Asegurar que cada noticia tiene un número de orden
}

export interface LanguageDataNews {
  title: string;
  description: string;
  editorial: string;
}

export interface FormDataNews {
  Español: LanguageDataNews;
  Inglés: LanguageDataNews;
  Portugués: LanguageDataNews;
  media_url: string; // la URL final de Cloudinary
}

interface NewsRecord {
  id: string;
  title_spanish: string | undefined;
  title_english: string | undefined;
  title_portuguese: string | undefined;
  description_spanish: string | undefined;
  description_english: string | undefined;
  description_portuguese: string | undefined;
  editorial_spanish: string | undefined;
  editorial_english: string | undefined;
  editorial_portuguese: string | undefined;
  media_url: string | undefined;
  news_link: string | undefined;
  // ...cualquier otro campo de "news"
}

export default function NewsPage() {
  const [newsList, setNewsList] = useState<NewsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRecord | null>(null);

  // 🔹 Obtener lista de noticias desde Supabase
  const fetchNews = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/news/getNews", { cache: "no-store" }); // ✅ Usa `no-store` para evitar cache
      if (!res.ok) throw new Error("Error al obtener noticias");
      const data = await res.json();

      // Ordenar por `order_number`
      setNewsList(
        data.sort((a: NewsItem, b: NewsItem) => a.order_number - b.order_number)
      );
    } catch (error) {
      console.error("Error fetchNews:", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filtrar noticias por título en español

  // 🔹 Manejo del Drag & Drop
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    // Reordenar noticias en el estado
    const updatedNews = [...newsList];
    const [movedItem] = updatedNews.splice(result.source.index, 1);
    updatedNews.splice(result.destination.index, 0, movedItem);

    // Asignar nuevo orden
    const reorderedNews = updatedNews.map((news, index) => ({
      ...news,
      order_number: index,
    }));

    setNewsList(reorderedNews); // Actualizar estado

    try {
      const response = await fetch("/api/news/updateNewsOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reorderedNews),
      });

      const result = await response.json();
      console.log("📨 Respuesta del servidor:", result);
    } catch (error) {
      console.error("❌ Error actualizando orden:", error);
    }
  };

  // Crear
  const handleCreate = () => {
    setEditingNews(null);
    setShowModal(true);
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Deseas eliminar esta noticia?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/news/deleteNews", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert(`Error al eliminar noticia: ${result.error}`);
        return;
      }
      alert("Noticia eliminada con éxito");
      fetchNews();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };
  type Language = "ES" | "EN" | "PT"; // Idiomas disponibles

  // Editar
  const handleEdit = (item: NewsRecord, lang: Language) => {
    console.log("Editando noticia en idioma:", lang);
    setEditingNews(item);
    setShowModal(true);
  };

  // Callback del formulario
  const handleFormSubmit = async (formData: FormDataNews, isEdit: boolean) => {
    try {
      if (!isEdit) {
        // Crear
        const response = await fetch("/api/news/addNews", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const result = await response.json();
          alert(`Error al crear noticia: ${result.error}`);
          return;
        }
        alert("Noticia creada con éxito");
      } else {
        // Editar
        if (!editingNews) return alert("No se encontró la noticia para editar");
        const id = editingNews.id;

        const response = await fetch("/api/news/updateNews", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id }),
        });
        if (!response.ok) {
          const result = await response.json();
          alert(`Error al editar noticia: ${result.error}`);
          return;
        }
        alert("Noticia actualizada con éxito");
      }

      setShowModal(false);
      setEditingNews(null);
      fetchNews();
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  // Mapeo de NewsRecord a FormDataNews
  const mapRecordToFormData = (record: NewsRecord) => {
    return {
      Español: {
        title: record.title_spanish || "",
        description: record.description_spanish || "",
        editorial: record.editorial_spanish || "",
      },
      Inglés: {
        title: record.title_english || "",
        description: record.description_english || "",
        editorial: record.editorial_english || "",
      },
      Portugués: {
        title: record.title_portuguese || "",
        description: record.description_portuguese || "",
        editorial: record.editorial_portuguese || "",
      },
      media_url: record.media_url || "",
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-arsenal mb-4 z-20">Gestión de Noticias</h1>

      <input
        type="text"
        placeholder="Buscar noticia (título en español)..."
        className="border p-2 mb-4 w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded-lg mb-4 flex items-center font-arsenal"
      >
        <span className="mr-2 text-xl font-arsenal">+</span> Agregar Noticia
      </button>

      {/* MODAL */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingNews(null);
        }}
      >
        <NewsForm
          initialData={
            editingNews ? mapRecordToFormData(editingNews) : undefined
          }
          onSubmit={handleFormSubmit}
        />
      </Modal>

      {/* 🔄 Mostrar Spinner mientras se cargan los datos */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center min-h-[200px]">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="3x"
            className="text-gray-500"
          />
          <p className="text-gray-500 mt-2 font-arsenal">Cargando datos...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="news-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {newsList.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <NewsCard
                          newsItem={item}
                          onDelete={handleDelete}
                          onEdit={(itemOrRecord, lang) =>
                            handleEdit(itemOrRecord, lang)
                          }
                        />
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
