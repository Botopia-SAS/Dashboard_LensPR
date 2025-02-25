"use client";
import { useState } from "react";

export default function UploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [name, setName] = useState(""); // Nuevo campo para el nombre
  const [imageUrl, setImageUrl] = useState("");
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return;
    setLoading(true);

    const formData = new FormData();
    formData.append("file", file);
    formData.append("name", name); // Enviar nombre del usuario

    const res = await fetch("/api/upload", {
      method: "POST",
      body: formData,
    });

    const data = await res.json();
    setLoading(false);

    if (data.url) {
      setImageUrl(data.url);
      alert("Imagen subida y guardada con éxito en Supabase");
    } else {
      alert(`Error: ${data.error}`);
    }
  };

  return (
    <div className="p-4 border rounded-lg">
      <h1 className="text-2xl font-bold mb-4">Subir Imagen</h1>

      <input
        type="text"
        placeholder="Nombre del usuario"
        value={name}
        onChange={(e) => setName(e.target.value)}
        className="block w-full mb-2 p-2 border"
      />

      <input
        type="file"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="block w-full mb-2 p-2 border"
      />

      <button
        onClick={handleUpload}
        disabled={loading}
        className="bg-blue-500 text-white px-4 py-2 rounded-md"
      >
        {loading ? "Subiendo..." : "Subir"}
      </button>

      {imageUrl && (
        <div className="mt-4">
          <p>Imagen subida:</p>
          <img src={imageUrl} alt="Uploaded" className="max-w-xs" />
        </div>
      )}
    </div>
  );
}
