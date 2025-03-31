"use client";
import { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faPenToSquare } from "@fortawesome/free-solid-svg-icons";

interface NewsRecord {
  id: string;
  title_spanish: string | undefined;
  title_english: string | undefined;
  title_portuguese: string | undefined;
  description_spanish: string | undefined;
  description_english: string | undefined;
  description_portuguese: string | undefined;
  editorial_spanish: string | undefined;
  editorial_english: string | undefined;
  editorial_portuguese: string | undefined;
  media_url: string | undefined;
  news_link: string | undefined;
}

type Language = "ES" | "EN" | "PT";

interface NewsCardProps {
  newsItem: NewsRecord;
  onDelete: (id: string) => void;
  onEdit: (itemOrRecord: NewsRecord, lang: Language) => void;
}

export default function NewsCard({
  newsItem,
  onDelete,
  onEdit,
}: NewsCardProps) {
  const [currentLang, setCurrentLang] = useState<Language>("ES");

  const getFieldByLang = (fieldBase: string) => {
    if (currentLang === "ES") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (newsItem as any)[`${fieldBase}_spanish`];
    } else if (currentLang === "EN") {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (newsItem as any)[`${fieldBase}_english`];
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      return (newsItem as any)[`${fieldBase}_portuguese`];
    }
  };

  return (
    <div className="relative w-full border rounded-lg shadow p-4 flex flex-col md:flex-row z-10 mb-6 bg-white">
      {/* Grab Handle - Esta parte se mantiene igual */}
      <div className="absolute left-0 top-0 bottom-0 w-4 flex items-center justify-center cursor-grab">
        <div className="h-full w-4 bg-gray-100 rounded-r-lg flex flex-col items-center justify-center space-y-1.5">
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
          <div className="w-1 h-1 bg-gray-500 rounded-full"></div>
        </div>
      </div>
      {/* Contenido principal CON MARGEN IZQUIERDO */}
      <div className="ml-6 w-full flex flex-col md:flex-row">
        {/* Botones Edit/Delete */}
        <div className="absolute top-2 right-2 flex space-x-3">
          <button
            onClick={() => onDelete(newsItem.id)}
            className="text-black hover:text-red-700"
          >
            <FontAwesomeIcon icon={faTrash} />
          </button>
          <button
            onClick={() => onEdit(newsItem, currentLang)}
            className="text-black hover:text-blue-700"
          >
            <FontAwesomeIcon icon={faPenToSquare} />
          </button>
        </div>

        {/* Sección izquierda: título, editorial */}
        <div className="w-full md:w-1/3 pr-4">
          {/* Tabs de idiomas */}
          <div className="flex space-x-2 mb-2">
            <button
              onClick={() => setCurrentLang("ES")}
              className={`px-2 py-1 rounded ${
                currentLang === "ES"
                  ? "bg-gray-200 font-arsenal"
                  : "hover:bg-gray-100"
              }`}
            >
              Español
            </button>
            <button
              onClick={() => setCurrentLang("EN")}
              className={`px-2 py-1 rounded ${
                currentLang === "EN"
                  ? "bg-gray-200 font-arsenal"
                  : "hover:bg-gray-100"
              }`}
            >
              Inglés
            </button>
            <button
              onClick={() => setCurrentLang("PT")}
              className={`px-2 py-1 rounded ${
                currentLang === "PT"
                  ? "bg-gray-200 font-arsenal"
                  : "hover:bg-gray-100"
              }`}
            >
              Portugués
            </button>
          </div>
          <h3 className="font-arsenal">Título:</h3>
          <p className="mb-3">{getFieldByLang("title") || "Sin Título"}</p>
          <h3 className="font-arsenal">Editorial:</h3>
          <p>{newsItem.editorial_spanish || "Sin Editorial"}</p>
        </div>

        {/* Sección central: Descripción con scrollbar */}
        <div className="w-full md:w-1/3 px-2">
          <h3 className="font-arsenal mb-1">Descripción:</h3>
          <div className="border p-2 h-[150px] overflow-y-auto">
            {getFieldByLang("description") || "Sin descripción"}
          </div>
          {/* Enlace a la noticia */}
          {newsItem.news_link && (
            <div className="mt-3">
              <a
                href={newsItem.news_link}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-500 underline font-arsenal"
              >
                Leer más
              </a>
            </div>
          )}
        </div>

        {/* Sección derecha: Imagen */}
        <div className="w-full md:w-1/3 pl-4 flex flex-col justify-center items-center">
          {newsItem.media_url ? (
            <img
              src={newsItem.media_url}
              alt="Imagen de la noticia"
              className="w-20 md:w-32 h-auto object-cover border"
            />
          ) : (
            <div className="border p-2 text-gray-500 text-sm font-arsenal">
              Sin imagen
            </div>
          )}
        </div>
      </div>{" "}
      {/* Cierre del div con ml-6 */}
    </div>
  );
}
