// src/app/dashboard/page.jsx
'use client';

import React, { useState, useEffect } from 'react';
import { 
  BookOpen, Brain, Zap, Send, Paperclip, Trash2, User, 
  FileText, Settings, Database, Library, Award
} from 'lucide-react';
import StructuredResponseRenderer from '@/components/StructuredResponseRenderer';

export default function DashboardPage() {
  const [activeTab, setActiveTab] = useState('ask-anything');
  const [loading, setLoading] = useState(false);
  const [bookshelfItems, setBookshelfItems] = useState([]);

  // Isolated Tool States
  const [toolStates, setToolStates] = useState({
    'ask-anything': { messages: [], queryInput: '', selectedFile: null },
    'notes': { messages: [], queryInput: '', selectedFile: null },
    'pdf': { messages: [], queryInput: '', selectedFile: null },
  });

  // Load bookshelf on mount
  useEffect(() => {
    const saved = localStorage.getItem('buitems_bookshelf');
    if (saved) setBookshelfItems(JSON.parse(saved));
  }, [activeTab]); // Refresh when tab changes

  const clearBookshelfItem = (id) => {
    const updated = bookshelfItems.filter(item => item.id !== id);
    setBookshelfItems(updated);
    localStorage.setItem('buitems_bookshelf', JSON.stringify(updated));
  };

  const handleSendQuery = async (e) => {
    e.preventDefault();
    const currentTool = toolStates[activeTab];
    if (!currentTool.queryInput.trim() && !currentTool.selectedFile) return;

    const userMsg = {
      id: Date.now().toString(),
      sender: 'user',
      text: currentTool.queryInput,
    };

    // Update state immediately with user message
    setToolStates(prev => ({
      ...prev,
      [activeTab]: {
        ...prev[activeTab],
        messages: [...prev[activeTab].messages, userMsg],
        queryInput: '' // clear input
      }
    }));
    
    setLoading(true);

    try {
      // Replace this block with your actual fetch request to your backend.
      // Simulating a structured backend response for demonstration:
      await new Promise(r => setTimeout(r, 1000)); 
      
      const aiResponse = {
        id: (Date.now() + 1).toString(),
        sender: 'ai',
        text: "**Definition:**\nA neural network is a machine learning model inspired by the structure of the human brain, consisting of interconnected nodes (neurons).\n\n**Formula:**\n$$ f(x) = Wx + b $$\nWhere W is the weight matrix, x is the input vector, and b is the bias.\n\nThis architecture allows for complex non-linear mapping of data, which is highly beneficial for image classification and natural language processing tasks."
      };

      setToolStates(prev => ({
        ...prev,
        [activeTab]: {
          ...prev[activeTab],
          messages: [...prev[activeTab].messages, aiResponse]
        }
      }));
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const updateInput = (text) => {
    setToolStates(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], queryInput: text }
    }));
  };

  const clearStream = () => {
    setToolStates(prev => ({
      ...prev,
      [activeTab]: { ...prev[activeTab], messages: [] }
    }));
  };

  return (
    <div className="flex h-screen bg-gray-50 dark:bg-zinc-950 text-gray-900 dark:text-zinc-100 font-sans overflow-hidden">
      
      {/* 5-ITEM SIDEBAR NAVIGATION */}
      <aside className="w-64 border-r border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-900 flex flex-col justify-between p-4">
        <div>
          <div className="flex items-center gap-3 px-2 py-3 mb-6">
            <div className="p-2 bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 rounded-xl shadow-md">
              <Brain className="w-6 h-6" />
            </div>
            <div>
              <h1 className="font-bold text-sm">BUITEMS Study AI</h1>
              <p className="text-[10px] font-mono text-zinc-500">v2.0 Workspace</p>
            </div>
          </div>

          <div className="space-y-1">
            <p className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Study Tools</p>
            
            <button onClick={() => setActiveTab('ask-anything')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'ask-anything' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'}`}>
              <Zap className="w-4 h-4" /> Ask Anything
            </button>
            <button onClick={() => setActiveTab('notes')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'notes' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'}`}>
              <FileText className="w-4 h-4" /> Note Expander
            </button>
            <button onClick={() => setActiveTab('pdf')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'pdf' ? 'bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 font-bold' : 'hover:bg-zinc-50 dark:hover:bg-zinc-800/50 text-zinc-600 dark:text-zinc-400'}`}>
              <Paperclip className="w-4 h-4" /> PDF Uploader
            </button>

            <div className="my-4 border-t border-zinc-200 dark:border-zinc-800 pt-3"></div>
            <p className="px-2 text-[10px] font-bold text-zinc-400 uppercase tracking-wider mb-2">Advanced</p>

            <button onClick={() => setActiveTab('bookshelf')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'bookshelf' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
              <Library className="w-4 h-4" /> Personal Bookshelf
            </button>
            <button onClick={() => setActiveTab('mock-exam')} className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-colors ${activeTab === 'mock-exam' ? 'bg-zinc-900 text-white dark:bg-zinc-100 dark:text-zinc-900 shadow-sm' : 'hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400'}`}>
              <Award className="w-4 h-4" /> Mock Exams
            </button>
          </div>
        </div>
      </aside>

      {/* DYNAMIC MAIN AREA */}
      <main className="flex-1 flex flex-col justify-between bg-gray-50 dark:bg-zinc-950 relative overflow-hidden">
        
        {/* Render Bookshelf View */}
        {activeTab === 'bookshelf' && (
          <div className="flex-1 overflow-y-auto p-8 max-w-5xl mx-auto w-full">
            <h2 className="text-2xl font-bold mb-2">Your Saved Knowledge</h2>
            <p className="text-sm text-zinc-500 mb-8">Review bookmarked definitions and formulas instantly.</p>
            <div className="grid grid-cols-1 gap-4">
              {bookshelfItems.length === 0 ? (
                <div className="text-center p-12 border-2 border-dashed border-zinc-200 dark:border-zinc-800 rounded-3xl text-zinc-400 text-sm">
                  No items saved yet. Bookmark definitions from your chat to see them here.
                </div>
              ) : (
                bookshelfItems.map((item) => (
                  <div key={item.id} className="p-5 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm flex items-start justify-between group">
                    <div className="space-y-2 max-w-[90%]">
                      <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${item.type === 'definition' ? 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400' : 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-400'}`}>
                        {item.type}
                      </span>
                      <p className={`text-sm ${item.type === 'formula' ? 'font-mono bg-zinc-50 dark:bg-black/20 p-2 rounded-lg' : 'font-medium'}`}>{item.content}</p>
                      <p className="text-[10px] text-zinc-400">Saved on {item.savedAt}</p>
                    </div>
                    <button onClick={() => clearBookshelfItem(item.id)} className="p-2 text-zinc-300 hover:text-red-500 transition-colors">
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Render Mock Exam Placeholder */}
        {activeTab === 'mock-exam' && (
          <div className="flex-1 overflow-y-auto p-8 flex items-center justify-center">
             <div className="text-center space-y-4 max-w-sm">
               <div className="p-4 bg-zinc-100 dark:bg-zinc-800 w-fit mx-auto rounded-3xl">
                 <Award className="w-12 h-12 text-zinc-900 dark:text-zinc-100" />
               </div>
               <h2 className="text-xl font-bold">Mock Exam Engine</h2>
               <p className="text-sm text-zinc-500">Your interactive exam module is ready to be injected here based on the previous architecture blueprint.</p>
             </div>
          </div>
        )}

        {/* Render Chat Tool Views */}
        {['ask-anything', 'notes', 'pdf'].includes(activeTab) && (
          <>
            <header className="h-16 border-b border-zinc-200 dark:border-zinc-800 bg-white/50 dark:bg-zinc-900/50 backdrop-blur-md flex items-center justify-between px-6 z-10">
              <span className="text-xs uppercase tracking-wider font-bold px-3 py-1.5 rounded-lg bg-zinc-100 dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 border border-zinc-200 dark:border-zinc-700">
                Mode: {activeTab.replace('-', ' ')}
              </span>
              <button onClick={clearStream} className="flex items-center gap-1.5 text-xs font-semibold px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors">
                <Trash2 className="w-3.5 h-3.5" /> Clear Stream
              </button>
            </header>

            <div className="flex-1 overflow-y-auto p-6 space-y-2 max-w-4xl mx-auto w-full">
              {toolStates[activeTab].messages.length === 0 && (
                <div className="h-full flex flex-col items-center justify-center text-zinc-400 space-y-4">
                  <Brain className="w-12 h-12 opacity-20" />
                  <p className="text-sm">Start a conversation to see the auto-structuring in action.</p>
                </div>
              )}

              {toolStates[activeTab].messages.map((msg) => (
                <React.Fragment key={msg.id}>
                  {msg.sender === 'user' ? (
                    <div className="flex items-start gap-4 flex-row-reverse my-6 animate-fadeIn">
                      <div className="p-2.5 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shrink-0 shadow-sm mt-1">
                        <User className="w-5 h-5" />
                      </div>
                      <div className="max-w-[75%] rounded-2xl rounded-tr-none p-4 text-sm leading-relaxed bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm">
                        <div className="whitespace-pre-wrap">{msg.text}</div>
                      </div>
                    </div>
                  ) : (
                    // THIS IS WHERE THE MAGIC HAPPENS
                    <StructuredResponseRenderer message={msg} />
                  )}
                </React.Fragment>
              ))}

              {loading && (
                <div className="flex items-center gap-3 text-zinc-400 text-sm py-4 animate-pulse">
                  <div className="w-2 h-2 rounded-full bg-zinc-900 dark:bg-zinc-100"></div>
                  Parsing structural data from AI...
                </div>
              )}
            </div>

            <div className="p-4 bg-gradient-to-t from-gray-50 via-gray-50/80 dark:from-zinc-950 dark:via-zinc-950/80 to-transparent">
              <form onSubmit={handleSendQuery} className="max-w-3xl mx-auto bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-2 shadow-lg flex flex-col gap-2">
                <div className="flex items-center gap-2 px-2">
                  <input 
                    type="text"
                    value={toolStates[activeTab].queryInput}
                    onChange={(e) => updateInput(e.target.value)}
                    placeholder="Ask a question. E.g., 'Explain Neural Networks and give me the formula'"
                    className="flex-1 bg-transparent border-none outline-none text-sm py-3 px-2 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
                  />
                  <button type="submit" disabled={loading || !toolStates[activeTab].queryInput.trim()} className="p-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 dark:bg-zinc-100 dark:hover:bg-zinc-200 dark:text-zinc-900 disabled:opacity-40 text-white transition-all shadow-md">
                    <Send className="w-4 h-4" />
                  </button>
                </div>
              </form>
            </div>
          </>
        )}
      </main>
    </div>
  );
}