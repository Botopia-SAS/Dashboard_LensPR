"use client";
import Image from "next/image";

export default function DashboardHome() {
  return (
    <div className="flex items-center justify-center min-h-screen bg-white">
      <div>
        <div className="flex flex-col items-center text-center">
          {/* Imagen responsiva */}
          <div className="relative w-full h-auto max-w-md">
            <Image
              src="/image.svg" // Reemplaza con la URL correcta
              alt="Lens PR Banner"
              width={800} // Ajusta según sea necesario
              height={400} // Ajusta según sea necesario
              layout="responsive"
              className="rounded-lg"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
