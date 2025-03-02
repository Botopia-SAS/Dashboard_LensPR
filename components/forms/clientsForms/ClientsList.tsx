"use client";
import { useState, useEffect } from "react";

interface Client {
  id: string;
  name_spanish: string;
  country_spanish: string;
  job_title_spanish: string;
  description_spanish: string;
  media_url: string;
}

const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [editingClient, setEditingClient] = useState<Client | null>(null);

  useEffect(() => {
    fetchClients();
  }, []);

  const fetchClients = async () => {
    const res = await fetch("/api/clients/getClients");
    const data = await res.json();
    setClients(data);
  };

  const handleEdit = (client: Client) => {
    setEditingClient(client);
  };

  const handleSave = async () => {
    if (!editingClient) return;

    const res = await fetch("/api/clients/updateClient", {
      method: "POST",
      body: JSON.stringify(editingClient),
      headers: { "Content-Type": "application/json" },
    });

    if (res.ok) {
      alert("Cliente actualizado con éxito");
      fetchClients();
      setEditingClient(null);
    } else {
      alert("Error al actualizar cliente");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-arsenal mb-6">Lista de Clientes</h1>

      <table className="min-w-full bg-white border border-gray-200">
        <thead>
          <tr className="bg-gray-100">
            <th className="border px-4 py-2">Nombre</th>
            <th className="border px-4 py-2">País</th>
            <th className="border px-4 py-2">Título</th>
            <th className="border px-4 py-2">Descripción</th>
            <th className="border px-4 py-2">Imagen</th>
            <th className="border px-4 py-2">Acciones</th>
          </tr>
        </thead>
        <tbody>
          {clients.map((client) => (
            <tr key={client.id} className="text-center font-arsenal">
              <td className="border px-4 py-2">
                {editingClient?.id === client.id ? (
                  <input
                    type="text"
                    value={editingClient.name_spanish}
                    onChange={(e) =>
                      setEditingClient({
                        ...editingClient,
                        name_spanish: e.target.value,
                      })
                    }
                    className="border px-2 py-1"
                  />
                ) : (
                  client.name_spanish
                )}
              </td>
              <td className="border px-4 py-2">{client.country_spanish}</td>
              <td className="border px-4 py-2">{client.job_title_spanish}</td>
              <td className="border px-4 py-2">{client.description_spanish}</td>
              <td className="border px-4 py-2">
                <img
                  src={client.media_url}
                  alt="Cliente"
                  className="w-16 h-16 object-cover"
                />
              </td>
              <td className="border px-4 py-2">
                {editingClient?.id === client.id ? (
                  <button
                    onClick={handleSave}
                    className="bg-green-500 text-white px-4 py-2 rounded-md font-arsenal"
                  >
                    Guardar
                  </button>
                ) : (
                  <button
                    onClick={() => handleEdit(client)}
                    className="bg-blue-500 text-white px-4 py-2 rounded-md font-arsenal"
                  >
                    Editar
                  </button>
                )}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default ClientsList;
