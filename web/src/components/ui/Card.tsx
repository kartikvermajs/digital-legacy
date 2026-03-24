import React, { ReactNode } from "react";

interface CardProps {
  children: ReactNode;
  className?: string;
  hoverEffect?: boolean;
}

export default function Card({ children, className = "", hoverEffect = false }: CardProps) {
  let baseClasses = "rounded-[24px] bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_30px_rgba(124,58,237,0.1)] overflow-hidden ";
  
  if (hoverEffect) {
    baseClasses += "transition-all duration-300 hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(124,58,237,0.2)] ";
  }

  return (
    <div className={baseClasses + className}>
      {children}
    </div>
  );
}
