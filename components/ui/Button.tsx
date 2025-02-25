"use client";
import { ReactNode } from "react";

interface ButtonProps {
  children: ReactNode;
  onClick?: () => void;
  className?: string;
}

const Button = ({ children, onClick, className }: ButtonProps) => {
  return (
    <button
      className={`px-4 py-2 rounded-lg font-semibold transition-all duration-200 ${className}`}
      onClick={onClick}
    >
      {children}
    </button>
  );
};

export default Button;
