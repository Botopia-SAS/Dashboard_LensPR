"use client";
import React from "react";
import { BlogLanguageKey } from "../../../types/blogs";

interface SEOSettingsProps {
  selectedLanguage: BlogLanguageKey;
  metaTitle: string;
  metaDescription: string;
  onMetaTitleChange: (metaTitle: string) => void;
  onMetaDescriptionChange: (metaDescription: string) => void;
}

const SEOSettings: React.FC<SEOSettingsProps> = ({
  selectedLanguage,
  metaTitle,
  metaDescription,
  onMetaTitleChange,
  onMetaDescriptionChange,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">SEO en {selectedLanguage}</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Title
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
            value={metaTitle || ""}
            onChange={(e) => onMetaTitleChange(e.target.value)}
            placeholder="Título optimizado para SEO..."
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Meta Description
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none text-sm"
            rows={3}
            value={metaDescription || ""}
            onChange={(e) => onMetaDescriptionChange(e.target.value)}
            placeholder="Descripción que aparecerá en los resultados de búsqueda..."
          />
        </div>
      </div>
    </div>
  );
};

export default SEOSettings;