"use client";
import React from "react";

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
  onChange: (field: keyof LanguageData, value: string) => void; // ✅ Tipo corregido
}

const FormComponent: React.FC<FormComponentProps> = ({
  title,
  formData,
  onChange,
}) => {
  return (
    <div className="p-4 border rounded-lg mb-4">
      <h2 className="text-xl font-arsenal mb-2">{title}</h2>

      {(
        [
          { label: "Nombre", key: "name" },
          { label: "País", key: "country" },
          { label: "Título del trabajo", key: "job_title" },
          { label: "Descripción", key: "description" },
        ] as const
      ).map(({ label, key }) => (
        <input
          key={key}
          type="text"
          placeholder={`${label} en ${title}`}
          value={formData[key]}
          onChange={(e) => onChange(key, e.target.value)}
          className="block w-full mb-2 p-2 border"
        />
      ))}
    </div>
  );
};

export default FormComponent;
