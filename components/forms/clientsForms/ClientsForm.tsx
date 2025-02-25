import { useState, useEffect } from "react";
import FormComponent from "../FormComponent";

const translateText = async (text: string, targetLang: string) => {
  try {
    const response = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
        text
      )}&langpair=es|${targetLang}`
    );
    const data = await response.json();
    return data.responseData.translatedText || text;
  } catch (error) {
    console.error("Error al traducir:", error);
    return text;
  }
};

type FormData = {
  email: string;
  image: File | null;
  Español: {
    name: string;
    country: string;
    job_title: string;
    description: string;
  };
  Inglés: {
    name: string;
    country: string;
    job_title: string;
    description: string;
  };
  Portugués: {
    name: string;
    country: string;
    job_title: string;
    description: string;
  };
  [key: string]: any;
};

const ClientForm = ({ language }: { language: string }) => {
  const [formData, setFormData] = useState<FormData>({
    email: "",
    image: null,
    Español: { name: "", country: "", job_title: "", description: "" },
    Inglés: { name: "", country: "", job_title: "", description: "" },
    Portugués: { name: "", country: "", job_title: "", description: "" },
  });

  // Manejo de cambios en los campos de texto
  const handleTextChange = (lang: string, field: string, value: string) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: { ...prev[lang], [field]: value },
    }));

    if (lang === "Español") {
      // Traducción asincrónica sin bloquear el onChange
      setTimeout(async () => {
        const englishTranslation = await translateText(value, "en");
        const portugueseTranslation = await translateText(value, "pt");

        setFormData((prev) => ({
          ...prev,
          Inglés: { ...prev.Inglés, [field]: englishTranslation },
          Portugués: { ...prev.Portugués, [field]: portugueseTranslation },
        }));
      }, 500); // Pequeño retraso para evitar múltiples llamadas innecesarias
    }
  };
  // Manejo de cambios en email
  const handleEmailChange = (value: string) => {
    setFormData((prev) => ({
      ...prev,
      email: value, // Se actualiza para todos los idiomas
    }));
  };

  // Manejo de cambios en la imagen
  const handleImageUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0] || null;
    if (file) {
      setFormData((prev) => ({
        ...prev,
        image: file, // La imagen se mantiene igual para todos los idiomas
      }));
    }
  };

  return (
    <FormComponent
      title={`Cliente (${language})`}
      apiEndpoint="/api/addClient"
      fields={[
        {
          name: "name",
          type: "text",
          placeholder: "Nombre",
          value: formData[language].name,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => handleTextChange(language, "name", e.target.value),
        },
        {
          name: "country",
          type: "text",
          placeholder: "País",
          value: formData[language].country,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => handleTextChange(language, "country", e.target.value),
        },
        {
          name: "job_title",
          type: "text",
          placeholder: "Puesto",
          value: formData[language].job_title,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => handleTextChange(language, "job_title", e.target.value),
        },
        {
          name: "description",
          type: "text",
          placeholder: "Descripción",
          value: formData[language].description,
          onChange: (
            e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
          ) => handleTextChange(language, "description", e.target.value),
        },
      ]}
      file={formData.image}
      onFileChange={handleImageUpload}
    />
  );
};

export default ClientForm;
