"use client";
import { useState } from "react";
import { ClientData } from "@/types/clients"; // Ajusta la ruta según tu proyecto
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import {
  faChevronLeft,
  faChevronRight,
  faTrash,
  faPenToSquare,
} from "@fortawesome/free-solid-svg-icons";

interface Client {
  id: string;
  name_spanish: string;
  country_spanish: string;
  job_title_spanish: string;
  description_spanish: string;

  name_english: string;
  country_english: string;
  job_title_english: string;
  description_english: string;

  name_portuguese: string;
  country_portuguese: string;
  job_title_portuguese: string;
  description_portuguese: string;

  media_url: string;
}

type Language = "ES" | "EN" | "PT";

interface ClientCardProps {
  client: ClientData;
  onDelete: (id: string) => void;
  onEdit: (client: ClientData, lang: Language) => void;
}

export default function ClientCard({
  client,
  onDelete,
  onEdit,
}: ClientCardProps) {
  // Estado local para manejar idioma seleccionado
  const [currentLang, setCurrentLang] = useState<Language>("ES");

  // Helper para obtener nombre/country/etc según el idioma actual
  const getFieldByLang = (fieldBase: string) => {
    if (currentLang === "ES") return (client as any)[fieldBase + "_spanish"];
    if (currentLang === "EN") return (client as any)[fieldBase + "_english"];
    if (currentLang === "PT") return (client as any)[fieldBase + "_portuguese"];
  };

  const handleNextLang = () => {
    // Alternar circularmente ES -> EN -> PT -> ES
    if (currentLang === "ES") setCurrentLang("EN");
    else if (currentLang === "EN") setCurrentLang("PT");
    else setCurrentLang("ES");
  };

  const handlePrevLang = () => {
    // Alternar inverso PT -> EN -> ES -> PT
    if (currentLang === "ES") setCurrentLang("PT");
    else if (currentLang === "PT") setCurrentLang("EN");
    else setCurrentLang("ES");
  };

  return (
    <div className="relative border rounded shadow p-4 w-full max-w-sm">
      {/* Contenedor de íconos en la esquina superior derecha */}
      <div className="absolute top-2 right-2 flex items-center gap-3">
        {/* Ícono de caneca (eliminar) */}
        <button
          onClick={() => onDelete(client.id)}
          className="text-black hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        {/* Ícono de lápiz (editar) */}
        <button
          onClick={() => onEdit(client, currentLang)}
          className="text-black hover:text-blue-900"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </div>

      {/* Flechas para cambiar idioma */}
      <div className="flex justify-between items-center mb-2 mt-6">
        {" "}
        <button onClick={handlePrevLang} className="text-gray-600 text-xl">
          <FontAwesomeIcon icon={faChevronLeft} />{" "}
        </button>
        <span className="font-bold">
          {currentLang === "ES"
            ? "Español"
            : currentLang === "EN"
            ? "Inglés"
            : "Portugués"}
        </span>{" "}
        <button onClick={handleNextLang} className="text-gray-600 text-xl">
          <FontAwesomeIcon icon={faChevronRight} />{" "}
        </button>
      </div>

      {/* Contenido dinámico según el idioma */}
      <h3 className="text-xl font-semibold mb-1">{getFieldByLang("name")}</h3>
      <p className="text-sm text-gray-600 mb-1">
        País: {getFieldByLang("country")}
      </p>
      <p className="text-sm text-gray-600 mb-1">
        Título: {getFieldByLang("job_title")}
      </p>
      <p className="text-sm text-gray-700 mb-2">
        Descripción: {getFieldByLang("description")}
      </p>

      {/* Imagen */}
      {client.media_url && (
        <div className="mb-2">
          {/* Si quieres detectar si es video o imagen, adelante;
              aquí asumimos siempre imagen por simplicidad. */}
          <img
            src={client.media_url}
            alt={`Imagen de ${getFieldByLang("name")}`}
            className="w-full h-auto max-h-48 object-cover rounded"
          />
        </div>
      )}
    </div>
  );
}
