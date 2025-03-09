"use client";
import React, { useState, useEffect } from "react";
import FileUpload from "../../ui/FileUpload";
import DatePicker from "react-datepicker"; // <---
import "react-datepicker/dist/react-datepicker.css";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface LanguageDataEvents {
  name: string;
  location: string;
  category: string;
  cost: string;
  duration: number;
  register_link: string;
  description: string;
}

interface LangEvents {
  name: string;
  location: string;
  category: string;
  description: string;
}
interface FormDataEvents {
  Español: LangEvents;
  Inglés: LangEvents;
  Portugués: LangEvents;
  media_url: string;
  date_time: string;
  duration: number;
  cost: string;
  register_link: string;
}

interface EventsFormProps {
  initialData?: FormDataEvents;
  onSubmit?: (data: FormDataEvents, isEdit: boolean) => void;
  defaultLanguage?: keyof FormDataEvents;
}

// Función para dividir el texto en fragmentos de 500 caracteres
function chunkString(str: string, size: number): string[] {
  const chunks: string[] = [];
  let i = 0;
  while (i < str.length) {
    chunks.push(str.slice(i, i + size));
    i += size;
  }
  return chunks;
}

// Función para traducir texto largo en fragmentos
async function translateText(
  text: string,
  sourceLang: string,
  targetLang: string
): Promise<string> {
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

      result += data.responseData.translatedText || chunk; // Concatenar el resultado traducido
    }

    return result;
  } catch (error) {
    console.error("Error al traducir:", error);
    return text; // Retornar el texto original en caso de error
  }
}

