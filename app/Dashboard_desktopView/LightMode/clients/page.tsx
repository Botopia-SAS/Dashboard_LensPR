"use client";
import React, { useState } from "react";

const ClientForm = () => {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    country: "",
    job_title: "",
    description: "",
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
    formDataToSend.append("name", formData.name);
    formDataToSend.append("email", formData.email);
    formDataToSend.append("country", formData.country);
    formDataToSend.append("job_title", formData.job_title);
    formDataToSend.append("description", formData.description);

    if (file) {
      formDataToSend.append("file", file);
    }

    const response = await fetch("/api/addClient", {
      method: "POST",
      body: formDataToSend,
    });

    const result = await response.json();
    console.log("Respuesta del servidor:", result);

    if (response.ok) {
      alert("Cliente agregado con éxito");
      setFormData({
        name: "",
        email: "",
        country: "",
        job_title: "",
        description: "",
      });
      setFile(null);
    } else {
      alert(`Error al agregar el cliente: ${result.error}`);
    }
    setLoading(false);
  };

  return (
    <form onSubmit={handleSubmit} className="p-4 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Agregar Cliente</h1>

      <input
        type="text"
        name="name"
        placeholder="Nombre"
        value={formData.name}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border"
      />
      <input
        type="email"
        name="email"
        placeholder="Email"
        value={formData.email}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border"
      />
      <input
        type="text"
        name="country"
        placeholder="País"
        value={formData.country}
        onChange={handleChange}
        className="block w-full mb-2 p-2 border"
      />
      <input
        type="text"
        name="job_title"
        placeholder="Puesto"
        value={formData.job_title}
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
        {loading ? "Subiendo..." : "Agregar Cliente"}
      </button>
    </form>
  );
};

export default ClientForm;
