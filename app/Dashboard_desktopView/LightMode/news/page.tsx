"use client";
import React, { useState } from "react";

const NewsForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    editorial: "",
  });

  const [file, setFile] = useState<File | null>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const formDataToSend = new FormData();
    formDataToSend.append("title", formData.title);
    formDataToSend.append("description", formData.description);
    formDataToSend.append("editorial", formData.editorial);

    if (file) {
      formDataToSend.append("file", file);
    }

    const response = await fetch("/api/addNews", {
      method: "POST",
      body: formDataToSend,
    });

    const result = await response.json();
    console.log("Respuesta del servidor:", result);

    if (response.ok) {
      alert("Noticia agregada con éxito");
      setFormData({
        title: "",
        description: "",
        editorial: "",
      });
      setFile(null);
    } else {
      alert(`Error al agregar la noticia: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Agregar Noticia</h1>

      <input
        type="text"
        name="title"
        placeholder="Título"
        value={formData.title}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border"
      />
      <textarea
        name="description"
        placeholder="Descripción"
        value={formData.description}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border"
      ></textarea>
      <input
        type="text"
        name="editorial"
        placeholder="Editorial"
        value={formData.editorial}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border"
      />

      {/* Input para la imagen */}
      <input
        type="file"
        onChange={handleFileChange}
        className="block w-full mb-2 p-2 border"
      />

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Subiendo..." : "Agregar Noticia"}
      </button>
    </form>
  );
};

export default NewsForm;
