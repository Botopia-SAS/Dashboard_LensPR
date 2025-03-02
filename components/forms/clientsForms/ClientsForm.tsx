"use client";
import React, { useState, useEffect } from "react";
import FileUpload from "../../ui/FileUpload"; // Ajusta la ruta a tu FileUpload
import { FormDataClients, LanguageDataClients } from "@/types/clients";

// Crearemos el type en la sección final

// Funciones para dividir texto y traducir (igual que en news)
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
    const chunks = chunkString(text, 500);
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

interface ClientsFormProps {
  initialData?: FormDataClients;
  onSubmit?: (data: FormDataClients, isEdit: boolean) => void;
  defaultLanguage?: keyof FormDataClients;
}

const ClientsForm: React.FC<ClientsFormProps> = ({
  initialData,
  onSubmit,
  defaultLanguage = "Español",
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof FormDataClients>(defaultLanguage);

  const [formData, setFormData] = useState<FormDataClients>({
    Español: { name: "", job_title: "", description: "" },
    Inglés: { name: "", job_title: "", description: "" },
    Portugués: { name: "", job_title: "", description: "" },
    media_url: "",
  });

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  // Manejo de cambios
  const handleTextChange = (
    lang: keyof FormDataClients,
    field: keyof LanguageDataClients,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] as LanguageDataClients),
        [field]: value,
      },
    }));
  };

  // Subir archivo (Cloudinary)
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
      if (data.secure_url) {
        setFormData((prev) => ({ ...prev, media_url: data.secure_url }));
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
    }
  };

  // Traducir
  const handleTranslate = async (sourceLang: keyof FormDataClients) => {
    const updated = { ...formData };
    const source =
      sourceLang === "Español" ? "es" : sourceLang === "Inglés" ? "en" : "pt";

    for (const field of ["name", "job_title", "description"] as const) {
      const originalText = (updated[sourceLang] as LanguageDataClients)[field];
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

  const handleSubmit = () => {
    const isEdit = !!initialData;
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
            className={`px-4 py-2 font-arsenal rounded-md transition-colors duration-300 ${
              selectedLanguage === lang
                ? "bg-gray-200 shadow-md"
                : "text-gray-700 hover:bg-gray-300 font-arsenal"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <h2 className="text-2xl font-arsenal mb-4">
        {initialData ? "Editar Cliente" : "Crear Cliente"}
      </h2>

      {/* Campos */}
      <div className="mb-4">
        <label className="block font-bold">Nombre:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={(formData[selectedLanguage] as LanguageDataClients).name}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "name", e.target.value)
          }
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold">Título de trabajo:</label>
        <input
          type="text"
          className="border p-2 w-full"
          value={(formData[selectedLanguage] as LanguageDataClients).job_title}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "job_title", e.target.value)
          }
        />
      </div>

      <div className="mb-4">
        <label className="block font-bold">Descripción:</label>
        <textarea
          rows={3}
          className="border p-2 w-full"
          value={
            (formData[selectedLanguage] as LanguageDataClients).description
          }
          onChange={(e) =>
            handleTextChange(selectedLanguage, "description", e.target.value)
          }
        />
      </div>

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
          className="bg-black text-white px-4 py-2 rounded-md font-arsenal"
        >
          Traducir desde {selectedLanguage}
        </button>
        <button
          onClick={handleSubmit}
          className="bg-green-700 text-white px-4 py-2 rounded-md font-arsenal"
        >
          {initialData ? "Guardar Cambios" : "Guardar Cliente"}
        </button>
      </div>
    </div>
  );
};

export default ClientsForm;
