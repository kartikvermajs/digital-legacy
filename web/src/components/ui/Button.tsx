import React, { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "danger" | "ghost";
  fullWidth?: boolean;
}

export default function Button({ variant = "primary", fullWidth = false, className = "", children, ...props }: ButtonProps) {
  let baseClasses = "py-3.5 px-6 rounded-[12px] font-bold transition-all duration-300 flex items-center justify-center gap-2 ";
  
  if (fullWidth) baseClasses += "w-full ";

  if (variant === "primary") {
    baseClasses += "bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] text-white shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_25px_rgba(167,139,250,0.6)] hover:-translate-y-1 ";
  } else if (variant === "secondary") {
    baseClasses += "bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] text-white hover:bg-[rgba(255,255,255,0.15)] hover:shadow-[0_0_15px_rgba(255,255,255,0.2)] ";
  } else if (variant === "danger") {
    baseClasses += "bg-red-500 hover:bg-red-600 text-white shadow-[0_0_20px_rgba(239,68,68,0.4)] hover:scale-105 ";
  } else if (variant === "ghost") {
    baseClasses += "bg-transparent text-[#cbd5f5] hover:text-[#a78bfa] hover:bg-[rgba(255,255,255,0.05)] ";
  }

  return (
    <button className={baseClasses + className} {...props}>
      {children}
    </button>
  );
}
