"use client";
import { useState } from "react";
import {
  FaUserCircle,
  FaUsers,
  FaNewspaper,
  FaUserLock,
  FaCalendar,
  FaBars,
  FaTimes,
} from "react-icons/fa";
import { motion } from "framer-motion";
import { SignedIn, SignedOut, SignInButton, UserButton } from "@clerk/nextjs"; // Importar Clerk

const Sidebar = () => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isMobileOpen, setIsMobileOpen] = useState(false); // Estado para móviles

  const menuItems = [
    {
      name: "Clients",
      icon: <FaUsers />,
      path: "/Dashboard_desktopView/LightMode/clients",
    },
    {
      name: "News",
      icon: <FaNewspaper />, // Cambia el icono si lo deseas
      path: "/Dashboard_desktopView/LightMode/news",
    },

    {
      name: "Events",
      icon: <FaCalendar />,
      path: "/Dashboard_desktopView/LightMode/events",
    },
    {
      name: "Users",
      icon: <FaUserLock />, // Cambia el icono si lo deseas
      path: "/Dashboard_desktopView/LightMode/users",
    },
  ];

  return (
    <>
      {/* 🔹 Sidebar en pantallas grandes (con expansión al pasar el mouse) */}
      <motion.aside
        className="hidden lg:flex fixed left-0 top-0 h-full border-r-2  bg-white shadow-lg flex-col py-6 px-4 font-arsenal text-xl transition-all text-black"
        initial={{ width: 80 }}
        animate={{ width: isExpanded ? 180 : 100 }}
        transition={{ duration: 0.4, ease: "easeInOut" }}
        onMouseEnter={() => setIsExpanded(true)}
        onMouseLeave={() => setIsExpanded(false)}
      >
        {/* Logo */}
        <div className="flex justify-center items-center mb-8 text-black">
          <img src="/logo.jpg" alt="LensPR Logo" className="w-14 h-14" />
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
          className="mt-auto flex justify-center w-full p-4"
          initial={{ opacity: 1 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, ease: "easeInOut" }}
        >
          {/* Cuando el usuario NO está autenticado (Mostrar SignInButton) */}
          <SignedOut>
            <button className="flex items-center justify-center gap-3 text-gray-700 hover:text-black w-full">
              <FaUserCircle size={30} />
              {isExpanded && (
                <span className="text-lg font-semibold">Iniciar Sesión</span>
              )}
            </button>
          </SignedOut>

          {/* Cuando el usuario SÍ está autenticado (Mostrar UserButton) */}
          <SignedIn>
            <button className="flex items-center justify-center gap-3 text-gray-700 hover:text-black w-full">
              <UserButton afterSignOutUrl="/" />
              {isExpanded && (
                <span className="text-lg font-semibold">Perfil</span>
              )}
            </button>
          </SignedIn>
        </motion.div>
      </motion.aside>

      {/* 🔹 Botón de menú en móviles */}
      <button
        className="lg:hidden fixed top-4 left-4  text-grey-400 p-3 rounded-lg shadow-md z-50"
        onClick={() => setIsMobileOpen(true)}
      >
        <FaBars size={20} />
      </button>

      {/* 🔹 Sidebar en móviles como drawer */}
      {isMobileOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex">
          <motion.aside
            className="w-[250px] bg-white shadow-lg flex flex-col p-6 h-full"
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
