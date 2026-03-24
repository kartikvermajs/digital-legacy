import React, { InputHTMLAttributes } from "react";

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  icon?: React.ReactNode;
}

export default function Input({ label, error, icon, className = "", ...props }: InputProps) {
  return (
    <div className="flex flex-col gap-2 w-full">
      {label && <label className="text-[#cbd5f5] text-sm font-semibold ml-1">{label}</label>}
      <div className="relative">
        <input
          {...props}
          className={`w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/40 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all ${icon ? "pl-12" : ""} ${error ? "border-red-500/50 focus:ring-red-500 focus:shadow-[0_0_15px_#ef4444]" : ""} ${className}`}
        />
        {icon && (
          <div className="absolute left-4 top-1/2 -translate-y-1/2 text-[#cbd5f5]">
            {icon}
          </div>
        )}
      </div>
      {error && <span className="text-red-400 text-xs ml-1">{error}</span>}
    </div>
  );
}
