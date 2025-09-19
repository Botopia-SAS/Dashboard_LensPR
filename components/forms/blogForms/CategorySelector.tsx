"use client";
import React, { useState } from "react";
import { BlogLanguageKey, BLOG_CATEGORIES } from "../../../types/blogs";

interface CategorySelectorProps {
  selectedLanguage: BlogLanguageKey;
  category: string;
  onCategoryChange: (category: string) => void;
}

const CategorySelector: React.FC<CategorySelectorProps> = ({
  selectedLanguage,
  category,
  onCategoryChange,
}) => {
  const [customCategory, setCustomCategory] = useState("");

  const handleCustomCategorySubmit = () => {
    if (customCategory.trim()) {
      onCategoryChange(customCategory.trim());
      setCustomCategory("");
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      handleCustomCategorySubmit();
    }
  };

  const getLangKey = (): "es" | "en" | "pt" => {
    return selectedLanguage === "Español"
      ? "es"
      : selectedLanguage === "Inglés"
      ? "en"
      : "pt";
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Categoría *
      </label>
      <div className="space-y-2 md:flex md:gap-2 md:space-y-0">
        <select
          className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
          value={category}
          onChange={(e) => onCategoryChange(e.target.value)}
        >
          <option value="">-- Selecciona una categoría --</option>
          {Object.values(BLOG_CATEGORIES).map((cat, index) => {
            const langKey = getLangKey();
            return (
              <option key={index} value={cat[langKey]}>
                {cat[langKey]}
              </option>
            );
          })}
        </select>
        <input
          type="text"
          className="w-full md:flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
          placeholder="O escribe una categoría personalizada..."
          value={customCategory}
          onChange={(e) => setCustomCategory(e.target.value)}
          onKeyDown={handleKeyDown}
        />
      </div>
    </div>
  );
};

export default CategorySelector;