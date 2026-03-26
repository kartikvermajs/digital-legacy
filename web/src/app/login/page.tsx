"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function Login() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.email || !formData.password) {
      setError("Please fill in all fields.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Invalid credentials.");
      }
      
      const data = await res.json();
      localStorage.setItem("token", data.token);
      
      // Successfully authenticated and token saved
      router.push("/dashboard");
    } catch (err: any) {
      setError(err.message || "Failed to login. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans">
      <div className="w-full flex flex-col justify-center items-center p-8 sm:p-12 relative z-10">
        <div className="w-full max-w-md mx-auto p-8 rounded-3xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.15)] flex flex-col gap-6">
          <div className="text-center mb-2">
            <h1 className="text-3xl font-bold mb-2 text-white">Welcome Back</h1>
            <p className="text-[#cbd5f5] text-sm">Log in to continue your digital legacy.</p>
          </div>

          <form onSubmit={handleLogin} className="flex flex-col gap-5">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[#cbd5f5] text-sm font-medium ml-1">Email Address</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="you@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#cbd5f5] text-sm font-medium ml-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="••••••••"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-4 w-full py-4 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-[12px] text-white font-bold text-lg shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(167,139,250,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center"
            >
              {loading ? "Authenticating..." : "Log In"}
            </button>
          </form>

          <div className="text-center mt-2">
            <span className="text-[#cbd5f5] text-sm">Don't have an account? </span>
            <Link href="/signup" className="text-[#a78bfa] hover:text-white transition-colors text-sm font-bold">
              Sign up
            </Link>
          </div>
        </div>
      </div>

    </div>
  );
}
