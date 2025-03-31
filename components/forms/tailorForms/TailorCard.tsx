"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";
import { TailorMadeItem } from "@/types/tailor";

type Language = "ES" | "EN" | "PT";

interface TailorCardProps {
  tailorItem: TailorMadeItem;
  onDelete: (id: string) => void;
  onEdit: (item: TailorMadeItem, lang: "ES" | "EN" | "PT") => void;
}

export default function TailorCard({
  tailorItem,
  onDelete,
  onEdit,
}: TailorCardProps) {
  const [currentLang, setCurrentLang] = useState<Language>("ES");

  const getFieldByLang = (field: string) => {
    const fieldMap: Record<Language, string> = {
      ES: `${field}_spanish`,
      EN: `${field}_english`,
      PT: `${field}_portuguese`,
    };
    return (
      tailorItem[fieldMap[currentLang] as keyof TailorMadeItem] ||
      `Sin ${field}`
    );
  };

  return (
    <div className="relative w-full border rounded-lg shadow p-4 flex flex-col md:flex-row z-10 mb-6 bg-white">
      {/* Agrega este div para el grab handle */}
      {/* Grab Handle mejorado con pestaña */}
      <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-grab">
        <div className="h-full w-4 bg-gray-100 rounded-r-lg flex flex-col items-center justify-center space-y-1.5">
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>

      {/* Contenido principal con margen izquierdo para el handle */}
      <div className="ml-4 w-full flex flex-col md:flex-row">
        {/* Botones Edit/Delete (sin cambios) */}
        <div className="absolute top-2 right-2 flex space-x-3">
          <button
            onClick={() => onDelete(tailorItem.id)}
            className="text-black hover:text-red-700 transition-colors"
            aria-label="Eliminar"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <button
            onClick={() => onEdit(tailorItem, currentLang)}
            className="text-black hover:text-blue-800 transition-colors"
            aria-label="Editar"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </div>

        {/* Sección izquierda: Título, Subtítulo (sin cambios) */}
        <div className="w-full md:w-1/3 pr-4">
          {/* Tabs de idiomas */}
          <div className="flex space-x-2 mb-2">
            {(["ES", "EN", "PT"] as Language[]).map((lang) => (
              <button
                key={lang}
                onClick={() => setCurrentLang(lang)}
                className={`px-2 py-1 rounded-lg font-arsenal ${
                  currentLang === lang
                    ? "bg-gray-200 font-bold"
                    : "hover:bg-gray-100"
                }`}
              >
                {lang === "ES"
                  ? "Español"
                  : lang === "EN"
                  ? "Inglés"
                  : "Portugués"}
              </button>
            ))}
          </div>

          <h3 className="font-arsenal">Título:</h3>
          <p className="mb-3 font-medium">{getFieldByLang("title")}</p>

          <h3 className="font-arsenal">Subtítulo:</h3>
          <p className="mb-3">{getFieldByLang("subtitle")}</p>
        </div>

        {/* Sección central: Descripción (sin cambios) */}
        <div className="w-full md:w-1/3 px-2 border-l border-r border-gray-200">
          <h3 className="font-arsenal mb-1">Descripción:</h3>
          <div className="p-2 h-[100px] overflow-y-auto text-sm">
            {getFieldByLang("description")}
          </div>
        </div>

        {/* Sección derecha: Imagen (sin cambios) */}
        <div className="w-full md:w-1/3 pl-4 flex flex-col justify-center items-center">
          {tailorItem.image ? (
            <img
              src={tailorItem.image}
              alt={`Imagen para ${getFieldByLang("title")}`}
              className="w-32 h-32 object-contain border rounded"
              loading="lazy"
            />
          ) : (
            <div className="border p-4 text-gray-500 text-sm font-arsenal rounded">
              Sin imagen
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
