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
  const [loading, setLoading] = useState(false);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    const response = await fetch("/api/addClient", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
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
        placeholder="Correo Electrónico"
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
        placeholder="Cargo"
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

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Enviando..." : "Agregar Cliente"}
      </button>
    </form>
  );
};

export default ClientForm;
