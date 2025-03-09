"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import NewsForm from "@/components/forms/newsForms/NewsForm";
import NewsCard from "@/components/forms/newsForms/NewsCard"; // Ajusta la ruta si tu NewsCard está en el mismo folder
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";

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

  // Modal control
  const [showModal, setShowModal] = useState(false);
  const [editingNews, setEditingNews] = useState<NewsRecord | null>(null);

  // Obtener todas las noticias
  const fetchNews = async () => {
    setIsLoading(true); // ⬅ Activa el estado de carga antes de la petición

    try {
      const res = await fetch("/api/news/getNews");
      if (!res.ok) throw new Error("Error al obtener news");
      const data = await res.json();
      setNewsList(data);
    } catch (error) {
      console.error("Error fetchNews:", error);
    } finally {
      setIsLoading(false); // ⬅ Desactiva el estado de carga al finalizar
    }
  };

  useEffect(() => {
    fetchNews();
  }, []);

  // Filtrar noticias por título en español
  const filteredNews = newsList.filter((item) =>
    item.title_spanish?.toLowerCase().includes(searchTerm.toLowerCase())
  );

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

  // Editar
  const handleEdit = (item: NewsRecord) => {
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
            size="3x" // Aumentamos tamaño
            className="text-gray-500"
          />
          <p className="text-gray-500 mt-2 font-arsenal">Cargando datos...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3 z-10">
          {filteredNews.map((item) => (
            <NewsCard
              key={item.id}
              newsItem={item}
              onDelete={handleDelete}
              onEdit={(record: NewsRecord) => handleEdit(record)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
