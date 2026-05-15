"use client";

import { useState, useEffect } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState("llama3-70b-8192");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [theme, setTheme] = useState("dark"); // STATE MODE TERANG/GELAP

  // LOAD RIWAYAT CHAT & TEMA DARI PENYIMPANAN BROWSER MASING-MASING PENGGUNA
  useEffect(() => {
    const savedChat = localStorage.getItem("azeerh_chat_history");
    const savedTheme = localStorage.getItem("azeerh_theme");
    if (savedChat) setMessages(JSON.parse(savedChat));
    if (savedTheme) {
      setTheme(savedTheme);
      if (savedTheme === "dark") document.documentElement.classList.add("dark");
      else document.documentElement.classList.remove("dark");
    } else {
      document.documentElement.classList.add("dark");
    }
  }, []);

  // SIMPAN RIWAYAT CHAT OTOMATIS SETIAP ADA PESAN BARU
  useEffect(() => {
    localStorage.setItem("azeerh_chat_history", JSON.stringify(messages));
  }, [messages]);

  const toggleTheme = () => {
    const newTheme = theme === "dark" ? "light" : "dark";
    setTheme(newTheme);
    localStorage.setItem("azeerh_theme", newTheme);
    if (newTheme === "dark") document.documentElement.classList.add("dark");
    else document.documentElement.classList.remove("dark");
  };

  const sendMessage = async (input: string) => {
    if (!input.trim()) return;

    const newMessages = [...messages, { role: "user" as const, content: input }];
    setMessages(newMessages);
    setIsLoading(true);

    try {
      const res = await fetch("/api/chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ messages: newMessages, model: currentModel }),
      });

      const data = await res.json();
      
      if (!res.ok) {
        throw new Error(data.error || "Gagal menyambung ke server API Groq.");
      }

      if (data.choices && data.choices[0]) {
        setMessages([...newMessages, { role: "assistant", content: data.choices[0].message.content }]);
      } else {
        throw new Error("Respon API tidak valid");
      }
    } catch (error: any) {
      setMessages([...newMessages, { role: "assistant", content: `⚠️ **SYSTEM ERROR:** ${error.message}` }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([]);
    localStorage.removeItem("azeerh_chat_history");
  };

  return (
    <main className="flex h-screen w-full bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen}
        currentModel={currentModel}
        setCurrentModel={setCurrentModel}
        clearChat={clearChat}
      />
      <ChatArea 
        messages={messages} 
        sendMessage={sendMessage} 
        isLoading={isLoading} 
        setSidebarOpen={() => setIsSidebarOpen(true)}
        theme={theme}
        toggleTheme={toggleTheme}
      />
    </main>
  );
}