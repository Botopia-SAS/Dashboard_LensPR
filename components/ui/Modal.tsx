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
        <div className="sticky top-0   flex justify-end p-2">
          <button
            onClick={onClose}
            className="text-black hover:text-gray-400 p-1 rounded-full"
          >
            X
          </button>
        </div>

        {/* Contenido del modal */}
        {children}
      </div>
    </div>
  );
};

export default Modal;
