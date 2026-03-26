"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";

export default function SignUp() {
  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
    termsAgreed: false,
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    if (localStorage.getItem("token")) {
      router.push("/dashboard");
    }
  }, [router]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");

    if (!formData.fullName || !formData.phone || !formData.email || !formData.password || !formData.confirmPassword) {
      setError("Please fill in all fields.");
      return;
    }
    if (formData.password !== formData.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }
    if (!formData.termsAgreed) {
      setError("You must agree to the terms and conditions.");
      return;
    }

    setLoading(true);

    try {
      const res = await fetch("/api/auth/signup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          name: formData.fullName,
          email: formData.email,
          phone: formData.phone,
          password: formData.password,
        }),
      });

      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.error || "Signup failed.");
      }
      
      window.location.href = "/login";
    } catch (err: any) {
      setError(err.message || "Something went wrong.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans">
      <div className="w-full flex items-center justify-center p-8 sm:p-12">
        <div className="w-full max-w-md p-8 rounded-2xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_40px_rgba(124,58,237,0.15)]">
          <h1 className="text-3xl font-bold mb-2 text-white text-center">Create an Account</h1>
          <p className="text-[#cbd5f5] mb-8 text-center text-sm">Join the digital legacy today.</p>

          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3 rounded-lg bg-red-500/10 border border-red-500/20 text-red-200 text-sm text-center">
                {error}
              </div>
            )}

            <div className="flex flex-col gap-1.5">
              <label className="text-[#cbd5f5] text-sm font-medium ml-1">Full Name</label>
              <input
                type="text"
                value={formData.fullName}
                onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[#cbd5f5]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="John Doe"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#cbd5f5] text-sm font-medium ml-1">Phone Number</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[#cbd5f5]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="+1 234 567 890"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#cbd5f5] text-sm font-medium ml-1">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[#cbd5f5]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="john@example.com"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#cbd5f5] text-sm font-medium ml-1">Password</label>
              <input
                type="password"
                value={formData.password}
                onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[#cbd5f5]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex flex-col gap-1.5">
              <label className="text-[#cbd5f5] text-sm font-medium ml-1">Confirm Password</label>
              <input
                type="password"
                value={formData.confirmPassword}
                onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                className="w-full bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3 text-white placeholder-[#cbd5f5]/50 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                placeholder="••••••••"
              />
            </div>

            <div className="flex items-center gap-3 mt-2">
              <input
                type="checkbox"
                id="terms"
                checked={formData.termsAgreed}
                onChange={(e) => setFormData({ ...formData, termsAgreed: e.target.checked })}
                className="w-5 h-5 rounded hover:cursor-pointer accent-[#8b5cf6]"
              />
              <label htmlFor="terms" className="text-sm text-[#cbd5f5] cursor-pointer selection:bg-transparent">
                I agree to the Terms and Conditions
              </label>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="mt-6 w-full py-3.5 px-4 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-[12px] text-white font-semibold shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_20px_rgba(167,139,250,0.6)] hover:-translate-y-0.5 transition-all duration-200 flex items-center justify-center"
            >
              {loading ? "Creating Account..." : "Sign Up"}
            </button>
          </form>
        </div>
      </div>

    </div>
  );
}
