"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
  traits: string;
  tone: string;
}

export default function ExploreAI() {
  const router = useRouter();
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filters, setFilters] = useState({
    gender: "all",
    age: "all",
    category: "all",
  });

  useEffect(() => {
    const fetchPersonas = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const res = await fetch("/api/personas", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setPersonas(data);
        }
      } catch (err) {} finally {
        setLoading(false);
      }
    };
    fetchPersonas();
  }, [router]);

  const filteredPersonas = useMemo(() => {
    return personas.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) || 
                            p.traits.toLowerCase().includes(search.toLowerCase());
      
      const traitsLower = p.traits.toLowerCase();
      const matchesGender = filters.gender === "all" || traitsLower.includes(filters.gender);
      const matchesAge = filters.age === "all" || traitsLower.includes(filters.age.replace("-", " "));
      const matchesCategory = filters.category === "all" || p.tone.toLowerCase() === filters.category;

      return matchesSearch && matchesGender && matchesAge && matchesCategory;
    });
  }, [personas, search, filters]);

  const handleSelect = (id: string) => {
    router.push(`/dashboard/call?persona=${id}`);
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans text-white p-6 md:p-8 flex flex-col h-screen overflow-hidden">
      <nav className="mb-6 flex items-center justify-between shrink-0">
        <Link 
          href="/dashboard" 
          className="text-[#cbd5f5] hover:text-[#a78bfa] transition-colors flex items-center gap-2 font-medium"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
          Dashboard
        </Link>
        <h1 className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-white to-[#cbd5f5]">
          Explore AI Community
        </h1>
        <div className="w-24"></div>
      </nav>

      <div className="flex flex-col lg:flex-row gap-8 flex-1 overflow-hidden">
        <aside className="w-full lg:w-72 shrink-0 h-full overflow-y-auto pr-2 pb-8 lg:pb-0">
          <div className="p-6 rounded-3xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_30px_rgba(124,58,237,0.1)] flex flex-col gap-8">
            <div>
              <h2 className="text-lg font-bold mb-4 flex items-center gap-2">
                <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" /></svg>
                Filters
              </h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex flex-col gap-3">
                  <label className="text-[#cbd5f5] text-sm font-semibold">Category</label>
                  <div className="relative">
                    <select
                      value={filters.category}
                      onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-4 pr-10 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] transition-all cursor-pointer text-sm"
                    >
                      <option value="all" className="bg-[#1e1b4b]">All Categories</option>
                      <option value="mentor" className="bg-[#1e1b4b]">Mentor</option>
                      <option value="friend" className="bg-[#1e1b4b]">Friend</option>
                      <option value="expert" className="bg-[#1e1b4b]">Expert</option>
                      <option value="historical" className="bg-[#1e1b4b]">Historical</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5f5]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[#cbd5f5] text-sm font-semibold">Gender</label>
                  <div className="relative">
                    <select
                      value={filters.gender}
                      onChange={(e) => setFilters({ ...filters, gender: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-4 pr-10 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] transition-all cursor-pointer text-sm"
                    >
                      <option value="all" className="bg-[#1e1b4b]">Any Gender</option>
                      <option value="female" className="bg-[#1e1b4b]">Female</option>
                      <option value="male" className="bg-[#1e1b4b]">Male</option>
                      <option value="non-binary" className="bg-[#1e1b4b]">Non-binary</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5f5]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col gap-3">
                  <label className="text-[#cbd5f5] text-sm font-semibold">Age Group</label>
                  <div className="relative">
                    <select
                      value={filters.age}
                      onChange={(e) => setFilters({ ...filters, age: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-4 pr-10 py-3 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] transition-all cursor-pointer text-sm"
                    >
                      <option value="all" className="bg-[#1e1b4b]">Any Age</option>
                      <option value="child" className="bg-[#1e1b4b]">Child</option>
                      <option value="young-adult" className="bg-[#1e1b4b]">Young Adult</option>
                      <option value="adult" className="bg-[#1e1b4b]">Adult</option>
                      <option value="elder" className="bg-[#1e1b4b]">Elder</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5f5]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </aside>

        <div className="flex-1 flex flex-col h-full overflow-hidden">
          <div className="relative mb-8 shrink-0">
            <input
              type="text"
              placeholder="Search AI Characters..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-2xl pl-14 pr-6 py-4 text-lg text-white placeholder-[#cbd5f5]/50 backdrop-blur-md focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_20px_rgba(124,58,237,0.2)] transition-all"
            />
            <svg className="w-6 h-6 text-[#cbd5f5] absolute left-5 top-1/2 -translate-y-1/2" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" /></svg>
          </div>

          <div className="flex-1 overflow-y-auto pb-8 pr-2">
            {loading ? (
              <div className="w-full h-full flex items-center justify-center">
                <div className="w-10 h-10 border-4 border-[#7c3aed] border-t-transparent rounded-full animate-spin"></div>
              </div>
            ) : filteredPersonas.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center text-[#cbd5f5] border-2 border-dashed border-[rgba(255,255,255,0.1)] rounded-3xl bg-[rgba(255,255,255,0.02)] p-12 text-center">
                <svg className="w-16 h-16 mb-4 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <h3 className="text-xl font-bold text-white mb-2">No characters found</h3>
                <p>Try adjusting your search or filter settings to find exactly what you're looking for.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredPersonas.map((persona) => (
                  <div 
                    key={persona.id}
                    onClick={() => handleSelect(persona.id)}
                    className="group bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-3xl overflow-hidden backdrop-blur-xl hover:-translate-y-2 hover:shadow-[0_15px_30px_rgba(124,58,237,0.2)] transition-all duration-300 cursor-pointer flex flex-col h-[320px]"
                  >
                    <div className="h-40 w-full relative overflow-hidden bg-[rgba(0,0,0,0.3)]">
                      {persona.avatarUrl ? (
                        <img 
                          src={persona.avatarUrl} 
                          alt={persona.name} 
                          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-[#1e1b4b] to-[#4c1d95] text-4xl font-bold">
                          {persona.name.charAt(0)}
                        </div>
                      )}
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0f172a]/90 via-transparent to-transparent"></div>
                      <div className="absolute bottom-3 left-4 right-4 flex justify-between items-end">
                        <span className="font-bold text-lg text-white truncate max-w-[70%] drop-shadow-md">
                          {persona.name}
                        </span>
                        <span className="text-xs font-semibold px-2 py-1 rounded-full bg-[#7c3aed]/80 backdrop-blur-sm text-white uppercase tracking-wider">
                          {persona.tone}
                        </span>
                      </div>
                    </div>
                    <div className="p-5 flex-1 flex flex-col justify-between">
                      <p className="text-[#cbd5f5] text-sm line-clamp-3 mb-4 leading-relaxed">
                        {persona.traits || "No description available for this companion."}
                      </p>
                      <button className="w-full py-2.5 bg-[rgba(255,255,255,0.08)] group-hover:bg-gradient-to-r group-hover:from-[#7c3aed] group-hover:to-[#4f46e5] border border-[rgba(255,255,255,0.1)] rounded-[10px] text-white font-semibold transition-all duration-300">
                        Connect
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
