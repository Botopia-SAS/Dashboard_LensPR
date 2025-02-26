"use client";
import React, { useState } from "react";
import FormComponent from "../FormComponent"; // Asegúrate de la ruta correcta

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

const ClientsForm: React.FC = () => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof FormDataType>("Español");
  const [formData, setFormData] = useState<FormDataType>({
    Español: { name: "", country: "", job_title: "", description: "" },
    Inglés: { name: "", country: "", job_title: "", description: "" },
    Portugués: { name: "", country: "", job_title: "", description: "" },
    media_url: "", // ✅ Agregar la propiedad para evitar el error
  });

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
  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]; // Obtiene el primer archivo seleccionado
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await fetch("/api/uploadMedia", {
        method: "POST",
        body: formData,
      });

      const data = await response.json();
      if (data.url) {
        setFormData((prev) => ({ ...prev, media_url: data.url })); // ✅ Guardar la URL del archivo
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
    }
  };

  return (
    <div className="p-6">
      {/* ✅ HEADER DE IDIOMAS */}
      <div className="flex space-x-4 mb-4 border-b pb-2">
        {(["Español", "Inglés", "Portugués"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 ${
              selectedLanguage === lang
                ? "bg-blue-500 text-white"
                : "bg-gray-200"
            } rounded-md`}
          >
            {lang}
          </button>
        ))}
      </div>

      <FormComponent
        title={selectedLanguage}
        formData={formData[selectedLanguage] as LanguageData}
        onChange={(field, value) =>
          handleTextChange(selectedLanguage, field, value)
        }
      />
      {/* ✅ INPUT PARA SUBIR ARCHIVOS */}
      <input type="file" accept="image/*,video/*" onChange={handleUpload} />
      {formData.media_url && (
        <p className="text-sm text-gray-600">
          Archivo subido: {formData.media_url}
        </p>
      )}

      <button
        onClick={() => handleTranslate(selectedLanguage)}
        className="bg-green-500 text-white px-4 py-2 rounded-md mr-2"
      >
        Traducir desde {selectedLanguage}
      </button>

      <button
        onClick={handleSubmit} // ✅ Se corrige la llamada sin pasar formData
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        Guardar Cliente
      </button>
    </div>
  );
};

export default ClientsForm;
