"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface UserProfile {
  name: string;
  email: string;
  birthday: string;
  gender: string;
  avatarUrl: string;
}

export default function Settings() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [profile, setProfile] = useState<UserProfile>({
    name: "",
    email: "",
    birthday: "",
    gender: "Not specified",
    avatarUrl: "",
  });
  
  const [preferences, setPreferences] = useState({
    darkMode: true,
    notifications: true,
  });

  const [message, setMessage] = useState<{type: "error" | "success", text: string} | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) return router.push("/login");

        const res = await fetch("/api/auth/me", {
          headers: { Authorization: `Bearer ${token}` }
        });
        
        if (res.ok) {
          const data = await res.json();
          setProfile(prev => ({
            ...prev,
            email: data.email || "",
            name: data.name || "",
            avatarUrl: data.avatarUrl || "",
          }));
        }
      } catch (err) {}
    };
    fetchProfile();
  }, [router]);

  const handleUpdateUser = async (e: React.FormEvent) => {
    e.preventDefault();
    setMessage(null);
    setLoading(true);

    try {
      const token = localStorage.getItem("token");
      await fetch("/api/user/update", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
      setMessage({ type: "success", text: "Profile updated successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to update profile." });
    } finally {
      setLoading(false);
    }
  };

  const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setMessage(null);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/avatar", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
        },
        body: formData,
      });

      if (!res.ok) throw new Error();

      const data = await res.json();
      setProfile(prev => ({ ...prev, avatarUrl: data.avatarUrl || data.url }));
      setMessage({ type: "success", text: "Avatar uploaded successfully." });
    } catch (err) {
      setMessage({ type: "error", text: "Failed to upload avatar." });
    }
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    router.push("/login");
  };

  return (
    <div className="min-h-screen bg-[linear-gradient(135deg,#0f172a,#1e1b4b,#4c1d95)] font-sans text-white flex">
      <aside className="w-72 hidden md:flex flex-col border-r border-[rgba(255,255,255,0.1)] bg-[rgba(255,255,255,0.02)] backdrop-blur-3xl sticky top-0 h-screen p-8">
        <div className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-[#8b5cf6] to-[#a78bfa] mb-12">
          Digital Legacy
        </div>
        
        <nav className="flex flex-col gap-4 flex-1">
          <Link href="/dashboard/settings" className="px-4 py-3 rounded-xl bg-[rgba(255,255,255,0.1)] text-white font-medium shadow-[0_0_15px_rgba(124,58,237,0.2)] transition-all">
            Profile
          </Link>
          <Link href="/dashboard" className="px-4 py-3 rounded-xl text-[#cbd5f5] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-all">
            AI Characters
          </Link>
          <Link href="/dashboard/settings" className="px-4 py-3 rounded-xl text-[#cbd5f5] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-all">
            Preference
          </Link>
          <Link href="/support" className="px-4 py-3 rounded-xl text-[#cbd5f5] hover:bg-[rgba(255,255,255,0.05)] hover:text-white transition-all">
            Support
          </Link>
        </nav>

        <button 
          onClick={handleLogout}
          className="mt-auto px-4 py-3 rounded-xl text-red-400 hover:bg-red-500/10 hover:text-red-300 transition-all text-left font-medium flex items-center gap-3"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" /></svg>
          Logout
        </button>
      </aside>

      <main className="flex-1 p-8 sm:p-12 overflow-y-auto w-full">
        <div className="max-w-4xl mx-auto">
          <div className="flex flex-col sm:flex-row justify-between items-start gap-8 mb-10">
            <div>
              <h1 className="text-3xl font-bold mb-2">Profile Settings</h1>
              <p className="text-[#cbd5f5]">Manage your account details and preferences.</p>
            </div>
            
            <div className="relative group shrink-0">
              <div className="w-28 h-28 rounded-full overflow-hidden border-2 border-[rgba(255,255,255,0.2)] bg-[rgba(0,0,0,0.3)] shadow-[0_0_20px_rgba(124,58,237,0.3)] group-hover:border-[#a78bfa] transition-all">
                {profile.avatarUrl ? (
                  <img src={profile.avatarUrl} alt="Avatar" className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex flex-col items-center justify-center text-[#cbd5f5]">
                    <svg className="w-8 h-8 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  </div>
                )}
              </div>
              <label 
                className="absolute bottom-0 right-0 p-2.5 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-full cursor-pointer shadow-[0_0_15px_#a78bfa] hover:scale-110 transition-transform"
                title="Upload Avatar"
              >
                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} />
                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 16A8 8 0 0115.8 4.2M21 16a8 8 0 00-11-5.8M12 13v9M12 13l-3 3M12 13l3 3" /></svg>
              </label>
            </div>
          </div>

          <form onSubmit={handleUpdateUser} className="space-y-10">
            {message && (
              <div className={`p-4 rounded-xl border text-sm text-center ${message.type === 'error' ? 'bg-red-500/10 border-red-500/20 text-red-200' : 'bg-green-500/10 border-green-500/20 text-green-200'}`}>
                {message.text}
              </div>
            )}

            <div className="p-8 rounded-3xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_30px_rgba(124,58,237,0.1)] flex flex-col gap-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                Personal Information
              </h2>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="flex flex-col gap-2">
                  <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Full Name</label>
                  <input
                    type="text"
                    value={profile.name}
                    onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/40 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                  />
                </div>
                
                <div className="flex flex-col gap-2">
                  <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Email Address</label>
                  <input
                    type="email"
                    value={profile.email}
                    onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/40 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Birthday</label>
                  <input
                    type="date"
                    value={profile.birthday}
                    onChange={(e) => setProfile({ ...profile, birthday: e.target.value })}
                    className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl px-4 py-3.5 text-white placeholder-[#cbd5f5]/40 focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all [color-scheme:dark]"
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label className="text-[#cbd5f5] text-sm font-semibold ml-1">Gender</label>
                  <div className="relative">
                    <select
                      value={profile.gender}
                      onChange={(e) => setProfile({ ...profile, gender: e.target.value })}
                      className="w-full bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.1)] rounded-xl pl-4 pr-10 py-3.5 text-white appearance-none focus:outline-none focus:ring-2 focus:ring-[#7c3aed] focus:shadow-[0_0_15px_#7c3aed] transition-all cursor-pointer"
                    >
                      <option value="Not specified" className="bg-[#1e1b4b]">Select Gender</option>
                      <option value="Female" className="bg-[#1e1b4b]">Female</option>
                      <option value="Male" className="bg-[#1e1b4b]">Male</option>
                      <option value="Custom" className="bg-[#1e1b4b]">Custom</option>
                    </select>
                    <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-[#cbd5f5]">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-8 rounded-3xl bg-[rgba(255,255,255,0.05)] border border-[rgba(255,255,255,0.1)] backdrop-blur-xl shadow-[0_0_30px_rgba(124,58,237,0.1)] flex flex-col gap-6">
              <h2 className="text-xl font-bold flex items-center gap-3">
                <svg className="w-5 h-5 text-[#8b5cf6]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                Preferences
              </h2>
              
              <div className="flex flex-col gap-6">
                <div className="flex items-center justify-between p-4 rounded-2xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
                  <div>
                    <h3 className="font-semibold text-white">Dark Mode</h3>
                    <p className="text-[#cbd5f5] text-sm">Experience the premium dark interface.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPreferences(p => ({ ...p, darkMode: !p.darkMode }))}
                    className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${preferences.darkMode ? 'bg-[#7c3aed]' : 'bg-[rgba(255,255,255,0.2)]'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-md ${preferences.darkMode ? 'translate-x-8' : 'translate-x-1'}`}></div>
                  </button>
                </div>

                <div className="flex items-center justify-between p-4 rounded-2xl bg-[rgba(0,0,0,0.2)] border border-[rgba(255,255,255,0.05)]">
                  <div>
                    <h3 className="font-semibold text-white">Email Notifications</h3>
                    <p className="text-[#cbd5f5] text-sm">Receive updates about your AI companions.</p>
                  </div>
                  <button 
                    type="button"
                    onClick={() => setPreferences(p => ({ ...p, notifications: !p.notifications }))}
                    className={`w-14 h-7 rounded-full transition-colors relative shadow-inner ${preferences.notifications ? 'bg-[#7c3aed]' : 'bg-[rgba(255,255,255,0.2)]'}`}
                  >
                    <div className={`w-5 h-5 bg-white rounded-full absolute top-1 transition-transform shadow-md ${preferences.notifications ? 'translate-x-8' : 'translate-x-1'}`}></div>
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                type="submit"
                disabled={loading}
                className="py-4 px-10 bg-gradient-to-r from-[#7c3aed] to-[#4f46e5] rounded-[12px] text-white font-bold shadow-[0_4px_14px_0_rgba(124,58,237,0.39)] hover:shadow-[0_6px_25px_rgba(167,139,250,0.6)] hover:-translate-y-1 transition-all duration-300 flex items-center justify-center min-w-[200px]"
              >
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
