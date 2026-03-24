"use client";
import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function Signup() {
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleSignup = (e: React.FormEvent) => {
    e.preventDefault();
    router.push('/dashboard');
  };

  return (
    <div className="flex flex-col min-h-screen items-center justify-center bg-slate-900 px-6">
      <h1 className="text-3xl font-bold text-white mb-8">Create Account</h1>
      <form onSubmit={handleSignup} className="w-full max-w-sm">
        <input 
          className="w-full bg-slate-800 text-white p-4 rounded-xl mb-4 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          placeholder="Email" 
          type="email"
          value={email} onChange={e => setEmail(e.target.value)}
        />
        <input 
          className="w-full bg-slate-800 text-white p-4 rounded-xl mb-8 focus:outline-none focus:ring-2 focus:ring-indigo-500" 
          placeholder="Password" 
          type="password"
          value={password} onChange={e => setPassword(e.target.value)}
        />
        <button type="submit" className="w-full bg-indigo-500 py-4 rounded-xl text-white font-bold text-lg hover:bg-indigo-600 transition">
          Sign Up
        </button>
      </form>
      <button onClick={() => router.push('/login')} className="mt-4 text-indigo-400 hover:text-indigo-300">
        Already have an account? Login
      </button>
    </div>
  );
}
