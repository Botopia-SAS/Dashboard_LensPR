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