import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Menu, Send, Image as ImageIcon, Mic, Moon, Sun, ThumbsUp, ThumbsDown, Copy, Play, Check, X } from "lucide-react";
import { toast } from "sonner";
import ReactMarkdown from "react-markdown";

// KOMPONEN RENDER KODE (Live Preview HTML & Copy Code)
const CodeBlock = ({ inline, className, children, ...props }: any) => {
  const [isCopied, setIsCopied] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const match = /language-(\w+)/.exec(className || '');
  const lang = match ? match[1] : '';
  const codeString = String(children).replace(/\n$/, '');

  const handleCopyCode = () => {
    navigator.clipboard.writeText(codeString);
    setIsCopied(true);
    toast.success("Kode berhasil disalin!");
    setTimeout(() => setIsCopied(false), 2000);
  };

  if (inline) return <code className="bg-zinc-200 dark:bg-white/10 px-1.5 py-0.5 rounded-md text-cyan-600 dark:text-cyan-400 font-semibold text-[13px]">{children}</code>;

  return (
    <div className="my-5 rounded-xl overflow-hidden border border-zinc-200 dark:border-white/10 shadow-sm bg-zinc-50 dark:bg-[#050505]">
      <div className="flex items-center justify-between px-4 py-2.5 bg-zinc-200 dark:bg-zinc-900 border-b border-zinc-300 dark:border-white/5">
        <span className="text-xs font-mono text-zinc-600 dark:text-zinc-400 uppercase font-bold tracking-wider">{lang || 'Code'}</span>
        <div className="flex items-center gap-4">
          {lang === 'html' && (
            <button onClick={() => setShowPreview(!showPreview)} className="text-xs flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium">
              <Play className="w-3.5 h-3.5" /> {showPreview ? "Tutup Preview" : "Live Preview"}
            </button>
          )}
          <button onClick={handleCopyCode} className="text-xs flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400 hover:text-cyan-600 dark:hover:text-cyan-400 transition-colors font-medium">
            {isCopied ? <Check className="w-3.5 h-3.5 text-green-500" /> : <Copy className="w-3.5 h-3.5" />} {isCopied ? "Copied!" : "Copy Code"}
          </button>
        </div>
      </div>
      <div className="p-4 overflow-x-auto text-[14px]">
        {showPreview && lang === 'html' ? (
          <iframe srcDoc={codeString} className="w-full h-80 bg-white rounded-lg border border-zinc-200 shadow-inner" sandbox="allow-scripts" title="Live Preview" />
        ) : <code className={className} {...props}>{children}</code>}
      </div>
    </div>
  );
};

// KOMPONEN UTAMA
interface ChatAreaProps {
  currentSessionTitle?: string;
  messages: { role: string; content: string; imageUrl?: string }[];
  sendMessage: (msg: string, attachmentUrl?: string) => void;
  isLoading: boolean;
  setSidebarOpen: () => void;
  theme: string;
  toggleTheme: () => void;
}

