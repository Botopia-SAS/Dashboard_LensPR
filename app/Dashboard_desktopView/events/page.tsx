"use client";
import { useEffect, useState } from "react";
import Modal from "@/components/ui/Modal";
import EventsForm from "@/components/forms/eventForms/EventsForm";
import EventsCard from "@/components/forms/eventForms/EventCard";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";

interface LangEvents {
  name: string;
  location: string;
  category: string;
  description: string;
}

interface FormDataEvents {
  Español: LangEvents;
  Inglés: LangEvents;
  Portugués: LangEvents;
  media_url: string;
  date_time: string;
  duration: number;
  cost: string;
  register_link: string;
}

interface EventsRecord {
  id: string;
  name_spanish?: string;
  location_spanish?: string;
  category_spanish?: string;
  description_spanish?: string;

  name_english?: string;
  location_english?: string;
  category_english?: string;
  description_english?: string;

  name_portuguese?: string;
  location_portuguese?: string;
  category_portuguese?: string;
  description_portuguese?: string;

  date_time?: string;
  duration?: number;
  cost?: string;
  register_link?: string;
  media_url?: string;
}

export default function EventsPage() {
  const [isLoading, setIsLoading] = useState(true); // Nuevo estado de carga

  const [events, setEvents] = useState<EventsRecord[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [editingEvent, setEditingEvent] = useState<EventsRecord | null>(null);

  // Cargar eventos
  const fetchEvents = async () => {
    setIsLoading(true); // ⬅ Activa el estado de carga antes de la petición
    try {
      const res = await fetch("/api/events/getEvent");
      if (!res.ok) throw new Error("Error al obtener eventos");
      const data = await res.json();
      setEvents(data);
    } catch (error) {
      console.error("Error fetchEvents:", error);
    } finally {
      setIsLoading(false); // ⬅ Desactiva el estado de carga al finalizar
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  // Filtrar por name_spanish
  const filteredEvents = events.filter((ev) =>
    ev.name_spanish?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Crear
  const handleCreate = () => {
    setEditingEvent(null);
    setShowModal(true);
  };

  // Eliminar
  const handleDelete = async (id: string) => {
    const confirmDelete = window.confirm("¿Deseas eliminar este evento?");
    if (!confirmDelete) return;
    try {
      const res = await fetch("/api/events/deleteEvent", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id }),
      });
      if (!res.ok) {
        const result = await res.json();
        alert(`Error al eliminar evento: ${result.error}`);
        return;
      }
      alert("Evento eliminado con éxito");
      fetchEvents();
    } catch (error) {
      console.error("Error al eliminar evento:", error);
    }
  };

  // Editar
  const handleEdit = (item: EventsRecord) => {
    setEditingEvent(item);
    setShowModal(true);
  };

  // Callback form
  const handleFormSubmit = async (
    formData: FormDataEvents,
    isEdit: boolean
  ) => {
    try {
      if (!isEdit) {
        // Crear
        const response = await fetch("/api/events/addEvent", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(formData),
        });
        if (!response.ok) {
          const result = await response.json();
          alert(`Error al crear evento: ${result.error}`);
          return;
        }
        alert("Evento creado con éxito");
      } else {
        // Editar
        if (!editingEvent) return alert("No se encontró el evento para editar");
        const id = editingEvent.id;

        const response = await fetch("/api/events/updateEvent", {
          method: "PATCH",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ ...formData, id }),
        });
        if (!response.ok) {
          const result = await response.json();
          alert(`Error al editar evento: ${result.error}`);
          return;
        }
        alert("Evento actualizado con éxito");
      }
      setShowModal(false);
      setEditingEvent(null);
      fetchEvents();
    } catch (error) {
      console.error("Error al enviar datos:", error);
    }
  };

  // Mapeo para initialData
  const mapRecordToFormData = (record: EventsRecord) => {
    return {
      Español: {
        name: record.name_spanish || "",
        location: record.location_spanish || "",
        category: record.category_spanish || "",
        description: record.description_spanish || "",
      },
      Inglés: {
        name: record.name_english || "",
        location: record.location_english || "",
        category: record.category_english || "",
        description: record.description_english || "",
      },
      Portugués: {
        name: record.name_portuguese || "",
        location: record.location_portuguese || "",
        category: record.category_portuguese || "",
        description: record.description_portuguese || "",
      },
      media_url: record.media_url || "",
      date_time: record.date_time || "",
      duration: record.duration || 0,
      cost: record.cost || "",
      register_link: record.register_link || "",
    };
  };

  return (
    <div className="p-6">
      <h1 className="text-3xl font-arsenal mb-4">Gestión de Eventos</h1>

      <input
        type="text"
        placeholder="Buscar evento (Español)..."
        className="border p-2 mb-4 w-full max-w-sm"
        value={searchTerm}
        onChange={(e) => setSearchTerm(e.target.value)}
      />

      <button
        onClick={handleCreate}
        className="bg-black text-white px-4 py-2 rounded-lg mb-4 flex items-center font-arsenal"
      >
        <span className="mr-2 text-xl font-arsenal">+</span> Agregar Evento
      </button>

      {/* Modal */}
      <Modal
        isOpen={showModal}
        onClose={() => {
          setShowModal(false);
          setEditingEvent(null);
        }}
      >
        <EventsForm
          initialData={
            editingEvent ? mapRecordToFormData(editingEvent) : undefined
          }
          onSubmit={handleFormSubmit}
        />
      </Modal>

      {/* 🔄 Mostrar Spinner mientras se cargan los datos */}
      {isLoading ? (
        <div className="flex flex-col justify-center items-center min-h-[200px]">
          <FontAwesomeIcon
            icon={faSpinner}
            spin
            size="3x" // Aumentamos tamaño
            className="text-gray-500"
          />
          <p className="text-gray-500 mt-2 font-arsenal">Cargando datos...</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-1 md:grid-cols-2 lg:grid-cols-3">
          {filteredEvents.map((item) => (
            <EventsCard
              key={item.id}
              eventItem={item}
              onDelete={handleDelete}
              onEdit={handleEdit}
            />
          ))}
        </div>
      )}
    </div>
  );
}
