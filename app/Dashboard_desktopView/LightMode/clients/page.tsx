"use client";
import { useState } from "react";

const Header = ({
  onLanguageChange,
}: {
  onLanguageChange: (lang: string) => void;
}) => {
  const [selectedLanguage, setSelectedLanguage] = useState("Español");

  const languages = ["Español", "Inglés", "Portugués"];

  const handleChange = (lang: string) => {
    setSelectedLanguage(lang);
    onLanguageChange(lang); // Envía el idioma seleccionado a la página
  };

  return (
    <div className="border-b border-black px-6 py-3">
      <div className="flex gap-4">
        {languages.map((lang) => (
          <button
            key={lang}
            className={`px-4 py-2 rounded-md font-arsenal ${
              selectedLanguage === lang ? "bg-gray-200" : ""
            }`}
            onClick={() => handleChange(lang)}
          >
            {lang}
          </button>
        ))}
      </div>
    </div>
  );
};

export default Header;
