"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faImage } from "@fortawesome/free-solid-svg-icons";
import FileUpload from "../../ui/FileUpload";
import ImagePreview from "./ImagePreview";

interface ImageUploaderProps {
  title: string;
  subtitle?: string;
  imageUrl?: string;
  onImageUpload: (file: File) => Promise<void>;
  required?: boolean;
}

const ImageUploader: React.FC<ImageUploaderProps> = ({
  title,
  subtitle,
  imageUrl,
  onImageUpload,
  required = false,
}) => {
  const handleFileUpload = (file: File) => {
    onImageUpload(file);
  };

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2">
        {title} {required && "*"}
      </label>

      {imageUrl ? (
        <ImagePreview
          imageUrl={imageUrl}
          altText={title}
          successMessage={`${title} cargada`}
          onImageChange={() => {
            // Create file input click handler
            const fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = "image/*";
            fileInput.onchange = (e) => {
              const target = e.target as HTMLInputElement;
              const file = target.files?.[0];
              if (file) {
                handleFileUpload(file);
              }
            };
            fileInput.click();
          }}
        />
      ) : (
        <FileUpload onFileUpload={handleFileUpload}>
          <div className="flex flex-col items-center">
            <FontAwesomeIcon icon={faImage} className="text-3xl text-gray-400 mb-2" />
            <button
              type="button"
              className="text-blue-600 hover:text-blue-800 font-medium"
            >
              Subir {title.toLowerCase()}
            </button>
            {subtitle && (
              <p className="text-xs text-gray-500 mt-2">{subtitle}</p>
            )}
          </div>
        </FileUpload>
      )}
    </div>
  );
};

export default ImageUploader;