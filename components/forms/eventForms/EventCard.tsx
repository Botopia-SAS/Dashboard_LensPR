"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

type Language = "ES" | "EN" | "PT";

interface EventsRecord {
  id: string;
  name_spanish?: string;
  location_spanish?: string;
  category_spanish?: string;
  description_spanish?: string;

  name_english?: string;
  location_english?: string;
  category_english?: string;
  description_english?: string;

  name_portuguese?: string;
  location_portuguese?: string;
  category_portuguese?: string;
  description_portuguese?: string;

  date_time?: string;
  duration?: number;
  cost?: string;
  register_link?: string;
  media_url?: string;
  order_number: number; // ✅ Asegurar que cada evento tiene un número de orden
}

interface EventsCardProps {
  eventItem: EventsRecord;
  onDelete: (id: string) => void;
  onEdit: (item: EventsRecord, lang: Language) => void;
}

export default function EventsCard({
  eventItem,
  onDelete,
  onEdit,
}: EventsCardProps) {
  const [currentLang, setCurrentLang] = useState<Language>("ES");

  const getFieldByLang = (field: string) => {
    if (currentLang === "ES") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (eventItem as any)[`${field}_spanish`];
    } else if (currentLang === "EN") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (eventItem as any)[`${field}_english`];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (eventItem as any)[`${field}_portuguese`];
    }
  };

  return (
    <div className="relative w-full border rounded-lg shadow p-4 flex flex-col md:flex-row z-10 mb-6">
      {/* Botones top-right */}
      <div className="absolute top-2 right-2 flex space-x-3">
        <button
          onClick={() => onDelete(eventItem.id)}
          className="text-black hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button
          onClick={() => onEdit(eventItem, currentLang)}
          className="text-black hover:text-blue-800"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </div>

      {/* Izquierda */}
      <div className="w-full md:w-1/3 pr-4">
        {/* Tabs de idioma */}
        <div className="flex space-x-2 mb-2">
          <button
            onClick={() => setCurrentLang("ES")}
            className={`px-2 py-1 rounded-lg ${
              currentLang === "ES"
                ? "bg-gray-200 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            Español
          </button>
          <button
            onClick={() => setCurrentLang("EN")}
            className={`px-2 py-1 rounded-lg ${
              currentLang === "EN"
                ? "bg-gray-200 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            Inglés
          </button>
          <button
            onClick={() => setCurrentLang("PT")}
            className={`px-2 py-1 rounded-lg ${
              currentLang === "PT"
                ? "bg-gray-200 font-bold"
                : "hover:bg-gray-100"
            }`}
          >
            Portugués
          </button>
        </div>

        <h3 className="font-arsenal">Nombre:</h3>
        <p className="mb-2">{getFieldByLang("name") || "Sin nombre"}</p>

        <h3 className="font-arsenal">Fecha y hora:</h3>
        <p className="mb-2">
          {eventItem.date_time
            ? new Date(eventItem.date_time).toLocaleString()
            : "No definida"}
        </p>

        <h3 className="font-arsenal">Ubicación:</h3>
        <p className="mb-2">{getFieldByLang("location") || "Sin ubicación"}</p>

        <h3 className="font-arsenal">Categoría:</h3>
        <p>{getFieldByLang("category") || "Sin categoría"}</p>
      </div>

      {/* Centro: Descripción */}
      <div className="w-full md:w-1/3 px-2">
        <h3 className="font-arsenal mb-1">Descripción:</h3>
        <div className="border p-2 h-[100px] overflow-y-auto">
          {getFieldByLang("description") || "Sin descripción"}
        </div>

        <h3 className="font-arsenal mt-2">Duración:</h3>
        <p>
          {eventItem.duration ? `${eventItem.duration} horas` : "No definida"}
        </p>

        <h3 className="font-arsenal mt-2">Costo:</h3>
        <p>{eventItem.cost || "Gratis"}</p>

        <h3 className="font-arsenal mt-2">Enlace de registro:</h3>
        {eventItem.register_link ? (
          <a
            href={eventItem.register_link}
            target="_blank"
            rel="noreferrer"
            className="text-black underline font-arsenal"
          >
            Abrir enlace
          </a>
        ) : (
          "No disponible"
        )}
      </div>

      {/* Derecha: Imagen */}
      <div className="w-full md:w-1/3 pl-4 flex flex-col justify-center items-center">
        {eventItem.media_url ? (
          <img
            src={eventItem.media_url}
            alt="Imagen del evento"
            className="w-20 md:w-24 h-auto object-cover border"
          />
        ) : (
          <div className="border p-2 text-gray-500 text-sm font-arsenal">
            Sin imagen
          </div>
        )}
      </div>
    </div>
  );
}
