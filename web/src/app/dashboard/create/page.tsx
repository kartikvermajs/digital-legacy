"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function CreateAI() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    characterType: "mentor",
    gender: "female",
    age: "young-adult",
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.name || !formData.description) {
      setError("Please fill in all required fields.");
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      if (!token) {
        router.push("/login");
        return;
      }

      const traits = `${formData.description}. A ${formData.age} ${formData.gender} acting as a ${formData.characterType}.`;
      
      const res = await fetch("/api/personas", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          name: formData.name,
          traits: traits,
          tone: formData.characterType,
          gender: formData.gender,
        }),
      });

      if (!res.ok) {
        throw new Error("Failed to create AI character.");
      }

      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans text-white p-6 md:p-12 flex flex-col">
      <nav className="mb-12">
        <Link 
          href="/dashboard" 
          className="text-[#cbd5f5] hover:text-[#a78bfa] transition-colors flex items-center gap-2 font-medium w-fit"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back to Dashboard
        </Link>
      </nav>

      <div className="flex-1 flex justify-center items-center">
        <div className="w-full max-w-2xl p-8 sm:p-10 rounded-3xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.15)]">
          <div className="mb-10 text-center">
            <h1 className="text-3xl font-bold mb-3 text-transparent bg-clip-text bg-gradient-to-r from-white to-[#cbd5f5]">
              Create AI Companion
            </h1>
            <p className="text-[#cbd5f5] text-sm md:text-base">
              Design the personality, traits, and foundational identity of your new digital legacy character.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            {error && (
              <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-2">
              <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Character Name</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/40 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="e.g. Marcus Aurelius"
              />
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Detailed Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={4}
                className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/40 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all resize-none"
                placeholder="Describe their background, how they speak, their core beliefs..."
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
              <div className="flex flex-col gap-2">
                <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Character Type</label>
                <div className="relative">
                  <select
                    value={formData.characterType}
                    onChange={(e) => setFormData({ ...formData, characterType: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-4 pr-10 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all cursor-pointer"
                  >
                    <option value="mentor" className="bg-[#1e1b4b]">Mentor</option>
                    <option value="friend" className="bg-[#1e1b4b]">Friend</option>
                    <option value="expert" className="bg-[#1e1b4b]">Expert</option>
                    <option value="historical" className="bg-[#1e1b4b]">Historical Figure</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5f5]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Gender</label>
                <div className="relative">
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-4 pr-10 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all cursor-pointer"
                  >
                    <option value="female" className="bg-[#1e1b4b]">Female</option>
                    <option value="male" className="bg-[#1e1b4b]">Male</option>
                    <option value="non-binary" className="bg-[#1e1b4b]">Non-binary</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5f5]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Age Group</label>
                <div className="relative">
                  <select
                    value={formData.age}
                    onChange={(e) => setFormData({ ...formData, age: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-4 pr-10 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all cursor-pointer"
                  >
                    <option value="child" className="bg-[#1e1b4b]">Child</option>
                    <option value="young-adult" className="bg-[#1e1b4b]">Young Adult</option>
                    <option value="adult" className="bg-[#1e1b4b]">Adult</option>
                    <option value="elder" className="bg-[#1e1b4b]">Elder</option>
                  </select>
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5f5]">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                  </div>
                </div>
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 px-6 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-[12px] text-white text-lg font-bold shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_25px_rgba(167,139,250,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
              >
                {loading ? "Creating..." : "Create AI"}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
