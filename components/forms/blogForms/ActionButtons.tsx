"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { BlogLanguageKey } from "../../../types/blogs";

interface ActionButtonsProps {
  selectedLanguage: BlogLanguageKey;
  isTranslating: boolean;
  isFormValid: boolean;
  isEdit: boolean;
  onTranslate: (sourceLang: BlogLanguageKey) => void;
  onSubmit: () => void;
}

const ActionButtons: React.FC<ActionButtonsProps> = ({
  selectedLanguage,
  isTranslating,
  isFormValid,
  isEdit,
  onTranslate,
  onSubmit,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <div className="space-y-3">
        {/* Mensaje informativo sobre Google Translate */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-3">
          <div className="flex items-start">
            <div className="flex-shrink-0">
              <svg className="h-5 w-5 text-blue-400" viewBox="0 0 20 20" fill="currentColor">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-blue-800">Traducción automática con Google Translate</h3>
              <p className="mt-1 text-xs text-blue-700">
                Las traducciones son generadas automáticamente. Se recomienda revisar y ajustar cada traducción para asegurar que sea 100% precisa y culturalmente apropiada.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={() => onTranslate(selectedLanguage)}
          disabled={isTranslating}
          className="w-full flex items-center justify-center px-4 py-2 bg-gray-600 text-white rounded-md font-medium transition-all duration-200 hover:bg-gray-700 disabled:opacity-50 disabled:cursor-not-allowed text-sm"
        >
          {isTranslating ? (
            <>
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              Traduciendo...
            </>
          ) : (
            `Traducir desde ${selectedLanguage}`
          )}
        </button>

        <button
          onClick={onSubmit}
          disabled={!isFormValid}
          className={`w-full px-4 py-2 rounded-md font-medium transition-all duration-200 text-sm ${
            isFormValid
              ? "bg-blue-600 text-white hover:bg-blue-700"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}
        >
          {isEdit ? "Guardar Cambios" : "Crear Blog"}
        </button>
      </div>
    </div>
  );
};

export default ActionButtons;