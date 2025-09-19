"use client";
import React from "react";
import { BlogLanguageKey } from "../../../types/blogs";

interface LanguageSelectorProps {
  selectedLanguage: BlogLanguageKey;
  onLanguageChange: (language: BlogLanguageKey) => void;
}

const LanguageSelector: React.FC<LanguageSelectorProps> = ({
  selectedLanguage,
  onLanguageChange,
}) => {
  const languages: BlogLanguageKey[] = ["Español", "Inglés", "Portugués"];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className="text-sm font-medium text-gray-900 mb-3">Idioma</h3>
      <div className="flex flex-wrap gap-1">
        {languages.map((lang) => (
          <button
            key={lang}
            onClick={() => onLanguageChange(lang)}
            className={`px-3 py-2 text-sm font-medium rounded-md transition-colors duration-200 ${
              selectedLanguage === lang
                ? "bg-gray-600 text-white"
                : "text-gray-700 hover:bg-gray-100 border border-gray-300"
            }`}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default LanguageSelector;