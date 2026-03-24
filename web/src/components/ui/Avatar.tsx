import React from "react";

interface AvatarProps {
  src?: string | null;
  fallback: string;
  size?: "sm" | "md" | "lg" | "xl";
  className?: string;
}

export default function Avatar({ src, fallback, size = "md", className = "" }: AvatarProps) {
  const sizeMap = {
    sm: "w-8 h-8 text-xs",
    md: "w-12 h-12 text-lg",
    lg: "w-20 h-20 text-3xl",
    xl: "w-32 h-32 text-4xl"
  };

  const baseClasses = `${sizeMap[size]} rounded-full overflow-hidden border-2 border-[rgba(255,255,255,0.1)] bg-[rgba(0,0,0,0.3)] shadow-[0_0_15px_rgba(124,58,237,0.2)] shrink-0 flex items-center justify-center font-bold text-white uppercase `;

  return (
    <div className={baseClasses + className}>
      {src ? (
        <img src={src} alt={fallback} className="w-full h-full object-cover rounded-full" />
      ) : (
        <span className="bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] w-full h-full flex items-center justify-center rounded-full">
          {fallback.charAt(0)}
        </span>
      )}
    </div>
  );
}
