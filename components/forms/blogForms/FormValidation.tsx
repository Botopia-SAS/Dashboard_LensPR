"use client";
import React from "react";

interface FormValidationProps {
  isValid: boolean;
}

const FormValidation: React.FC<FormValidationProps> = ({ isValid }) => {
  if (isValid) {
    return null;
  }

  return (
    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
      <div className="flex items-start">
        <div className="text-red-500 text-lg mr-3 font-bold">!</div>
        <div>
          <h4 className="text-red-800 font-medium mb-1 text-sm">
            Formulario incompleto
          </h4>
          <p className="text-red-700 text-xs">
            Completa: título, excerpt, contenido, categoría en los 3 idiomas, slug
            y portada.
          </p>
        </div>
      </div>
    </div>
  );
};

export default FormValidation;