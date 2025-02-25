"use client";
import React, { useState } from "react";

interface FormComponentProps {
  fields: {
    name: string;
    type: string;
    placeholder: string;
    value?: string;
    onChange?: (
      e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
    ) => void;
  }[];
  apiEndpoint: string;
  title: string;
  file?: File | null;
  onFileChange?: (event: React.ChangeEvent<HTMLInputElement>) => void;
}

const FormComponent: React.FC<FormComponentProps> = ({
  fields,
  apiEndpoint,
  title,
  file,
  onFileChange,
}) => {
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    fields.forEach((field) => {
      formDataToSend.append(field.name, field.value || "");
    });

    if (file) {
      formDataToSend.append("file", file);
    }

    const response = await fetch(apiEndpoint, {
      method: "POST",
      body: formDataToSend,
    });

    const result = await response.json();
    console.log("Respuesta del servidor:", result);

    if (response.ok) {
      alert(`${title} agregado con éxito`);
    } else {
      alert(`Error al agregar ${title}: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">{title}</h1>

      {fields.map((field) => (
        <input
          key={field.name}
          type={field.type}
          name={field.name}
          placeholder={field.placeholder}
          value={field.value}
          onChange={field.onChange}
          className="block w-full mb-2 p-2 border"
        />
      ))}

      {/* Input para la imagen */}
      <input
        type="file"
        onChange={onFileChange}
        className="block w-full mb-2 p-2 border"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Subiendo..." : `Agregar ${title}`}
      </button>
    </form>
  );
};

export default FormComponent;
