"use client";
import React from "react";
import TextareaAutosize from "react-textarea-autosize";

interface LanguageData {
  name: string;
  country: string;
  job_title: string;
  description: string;
}

interface FormComponentProps {
  title: string;
  formData: {
    name: string;
    country: string;
    job_title: string;
    description: string;
  };
  onChange: (field: keyof LanguageData, value: string) => void;
}

const FormComponent: React.FC<FormComponentProps> = ({
  title,
  formData,
  onChange,
}) => {
  // Array de campos a recorrer
  const fields = [
    { label: "Nombre", key: "name" },
    { label: "País", key: "country" },
    { label: "Título del trabajo", key: "job_title" },
    { label: "Descripción", key: "description" },
  ] as const;

  return (
    <div className="p-4 border rounded-lg mb-4">
      <h2 className="text-xl font-arsenal mb-2">{title}</h2>

      {fields.map(({ label, key }) => {
        // Manejo de placeholder y value para ambos casos
        const placeholder = `${label} en ${title}`;
        const value = formData[key];

        // Si es "description", usamos <TextareaAutosize>, si no, <input>
        if (key === "description") {
          return (
            <TextareaAutosize
              key={key}
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(key, e.target.value)}
              className="
                block w-full mb-2 p-2 border 
                resize-none  /* deshabilita el arrastre manual */
                overflow-hidden
              "
              minRows={3} // Mínimo de líneas
            />
          );
        } else {
          return (
            <input
              key={key}
              type="text"
              placeholder={placeholder}
              value={value}
              onChange={(e) => onChange(key, e.target.value)}
              className="block w-full mb-2 p-2 border"
            />
          );
        }
      })}
    </div>
  );
};

export default FormComponent;
