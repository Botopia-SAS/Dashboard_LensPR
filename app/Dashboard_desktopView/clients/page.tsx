"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ClientsForm from "@/components/forms/clientsForms/ClientsForm";
import ClientsCard from "@/components/forms/clientsForms/ClientCard";
import { ClientsRecord } from "@/types/clients";

export default function ClientsPage() {
  const [clients, setClients] = useState<ClientsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientsRecord | null>(
    null
  );

  // Obtener lista
  const fetchClients = async () => {
    try {
      const res = await fetch("/api/clients/getClients");
      if (!res.ok) throw new Error("Error al obtener clients");
      const data = await res.json();
      setClients(data);
    } catch (error) {
      console.error("Error fetchClients:", error);
    }
  };

  useEffect(() => {
    fetchClients();
  }, []);

  // Filtrar por name_spanish
  const filteredClients = clients.filter((c) =>
    c.name_spanish?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear
  const handleCreate = () => {
    setEditingClient(null);
    setShowModal(true);
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Deseas eliminar este cliente?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/clients/deleteClient", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert(`Error al eliminar cliente: ${result.error}`);
        return;
      }
      alert("Cliente eliminado con éxito");
      fetchClients();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Editar
  const handleEdit = (item: ClientsRecord) => {
    setEditingClient(item);
    setShowModal(true);
  };

  // Guardar
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleFormSubmit = async (formData: any, isEdit: boolean) => {
    try {
      if (!isEdit) {
        // Crear
        const response = await fetch("/api/clients/addClient", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const result = await response.json();
          alert(`Error al crear cliente: ${result.error}`);
          return;
        }
        alert("Cliente creado con éxito");
      } else {
        // Editar
        if (!editingClient)
          return alert("No se encontró el cliente para editar");
        const id = editingClient.id;

        const response = await fetch("/api/clients/updateClient", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id }),
        });
        if (!response.ok) {
          const result = await response.json();
          alert(`Error al editar cliente: ${result.error}`);
          return;
        }
        alert("Cliente actualizado con éxito");
      }
      setShowModal(false);
      setEditingClient(null);
      fetchClients();
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  // Mapeo para el form
  const mapRecordToFormData = (record: ClientsRecord) => {
    return {
      Español: {
        name: record.name_spanish || "",
        job_title: record.job_title_spanish || "",
        description: record.description_spanish || "",
      },
      Inglés: {
        name: record.name_english || "",
        job_title: record.job_title_english || "",
        description: record.description_english || "",
      },
      Portugués: {
        name: record.name_portuguese || "",
        job_title: record.job_title_portuguese || "",
        description: record.description_portuguese || "",
      },
      media_url: record.media_url || "",
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-arsenal mb-4">Gestión de Clientes</h1>

      <input
        type="text"
        placeholder="Buscar cliente (Español)..."
        className="border p-2 mb-4 w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded-full mb-4 flex items-center font-arsenal"
      >
        <span className="mr-2 text-xl font-arsenal">+</span> Agregar Cliente
      </button>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingClient(null);
        }}
      >
        <ClientsForm
          initialData={
            editingClient ? mapRecordToFormData(editingClient) : undefined
          }
          onSubmit={handleFormSubmit}
        />
      </Modal>

      {/* Listado con 1 item por fila */}
      <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
        {filteredClients.map((item) => (
          <ClientsCard
            key={item.id}
            clientItem={item}
            onDelete={handleDelete}
            onEdit={(item) => handleEdit(item)} // pasamos la misma función
          />
        ))}
      </div>
    </div>
  );
}
