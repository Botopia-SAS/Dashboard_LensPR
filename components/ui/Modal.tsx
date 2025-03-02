"use client";
import React from "react";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  children: React.ReactNode;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, children }) => {
  if (!isOpen) return null;

  return (
    // Contenedor fijo que cubre toda la ventana
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      {/* Caja donde se muestra el contenido del modal */}
      <div
        className="
          relative
          bg-white
          rounded
          p-6
          w-full
          max-w-lg
          mx-4
          max-h-[90vh]
          overflow-y-auto
        "
      >
        {/* Botón de cerrar */}
        <button
          onClick={onClose}
          className="absolute top-2 right-2 text-gray-500 hover:text-gray-700 "
        >
          X
        </button>

        {/* Contenido del modal */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