const EventsForm: React.FC<EventsFormProps> = ({
  initialData,
  onSubmit,
  defaultLanguage = "Español",
}) => {
  const [selectedLanguage, setSelectedLanguage] =
    useState<keyof FormDataEvents>(defaultLanguage);

  const [formData, setFormData] = useState<FormDataEvents>({
    Español: { name: "", location: "", category: "", description: "" },
    Inglés: { name: "", location: "", category: "", description: "" },
    Portugués: { name: "", location: "", category: "", description: "" },
    media_url: "",
    date_time: "",
    duration: 0,
    cost: "",
    register_link: "",
  });

  // Convert date_time (string) <-> Date para react-datepicker
  const [eventDate, setEventDate] = useState<Date | null>(null);

  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      if (initialData.date_time) {
        // parse string to Date
        setEventDate(new Date(initialData.date_time));
      }
    }
  }, [initialData]);

  const handleLangChange = (
    lang: keyof FormDataEvents,
    field: keyof LangEvents,
    value: string
  ) => {
    setFormData((prev) => ({
      ...prev,
      [lang]: {
        ...(typeof prev[lang] === "object" && prev[lang] !== null
          ? prev[lang]
          : {}), // Asegura que prev[lang] es un objeto válido
        [field]: value,
      },
    }));
  };

  const handleGlobalChange = (
    field: keyof FormDataEvents,
    value: string | number
  ) => {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    setFormData((prev) => ({ ...prev, [field]: value as any }));
  };

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
      } else {
        alert("Error al subir la imagen. Inténtalo de nuevo.");
      }
    } catch (error) {
      console.error("Error al subir archivo:", error);
      alert("Hubo un error al subir la imagen.");
    }
  };
  const [isTranslating, setIsTranslating] = useState(false);
  const handleTranslate = async (sourceLang: keyof FormDataEvents) => {
    setIsTranslating(true); // ⬅ Activa el estado de carga
    const updated = { ...formData };
    const source =
      sourceLang === "Español" ? "es" : sourceLang === "Inglés" ? "en" : "pt";

    for (const field of [
      "name",
      "location",
      "category",
      "description",
    ] as const) {
      const originalText = (updated[sourceLang] as LanguageDataEvents)[field];

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
    setIsTranslating(false); // ⬅ Desactiva el estado de carga
  };

  const handleSubmit = () => {
    const isEdit = !!initialData;
    // Convert eventDate back to string if needed
    if (eventDate) {
      formData.date_time = eventDate.toISOString();
    }
    onSubmit?.(formData, isEdit);
  };

  // AutoCompletar de ubicación: Podrías integrar Google Places
  // y en onPlaceSelected => handleLangChange(selectedLanguage, "location", place)
  const isFormValid = () => {
    // Verificar que todos los idiomas tienen valores completos
    for (const lang of ["Español", "Inglés", "Portugués"] as const) {
      const data = formData[lang];
      if (
        !data.name?.trim() ||
        !data.location?.trim() ||
        !data.category?.trim() ||
        !data.description?.trim()
      ) {
        return false; // Si algún campo está vacío, no se puede guardar
      }
    }

    // Validar los campos globales
    return (
      Boolean(formData.media_url) && // Asegura que se subió una imagen
      Boolean(eventDate) && // La fecha debe ser válida
      formData.duration > 0 && // La duración debe ser mayor a 0
      Boolean(formData.cost?.trim()) &&
      Boolean(formData.register_link?.trim())
    );
  };

  return (
    <div className="p-6 border rounded-lg">
      {/* Tabs de idioma */}
      <div className="flex space-x-4 mb-4">
        {(["Español", "Inglés", "Portugués"] as const).map((lang) => (
          <button
            key={lang}
            onClick={() => setSelectedLanguage(lang)}
            className={`px-4 py-2 rounded ${
              selectedLanguage === lang
                ? "bg-gray-200 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4 font-arsenal">
        {initialData ? "Editar Evento" : "Crear Evento"}
      </h2>

      <label className="block font-bold">Nombre del evento:</label>
      <input
        type="text"
        className="border p-2 w-full mb-4"
        value={(formData[selectedLanguage] as LanguageDataEvents)?.name ?? ""}
        onChange={(e) =>
          handleLangChange(selectedLanguage, "name", e.target.value)
        }
      />

      <label className="block font-bold">Ubicación:</label>
      {/* Ejemplo normal. Reemplazar por un <AutoComplete> con Google Places si deseas */}
      <input
        type="text"
        className="border p-2 w-full mb-4"
        placeholder="Ingresa la dirección..."
        value={(formData[selectedLanguage] as LanguageDataEvents).location}
        onChange={(e) =>
          handleLangChange(selectedLanguage, "location", e.target.value)
        }
      />

      <label className="block font-bold">Categoría:</label>
      <input
        type="text"
        className="border p-2 w-full mb-4"
        value={(formData[selectedLanguage] as LanguageDataEvents).category}
        onChange={(e) =>
          handleLangChange(selectedLanguage, "category", e.target.value)
        }
      />

      {/* Fecha/Hora con DatePicker */}
      <label className="block font-bold">Fecha y hora:</label>
      <DatePicker
        selected={eventDate}
        onChange={(date) => setEventDate(date)}
        showTimeSelect
        dateFormat="Pp"
        className="border p-2 w-full mb-4"
      />

      <label className="block font-bold">Duración (horas):</label>
      <input
        type="number"
        className="border p-2 w-full mb-4"
        value={formData.duration}
        onChange={(e) => handleGlobalChange("duration", Number(e.target.value))}
      />

      <label className="block font-bold">Costo:</label>
      <input
        type="text"
        className="border p-2 w-full mb-4"
        placeholder="Ej: $50 o 'Gratis'"
        value={formData.cost}
        onChange={(e) => handleGlobalChange("cost", e.target.value)}
      />

      <label className="block font-bold">Enlace de registro:</label>
      <input
        type="text"
        className="border p-2 w-full mb-4"
        placeholder="https://..."
        value={formData.register_link}
        onChange={(e) => handleGlobalChange("register_link", e.target.value)}
      />

      <textarea
        rows={4}
        className="border p-2 w-full mb-4"
        value={(formData[selectedLanguage] as LanguageDataEvents).description}
        onChange={(e) =>
          handleLangChange(selectedLanguage, "description", e.target.value)
        }
      />

      {/* Imagen */}
      <FileUpload onFileUpload={handleUpload} />
      {!isFormValid() && (
        <p className="text-yellow-600 font-arsenal mb-2">
          ⚠️ Debes completar todos los campos en los tres idiomas y la
          información del evento antes de guardar.
        </p>
      )}
      <div className="flex space-x-2 mt-4">
        <button
          onClick={() => handleTranslate(selectedLanguage)}
          className="bg-black text-white px-4 py-2 rounded-lg flex items-center justify-center"
          disabled={isTranslating} // ⬅ Desactiva el botón mientras traduce
        >
          {isTranslating ? (
            <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
          ) : (
            `Traducir desde ${selectedLanguage}`
          )}
        </button>

        <button
          onClick={handleSubmit}
          className={`px-4 py-2 rounded font-arsenal ${
            isFormValid()
              ? "bg-green-600 text-white"
              : "bg-gray-400 text-gray-700 cursor-not-allowed"
          }`}
          disabled={!isFormValid()} // ⬅ Deshabilita el botón si el formulario no es válido
        >
          {initialData ? "Guardar Cambios" : "Guardar Evento"}
        </button>
      </div>
    </div>
  );
};

export default EventsForm;
