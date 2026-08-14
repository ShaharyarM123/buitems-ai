'use client';

import { useEffect, useState } from 'react';
import { secureFetch } from '@/utils/apiHelper';

export default function Sidebar({ onSelectChat, currentChatId, activeTool, setActiveTool, onNewChat }) {
  const [chats, setChats] = useState([]);
  const [loading, setLoading] = useState(false);

  // 1. Backend se Chat History Fetch karna
  const fetchChatHistory = async () => {
    try {
      setLoading(true);
      const res = await secureFetch('/api/ai/history');
      const data = await res.json();
      if (data.success) {
        setChats(data.chats || []);
      }
    } catch (error) {
      console.error('Failed to fetch chat history:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchChatHistory();
  }, [currentChatId]);

  // 2. Chat Delete karne ka Handler
  const handleDeleteChat = async (e, chatId) => {
    e.stopPropagation();
    if (!confirm('Kya aap is chat ko delete karna chahte hain?')) return;

    try {
      const res = await secureFetch(`/api/ai/chat/${chatId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        setChats((prev) => prev.filter((c) => c._id !== chatId));
        if (currentChatId === chatId && onNewChat) {
          onNewChat();
        }
      }
    } catch (error) {
      console.error('Failed to delete chat:', error);
    }
  };

  return (
    <aside className="w-64 bg-neutral-900 text-white flex flex-col h-screen border-r border-neutral-800 select-none">
      {/* App Logo & Header */}
      <div className="p-4 border-b border-neutral-800 flex items-center space-x-3">
        <div className="w-8 h-8 bg-emerald-500 rounded-lg flex items-center justify-center font-bold text-black">
          E
        </div>
        <div>
          <h2 className="font-semibold text-sm leading-tight">Echo AI Study</h2>
          <p className="text-[10px] text-neutral-400">BUITEMS AI PLATFORM</p>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto p-3 space-y-6">
        {/* CORE TOOLS */}
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 px-2">
            Core Tools
          </p>
          <nav className="space-y-1">
            <button
              onClick={() => setActiveTool && setActiveTool('ask-anything')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTool === 'ask-anything'
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <span>💬</span>
              <span>Ask Anything</span>
            </button>

            <button
              onClick={() => setActiveTool && setActiveTool('expand-notes')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTool === 'expand-notes'
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <span>📝</span>
              <span>Note Expander</span>
            </button>

            <button
              onClick={() => setActiveTool && setActiveTool('pdf-uploader')}
              className={`w-full flex items-center space-x-2.5 px-3 py-2 rounded-lg text-xs font-medium transition-colors ${
                activeTool === 'pdf-uploader'
                  ? 'bg-neutral-800 text-emerald-400'
                  : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
              }`}
            >
              <span>📄</span>
              <span>PDF Uploader</span>
            </button>
          </nav>
        </div>

        {/* 🆕 RECENT CHATS SECTION */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider">
              Recent Chats
            </p>
            <button
              onClick={fetchChatHistory}
              className="text-[10px] text-neutral-400 hover:text-white transition-colors"
              title="Refresh History"
            >
              🔄
            </button>
          </div>

          <div className="space-y-1 max-h-48 overflow-y-auto pr-1">
            {loading ? (
              <p className="text-xs text-neutral-500 px-2 py-1">Loading history...</p>
            ) : chats.length === 0 ? (
              <p className="text-xs text-neutral-500 px-2 py-1">No past chats</p>
            ) : (
              chats.map((chat) => (
                <div
                  key={chat._id}
                  onClick={() => onSelectChat && onSelectChat(chat._id)}
                  className={`group flex items-center justify-between px-3 py-2 rounded-lg text-xs cursor-pointer transition-colors ${
                    currentChatId === chat._id
                      ? 'bg-neutral-800 text-emerald-400 font-medium'
                      : 'text-neutral-400 hover:bg-neutral-800/60 hover:text-white'
                  }`}
                >
                  <span className="truncate pr-2">{chat.title || 'Untitled Chat'}</span>
                  <button
                    onClick={(e) => handleDeleteChat(e, chat._id)}
                    className="opacity-0 group-hover:opacity-100 text-neutral-500 hover:text-red-400 transition-opacity"
                    title="Delete Chat"
                  >
                    🗑️
                  </button>
                </div>
              ))
            )}
          </div>
        </div>

        {/* WORKSPACE & OTHER METRICS */}
        <div>
          <p className="text-[10px] font-bold text-neutral-500 uppercase tracking-wider mb-2 px-2">
            Library & Workspace
          </p>
          <nav className="space-y-1 text-xs text-neutral-400">
            <div className="px-3 py-2 hover:bg-neutral-800/60 hover:text-white rounded-lg cursor-pointer transition-colors">
              📚 Personal Bookshelf
            </div>
            <div className="px-3 py-2 hover:bg-neutral-800/60 hover:text-white rounded-lg cursor-pointer transition-colors">
              📋 Mock Tests
            </div>
          </nav>
        </div>
      </div>

      {/* Bottom Profile / Logout */}
      <div className="p-3 border-t border-neutral-800 text-xs text-neutral-400 space-y-1">
        <div className="px-3 py-2 hover:bg-neutral-800/60 hover:text-white rounded-lg cursor-pointer transition-colors">
          ⚙️ Settings & Profile
        </div>
      </div>
    </aside>
  );
}