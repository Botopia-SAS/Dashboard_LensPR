"use client";
import { useEffect, useState } from "react";
import ClientCard from "./ClientCard";
import ClientsForm from "./forms/clientsForms/ClientsForm";
import { ClientData } from "@/types/clients"; // ajusta la ruta según tu estructura

export default function ClientsDashboard() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);

  // Para editar, podríamos reutilizar ClientsForm o usar algo aparte
  const [editingClient, setEditingClient] = useState<null | {
    client: ClientData;
    lang: string;
  }>(null);

  const fetchClients = async () => {
    try {
      const res = await fetch("/api/getClients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetchClients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Deseas eliminar este cliente?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/deleteClient", {
        method: "DELETE",
        body: JSON.stringify({ id }),
        headers: { "Content-Type": "application/json" },
      });

      if (res.ok) {
        alert("Cliente eliminado con éxito");
        fetchClients();
      } else {
        const result = await res.json();
        alert(`Error al eliminar: ${result.error}`);
      }
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  const handleEdit = (client: ClientData, lang: string) => {
    // Aquí decides cómo abrir el formulario de edición
    setEditingClient({ client, lang });
    setShowForm(true);
  };

  const filteredClients = clients.filter((client) => {
    // Filtramos en base a name_spanish, name_english, etc.
    // solo un ejemplo con name_spanish
    return client.name_spanish
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  return (
    <div className="p-6">
      <h1 className="text-3xl font-arsenal mb-4">Dashboard de Clientes</h1>

      {/* Barra de búsqueda */}
      <input
        type="text"
        placeholder="Buscar cliente..."
        className="border p-2 mb-4 w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      {/* Botón de agregar */}
      <button
        onClick={() => {
          setEditingClient(null); // Para no cargar nada en edición
          setShowForm((prev) => !prev);
        }}
        className="bg-green-600 text-white px-4 py-2 rounded-full mb-4 flex items-center"
      >
        <span className="mr-2 text-xl font-bold">+</span> Agregar Cliente
      </button>

      {/* Mostrar/ocultar formulario de creación/edición */}
      {showForm && (
        <div className="mb-6 border p-4 rounded">
          <ClientsForm language="Español" />
        </div>
      )}

      {/* Grid de tarjetas */}
      <div className="grid gap-4 sm:grid-cols-2 md:grid-cols-3">
        {filteredClients.map((client) => (
          <ClientCard
            key={client.id}
            client={client}
            onDelete={handleDelete}
            onEdit={handleEdit}
          />
        ))}
      </div>
    </div>
  );
}
