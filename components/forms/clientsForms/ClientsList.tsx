import { useState, useEffect } from "react";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";

interface Client {
  id: string;
  name: string;
  title: string;
  description: string;
  image: string;
  order_number: number;
}

const ClientsList = () => {
  const [clients, setClients] = useState<Client[]>([]);

  useEffect(() => {
    // Simula la carga de datos desde la API
    fetch("/api/clients")
      .then((res) => res.json())
      .then((data: Client[]) =>
        setClients(
          data.sort((a: Client, b: Client) => a.order_number - b.order_number)
        )
      ); // Orden inicial
  }, []);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const handleDragEnd = (result: any) => {
    if (!result.destination) return;

    const updatedClients = [...clients];
    const [movedItem] = updatedClients.splice(result.source.index, 1);
    updatedClients.splice(result.destination.index, 0, movedItem);

    // Reasignar el orden
    const reorderedClients = updatedClients.map((client, index) => ({
      ...client,
      order_number: index,
    }));

    setClients(reorderedClients);

    // Enviar actualización al backend
    fetch("/api/updateClientOrder", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(reorderedClients),
    });
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="clients-list">
        {(provided) => (
          <div
            ref={provided.innerRef}
            {...provided.droppableProps}
            className="space-y-4"
          >
            {clients.map((client, index) => (
              <Draggable key={client.id} draggableId={client.id} index={index}>
                {(provided) => (
                  <div
                    ref={provided.innerRef}
                    {...provided.draggableProps}
                    {...provided.dragHandleProps}
                    className="p-4 bg-white shadow rounded-lg cursor-pointer flex items-center justify-between"
                  >
                    <div>
                      <h3 className="font-bold">{client.name}</h3>
                      <p className="text-sm">{client.title}</p>
                    </div>
                    {client.image && (
                      <img
                        src={client.image}
                        alt={client.name}
                        className="w-12 h-12 object-cover rounded-full"
                      />
                    )}
                  </div>
                )}
              </Draggable>
            ))}
            {provided.placeholder}
          </div>
        )}
      </Droppable>
    </DragDropContext>
  );
};

export default ClientsList;