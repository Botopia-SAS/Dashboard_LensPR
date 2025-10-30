"use client";
import React, { useState, useEffect } from "react";
import FileUpload from "../../ui/FileUpload";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FormDataTailor, LanguageKey, LanguageData } from "@/types/tailor"; // Importa los tipos adicionales

interface TailorFormProps {
  initialData?: FormDataTailor;
  onSubmit?: (data: FormDataTailor, isEdit: boolean) => void;
  defaultLanguage?: LanguageKey; // Usa el tipo importado directamente
}

// Función de traducción (igual que en ClientsForm)
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
      const emailParam = process.env.NEXT_PUBLIC_MYMEMORY_EMAIL
        ? `&de=${encodeURIComponent(process.env.NEXT_PUBLIC_MYMEMORY_EMAIL)}`
        : "";
      const response = await fetch(
        `https://api.mymemory.translated.net/get?q=${encodeURIComponent(
          chunk
        )}&langpair=${sourceLang}|${targetLang}${emailParam}`
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

const TailorForm: React.FC<TailorFormProps> = ({
  initialData,
  onSubmit,
  defaultLanguage = "Español",
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<LanguageKey>(defaultLanguage);
  const [formData, setFormData] = useState<FormDataTailor>({
    Español: { title: "", subtitle: "", description: "" },
    Inglés: { title: "", subtitle: "", description: "" },
    Portugués: { title: "", subtitle: "", description: "" },
    image: "",
  });

  const [isTranslating, setIsTranslating] = useState(false);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
    }
  }, [initialData]);

  const handleTextChange = (
    lang: LanguageKey,
    field: keyof LanguageData, // Usa LanguageData en lugar de LanguageDataTailor
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...prev[lang],
        [field]: value,
      },
    }));
  };

  const handleUpload = async (file: File): Promise<string> => {
    if (!file) throw new Error("No file provided");
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
        setFormData((prev) => ({ ...prev, image: data.secure_url }));
        return data.secure_url;
      } else {
        throw new Error("Failed to upload image");
      }
    } catch (error) {
      console.error("Error al subir imagen:", error);
      throw error;
    }
  };

  const handleTranslate = async (sourceLang: LanguageKey) => {
    setIsTranslating(true);
    const source =
      sourceLang === "Español" ? "es" : sourceLang === "Inglés" ? "en" : "pt";

    const fieldsToTranslate: (keyof LanguageData)[] = [
      // Usa LanguageData
      "title",
      "subtitle",
      "description",
    ];

    const translationPromises = fieldsToTranslate.map(async (field) => {
      const originalText = formData[sourceLang][field];

      const translations = await Promise.all(
        (["Español", "Inglés", "Portugués"] as LanguageKey[])
          .filter((lang) => lang !== sourceLang)
          .map(async (targetLang) => {
            const target =
              targetLang === "Español"
                ? "es"
                : targetLang === "Inglés"
                ? "en"
                : "pt";
            const translated = await translateText(
              originalText,
              source,
              target
            );
            return { targetLang, field, translated };
          })
      );

      return translations;
    });

    const results = await Promise.all(translationPromises);
    const flatResults = results.flat();

    setFormData((prev) => {
      const updated = { ...prev };
      flatResults.forEach(({ targetLang, field, translated }) => {
        updated[targetLang][field] = translated;
      });
      return updated;
    });

    setIsTranslating(false);
  };

  const handleSubmit = () => {
    const isEdit = !!initialData;
    onSubmit?.(formData, isEdit);
  };

  const isFormValid = () => {
    for (const lang of ["Español", "Inglés", "Portugués"] as const) {
      const data = formData[lang];
      if (
        !data.title.trim() ||
        !data.subtitle.trim() ||
        !data.description.trim()
      ) {
        return false;
      }
    }
    return !!formData.image;
  };

  return (
    <div className="p-6 border rounded-lg bg-white shadow-sm">
      {/* Botones de idioma */}
      <div className="flex space-x-4 mb-4">
        {(["Español", "Inglés", "Portugués"] as LanguageKey[]).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 rounded-lg transition-colors duration-300 font-arsenal ${
              selectedLanguage === lang
                ? "bg-gray-200 shadow-md"
                : "text-gray-700 hover:bg-gray-300"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      {/* Campos del formulario con tipado seguro */}
      <div className="mb-4">
        <label className="block font-arsenal font-bold mb-1">Título:</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={formData[selectedLanguage].title}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "title", e.target.value)
          }
        />
      </div>

      <div className="mb-4">
        <label className="block font-arsenal font-bold mb-1">Subtítulo:</label>
        <input
          type="text"
          className="border p-2 w-full rounded"
          value={formData[selectedLanguage].subtitle}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "subtitle", e.target.value)
          }
        />
      </div>

      <div className="mb-4">
        <label className="block font-arsenal font-bold mb-1">
          Descripción:
        </label>
        <textarea
          rows={4}
          className="border p-2 w-full rounded"
          value={formData[selectedLanguage].description}
          onChange={(e) =>
            handleTextChange(selectedLanguage, "description", e.target.value)
          }
        />
      </div>

      <div className="mb-4">
        <label className="block font-arsenal font-bold mb-1">Imagen:</label>
        <FileUpload onFileUpload={handleUpload} />
        {/*{formData.image && (
          <div className="mt-2">
            <img
              src={formData.image}
              alt="Vista previa"
              className="h-32 object-contain border rounded"
            />
          </div>
        )}*/}
      </div>

      {!isFormValid() && (
        <p className="text-yellow-600 font-arsenal mb-2">
          ⚠️ Completa todos los campos en los tres idiomas y sube una imagen
        </p>
      )}

      <div className="flex space-x-2">
        <button
          onClick={() => handleTranslate(selectedLanguage)}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center font-arsenal"
          disabled={isTranslating}
        >
          {isTranslating ? (
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          ) : (
            `Traducir desde ${selectedLanguage}`
          )}
        </button>

        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded-lg font-arsenal ${
            isFormValid()
              ? "bg-green-700 text-white hover:bg-green-800"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          disabled={!isFormValid()}
        >
          {initialData ? "Guardar Cambios" : "Guardar Contenido"}
        </button>
      </div>
    </div>
  );
};

export default TailorForm;
