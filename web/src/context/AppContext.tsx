"use client";

import React, { createContext, useContext, useState, ReactNode } from "react";

interface User {
  id: string;
  email: string;
  name?: string;
  avatarUrl?: string;
}

interface Persona {
  id: string;
  name: string;
  avatarUrl: string | null;
  traits: string;
  tone: string;
}

interface Session {
  id: string;
  personaId: string;
}

interface AppState {
  user: User | null;
  personas: Persona[];
  currentSession: Session | null;
  setUser: (user: User | null) => void;
  setPersonas: (personas: Persona[]) => void;
  setCurrentSession: (session: Session | null) => void;
}

const AppContext = createContext<AppState | undefined>(undefined);

export function AppProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [currentSession, setCurrentSession] = useState<Session | null>(null);

  return (
    <AppContext.Provider value={{ user, setUser, personas, setPersonas, currentSession, setCurrentSession }}>
      {children}
    </AppContext.Provider>
  );
}

export function useAppContext() {
  const context = useContext(AppContext);
  if (context === undefined) {
    throw new Error("useAppContext must be used within an AppProvider");
  }
  return context;
}
