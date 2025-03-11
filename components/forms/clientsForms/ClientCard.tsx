"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

type Language = "ES" | "EN" | "PT";

interface ClientsRecord {
  id: string;
  name_spanish?: string;
  job_title_spanish?: string;
  description_spanish?: string;
  name_english?: string; // Cambiado de obligatorio a opcional
  job_title_english?: string;
  description_english?: string;

  name_portuguese?: string;
  job_title_portuguese?: string;
  description_portuguese?: string;
  media_url?: string;
  order_number: number;
}

interface ClientsCardProps {
  clientItem: ClientItem;
  onDelete: (id: string) => void;
  // (record, lang) => ...
  onEdit: (item: ClientsRecord, lang: Language) => void;
}
type ClientItem = {
  id: string;
  name_spanish?: string;
  name_english?: string;
  name_portuguese?: string;
  job_title_spanish?: string;
  job_title_english?: string;
  job_title_portuguese?: string;
  description_spanish?: string;
  description_english?: string;
  description_portuguese?: string;
  media_url?: string;
  order_number: number;
};

export default function ClientsCard({
  clientItem,
  onDelete,
  onEdit,
}: ClientsCardProps) {
  const [currentLang, setCurrentLang] = useState<Language>("ES");

  // Lógica para obtener campo según el idioma (igual a “NewsCard”):

  const getFieldByLang = (field: string) => {
    if (currentLang === "ES") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (clientItem as any)[`${field}_spanish`];
    } else if (currentLang === "EN") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (clientItem as any)[`${field}_english`];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (clientItem as any)[`${field}_portuguese`];
    }
  };

  return (
    <div className="relative w-full border rounded-lg shadow p-4 flex flex-col md:flex-row z-10 mb-6">
      {/* Botones Edit/Delete top-right */}
      <div className="absolute top-2 right-2 flex space-x-3">
        <button
          onClick={() => onDelete(clientItem.id)}
          className="text-black hover:text-red-700"
        >
          <FontAwesomeIcon icon={faTrash} />
        </button>
        <button
          onClick={() => onEdit(clientItem, currentLang)}
          className="text-black hover:text-blue-800"
        >
          <FontAwesomeIcon icon={faPenToSquare} />
        </button>
      </div>

      {/* Sección izquierda */}
      <div className=" w-full md:w-1/3 pr-4">
        {/* Tabs de idiomas */}
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
                ? "bg-gray-200 font-arsenal"
                : "hover:bg-gray-100"
            }`}
          >
            Inglés
          </button>
          <button
            onClick={() => setCurrentLang("PT")}
            className={`px-2 py-1 rounded-lg ${
              currentLang === "PT"
                ? "bg-gray-200 font-arsenal"
                : "hover:bg-gray-100"
            }`}
          >
            Portugués
          </button>
        </div>
        <h3 className="font-arsenal">Nombre:</h3>
        <p className="mb-3">{getFieldByLang("name") || "Sin nombre"}</p>

        <h3 className="font-arsenal">Título de trabajo:</h3>
        <p className="mb-3">{getFieldByLang("job_title") || "Sin título"}</p>
      </div>

      {/* Sección central: Descripción con scrollbar */}
      <div className="w-full md:w-1/3 px-2">
        <h3 className="font-arsenal mb-1">Descripción:</h3>
        <div className="border p-2 h-[100px] overflow-y-auto">
          {getFieldByLang("description") || "Sin descripción"}
        </div>
      </div>

      {/* Sección derecha: Imagen */}
      <div className="w-full md:w-1/3 pl-4 flex flex-col justify-center items-center">
        {clientItem.media_url ? (
          <img
            src={clientItem.media_url}
            alt="Imagen del cliente"
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
