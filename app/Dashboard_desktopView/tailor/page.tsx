"use client";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import TailorForm from "@/components/forms/tailorForms/TailorForm";
import TailorCard from "@/components/forms/tailorForms/TailorCard";
import {
  DragDropContext,
  Droppable,
  Draggable,
  DropResult,
} from "@hello-pangea/dnd";
import { TailorMadeItem, FormDataTailor } from "@/types/tailor";

export default function TailorMadePage() {
  const [isLoading, setIsLoading] = useState(true);
  const [tailorItems, setTailorItems] = useState<TailorMadeItem[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingItem, setEditingItem] = useState<TailorMadeItem | null>(null);

  // Obtener lista de items
  const fetchTailorItems = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/tailor/getTailor");

      if (!res.ok) {
        const errorData = await res.json();
        console.error("Error del servidor:", errorData);
        throw new Error(errorData.error || "Error al obtener items");
      }

      const data: TailorMadeItem[] = await res.json();
      console.log("Datos recibidos:", data); // Para depuración

      setTailorItems(data.sort((a, b) => a.order - b.order));
    } catch (error) {
      console.error("Error en fetchTailorItems:", error);
      // Puedes agregar un estado para mostrar el error en la UI
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTailorItems();
  }, []);

  // Filtrar por título en español
  const filteredItems = tailorItems.filter((item) =>
    item.title_spanish?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear nuevo item
  const handleCreate = () => {
    setEditingItem(null);
    setShowModal(true);
  };

  // Eliminar item
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Deseas eliminar este item?");
    if (!confirmDelete) return;

    try {
      const res = await fetch("/api/tailor/deleteTailor", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });

      if (!res.ok) {
        const result = await res.json();
        alert(`Error al eliminar: ${result.error}`);
        return;
      }

      alert("Item eliminado con éxito");
      fetchTailorItems();
    } catch (error) {
      console.error("Error al eliminar:", error);
    }
  };

  // Editar item
  const handleEdit = (item: TailorMadeItem) => {
    setEditingItem(item);
    setShowModal(true);
  };

  // Guardar cambios
  const handleFormSubmit = async (
    formData: FormDataTailor,
    isEdit: boolean
  ) => {
    try {
      // Configuración de la petición
      const url = isEdit ? "/api/tailor/updateTailor" : "/api/tailor/addTailor";
      const method = isEdit ? "PATCH" : "POST";

      // Validación para edición
      if (isEdit && !editingItem) {
        alert("No se encontró el item para editar");
        return;
      }

      // Preparar el cuerpo de la petición
      const requestBody = isEdit
        ? { ...formData, id: editingItem?.id }
        : formData;

      // Realizar la petición
      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      // Manejar la respuesta
      const result = await response.json();

      if (!response.ok) {
        console.error("Error del servidor:", result);
        throw new Error(
          result.error || `Error al ${isEdit ? "editar" : "crear"} el item`
        );
      }

      // Éxito - mostrar feedback y actualizar
      alert(`Item ${isEdit ? "actualizado" : "creado"} con éxito`);
      setShowModal(false);
      setEditingItem(null);
      fetchTailorItems();
    } catch (error) {
      console.error("Error al guardar:", error);
      alert(
        `Error: ${error instanceof Error ? error.message : "Error desconocido"}`
      );
    }
  };

  // Mapear datos para el formulario
  const mapRecordToFormData = (record: TailorMadeItem) => {
    return {
      Español: {
        title: record.title_spanish || "",
        subtitle: record.subtitle_spanish || "",
        description: record.description_spanish || "",
      },
      Inglés: {
        title: record.title_english || "",
        subtitle: record.subtitle_english || "",
        description: record.description_english || "",
      },
      Portugués: {
        title: record.title_portuguese || "",
        subtitle: record.subtitle_portuguese || "",
        description: record.description_portuguese || "",
      },
      image: record.image || "",
    };
  };

  // Drag & Drop
  const handleDragEnd = async (result: DropResult) => {
    if (!result.destination) return;

    const updatedItems = [...tailorItems];
    const [movedItem] = updatedItems.splice(result.source.index, 1);
    updatedItems.splice(result.destination.index, 0, movedItem);

    // Reasignar order_number
    const reorderedItems = updatedItems.map((item, index) => ({
      ...item,
      order: index,
    }));

    setTailorItems(reorderedItems);

    try {
      await fetch("/api/tailor/updateTailorOrder", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(
          reorderedItems.map((item) => ({
            id: item.id,
            order: item.order,
          }))
        ),
      });
    } catch (error) {
      console.error("Error actualizando orden:", error);
    }
  };

  return (
    <div className="p-6 bg-white">
      <h1 className="text-3xl font-arsenal mb-4">Gestión de Tailor-made</h1>

      <input
        type="text"
        placeholder="Buscar por título (Español)..."
        className="border p-2 mb-4 w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded-lg mb-4 flex items-center font-arsenal"
      >
        <span className="mr-2 text-xl font-arsenal">+</span> Agregar Item
      </button>

      {/* Modal para crear/editar */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingItem(null);
        }}
      >
        <TailorForm
          initialData={
            editingItem ? mapRecordToFormData(editingItem) : undefined
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
          <Droppable droppableId="tailor-made-list">
            {(provided) => (
              <div
                ref={provided.innerRef}
                {...provided.droppableProps}
                className="space-y-4"
              >
                {filteredItems.map((item, index) => (
                  <Draggable
                    key={item.id}
                    draggableId={item.id.toString()} // Asegúrate que sea string
                    index={index}
                  >
                    {(provided) => (
                      <div
                        ref={provided.innerRef}
                        {...provided.draggableProps}
                        {...provided.dragHandleProps}
                      >
                        <TailorCard
                          tailorItem={item}
                          onDelete={handleDelete}
                          onEdit={handleEdit}
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
