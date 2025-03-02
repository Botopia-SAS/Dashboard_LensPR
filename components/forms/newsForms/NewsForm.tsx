"use client";
import React, { useState, useEffect } from "react";
import { FormDataNews, LanguageDataNews } from "../../../types/news";
import FileUpload from "../../ui/FileUpload";

// Traductor opcional
function chunkString(str: string, size: number) {
  const chunks = [];
  let i = 0;
  while (i < str.length) {
    chunks.push(str.slice(i, i + size));
    i += size;
  }
  return chunks;
}

async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
) {
  try {
    const chunks = chunkString(text, 500); // Divide el texto en fragmentos de 500 caracteres
    let result = "";

    for (const chunk of chunks) {
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          chunk
        )}&langpair=${sourceLang}|${targetLang}`
      );
      const data = await response.json();
      result += data.responseData.translatedText || chunk;
    }

    return result;
  } catch (error) {
    console.error("Error al traducir:", error);
    return text;
  }
}

interface NewsFormProps {
  // Si pasamos initialData, estamos editando
  initialData?: FormDataNews;
  // Callback para que el padre decida si llama /api/addNews o /api/updateNews
  onSubmit?: (data: FormDataNews, isEdit: boolean) => void;
  // Idioma inicial por defecto
  defaultLanguage?: keyof FormDataNews;
}

const NewsForm: React.FC<NewsFormProps> = ({
  initialData,
  onSubmit,
  defaultLanguage = "Español",
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof FormDataNews>(defaultLanguage);

  const [formData, setFormData] = useState<FormDataNews>({
    Español: { title: "", description: "", editorial: "" },
    Inglés: { title: "", description: "", editorial: "" },
    Portugués: { title: "", description: "", editorial: "" },
    media_url: "",
  });

  // Cargar datos si es edición
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Manejo de cambios en los inputs
  const handleTextChange = (
    lang: keyof FormDataNews,
    field: keyof LanguageDataNews,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] as LanguageDataNews),
        [field]: value,
      },
    }));
  };

  // Subir archivo a Cloudinary
  const handleUpload = async (file: File) => {
    if (!file) return;
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);
    formDataUpload.append(
      "upload_preset",
      process.env.NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET!
    );

    try {
      const response = await fetch(
        `https://api.cloudinary.com/v1_1/${process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME}/upload`,
        {
          method: "POST",
          body: formDataUpload,
        }
      );
      const data = await response.json();
      console.log("Subida a Cloudinary:", data);
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, media_url: data.secure_url }));
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
    }
  };

  // Traducir desde el idioma seleccionado
  const handleTranslate = async (sourceLang: keyof FormDataNews) => {
    const updated = { ...formData };
    const source =
      sourceLang === "Español" ? "es" : sourceLang === "Inglés" ? "en" : "pt";

    for (const field of ["title", "description", "editorial"] as const) {
      const originalText = (updated[sourceLang] as LanguageDataNews)[field];
      for (const targetLang of ["Español", "Inglés", "Portugués"] as const) {
        if (targetLang !== sourceLang) {
          const target =
            targetLang === "Español"
              ? "es"
              : targetLang === "Inglés"
              ? "en"
              : "pt";
          updated[targetLang][field] = await translateText(
            originalText,
            source,
            target
          );
        }
      }
    }
    setFormData(updated);
  };

  // Cuando presionamos "Guardar"
  const handleSubmit = () => {
    const isEdit = !!initialData; // si tenemos initialData, asumimos que es edición
    onSubmit?.(formData, isEdit);
  };

  return (
    <div className="p-6 border">
      {/* Botones de idioma */}
      <div className="flex space-x-4 mb-4">
        {(["Español", "Inglés", "Portugués"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 font-arsenal transition-colors duration-300 rounded-md ${
              selectedLanguage === lang
                ? "bg-gray-200 shadow-md"
                : "text-gray-700 hover:bg-gray-300"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-arsenal mb-4">
        {initialData ? "Editar Noticia" : "Crear Noticia"}
      </h2>

      {/* Campos de formulario */}
      <div className="mb-4">
        <label className="block font-arsenal">Título:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={(formData[selectedLanguage] as LanguageDataNews).title}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "title", e.target.value)
          }
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold">Descripción:</label>
        <textarea
          className="border p-2 w-full"
          rows={3}
          value={(formData[selectedLanguage] as LanguageDataNews).description}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "description", e.target.value)
          }
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold">Editorial:</label>
        <textarea
          className="border p-2 w-full"
          rows={3}
          value={(formData[selectedLanguage] as LanguageDataNews).editorial}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "editorial", e.target.value)
          }
        />
      </div>

      {/* Subir archivo */}
      <div className="mb-4">
        <FileUpload onFileUpload={handleUpload} />
        {formData.media_url && (
          <img
            src={formData.media_url}
            alt="Vista previa"
            className="mt-2 w-64 h-auto object-contain"
          />
        )}
      </div>

      <div className="flex space-x-2">
        <button
          onClick={() => handleTranslate(selectedLanguage)}
          className="bg-black text-white font-arsenal px-4 py-2 rounded-md"
        >
          Traducir desde {selectedLanguage}
        </button>

        <button
          onClick={handleSubmit}
          className="bg-green-600 text-white font-arsenal px-4 py-2 rounded-md"
        >
          {initialData ? "Guardar Cambios" : "Guardar Noticia"}
        </button>
      </div>
    </div>
  );
};

export default NewsForm;