export default function ChatArea({ currentSessionTitle, messages, sendMessage, isLoading, setSidebarOpen, theme, toggleTheme }: ChatAreaProps) {
  const [input, setInput] = useState("");
  const [isListening, setIsListening] = useState(false);
  const [attachmentPreview, setAttachmentPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const endOfMessagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    endOfMessagesRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isLoading]);

  const handleSend = () => {
    if (input.trim() || attachmentPreview) {
      sendMessage(input, attachmentPreview || undefined);
      setInput("");
      setAttachmentPreview(null);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 4 * 1024 * 1024) return toast.error("Ukuran gambar maksimal 4MB");
      const reader = new FileReader();
      reader.onloadend = () => setAttachmentPreview(reader.result as string);
      reader.readAsDataURL(file);
    }
  };

  const handleCopyText = (text: string) => { navigator.clipboard.writeText(text); toast.success("Teks disalin!"); };
  
  const renderMessageContent = (content: string) => {
    const videoRegex = /\[VIDEO_GENERATED\]\((.*?)\)/g;
    if (videoRegex.test(content)) {
      const parts = content.split(videoRegex);
      return parts.map((part, i) => {
        if (part.startsWith('https://v3.fal.media') || part.endsWith('.mp4')) {
          return <video key={i} controls className="w-full max-w-lg mt-4 rounded-2xl shadow-xl border border-white/10"><source src={part} type="video/mp4" /></video>;
        }
        return <ReactMarkdown key={i} components={{ code: CodeBlock }}>{part}</ReactMarkdown>;
      });
    }
    return <ReactMarkdown components={{ code: CodeBlock }}>{content}</ReactMarkdown>;
  };

  // FITUR MIKROFON DIKEMBALIKAN
  const handleMicClick = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) return toast.error("Browser Anda tidak mendukung fitur mikrofon.");

    const recognition = new SpeechRecognition();
    recognition.lang = 'id-ID';
    recognition.interimResults = false;

    recognition.onstart = () => { setIsListening(true); toast.info("Mendengarkan suara..."); };
    recognition.onresult = (event: any) => setInput((prev) => prev + (prev ? " " : "") + event.results[0][0].transcript);
    recognition.onerror = () => { toast.error("Gagal mendeteksi suara."); setIsListening(false); };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  return (
    <div className="flex flex-col h-full w-full relative bg-zinc-50 dark:bg-[#09090b] transition-colors duration-500 overflow-hidden">
      <header className="absolute top-0 w-full z-20 flex items-center justify-between p-4 px-6 bg-white/70 dark:bg-[#09090b]/70 backdrop-blur-xl border-b border-zinc-200/50 dark:border-white/5 transition-colors">
        <div className="flex items-center">
          <button onClick={setSidebarOpen} className="md:hidden p-2 -ml-2 rounded-full text-zinc-600 dark:text-zinc-400 hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-all active:scale-90"><Menu className="w-5 h-5" /></button>
          <span className="ml-3 font-semibold text-zinc-800 dark:text-zinc-200 tracking-wide text-sm md:text-base truncate max-w-[200px] md:max-w-[400px]">{currentSessionTitle ? currentSessionTitle : "Azeerh AI"}</span>
        </div>
        <button onClick={toggleTheme} className="p-2 rounded-full bg-zinc-100/80 dark:bg-zinc-800/80 text-zinc-600 dark:text-zinc-300 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shadow-sm"><Sun className="w-4 h-4 dark:hidden" /><Moon className="w-4 h-4 hidden dark:block" /></button>
      </header>

      <main className="flex-1 overflow-y-auto px-4 md:px-8 pt-24 pb-48 scroll-smooth custom-scrollbar relative z-0">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center min-h-full">
            <motion.div initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }} className="relative">
              <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-br from-cyan-400 via-blue-500 to-purple-600 tracking-tight drop-shadow-2xl mb-4 select-none">AZEERH</h1>
            </motion.div>
            <p className="text-zinc-500 dark:text-zinc-400 text-sm md:text-base tracking-widest text-center mt-4 font-medium uppercase">System Online • Ready</p>
          </div>
        ) : (
          <div className="max-w-4xl mx-auto space-y-8">
            <AnimatePresence initial={false}>
              {messages.map((msg, idx) => (
                <motion.div key={idx} layout initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ type: "spring", stiffness: 400, damping: 30 }} className={`flex ${msg.role === "user" ? "justify-end" : "justify-start w-full"}`}>
                  <div className={`rounded-3xl px-6 py-5 shadow-sm transition-colors ${msg.role === "user" ? "max-w-[90%] md:max-w-[85%] bg-zinc-200 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 rounded-tr-sm ml-auto" : "w-full bg-white dark:bg-zinc-900/80 text-zinc-800 dark:text-zinc-200 border border-zinc-100 dark:border-white/5 shadow-lg rounded-tl-sm backdrop-blur-sm"}`}>
                    {msg.role === "assistant" && <div className="text-[11px] text-cyan-600 dark:text-cyan-400 font-bold mb-3 tracking-widest uppercase flex items-center gap-2"><span className="relative flex h-2 w-2"><span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-cyan-400 opacity-75"></span><span className="relative inline-flex rounded-full h-2 w-2 bg-cyan-500"></span></span> AZEERH</div>}
                    
                    {msg.imageUrl && <img src={msg.imageUrl} alt="Uploaded" className="w-64 rounded-xl mb-4 object-cover shadow-md border border-zinc-200 dark:border-white/10" />}

                    <div className={`prose dark:prose-invert max-w-none text-[15px] leading-relaxed tracking-wide ${msg.role === "user" ? "whitespace-pre-wrap font-medium" : ""}`}>
                      {msg.role === "assistant" ? renderMessageContent(msg.content) : msg.content}
                    </div>

                    {msg.role === "assistant" && (
                      <div className="flex items-center gap-3 mt-6 pt-4 border-t border-zinc-100 dark:border-white/5 text-zinc-400">
                        <button onClick={() => toast.success("Terima kasih!")} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-green-500 transition-all"><ThumbsUp className="w-4 h-4" /></button>
                        <button onClick={() => toast.error("Mohon maaf!")} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-red-500 transition-all"><ThumbsDown className="w-4 h-4" /></button>
                        <button onClick={() => handleCopyText(msg.content)} className="p-1.5 rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 hover:text-cyan-500 transition-all flex items-center gap-2 ml-auto"><Copy className="w-4 h-4" /> <span className="text-[10px] uppercase font-bold tracking-wider">Copy</span></button>
                      </div>
                    )}
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
            {isLoading && (
              <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="flex justify-start">
                <div className="bg-white dark:bg-zinc-900/80 border border-zinc-100 dark:border-white/5 px-6 py-5 rounded-3xl rounded-tl-sm flex gap-2 items-center shadow-lg"><motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6 }} className="w-2 h-2 bg-cyan-500 rounded-full"></motion.div><motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.1 }} className="w-2 h-2 bg-cyan-500 rounded-full"></motion.div><motion.div animate={{ y: [0, -5, 0] }} transition={{ repeat: Infinity, duration: 0.6, delay: 0.2 }} className="w-2 h-2 bg-cyan-500 rounded-full"></motion.div></div>
              </motion.div>
            )}
            <div ref={endOfMessagesRef} className="h-2" />
          </div>
        )}
      </main>

      <div className="absolute bottom-0 left-0 w-full bg-gradient-to-t from-zinc-50 via-zinc-50/80 dark:from-[#09090b] dark:via-[#09090b]/80 to-transparent pt-24 pb-6 px-4 md:px-8 z-20 pointer-events-none">
        <div className="max-w-4xl mx-auto pointer-events-auto flex flex-col gap-2">
          
          {attachmentPreview && (
            <div className="relative w-24 h-24 ml-4">
              <img src={attachmentPreview} alt="Preview" className="w-full h-full object-cover rounded-2xl shadow-xl border-2 border-cyan-500" />
              <button onClick={() => setAttachmentPreview(null)} className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 shadow-lg hover:scale-110 transition-transform"><X className="w-4 h-4" /></button>
            </div>
          )}

          <div className="relative flex items-end gap-2 bg-white/80 dark:bg-zinc-900/80 backdrop-blur-2xl border border-zinc-200/50 dark:border-white/10 p-2.5 rounded-[2rem] shadow-2xl focus-within:ring-2 focus-within:ring-cyan-500/20 transition-all duration-300">
            <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileChange} className="hidden" />
            
            <button onClick={() => fileInputRef.current?.click()} className="p-3.5 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800 rounded-2xl transition-all"><ImageIcon className="w-5 h-5" /></button>
            
            {/* TOMBOL MIC ADA DI SINI */}
            <button onClick={handleMicClick} className={`p-3.5 rounded-2xl transition-all active:scale-95 ${isListening ? "text-red-500 bg-red-50 dark:bg-red-500/10 animate-pulse shadow-inner" : "text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 hover:bg-zinc-100 dark:hover:bg-zinc-800"}`}><Mic className="w-5 h-5" /></button>
            
            <textarea
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter" && !e.shiftKey) { e.preventDefault(); handleSend(); } }}
              placeholder={isListening ? "Mendengarkan..." : "Ketik pesan, kirim gambar..."}
              className="flex-1 max-h-40 min-h-[44px] bg-transparent text-zinc-900 dark:text-white placeholder-zinc-400 resize-none outline-none py-3.5 text-[15px] custom-scrollbar font-medium"
              rows={1}
            />
            <button onClick={handleSend} disabled={(!input.trim() && !attachmentPreview) || isLoading} className="p-3.5 mb-0.5 bg-zinc-900 dark:bg-white text-white dark:text-zinc-900 disabled:opacity-40 rounded-2xl transition-all hover:shadow-lg active:scale-90 ml-1"><Send className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    </div>
  );
}