"use client";
import { useState } from "react";
import {
  FaUsers,
  FaNewspaper,
  FaUserLock,
  FaCalendar,
  FaBars,
  FaTimes,
  FaChevronDown,
  FaPalette,
  FaEdit,
} from "react-icons/fa";
import { motion } from "framer-motion";

import { UserButton, useClerk } from "@clerk/nextjs"; // Importar Clerk
import Link from "next/link";

const Sidebar = () => {
  const { openUserProfile } = useClerk();
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Estado para móviles
  const { signOut } = useClerk(); // Función para cerrar sesión
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  const menuItems = [
    {
      name: "Clients",
      icon: <FaUsers />,
      path: "/Dashboard_desktopView/clients",
    },
    {
      name: "News",
      icon: <FaNewspaper />, // Cambia el icono si lo deseas
      path: "/Dashboard_desktopView/news",
    },
    {
      name: "Blogs",
      icon: <FaEdit />,
      path: "/Dashboard_desktopView/blogs",
    },

    {
      name: "Events",
      icon: <FaCalendar />,
      path: "/Dashboard_desktopView/events",
    },
    {
      name: "Tailor-made",
      icon: <FaPalette />, // Cambia el icono si lo deseas
      path: "/Dashboard_desktopView/tailor",
    },
    {
      name: "Users",
      icon: <FaUserLock />, // Cambia el icono si lo deseas
      path: "/Dashboard_desktopView/users",
    },
  ];

  return (
    <>
      {/* 🔹 Sidebar en pantallas grandes (con expansión al pasar el mouse) */}
      <motion.aside
        className={
          "hidden lg:flex fixed left-0 top-0 h-full border-r border-gray-200 bg-white shadow-lg flex-col py-6 px-4 font-arsenal text-xl transition-all text-black"
        }
        initial={{ width: 80 }}
        animate={{ width: isExpanded ? 180 : 100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        <div className="flex justify-center items-center mb-8 text-black">
          <Link href="/">
            <img
              src="/logo-lens.svg"
              alt="LensPR Logo"
              className="w-14 h-14 cursor-pointer"
            />
          </Link>
        </div>

        {/* Menú de navegación */}
        <nav className="flex flex-col gap-2">
          {menuItems.map((item) => (
            <a
              key={item.name}
              href={item.path}
              className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-100 transition-all w-full text-black"
            >
              {/* Ícono SIEMPRE visible */}
              <div className="w-8 h-8 flex items-center justify-center">
                {item.icon}
              </div>

              {/* Texto que aparece con el menú expandido */}
              <motion.span
                className="text-lg font-semibold flex-1 text-center text-black"
                initial={{ opacity: 0, x: -10 }}
                animate={{
                  opacity: isExpanded ? 1 : 0,
                  x: isExpanded ? 0 : -10,
                }}
                transition={{ duration: 0.3, ease: "easeInOut", delay: 0.2 }}
              >
                {isExpanded && item.name}
              </motion.span>
            </a>
          ))}
        </nav>

        <motion.div
          className="mt-auto flex flex-col items-center w-full p-4 relative"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          <div className="relative w-full">
            {/* Botón de perfil con flecha de despliegue */}
            <button
              className="flex items-center justify-between text-gray-700 hover:text-black w-full p-2 rounded-lg transition-all"
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            >
              <div className="flex items-center gap-3">
                {/* 🔹 Siempre visible (icono de usuario de Clerk) */}
                <UserButton afterSignOutUrl="/" />

                {/* 🔹 Solo se muestra cuando el sidebar está expandido */}
                {isExpanded && (
                  <motion.span
                    className="text-lg font-semibold text-black"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.3, ease: "easeInOut" }}
                  >
                    Perfil
                  </motion.span>
                )}
              </div>

              {/* 🔹 Flecha visible solo cuando el sidebar está expandido */}
              {isExpanded && (
                <motion.div animate={{ rotate: isDropdownOpen ? 180 : 0 }}>
                  <FaChevronDown />
                </motion.div>
              )}
            </button>

            {/* Menú desplegable de opciones */}
            {isDropdownOpen && (
              <motion.div
                className="absolute left-0 bottom-full mb-2 w-48 bg-white border rounded-lg shadow-lg z-50"
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <button
                  onClick={() => signOut()} // Cerrar sesión
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Cerrar sesión
                </button>
                <button
                  onClick={() => openUserProfile()} // Abre el modal de cuenta
                  className="block w-full text-left px-4 py-2 text-gray-700 hover:bg-gray-100"
                >
                  Manage Account
                </button>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.aside>

      {/* 🔹 Botón de menú en móviles */}
      <button
        className={
          "lg:hidden fixed top-4 left-4  text-grey-400 p-3 rounded-lg shadow-md font-arsenal "
        }
        onClick={() => setIsMobileOpen(true)}
      >
        <FaBars size={20} />
      </button>

      {/* 🔹 Sidebar en móviles como drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-80 flex font-arsenal">
          <motion.aside
            className="w-[250px] bg-white shadow-lg flex flex-col p-6 h-full font-arsenal"
            initial={{ x: -250 }}
            animate={{ x: 0 }}
            transition={{ duration: 0.3 }}
          >
            {/* Botón para cerrar el menú en móviles */}
            <button
              className="text-right text-black mb-4"
              onClick={() => setIsMobileOpen(false)}
            >
              <FaTimes size={24} />
            </button>

            {/* Menú en móviles */}
            <nav className="flex flex-col gap-2">
              {menuItems.map((item) => (
                <a
                  key={item.name}
                  href={item.path}
                  className="flex items-center gap-4 p-4 rounded-lg hover:bg-gray-200 transition-all"
                >
                  {item.icon}
                  <span className="text-lg font-semibold">{item.name}</span>
                </a>
              ))}
            </nav>
          </motion.aside>
        </div>
      )}
    </>
  );
};

export default Sidebar;
