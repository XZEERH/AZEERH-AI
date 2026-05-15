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
          className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-sm transition-opacity" 
          onClick={() => setIsOpen(false)}
        />
      )}

      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white dark:bg-zinc-900 border-r border-gray-200 dark:border-white/5 transform transition-transform duration-300 ease-in-out flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 shadow-2xl md:shadow-none`}>
        
        <div className="p-5 flex items-center justify-between border-b border-gray-100 dark:border-white/5">
          <div className="flex items-center gap-2 text-gray-800 dark:text-white font-bold tracking-wider">
            <Zap className="w-5 h-5 text-[#00f3ff]" />
            <span>COMMAND CENTER</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 space-y-2">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2 mt-2 tracking-wide">RIWAYAT SESI</div>
          <button className="w-full flex items-center gap-3 px-4 py-3 text-sm text-gray-700 dark:text-gray-300 bg-gray-50 dark:bg-white/5 border border-gray-100 dark:border-white/5 rounded-xl transition hover:bg-gray-100 dark:hover:bg-white/10 shadow-sm">
            <MessageSquare className="w-4 h-4 text-[#00f3ff]" />
            <span className="truncate font-medium">Sesi Pribadi Anda</span>
          </button>
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-white/5 space-y-4 bg-gray-50 dark:bg-zinc-950/50">
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-2 tracking-wide">
              <Settings className="w-3 h-3" /> MODEL NEURAL
            </label>
            <select 
              value={currentModel} 
              onChange={(e) => setCurrentModel(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-sm text-gray-800 dark:text-white rounded-xl p-3 outline-none focus:border-[#00f3ff] transition cursor-pointer appearance-none shadow-sm"
            >
              <option value="llama3-70b-8192">Llama 3 70B (Max Power)</option>
              <option value="llama3-8b-8192">Llama 3 8B (Fast Speed)</option>
              <option value="mixtral-8x7b-32768">Mixtral 8x7B (Balanced)</option>
            </select>
          </div>
          
          <button 
            onClick={clearChat}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 py-3 rounded-xl text-sm font-semibold transition group shadow-sm"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Bersihkan Riwayat
          </button>
        </div>
      </div>
    </>
  );
}