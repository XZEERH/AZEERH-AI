import { X, MessageSquare, Trash2, Settings, Zap } from "lucide-react";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  currentModel: string;
  setCurrentModel: (val: string) => void;
  clearChat: () => void;
}

export default function Sidebar({ isOpen, setIsOpen, currentModel, setCurrentModel, clearChat }: SidebarProps) {
  return (
    <>
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-[#09090b] border-r border-white/10 transform transition-transform duration-300 flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0`}>
        
        <div className="p-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-2 text-white font-bold tracking-wider">
            <Zap className="w-5 h-5 text-[#00f3ff]" />
            <span>COMMAND CENTER</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          <div className="text-xs font-semibold text-gray-500 mb-3 px-2 mt-2">RIWAYAT SESI</div>
          <button className="w-full flex items-center gap-3 px-3 py-3 text-sm text-gray-300 bg-white/5 border border-white/5 rounded-lg transition hover:bg-white/10">
            <MessageSquare className="w-4 h-4 text-[#00f3ff]" />
            <span className="truncate">Sesi Aktif Saat Ini</span>
          </button>
        </div>

        <div className="p-4 border-t border-white/10 space-y-4 bg-[#050505]/50">
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-2">
              <Settings className="w-3 h-3" /> MODEL NEURAL
            </label>
            <select 
              value={currentModel} 
              onChange={(e) => setCurrentModel(e.target.value)}
              className="w-full bg-[#121214] border border-white/10 text-sm text-white rounded-lg p-2.5 outline-none focus:border-[#00f3ff] transition cursor-pointer appearance-none"
            >
              <option value="llama3-70b-8192">Llama 3 70B (Max Power)</option>
              <option value="llama3-8b-8192">Llama 3 8B (Fast Speed)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (Balanced)</option>
            </select>
          </div>
          
          <button 
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 bg-red-500/10 hover:bg-red-500/20 text-red-500 py-2.5 rounded-lg text-sm font-semibold transition group"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Purge Memory
          </button>
        </div>
      </div>
    </>
  );
}