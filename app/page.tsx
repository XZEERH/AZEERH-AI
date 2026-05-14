"use client";

import { useState } from "react";
import Sidebar from "@/components/Sidebar";
import ChatArea from "@/components/ChatArea";

export type Message = { role: "user" | "assistant"; content: string };

export default function Home() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [currentModel, setCurrentModel] = useState("llama3-70b-8192");
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

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
      if (data.choices && data.choices[0]) {
        setMessages([...newMessages, { role: "assistant", content: data.choices[0].message.content }]);
      } else {
        throw new Error("Respon tidak valid");
      }
    } catch (error) {
      setMessages([...newMessages, { role: "assistant", content: "⚠️ **SYSTEM ERROR:** Gagal menyambung ke server API Groq." }]);
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => setMessages([]);

  return (
    <main className="flex h-screen w-full bg-[#050505]">
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
      />
    </main>
  );
}