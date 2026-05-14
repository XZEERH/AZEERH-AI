import { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Menu, Send, Image as ImageIcon, Mic } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

interface ChatAreaProps {
  messages: { role: string; content: string }[];
  sendMessage: (msg: string) => void;
  isLoading: boolean;
  setSidebarOpen: () => void;
}

export default function ChatArea({ messages, sendMessage, isLoading, setSidebarOpen }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

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
    toast.error("Mohon maaf, upload gambar blom tersedia saat ini!", {
      style: { background: '#121214', color: '#ff1e1e', border: '1px solid #ff1e1e' }
    });
  };

  const handleMicClick = () => {
    toast.info("Fitur mikrofon sedang dalam pengembangan.", {
      style: { background: '#121214', color: '#00f3ff', border: '1px solid #00f3ff' }
    });
  };

  return (
    <div className="flex-1 flex flex-col relative h-full bg-[#050505]">
      
      <div className="md:hidden flex items-center p-4 border-b border-white/10 bg-[#09090b]">
        <button onClick={setSidebarOpen} className="text-gray-400 hover:text-white transition">
          <Menu className="w-6 h-6" />
        </button>
        <span className="ml-4 font-bold text-white tracking-widest text-sm">AZEERH AI</span>
      </div>

      <div className="flex-1 overflow-y-auto p-4 md:p-8 scroll-smooth pb-40 custom-scrollbar">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }} 
              animate={{ opacity: 1, scale: 1 }} 
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="relative"
            >
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-[#00f3ff] via-white to-[#ff00ff] tracking-widest drop-shadow-[0_0_20px_rgba(0,243,255,0.4)] mb-4 select-none">
                AZEERH
              </h1>
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ repeat: Infinity, duration: 10, ease: "linear" }}
                className="absolute -inset-4 border border-dashed border-[#00f3ff]/30 rounded-full w-[120%] h-[150%] -left-[10%] -top-[25%] pointer-events-none hidden md:block"
              />
            </motion.div>
            
            <motion.p 
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="text-gray-400 text-sm md:text-base tracking-widest text-center mt-6"
            >
              SYSTEM ONLINE • READY FOR COMMAND
            </motion.p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}>
                <div className={`max-w-[90%] md:max-w-[80%] rounded-2xl px-5 py-4 ${
                  msg.role === "user" 
                    ? "bg-[#202022] text-white rounded-tr-sm" 
                    : "bg-transparent text-gray-200 border border-white/10 shadow-[0_0_15px_rgba(0,243,255,0.03)] rounded-tl-sm"
                }`}>
                  {msg.role === "assistant" && (
                    <div className="text-xs text-[#00f3ff] font-bold mb-3 tracking-widest flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-[#00f3ff] animate-pulse" />
                      AZEERH
                    </div>
                  )}
                  
                  <div className={`prose prose-invert max-w-none text-sm md:text-base leading-relaxed ${msg.role === "user" ? "whitespace-pre-wrap" : ""}`}>
                    {msg.role === "assistant" ? (
                      <ReactMarkdown 
                        components={{
                          code({node, inline, className, children, ...props}: any) {
                            return !inline ? (
                              <div className="bg-[#0d0d0f] rounded-lg p-4 overflow-x-auto my-4 border border-white/10 font-mono text-sm">
                                <code {...props} className={className}>{children}</code>
                              </div>
                            ) : (
                              <code {...props} className="bg-white/10 px-1.5 py-0.5 rounded text-[#00f3ff]">{children}</code>
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
              </div>
            ))}
            
            {isLoading && (
              <div className="flex justify-start">
                <div className="bg-transparent border border-white/10 px-6 py-4 rounded-2xl rounded-tl-sm flex gap-2 items-center h-12 shadow-[0_0_15px_rgba(0,243,255,0.03)]">
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1 }} className="w-2.5 h-2.5 bg-[#00f3ff] rounded-full"></motion.div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.2 }} className="w-2.5 h-2.5 bg-[#00f3ff] rounded-full"></motion.div>
                  <motion.div animate={{ scale: [1, 1.5, 1], opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 1, delay: 0.4 }} className="w-2.5 h-2.5 bg-[#00f3ff] rounded-full"></motion.div>
                </div>
              </div>
            )}
            <div ref={endOfMessagesRef} />
          </div>
        )}
      </div>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-[#050505] via-[#050505] to-transparent pt-12 pb-6 px-4 md:px-8">
        <div className="max-w-4xl mx-auto">
          <div className="relative flex items-end gap-2 bg-[#121214] border border-white/10 p-2.5 rounded-2xl shadow-2xl focus-within:border-[#00f3ff]/50 transition-colors">
            
            <button onClick={handleUploadClick} title="Upload Gambar" className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition">
              <ImageIcon className="w-5 h-5" />
            </button>
            <button onClick={handleMicClick} title="Gunakan Suara" className="p-3 text-gray-400 hover:text-white hover:bg-white/5 rounded-xl transition hidden sm:block">
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
              placeholder="Ketik perintah, minta kode, atau tanya apapun..."
              className="flex-1 max-h-40 min-h-[44px] bg-transparent text-white placeholder-gray-500 resize-none outline-none py-3 text-sm md:text-base custom-scrollbar"
              rows={1}
            />

            <button 
              onClick={handleSend}
              disabled={!input.trim() || isLoading}
              className="p-3 bg-white text-black hover:bg-gray-200 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl transition ml-2 group"
            >
              <Send className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </button>
          </div>
          
          <p className="text-center text-[10px] md:text-xs text-gray-500 mt-3 tracking-wide">
            Azeerh AI dapat membuat kesalahan. Harap periksa informasi penting. | Dibuat oleh Razeerh
          </p>
        </div>
      </div>
    </div>
  );
}