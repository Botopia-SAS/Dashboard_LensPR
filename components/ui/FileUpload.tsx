import React, { useState, useRef } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTrash, faSync } from "@fortawesome/free-solid-svg-icons";

interface FileUploadProps {
  onFileUpload: (file: File) => void;
  children?: React.ReactNode;
}

const FileUpload: React.FC<FileUploadProps> = ({ onFileUpload, children }) => {
  const [preview, setPreview] = useState<string | null>(null);
  const [dragging, setDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement | null>(null); // ✅ Referencia al input de archivos

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      processFile(file);
    }
  };

  const processFile = (file: File) => {
    const objectUrl = URL.createObjectURL(file);
    setPreview(objectUrl);
    onFileUpload(file);
  };

  const handleDragOver = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(true);
  };

  const handleDragLeave = () => {
    setDragging(false);
  };

  const handleDrop = (event: React.DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setDragging(false);

    const file = event.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  return (
    <div className="w-full flex flex-col items-center">
      <div
        className={`w-full max-w-md p-6 border-2 border-dashed rounded-lg transition-all
          ${
            dragging
              ? "border-blue-500 bg-blue-100"
              : "border-gray-300 bg-gray-50"
          } 
          flex flex-col items-center justify-center cursor-pointer`}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        onClick={() => fileInputRef.current?.click()} // ✅ Simula un clic en el input al hacer clic en el div
      >
        <input
          ref={fileInputRef} // ✅ Se asocia la referencia con el input
          type="file"
          accept="image/*,video/*"
          onChange={handleFileChange}
          className="hidden"
        />
        {children ? (
          children
        ) : (
          <p className="text-gray-500 text-sm font-arsenal">
            {dragging
              ? "Suelta el archivo aquí"
              : "Arrastra y suelta un archivo o haz clic para subir"}
          </p>
        )}
      </div>

      {preview && (
        <div className="mt-4 w-full max-w-md flex flex-col items-center relative">
          {preview.includes("video") ? (
            <video className="w-full rounded-lg shadow-md" controls>
              <source src={preview} type="video/mp4" />
            </video>
          ) : (
            <img
              src={preview}
              alt="Preview"
              className="w-full rounded-lg shadow-md mb-2"
            />
          )}

          {/* Botones para eliminar o cambiar la imagen (con íconos) */}
          <div className="absolute top-2 right-2 flex space-x-2 bg-black/50 p-1 rounded-lg">
            {/* Botón eliminar */}
            <button
              onClick={() => {
                setPreview(null);
                if (fileInputRef.current) {
                  fileInputRef.current.value = ""; // 🔥 Permite subir una nueva imagen después de eliminar
                }
              }}
            >
              <FontAwesomeIcon
                icon={faTrash}
                className="text-white hover:text-red-500"
              />
            </button>

            {/* Botón cambiar imagen */}
            <button onClick={() => fileInputRef.current?.click()}>
              <FontAwesomeIcon
                icon={faSync}
                className="text-white hover:text-blue-500"
              />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default FileUpload;
