"use client";

import { useQuery } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface User {
  id: string;
  email: string;
  name?: string;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
}

interface Stats {
  timeSpent: string;
  characters: number;
}

export default function Dashboard() {
  const router = useRouter();
  const { data: user, isLoading: userLoading } = useQuery({
    queryKey: ['me'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        throw new Error("No token");
      }
      const res = await fetch("/api/auth/me", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) {
        router.push("/login");
        throw new Error("Unauthorized");
      }
      return res.json() as Promise<User>;
    }
  });

  const { data: personas = [], isLoading: personasLoading } = useQuery({
    queryKey: ['personas'],
    queryFn: async () => {
      const token = localStorage.getItem("token");
      if (!token) throw new Error("No token");
      const res = await fetch("/api/personas", {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (!res.ok) throw new Error("Failed to fetch personas");
      return res.json() as Promise<Persona[]>;
    }
  });

  const stats = {
    timeSpent: "12h 45m",
    characters: personas.length || 0,
  };

  const loading = userLoading || personasLoading;

  if (loading) {
    return (
      <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans text-white">
      <nav className="flex items-center justify-between px-8 py-5 border-b border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.05)] backdrop-blur-xl sticky top-0 z-50">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa]">
          Digital Legacy
        </div>
        <div className="flex-1"></div>
        <div className="flex items-center gap-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] flex items-center justify-center font-bold shadow-[0_0_10px_#7c3aed]">
            {user?.email?.charAt(0).toUpperCase() || "U"}
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-8 py-10 grid grid-cols-1 lg:grid-cols-3 gap-10">
        <div className="lg:col-span-2 flex flex-col gap-10">
          <div>
            <h1 className="text-4xl font-bold mb-2">Welcome back, {user?.name || user?.email?.split('@')[0] || "User"}</h1>
            <p className="text-[#cbd5f5] text-lg">Your legacy is growing. Select a persona or start a new interaction.</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-transform hover:-translate-y-1">
              <h3 className="text-[#cbd5f5] text-sm font-medium mb-1">Total Time Spent</h3>
              <p className="text-3xl font-bold text-white tracking-tight">{stats.timeSpent}</p>
            </div>
            <div className="p-6 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_20px_rgba(124,58,237,0.1)] transition-transform hover:-translate-y-1">
              <h3 className="text-[#cbd5f5] text-sm font-medium mb-1">Active Characters</h3>
              <p className="text-3xl font-bold text-white tracking-tight">{stats.characters}</p>
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-2xl font-bold">Your AI Characters</h2>
              <button className="text-[#8b5cf6] hover:text-[#a78bfa] text-sm font-medium transition-colors">View All</button>
            </div>

            {personas.length === 0 ? (
              <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.02)] border border-[rgba(255,255,255,0.05)] text-center text-[#cbd5f5]">
                No characters found. Create your first AI companion to get started.
              </div>
            ) : (
              <div className="flex gap-5 overflow-x-auto pb-6 snap-x">
                {personas.map((persona) => (
                  <div key={persona.id} className="min-w-[160px] snap-start flex flex-col items-center p-5 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl transition-all cursor-pointer group">
                    <div className="w-20 h-20 rounded-full overflow-hidden mb-4 border-2 border-[rgba(255,255,255,0.1)] group-hover:border-[#a78bfa] transition-colors bg-[rgba(0,0,0,0.2)]">
                      {persona.avatarUrl ? (
                        <img src={persona.avatarUrl} alt={persona.name} className="w-full h-full object-cover" />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] text-2xl font-bold">
                          {persona.name.charAt(0)}
                        </div>
                      )}
                    </div>
                    <span className="font-semibold text-lg truncate w-full text-center">{persona.name}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        <div>
          <div className="p-8 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl sticky top-28 shadow-[0_0_30px_rgba(124,58,237,0.15)] flex flex-col gap-4">
            <h3 className="text-xl font-bold mb-2">Quick Actions</h3>

            <button
              onClick={() => router.push("/dashboard/call")}
              className="w-full py-3.5 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-[12px] text-white font-semibold flex items-center justify-center gap-2 shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_0_20px_#a78bfa] hover:-translate-y-0.5 transition-all duration-200"
            >
              Start Call
            </button>
            <button
              onClick={() => router.push("/dashboard/create")}
              className="w-full py-3.5 px-4 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.15)] rounded-[12px] text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Create AI
            </button>
            <button
              onClick={() => router.push("/dashboard/explore")}
              className="w-full py-3.5 px-4 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.15)] rounded-[12px] text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Explore AI
            </button>
            <button
              onClick={() => router.push("/dashboard/settings")}
              className="w-full py-3.5 px-4 bg-[rgba(255,255,255,0.1)] border border-[rgba(255,255,255,0.2)] hover:bg-[rgba(255,255,255,0.15)] rounded-[12px] text-white font-semibold flex items-center justify-center gap-2 transition-all duration-200 hover:shadow-[0_0_15px_rgba(255,255,255,0.2)]"
            >
              Settings
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
