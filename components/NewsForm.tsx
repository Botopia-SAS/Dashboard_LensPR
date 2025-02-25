"use client";
import React, { useState } from "react";

const NewsForm = () => {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    editorial: "",
  });
  const [file, setFile] = useState<File | null>(null);
  const [imageUrl, setImageUrl] = useState("");
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

    let uploadedImageUrl = "";

    // Si hay una imagen seleccionada, subirla primero a Cloudinary
    if (file) {
      const formDataImage = new FormData();
      formDataImage.append("file", file);
      formDataImage.append("upload_preset", "your_upload_preset"); // Reemplázalo con tu preset de Cloudinary

      const res = await fetch(
        "https://api.cloudinary.com/v1_1/YOUR_CLOUD_NAME/image/upload",
        {
          method: "POST",
          body: formDataImage,
        }
      );

      const data = await res.json();
      if (data.secure_url) {
        uploadedImageUrl = data.secure_url;
        setImageUrl(data.secure_url);
      } else {
        alert("Error al subir la imagen");
        setLoading(false);
        return;
      }
    }

    // Agregar la URL de la imagen a los datos antes de enviarlos a Supabase
    const fullData = { ...formData, image_url: uploadedImageUrl };

    const response = await fetch("/api/addNews", {
      method: "POST",
      body: new FormData(),
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
      setImageUrl("");
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
      {imageUrl && (
        <img src={imageUrl} alt="Uploaded" className="mb-2 max-w-xs" />
      )}

      <button
        type="submit"
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Subiendo..." : "Agregar"}
      </button>
    </form>
  );
};

export default NewsForm;
