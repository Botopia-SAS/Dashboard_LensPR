"use client";
import { useState } from "react";
import Header from "@/components/Header";
import ClientForm from "@/components/forms/clientsForms/ClientsForm";

const ClientsPage = () => {
  const [selectedLanguage, setSelectedLanguage] = useState("Español");

  return (
    <div className="p-6">
      {/* Pasar correctamente la función al Header */}
      <Header onLanguageChange={(lang) => setSelectedLanguage(lang)} />

      <h1 className="text-3xl font-arsenal mb-6">
        Gestión de Clientes - {selectedLanguage}
      </h1>

      {/* Mostrar el formulario correspondiente al idioma seleccionado */}
      <ClientForm language={selectedLanguage} />
    </div>
  );
};

export default ClientsPage;
