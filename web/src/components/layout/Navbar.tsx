import React from "react";
import Link from "next/link";
import Avatar from "../ui/Avatar";
import { useAppContext } from "../../context/AppContext";

export default function Navbar() {
  const { user } = useAppContext();

  return (
    <nav className="flex items-center justify-between px-8 py-5 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl sticky top-0 z-50">
      <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]">
        Digital Legacy
      </div>
      <div className="flex-1"></div>
      <div className="flex items-center gap-4">
        {user ? (
          <Link href="/dashboard/settings">
            <Avatar src={user.avatarUrl} fallback={user.name?.[0] || user.email[0] || "U"} size="md" className="hover:scale-105 hover:border-[#a78bfa] transition-all cursor-pointer" />
          </Link>
        ) : (
          <div className="w-10 h-10 rounded-full bg-[rgba(255,255,255,0.1)] animate-pulse" />
        )}
      </div>
    </nav>
  );
}
