"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import ClientsForm from "@/components/forms/clientsForms/ClientsForm";
import ClientsCard from "@/components/forms/clientsForms/ClientCard";
import { ClientsRecord } from "@/types/clients";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

export default function ClientsPage() {
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga
  const [clients, setClients] = useState<ClientsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingClient, setEditingClient] = useState<ClientsRecord | null>(
    null
  );

  // Obtener lista
  const fetchClients = async () => {
    setIsLoading(true); // Inicia la carga
    try {
      const res = await fetch("/api/clients/getClients");
      if (!res.ok) throw new Error("Error al obtener clientes");
      const data: ClientsRecord[] = await res.json(); // 👈 Aquí definimos explícitamente el tipo

      // Ordenar clientes por el campo `order` (ascendente, los de menor número aparecen primero)
      setClients(
        data.sort(
          (a: ClientsRecord, b: ClientsRecord) =>
            a.order_number - b.order_number
        )
      );
    } catch (error) {
      console.error("Error fetchClients:", error);
    } finally {
      setIsLoading(false);
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

  const handleEdit = (item: ClientsRecord) => {
    console.log("Item recibido en handleEdit:", item);
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
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = async (result: any) => {
    if (!result.destination) return;

    const updatedClients = [...clients];
    const [movedItem] = updatedClients.splice(result.source.index, 1);
    updatedClients.splice(result.destination.index, 0, movedItem);

    // Reasignar orden
    const reorderedClients = updatedClients.map((client, index) => ({
      ...client,
      order_number: index, // 👈 Asegura que el `order_number` es un número
    }));

    console.log("📌 Nuevo orden en el estado:", reorderedClients); // 🔍 Verifica si se actualiza correctamente

    setClients(reorderedClients);

    try {
      const response = await fetch("/api/clients/updateClientOrder", {
        // ✅ Asegura que la ruta es correcta
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(reorderedClients),
      });

      const result = await response.json();
      console.log("📨 Respuesta del servidor:", result); // 🔍 Verifica si la API responde correctamente
    } catch (error) {
      console.error("❌ Error actualizando orden:", error);
    }
  };

  return (
    <div className="p-6 bg-white">
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
        className="bg-black text-white px-4 py-2 rounded-lg mb-4 flex items-center font-arsenal"
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

      {isLoading ? (
        <div className="flex flex-col justify-center items-center min-h-[200px]">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="3x"
            className="text-gray-500"
          />
          <p className="text-gray-500 mt-2 font-arsenal">Cargando datos...</p>
        </div>
      ) : (
        <DragDropContext onDragEnd={handleDragEnd}>
          <Droppable droppableId="clients-list">
            {(provided) => (
              <div ref={provided.innerRef} {...provided.droppableProps}>
                {filteredClients.map((item, index) => (
                  <Draggable key={item.id} draggableId={item.id} index={index}>
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <ClientsCard
                          clientItem={item}
                          onDelete={handleDelete}
                          onEdit={(item) => handleEdit(item)}
                        />
                      </div>
                    )}
                  </Draggable>
                ))}
                {provided.placeholder}
              </div>
            )}
          </Droppable>
        </DragDropContext>
      )}
    </div>
  );
}
