"use client";
import { useEffect, useState } from "react";
import ClientCard from "./ClientCard";
import ClientsForm from "./forms/clientsForms/ClientsForm";
import { ClientData } from "@/types/clients"; // ajusta la ruta según tu estructura
import Modal from "@/components/ui/Modal"; // Ajusta la ruta a donde creaste Modal

export default function ClientsDashboard() {
  const [clients, setClients] = useState<ClientData[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showForm, setShowForm] = useState(false);
  const [showModal, setShowModal] = useState(false);

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
    setShowModal(true); // Abro el modal
  };

  const openCreateForm = () => {
    // Vamos a crear un cliente nuevo => no hay editingClient
    setEditingClient(null);
    setShowModal(true);
  };

  const filteredClients = clients.filter((client) => {
    // Filtramos en base a name_spanish, name_english, etc.
    // solo un ejemplo con name_spanish
    return client.name_spanish
      ?.toLowerCase()
      .includes(searchTerm.toLowerCase());
  });

  // Manejo de "onSubmit" en el formulario
  const handleFormSubmit = async (formData: any, isEdit: boolean) => {
    try {
      if (!isEdit) {
        // es creación
        const response = await fetch("/api/addClient", {
          method: "POST",
          body: JSON.stringify(formData),
          headers: { "Content-Type": "application/json" },
        });
        if (response.ok) {
          alert("Cliente creado con éxito");
          setShowModal(false);
          fetchClients(); // recarga la lista
        } else {
          const result = await response.json();
          alert(`Error al crear: ${result.error}`);
        }
      } else {
        // es edición
        // Para actualizar, seguramente necesites el ID del cliente
        // y un endpoint /api/updateClient que acepte la data

        // formData no incluye el ID por defecto, podrías meterlo en initialData
        // o en el "editingClient". Ejemplo rápido:
        const id = editingClient?.client.id;
        if (!id) return alert("No se encontró ID para editar");

        const dataToUpdate = { ...formData, id };
        const response = await fetch("/api/updateClient", {
          method: "PATCH",
          body: JSON.stringify(dataToUpdate),
          headers: { "Content-Type": "application/json" },
        });

        if (response.ok) {
          alert("Cliente actualizado con éxito");
          setShowModal(false);
          fetchClients();
        } else {
          const result = await response.json();
          alert(`Error al actualizar: ${result.error}`);
        }
      }
    } catch (error) {
      console.error(error);
      alert("Ocurrió un error en la conexión");
    }
  };

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
          setShowModal(true); // o setShowForm(true), según tu implementación
        }}
        className="
        +   bg-black text-white px-4 py-2 rounded-full mb-4 flex items-center
        +   transition-all duration-300 ease-in-out
        +   hover:bg-white hover:text-black hover:shadow-md
        +   active:scale-95
        + "
      >
        <span className="mr-2 text-xl font-bold">+</span> Agregar Cliente
      </button>

      {/* === MODAL que muestra EITHER el formulario de crear O de editar === */}
      <Modal isOpen={showModal} onClose={() => setShowModal(false)}>
        <ClientsForm
          language={editingClient?.lang || "Español"}
          // si hay editingClient, pasamos su data como initialData
          initialData={
            editingClient
              ? {
                  Español: {
                    name: editingClient.client.name_spanish || "",
                    country: editingClient.client.country_spanish || "",
                    job_title: editingClient.client.job_title_spanish || "",
                    description: editingClient.client.description_spanish || "",
                  },
                  Inglés: {
                    name: editingClient.client.name_english || "",
                    country: editingClient.client.country_english || "",
                    job_title: editingClient.client.job_title_english || "",
                    description: editingClient.client.description_english || "",
                  },
                  Portugués: {
                    name: editingClient.client.name_portuguese || "",
                    country: editingClient.client.country_portuguese || "",
                    job_title: editingClient.client.job_title_portuguese || "",
                    description:
                      editingClient.client.description_portuguese || "",
                  },
                  media_url: editingClient.client.media_url || "",
                }
              : undefined
          }
          onSubmit={handleFormSubmit}
        />
      </Modal>

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
