"use client";
import React from "react";

interface GeneralSettingsProps {
  slug: string;
  canonicalUrl?: string;
  onSlugChange: (slug: string) => void;
  onCanonicalUrlChange: (url: string) => void;
}

const GeneralSettings: React.FC<GeneralSettingsProps> = ({
  slug,
  canonicalUrl,
  onSlugChange,
  onCanonicalUrlChange,
}) => {
  const handleSlugChange = (value: string) => {
    const normalized = value
      .toLowerCase()
      .normalize("NFD")
      .replace(/\p{Diacritic}/gu, "")
      .replace(/[^a-z0-9-\s]/g, "")
      .trim()
      .replace(/\s+/g, "-");
    onSlugChange(normalized);
  };

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración General</h3>
      <div className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Slug (URL) *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
            value={slug}
            onChange={(e) => handleSlugChange(e.target.value)}
            placeholder="mi-articulo-super-interesante"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Canonical URL (opcional)
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
            value={canonicalUrl || ""}
            onChange={(e) => onCanonicalUrlChange(e.target.value)}
            placeholder="https://dominio.com/blog/mi-articulo"
          />
        </div>
      </div>
    </div>
  );
};

export default GeneralSettings;