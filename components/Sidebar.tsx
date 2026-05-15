import { useState, useRef, useEffect } from "react";
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
            <span>Pusat Riwayat Pesan</span>
          </div>
          <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-500 hover:text-gray-800 dark:text-gray-400 dark:hover:text-white transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* TOMBOL CHAT TERBARU */}
        <div className="p-4 border-b border-gray-100 dark:border-white/5">
          <button 
            onClick={createNewChat}
            className="w-full flex items-center gap-3 px-4 py-3 bg-gray-900 dark:bg-white/10 hover:bg-gray-800 dark:hover:bg-white/20 text-white dark:text-white rounded-xl transition shadow-sm font-medium"
          >
            <Plus className="w-5 h-5 text-[#00f3ff]" />
            Chat Terbaru
          </button>
        </div>

        {/* DAFTAR RIWAYAT CHAT */}
        <div className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
          <div className="text-xs font-semibold text-gray-400 dark:text-gray-500 mb-3 px-2 mt-2 tracking-wide">RIWAYAT PERCAKAPAN</div>
          
          {sessions.map(session => (
            <div key={session.id} className="relative group">
              {editingId === session.id ? (
                <div className="flex items-center px-2 py-2 bg-gray-100 dark:bg-white/10 rounded-xl">
                  <input 
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    onBlur={() => saveEdit(session.id)}
                    onKeyDown={(e) => e.key === 'Enter' && saveEdit(session.id)}
                    autoFocus
                    className="flex-1 bg-transparent text-sm text-gray-900 dark:text-white outline-none"
                  />
                </div>
              ) : (
                <div 
                  onClick={() => setCurrentSessionId(session.id)}
                  className={`w-full flex items-center justify-between px-3 py-3 rounded-xl cursor-pointer transition ${currentSessionId === session.id ? 'bg-gray-100 dark:bg-white/10 text-gray-900 dark:text-white font-medium' : 'text-gray-600 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5'}`}
                >
                  <div className="flex items-center gap-3 overflow-hidden">
                    <MessageSquare className={`w-4 h-4 shrink-0 ${currentSessionId === session.id ? 'text-[#00f3ff]' : ''}`} />
                    <span className="truncate text-sm">{session.title}</span>
                  </div>

                  {/* TOMBOL TITIK TIGA */}
                  <button 
                    onClick={(e) => { e.stopPropagation(); setOpenMenuId(openMenuId === session.id ? null : session.id); }}
                    className="p-1 rounded-md opacity-0 group-hover:opacity-100 hover:bg-gray-200 dark:hover:bg-white/20 transition shrink-0"
                  >
                    <MoreVertical className="w-4 h-4" />
                  </button>

                  {/* POPUP EDIT & DELETE */}
                  {openMenuId === session.id && (
                    <div className="absolute right-8 top-8 w-32 bg-white dark:bg-zinc-800 rounded-lg shadow-xl border border-gray-100 dark:border-white/10 z-50 overflow-hidden">
                      <button onClick={(e) => { e.stopPropagation(); startEditing(session.id, session.title); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-white/10 transition">
                        <Edit2 className="w-3.5 h-3.5" /> Edit
                      </button>
                      <button onClick={(e) => { e.stopPropagation(); deleteSession(session.id); }} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-500/10 transition">
                        <Trash2 className="w-3.5 h-3.5" /> Delete
                      </button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
          {sessions.length === 0 && <p className="text-xs text-center text-gray-400 mt-4">Belum ada riwayat</p>}
        </div>

        <div className="p-5 border-t border-gray-100 dark:border-white/5 space-y-4 bg-gray-50 dark:bg-zinc-950/50">
          <div>
            <label className="text-xs text-gray-500 font-semibold mb-2 flex items-center gap-2 tracking-wide">
              <Settings className="w-3 h-3" /> MODEL AI
            </label>
            <select 
              value={currentModel} 
              onChange={(e) => setCurrentModel(e.target.value)}
              className="w-full bg-white dark:bg-zinc-800 border border-gray-200 dark:border-white/10 text-sm text-gray-800 dark:text-white rounded-xl p-3 outline-none focus:border-[#00f3ff] transition cursor-pointer appearance-none shadow-sm"
            >
              <option value="llama-3.3-70b-versatile">Llama 3.3 70B (Max Power)</option>
              <option value="llama-3.1-8b-instant">Llama 3.1 8B (Fast Speed)</option>
            </select>
          </div>
          
          <button 
            onClick={clearAllChats}
            className="w-full flex items-center justify-center gap-2 bg-red-50 dark:bg-red-500/10 hover:bg-red-100 dark:hover:bg-red-500/20 text-red-600 dark:text-red-500 py-3 rounded-xl text-sm font-semibold transition group shadow-sm"
          >
            <Trash2 className="w-4 h-4 group-hover:scale-110 transition-transform" /> Hapus Semua Data
          </button>
        </div>
      </div>
    </>
  );
}