"use client";
import { ReactNode } from "react";

interface ModalProps {
  children: ReactNode;
  onClose: () => void;
}

const Modal = ({ children, onClose }: ModalProps) => {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-[400px] relative">
        <button
          className="absolute top-2 right-2 text-gray-600 hover:text-black"
          onClick={onClose}
        >
          ✖
        </button>
        {children}
      </div>
    </div>
  );
};

export default Modal;
