"use client";
import React from "react";
import { BlogLanguageKey, LanguageDataBlog } from "../../../types/blogs";
import RichTextEditor from "@/components/ui/RichTextEditor";
import CategorySelector from "./CategorySelector";
import TagsEditor from "./TagsEditor";

interface ContentEditorProps {
  selectedLanguage: BlogLanguageKey;
  languageData: LanguageDataBlog;
  onFieldChange: (field: keyof LanguageDataBlog, value: string | string[]) => void;
}

const ContentEditor: React.FC<ContentEditorProps> = ({
  selectedLanguage,
  languageData,
  onFieldChange,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Contenido en {selectedLanguage}</h3>

      <div className="space-y-6">
        {/* Título */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Título *
          </label>
          <input
            type="text"
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors"
            value={languageData.title || ""}
            onChange={(e) => onFieldChange("title", e.target.value)}
            placeholder="Ingresa el título del blog..."
          />
        </div>

        {/* Excerpt */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Excerpt / Resumen *
          </label>
          <textarea
            className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors resize-none"
            rows={3}
            value={languageData.excerpt || ""}
            onChange={(e) => onFieldChange("excerpt", e.target.value)}
            placeholder="Escribe un resumen atractivo del contenido..."
          />
        </div>

        {/* Categoría */}
        <CategorySelector
          selectedLanguage={selectedLanguage}
          category={languageData.category || ""}
          onCategoryChange={(category) => onFieldChange("category", category)}
        />

        {/* Tags */}
        <TagsEditor
          tags={languageData.tags || []}
          onTagsChange={(tags) => onFieldChange("tags", tags)}
        />

        {/* Contenido */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Contenido *
          </label>
          <RichTextEditor
            value={languageData.content || ""}
            onChange={(html) => onFieldChange("content", html)}
            placeholder="Escribe el contenido con formato rico..."
            minHeight={400}
          />
        </div>
      </div>
    </div>
  );
};

export default ContentEditor;