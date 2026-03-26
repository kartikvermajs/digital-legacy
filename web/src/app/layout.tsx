import type { Metadata } from "next";
import "./globals.css";

import QueryProvider from "../providers/QueryProvider";
import { AppProvider } from "../context/AppContext";
import AudioUnlock from "@/components/audioUnlock";

export const metadata: Metadata = {
  title: "Digital Legacy",
  description: "AI Voice Companion App",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full">
      <body className="min-h-full flex flex-col">
        <QueryProvider>
          <AppProvider>
            <AudioUnlock />
            {children}
          </AppProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
