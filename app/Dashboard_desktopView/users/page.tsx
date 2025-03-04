"use client";
import { useState } from "react";

export default function ChangeUserRole() {
  const [email, setEmail] = useState("");
  const [newRole, setNewRole] = useState("");
  const [message, setMessage] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    try {
      const response = await fetch("/api/updateRole", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email, // Enviamos el correo en vez del ID
          newRole,
        }),
      });

      const data = await response.json();
      if (response.ok) {
        setMessage(`✅ Rol actualizado con éxito: ${newRole}`);
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage("❌ Error al conectar con el servidor");
      console.error(error);
    }
  };

  return (
    <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg">
      <h2 className="text-xl font-arsenal mb-4">Cambiar Rol de Usuario</h2>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        {/* Campo para el correo del usuario */}
        <label className="flex flex-col">
          <span className="font-semibold">Correo del Usuario:</span>
          <input
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Ejemplo: usuario@example.com"
            className="border p-2 rounded"
            required
          />
        </label>

        {/* Selector de Rol */}
        <label className="flex flex-col">
          <span className="font-semibold">Nuevo Rol:</span>
          <select
            value={newRole}
            onChange={(e) => setNewRole(e.target.value)}
            className="border p-2 rounded"
            required
          >
            <option value="">Selecciona un rol</option>
            <option value="lens_admin">Administrador</option>
            <option value="user">Usuario</option>
          </select>
        </label>

        {/* Botón de Enviar */}
        <button
          type="submit"
          className="bg-black text-white p-2 rounded hover:bg-blue-700 transition font-arsenal"
        >
          Cambiar Rol
        </button>
      </form>

      {/* Mensaje de estado */}
      {message && <p className="mt-4 text-center">{message}</p>}
    </div>
  );
}
