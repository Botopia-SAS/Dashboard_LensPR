"use client";
import React from "react";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faSpinner } from "@fortawesome/free-solid-svg-icons";
import { ClientData } from "../../../types/clients";

interface AdditionalSettingsProps {
  clients: ClientData[];
  loadingClients: boolean;
  clientId?: string;
  published: boolean;
  orderNumber?: number;
  onClientIdChange: (clientId: string) => void;
  onPublishedChange: (published: boolean) => void;
  onOrderNumberChange: (orderNumber: number) => void;
}

const AdditionalSettings: React.FC<AdditionalSettingsProps> = ({
  clients,
  loadingClients,
  clientId,
  published,
  orderNumber,
  onClientIdChange,
  onPublishedChange,
  onOrderNumberChange,
}) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6">
      <h3 className="text-lg font-medium text-gray-900 mb-4">Configuración Adicional</h3>

      <div className="space-y-4">
        {/* Cliente asociado */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Cliente asociado (opcional)
          </label>
          {loadingClients ? (
            <div className="flex items-center text-gray-600">
              <FontAwesomeIcon icon={faSpinner} spin className="mr-2" />
              <span>Cargando clientes...</span>
            </div>
          ) : (
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
              value={clientId || ""}
              onChange={(e) => onClientIdChange(e.target.value)}
            >
              <option value="">-- Selecciona un cliente --</option>
              {clients.map((client) => (
                <option key={client.id} value={client.id}>
                  {client.name_spanish ||
                    client.name_english ||
                    client.name_portuguese ||
                    "Cliente"}
                </option>
              ))}
            </select>
          )}
        </div>

        {/* Configuración de publicación y orden */}
        <div className="flex flex-wrap items-center gap-4">
          <label className="flex items-center space-x-3 cursor-pointer">
            <input
              type="checkbox"
              checked={published}
              onChange={(e) => onPublishedChange(e.target.checked)}
              className="w-5 h-5 text-blue-600 border-2 border-gray-300 rounded focus:ring-blue-500 focus:ring-2"
            />
            <span className="text-sm font-medium text-gray-700">
              Publicar inmediatamente
            </span>
          </label>

          <div className="flex items-center gap-2">
            <label className="text-sm font-medium text-gray-700">Orden:</label>
            <input
              type="number"
              className="w-20 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-gray-500 focus:border-gray-500 transition-colors text-sm"
              value={orderNumber ?? 0}
              onChange={(e) => onOrderNumberChange(parseInt(e.target.value, 10))}
            />
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdditionalSettings;