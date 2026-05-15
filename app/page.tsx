"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export type Message = { role: "user" | "assistant"; content: string };
export type ChatSession = { id: string; title: string; messages: Message[]; updatedAt: number };

export default function Home() {
  const [sessions, setSessions] = useState<ChatSession[]>([]);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState("llama-3.3-70b-versatile");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark");

  // LOAD SESSIONS & TEMA DARI PENYIMPANAN
  useEffect(() => {
    const savedSessions = localStorage.getItem("azeerh_sessions");
    const savedTheme = localStorage.getItem("azeerh_theme");
    
    if (savedSessions) {
      const parsed = JSON.parse(savedSessions);
      setSessions(parsed);
      // Opsional: Buka chat terakhir jika ada
      if (parsed.length > 0) setCurrentSessionId(parsed[0].id);
    }
    
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // SIMPAN SESSIONS OTOMATIS
  useEffect(() => {
    localStorage.setItem("azeerh_sessions", JSON.stringify(sessions));
  }, [sessions]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("azeerh_theme", newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const createNewChat = () => {
    setCurrentSessionId(null);
    setIsSidebarOpen(false);
  };

  const deleteSession = (id: string) => {
    const updated = sessions.filter(s => s.id !== id);
    setSessions(updated);
    if (currentSessionId === id) setCurrentSessionId(null);
  };

  const renameSession = (id: string, newTitle: string) => {
    setSessions(sessions.map(s => s.id === id ? { ...s, title: newTitle } : s));
  };

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    let targetSessionId = currentSessionId;
    let currentSessions = [...sessions];

    // JIKA CHAT BARU, BUAT SESI BARU
    if (!targetSessionId) {
      targetSessionId = Date.now().toString();
      const newTitle = input.length > 25 ? input.substring(0, 25) + "..." : input;
      const newSession: ChatSession = { id: targetSessionId, title: newTitle, messages: [], updatedAt: Date.now() };
      currentSessions = [newSession, ...currentSessions];
      setCurrentSessionId(targetSessionId);
    }

    // TAMBAH PESAN USER KE SESI YANG TEPAT
    const newMessage = { role: "user" as const, content: input };
    currentSessions = currentSessions.map(s => 
      s.id === targetSessionId ? { ...s, messages: [...s.messages, newMessage], updatedAt: Date.now() } : s
    );
    setSessions(currentSessions);
    setIsLoading(true);

    // MENGAMBIL RIWAYAT CHAT DARI SESI TERSEBUT UNTUK DIKIRIM KE API
    const activeSession = currentSessions.find(s => s.id === targetSessionId);
    const messagesToSend = activeSession ? activeSession.messages : [newMessage];

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: messagesToSend, model: currentModel }),
      });

      const data = await res.json();
      
      if (!res.ok) throw new Error(data.error || "Gagal menyambung ke server API Groq.");
      if (!data.choices || !data.choices[0]) throw new Error("Respon API tidak valid");

      const reply = data.choices[0].message.content;

      // TAMBAH PESAN AI KE SESI YANG TEPAT
      setSessions(prev => prev.map(s => 
        s.id === targetSessionId ? { ...s, messages: [...s.messages, { role: "assistant", content: reply }], updatedAt: Date.now() } : s
      ));

    } catch (error: any) {
      setSessions(prev => prev.map(s => 
        s.id === targetSessionId ? { ...s, messages: [...s.messages, { role: "assistant", content: `⚠️ **SYSTEM ERROR:** ${error.message}` }], updatedAt: Date.now() } : s
      ));
    } finally {
      setIsLoading(false);
    }
  };

  const clearAllChats = () => {
    setSessions([]);
    setCurrentSessionId(null);
    localStorage.removeItem("azeerh_sessions");
  };

  const currentSession = sessions.find(s => s.id === currentSessionId);

  return (
    <main className="flex h-[100dvh] w-full overflow-hidden bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        sessions={sessions}
        currentSessionId={currentSessionId}
        setCurrentSessionId={setCurrentSessionId}
        createNewChat={createNewChat}
        deleteSession={deleteSession}
        renameSession={renameSession}
        currentModel={currentModel}
        setCurrentModel={setCurrentModel}
        clearAllChats={clearAllChats}
      />
      <ChatArea 
        currentSessionTitle={currentSession?.title}
        messages={currentSession?.messages || []} 
        sendMessage={sendMessage} 
        isLoading={isLoading} 
        setSidebarOpen={() => setIsSidebarOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </main>
  );
}