"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";

interface ImagePreviewProps {
  imageUrl: string | null;
  altText: string;
  successMessage: string;
  onImageChange: () => void;
}

const ImagePreview: React.FC<ImagePreviewProps> = ({
  imageUrl,
  altText,
  successMessage,
  onImageChange,
}) => {
  if (imageUrl) {
    return (
      <div className="relative group">
        <img
          src={imageUrl}
          alt={altText}
          className="w-full h-48 object-cover rounded-lg border border-gray-200"
        />
        <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity rounded-lg">
          <button
            type="button"
            onClick={onImageChange}
            className="px-4 py-2 bg-white text-gray-900 rounded-lg font-medium flex items-center gap-2 hover:bg-gray-100 transition-colors"
          >
            <FontAwesomeIcon icon={faImage} />
            Cambiar imagen
          </button>
        </div>
        <div className="mt-2 p-2 bg-green-50 border border-green-200 rounded text-sm text-green-800">
          ✅ {successMessage}
        </div>
      </div>
    );
  }

  return null;
};

export default ImagePreview;