"use client";
import React, { useState, useEffect } from "react";
import FormComponent from "../FormComponent"; // Asegúrate de la ruta correcta
import FileUpload from "@/components/FileUpload";

type LanguageData = {
  name: string;
  country: string;
  job_title: string;
  description: string;
};

type FormDataType = {
  Español: LanguageData;
  Inglés: LanguageData;
  Portugués: LanguageData;
  media_url: string; // ✅ Nuevo campo para la imagen o video
};

const translateText = async (
  text: string,
  sourceLang: string,
  targetLang: string
) => {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=${sourceLang}|${targetLang}`
    );
    const data = await response.json();
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error("Error al traducir:", error);
    return text;
  }
};
interface ClientsFormProps {
  language: string;
  initialData?: FormDataType; // si estamos editando
  onSubmit?: (data: FormDataType, isEdit: boolean) => void; // callback para el padre
}

const ClientsForm: React.FC<ClientsFormProps> = ({ language, initialData }) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof FormDataType>("Español");
  const [formData, setFormData] = useState<FormDataType>({
    Español: { name: "", country: "", job_title: "", description: "" },
    Inglés: { name: "", country: "", job_title: "", description: "" },
    Portugués: { name: "", country: "", job_title: "", description: "" },
    media_url: "", // ✅ Agregar la propiedad para evitar el error
  });
  // Si hay initialData, al montar (o si cambia) lo ponemos en el state
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);
  // ✅ Manejo de cambios en los inputs
  const handleTextChange = (
    lang: keyof FormDataType,
    field: keyof LanguageData,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...(prev[lang] as LanguageData),
        [field]: value,
      },
    }));
  };

  // ✅ Manejo de traducción de los textos
  const handleTranslate = async (sourceLang: keyof FormDataType) => {
    const updatedData = { ...formData };

    for (const field of [
      "name",
      "country",
      "job_title",
      "description",
    ] as const) {
      const value = (formData[sourceLang] as LanguageData)[field];

      for (const targetLang of ["Español", "Inglés", "Portugués"] as const) {
        if (targetLang !== sourceLang) {
          updatedData[targetLang][field] = await translateText(
            value,
            sourceLang === "Español"
              ? "es"
              : sourceLang === "Inglés"
              ? "en"
              : "pt",
            targetLang === "Español"
              ? "es"
              : targetLang === "Inglés"
              ? "en"
              : "pt"
          );
        }
      }
    }

    setFormData(updatedData);
  };

  // ✅ Manejo del envío de datos a la API
  const handleSubmit = async () => {
    console.log("📌 Datos a enviar al backend:", formData);

    try {
      const response = await fetch("/api/addClient", {
        method: "POST",
        body: JSON.stringify(formData),
        headers: { "Content-Type": "application/json" },
      });

      const result = await response.json();

      if (response.ok) {
        alert("Cliente agregado con éxito");
      } else {
        alert(`Error al agregar cliente: ${result.error}`);
      }
    } catch (error) {
      console.error("⚠️ Error en la solicitud:", error);
      alert("Error en la conexión con el servidor");
    }
  };
  const handleUpload = async (file: File) => {
    // ✅ Ahora recibe un File directamente
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
      console.log("📌 Respuesta de Cloudinary:", data); // 🔍 Muestra toda la respuesta en la consola

      if (data.secure_url) {
        console.log("✅ Archivo subido con URL:", data.secure_url);
        setFormData((prev) => ({ ...prev, media_url: data.secure_url }));
      } else {
        console.error("⚠️ Error: No se recibió una URL en la respuesta", data);
      }
    } catch (error) {
      console.error("❌ Error al subir archivo:", error);
    }
  };

  return (
    <div className="p-6">
      {/* ✅ HEADER DE IDIOMAS */}
      <div>
        <div className="flex space-x-4 mb-4 border-b border-gray-300 pb-3 bg-white  px-6 py-4">
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
        <h1 className="text-3xl font-arsenal mb-6">
          Gestión de Clientes - {selectedLanguage}
        </h1>
      </div>
      <FormComponent
        title={selectedLanguage}
        formData={formData[selectedLanguage] as LanguageData}
        onChange={(field, value) =>
          handleTextChange(selectedLanguage, field, value)
        }
      />
      {/* ✅ SECCIÓN PARA SUBIR ARCHIVOS */}
      <div className="mt-6">
        <FileUpload onFileUpload={(file) => handleUpload(file)} />
      </div>

      <button
        onClick={() => handleTranslate(selectedLanguage)}
        className="bg-black text-white px-4 py-2 rounded-md mr-2 
             transition-all duration-300 ease-in-out 
             hover:bg-white hover:text-black hover:shadow-md 
             active:scale-95 mt-10"
      >
        Traducir desde {selectedLanguage}
      </button>

      <button
        onClick={handleSubmit} // ✅ Se corrige la llamada sin pasar formData
        className="bg-black text-white px-4 py-2 rounded-md mr-2 
        transition-all duration-300 ease-in-out 
        hover:bg-white hover:text-black hover:shadow-md 
        active:scale-95"
      >
        Guardar Cliente
      </button>
    </div>
  );
};

export default ClientsForm;
