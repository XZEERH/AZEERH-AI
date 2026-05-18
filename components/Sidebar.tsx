import { useState } from "react";
import { X, Trash2, Settings, Zap, Plus, MessageSquare, MoreVertical, Edit2 } from "lucide-react";
import { ChatSession } from "@/app/page";

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (val: boolean) => void;
  sessions: ChatSession[];
  currentSessionId: string | null;
  setCurrentSessionId: (id: string) => void;
  createNewChat: () => void;
  deleteSession: (id: string) => void;
  renameSession: (id: string, newTitle: string) => void;
  currentModel: string;
  setCurrentModel: (val: string) => void;
  clearAllChats: () => void;
}

export default function Sidebar({ 
  isOpen, setIsOpen, sessions, currentSessionId, setCurrentSessionId, 
  createNewChat, deleteSession, renameSession, currentModel, setCurrentModel, clearAllChats 
}: SidebarProps) {
  
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");

  const startEditing = (id: string, currentTitle: string) => {
    setEditingId(id);
    setEditTitle(currentTitle);
    setOpenMenuId(null);
  };

  const saveEdit = (id: string) => {
    if (editTitle.trim()) renameSession(id, editTitle);
    setEditingId(null);
  };

  return (
    <>
      {/* Overlay Backdrop Blur Mewah */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-zinc-950/40 z-40 md:hidden backdrop-blur-sm transition-all duration-300" 
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* Sidebar Panel */}
      <div className={`fixed inset-y-0 left-0 z-50 w-72 bg-white/95 dark:bg-zinc-950/95 backdrop-blur-xl border-r border-zinc-200 dark:border-white/5 transform transition-transform duration-500 ease-[0.23,1,0.32,1] flex flex-col ${isOpen ? "translate-x-0" : "-translate-x-full"} md:relative md:translate-x-0 shadow-2xl md:shadow-none`}>
        
        {/* Header Sidebar */}
        <div className="p-6 flex items-center justify-between">
          <div className="flex items-center gap-2.5 text-zinc-800 dark:text-zinc-100 font-bold tracking-widest text-sm">
            <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-cyan-400 to-blue-600 shadow-lg shadow-cyan-500/20">
              <Zap className="w-4 h-4 text-white" />
            </div>
            RIWAYAT PESAN
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden p-2 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white transition-all active:scale-90">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Tombol New Chat Premium */}
        <div className="px-4 pb-4">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-4 py-3.5 bg-zinc-900 dark:bg-zinc-100 hover:bg-zinc-800 dark:hover:bg-white text-white dark:text-zinc-900 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:scale-95 font-semibold text-sm"
          >
            <Plus className="w-4 h-4" />
            Chat Terbaru
          </button>
        </div>

        {/* List Chat */}
        <div className="flex-1 overflow-y-auto px-3 space-y-1 custom-scrollbar">
          <div className="text-[10px] font-bold text-zinc-400 dark:text-zinc-500 mb-3 px-3 mt-2 tracking-widest uppercase">Riwayat Percakapan</div>
          
          {sessions.map(session => (
            <div key={session.id} className="relative group">
              {editingId === session.id ? (
                <div className="flex items-center px-3 py-2.5 bg-zinc-100 dark:bg-zinc-800/50 rounded-xl border border-zinc-200 dark:border-white/10">
                  <input 
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveEdit(session.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(session.id)}
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-zinc-900 dark:text-white outline-none"
                  />
                </div>
              ) : (
                <div 
                  onClick={() => setCurrentSessionId(session.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition-all duration-200 active:scale-[0.98] ${currentSessionId === session.id ? 'bg-zinc-100 dark:bg-zinc-800/80 text-zinc-900 dark:text-white font-medium shadow-sm' : 'text-zinc-500 dark:text-zinc-400 hover:bg-zinc-50 dark:hover:bg-zinc-800/40'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 shrink-0 transition-colors ${currentSessionId === session.id ? 'text-cyan-500' : 'text-zinc-400'}`} />
                    <span className="truncate text-sm tracking-wide">{session.title}</span>
                  </div>

                  {/* Tombol Opsi */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === session.id ? null : session.id); }}
                    className="p-1.5 rounded-lg opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-700 transition-all shrink-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* Menu Popup */}
                  {openMenuId === session.id && (
                    <div className="absolute right-8 top-8 w-36 bg-white/90 dark:bg-zinc-800/90 backdrop-blur-xl rounded-xl shadow-2xl border border-zinc-100 dark:border-white/10 z-50 overflow-hidden py-1 animate-in fade-in zoom-in-95 duration-200">
                      <button onClick={(e) => { e.stopPropagation(); startEditing(session.id, session.title); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-zinc-700 dark:text-zinc-300 hover:bg-zinc-100 dark:hover:bg-zinc-700/50 transition-colors">
                        <Edit2 className="w-3.5 h-3.5" /> Rename
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition-colors">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {/* Footer Sidebar */}
        <div className="p-4 border-t border-zinc-200 dark:border-white/5 space-y-4">
          <div>
            <label className="text-[10px] text-zinc-400 dark:text-zinc-500 font-bold mb-2 flex items-center gap-2 tracking-widest uppercase">
              <Settings className="w-3 h-3" /> Neural Model
            </label>
            <div className="relative">
              <select 
                value={currentModel} 
                onChange={(e) => setCurrentModel(e.target.value)}
                className="w-full bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-white/10 text-xs font-medium text-zinc-800 dark:text-zinc-200 rounded-xl p-3 outline-none focus:ring-2 focus:ring-cyan-500/50 transition-all cursor-pointer appearance-none shadow-sm hover:border-cyan-500/30"
              >
                <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Max Power)</option>
                <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast Speed)</option>
              </select>
            </div>
          </div>
          
          <button 
            onClick={clearAllChats}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 py-3 rounded-xl text-xs font-bold tracking-wide transition-all active:scale-95"
          >
            <Trash2 className="w-4 h-4" /> PURGE MEMORY
          </button>
        </div>
      </div>
    </>
  );
}