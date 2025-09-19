"use client";
import React, { useState } from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faTimes, faPlus } from "@fortawesome/free-solid-svg-icons";

interface TagsEditorProps {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
}

const TagsEditor: React.FC<TagsEditorProps> = ({ tags, onTagsChange }) => {
  const [newTag, setNewTag] = useState("");

  const handleAddTag = () => {
    if (newTag.trim() && !tags.includes(newTag.trim())) {
      onTagsChange([...tags, newTag.trim()]);
      setNewTag("");
    }
  };

  const handleRemoveTag = (index: number) => {
    const newTags = tags.filter((_, i) => i !== index);
    onTagsChange(newTags);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && newTag.trim()) {
      e.preventDefault();
      handleAddTag();
    }
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        Tags
      </label>
      <div className="flex flex-wrap gap-2 mb-3">
        {tags.map((tag, index) => (
          <span
            key={index}
            className="inline-flex items-center px-2 py-1 rounded-md text-xs bg-gray-100 text-gray-800 border border-gray-200"
          >
            {tag}
            <button
              type="button"
              onClick={() => handleRemoveTag(index)}
              className="ml-2 text-gray-500 hover:text-gray-700 transition-colors"
            >
              <FontAwesomeIcon icon={faTimes} className="text-xs" />
            </button>
          </span>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
          placeholder="Agregar nuevo tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button
          type="button"
          onClick={handleAddTag}
          className="px-3 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors flex items-center text-sm"
        >
          <FontAwesomeIcon icon={faPlus} className="mr-2" />
          Agregar
        </button>
      </div>
    </div>
  );
};

export default TagsEditor;