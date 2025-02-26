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
      <h2 className="text-xl font-bold mb-2">{title}</h2>

      {(["name", "country", "job_title", "description"] as const).map(
        (field) => (
          <input
            key={field}
            type="text"
            placeholder={`${field} en ${title}`}
            value={formData[field as keyof typeof formData]}
            onChange={(e) => onChange(field, e.target.value)} // ✅ Tipo corregido
            className="block w-full mb-2 p-2 border"
          />
        )
      )}
    </div>
  );
};

export default FormComponent;
