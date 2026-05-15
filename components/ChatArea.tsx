import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, Send, Image as ImageIcon, Mic, Moon, Sun } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ChatAreaProps {
  messages: { role: string; content: string }[];
  sendMessage: (msg: string) => void;
  isLoading: boolean;
  setSidebarOpen: () => void;
  theme: string;
  toggleTheme: () => void;
}

export default function ChatArea({ messages, sendMessage, isLoading, setSidebarOpen, theme, toggleTheme }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  // Auto-scroll yang smooth ke bawah setiap ada pesan
  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim()) {
      sendMessage(input);
      setInput("");
    }
  };

  const handleUploadClick = () => {
    toast.error("Mohon maaf, upload gambar blom tersedia saat ini!");
  };

  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      toast.error("Browser perangkat Anda tidak mendukung fitur mikrofon.");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;

    recognition.onstart = () => {
      setIsListening(true);
      toast.info("Mendengarkan suara...");
    };

    recognition.onresult = (event: any) => {
      const transcript = event.results[0][0].transcript;
      setInput((prev) => prev + (prev ? " " : "") + transcript);
    };

    recognition.onerror = () => {
      toast.error("Gagal mendeteksi suara.");
      setIsListening(false);
    };

    recognition.onend = () => {
      setIsListening(false);
    };

    recognition.start();
  };

  return (
    /* PERBAIKAN LAYOUT UTAMA: Menggunakan flex-col h-full agar rapi terbagi 3 bagian */
    <div className="flex flex-col h-full w-full bg-gray-50 dark:bg-zinc-950 transition-colors duration-300">
      
      {/* BAGIAN 1: HEADER (Flex-none agar tinggi tetap dan tidak tumpang tindih) */}
      <header className="flex-none flex items-center justify-between p-4 border-b border-gray-200 dark:border-white/5 bg-white dark:bg-zinc-900 shadow-sm z-20">
        <div className="flex items-center">
          <button onClick={setSidebarOpen} className="md:hidden text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-white transition">
            <Menu className="w-6 h-6" />
          </button>
          <span className="ml-4 font-bold text-gray-800 dark:text-white tracking-widest text-sm md:hidden">AZEERH AI</span>
        </div>
        
        <button 
          onClick={toggleTheme}
          className="p-2 rounded-full bg-gray-100 dark:bg-white/10 text-gray-600 dark:text-gray-300 hover:bg-gray-200 dark:hover:bg-white/20 transition-all"
        >
          {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
        </button>
      </header>

      {/* BAGIAN 2: AREA CHAT (Flex-1 agar mengisi sisa ruang tengah, otomatis scroll di sini) */}
      <main className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00f3ff] to-[#ff00ff] tracking-widest drop-shadow-[0_0_15px_rgba(0,243,255,0.2)] mb-4 select-none">
                AZEERH
              </h1>
            </motion.div>
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-500 dark:text-gray-400 text-sm md:text-base tracking-widest text-center mt-6 font-medium"
            >
              SYSTEM ONLINE • READY FOR COMMAND
            </motion.p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-6">
            {messages.map((msg, idx) => (
              <motion.div 
                key={idx} 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ type: "spring", stiffness: 260, damping: 20 }}
                className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
              >
                <div className={`max-w-[90%] md:max-w-[80%] rounded-3xl px-6 py-4 shadow-sm ${
                  msg.role === "user" 
                    ? "bg-gray-200 dark:bg-zinc-800 text-gray-900 dark:text-white rounded-tr-sm" 
                    : "bg-white dark:bg-zinc-900 text-gray-800 dark:text-gray-200 border border-gray-100 dark:border-white/5 shadow-sm rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" && (
                    <div className="text-xs text-[#00f3ff] font-bold mb-3 tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" />
                      AZEERH
                    </div>
                  )}
                  
                  <div className={`prose dark:prose-invert max-w-none text-sm md:text-base leading-relaxed ${msg.role === "user" ? "whitespace-pre-wrap" : ""}`}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown 
                        components={{
                          code({node, inline, className, children, ...props}: any) {
                            return !inline ? (
                              <div className="bg-gray-100 dark:bg-zinc-950/50 rounded-xl p-4 overflow-x-auto my-4 border border-gray-200 dark:border-white/10 font-mono text-sm shadow-inner">
                                <code {...props} className={className}>{children}</code>
                              </div>
                            ) : (
                              <code {...props} className="bg-gray-100 dark:bg-white/10 px-1.5 py-0.5 rounded text-[#008cff] dark:text-[#00f3ff] font-semibold">{children}</code>
                            )
                          }
                        }}
                      >
                        {msg.content}
                      </ReactMarkdown>
                    ) : (
                      msg.content
                    )}
                  </div>
                </div>
              </motion.div>
            ))}
            
            {isLoading && (
              <motion.div 
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex justify-start"
              >
                <div className="bg-white dark:bg-zinc-900 border border-gray-100 dark:border-white/5 px-6 py-4 rounded-3xl rounded-tl-sm flex gap-2 items-center h-12 shadow-sm">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2 h-2 bg-[#00f3ff] rounded-full"></motion.div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2 h-2 bg-[#00f3ff] rounded-full"></motion.div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2 h-2 bg-[#00f3ff] rounded-full"></motion.div>
                </div>
              </motion.div>
            )}
            {/* Pembatas bawah agar auto-scroll tidak mentok banget */}
            <div ref={endOfMessagesRef} className="h-4" />
          </div>
        )}
      </main>

      {/* BAGIAN 3: KOTAK INPUT BAWAH (Flex-none agar diam di tempat paling bawah) */}
      <footer className="flex-none p-4 md:p-6 bg-gray-50 dark:bg-zinc-950 border-t border-transparent">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-white dark:bg-zinc-900 border border-gray-200 dark:border-white/10 p-2.5 rounded-3xl shadow-xl focus-within:border-gray-400 dark:focus-within:border-[#00f3ff]/50 transition-colors">
            
            <button onClick={handleUploadClick} className="p-3 text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5 rounded-2xl transition">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button 
              onClick={handleMicClick} 
              className={`p-3 rounded-2xl transition ${isListening ? "text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse" : "text-gray-500 dark:text-gray-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-white/5"}`}
            >
              <Mic className="w-5 h-5" />
            </button>

            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder={isListening ? "Mendengarkan..." : "Ketik pesan..."}
              className="flex-1 max-h-40 min-h-[44px] bg-transparent text-gray-900 dark:text-white placeholder-gray-400 dark:placeholder-gray-500 resize-none outline-none py-3 text-sm md:text-base custom-scrollbar"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-gray-900 dark:bg-white text-white dark:text-black hover:bg-gray-800 dark:hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-2xl transition ml-2 group"
            >
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          <p className="text-center text-[10px] md:text-xs text-gray-400 dark:text-gray-500 mt-3 tracking-wide font-medium">
            Azeerh AI dapat membuat kesalahan. Harap periksa informasi penting.
          </p>
        </div>
      </footer>
    </div>
  );
}