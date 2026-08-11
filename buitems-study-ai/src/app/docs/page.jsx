//2ND EDIT

'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Menu, X, Flame, ShieldCheck, Cpu } from 'lucide-react';

export default function DocsPage() {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('intro');

  return (
    <div className="min-h-screen bg-zinc-50 text-zinc-900 font-sans selection:bg-black selection:text-white relative flex flex-col">
      
      {/* Background Subtle Monochromatic Grid Pattern */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#e5e7eb_1px,transparent_1px),linear-gradient(to_bottom,#e5e7eb_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] opacity-60 pointer-events-none" />

      {/* TOP NAVBAR */}
      <header className="w-full border-b border-zinc-200/80 bg-white/80 backdrop-blur-md sticky top-0 z-50 px-4 sm:px-8 py-3.5 flex items-center justify-between shadow-sm">
        <div className="flex items-center gap-3">
          {/* Mobile Hamburger Toggle */}
          <button 
            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
            className="md:hidden p-2 rounded-lg bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black active:scale-95 transition-transform"
          >
            {isSidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>

          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.3)]">
              <Flame className="w-4 h-4 text-white" />
            </div>
            <span className="font-bold text-base tracking-tight text-zinc-900">
              BUITEMS <span className="text-emerald-600">AI Docs</span>
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <Link href="/" className="text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">Home</Link>
          <Link href="/dashboard" className="text-xs sm:text-sm font-semibold text-zinc-600 hover:text-zinc-900 transition-colors">Dashboard</Link>
          <Link href="/signup" className="px-4 py-2 rounded-xl bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-semibold text-xs sm:text-sm shadow-sm active:scale-95 transition-transform">
            Get Started
          </Link>
        </div>
      </header>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 max-w-7xl w-full mx-auto flex relative z-10">
        
        {/* MOBILE SIDEBAR OVERLAY */}
        {isSidebarOpen && (
          <div 
            onClick={() => setIsSidebarOpen(false)}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-40 md:hidden transition-opacity"
          />
        )}

        {/* SIDEBAR NAVIGATION */}
        <aside className={`
          fixed md:static top-[65px] left-0 h-[calc(100vh-65px)] md:h-auto w-72 shrink-0
          bg-white/95 md:bg-transparent border-r border-zinc-200 p-6 z-50 overflow-y-auto
          transition-transform duration-300 ease-in-out flex flex-col justify-between
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
        `}>
          <div className="space-y-6">
            <div>
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-3">Getting Started</div>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <button 
                    onClick={() => { setActiveSection('intro'); setIsSidebarOpen(false); }} 
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                      activeSection === 'intro' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    Introduction
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveSection('architecture'); setIsSidebarOpen(false); }} 
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                      activeSection === 'architecture' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    Core Architecture
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveSection('quickstart'); setIsSidebarOpen(false); }} 
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                      activeSection === 'quickstart' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    Quick Start Guide
                  </button>
                </li>
              </ul>
            </div>

            <div>
              <div className="text-[10px] font-mono font-bold tracking-wider uppercase text-zinc-400 mb-3">AI Engine & Modules</div>
              <ul className="space-y-1.5 text-sm">
                <li>
                  <button 
                    onClick={() => { setActiveSection('askanything'); setIsSidebarOpen(false); }} 
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                      activeSection === 'askanything' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    Ask Anything & Quizzes
                  </button>
                </li>
                <li>
                  <button 
                    onClick={() => { setActiveSection('expander'); setIsSidebarOpen(false); }} 
                    className={`w-full text-left px-3 py-2 rounded-xl transition-all text-xs font-semibold ${
                      activeSection === 'expander' 
                        ? 'bg-emerald-50 text-emerald-800 border border-emerald-200 shadow-sm' 
                        : 'text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100'
                    }`}
                  >
                    Note Expander (Vision)
                  </button>
                </li>
              </ul>
            </div>
          </div>

          <div className="pt-6 border-t border-zinc-200 text-xs text-zinc-400 flex items-center justify-between mt-8 font-mono">
            <span>v2.4.0-stable</span>
            <span className="text-emerald-600 font-bold">BUITEMS AI</span>
          </div>
        </aside>

        {/* CONTENT AREA */}
        <main className="flex-1 p-6 sm:p-10 lg:p-12 space-y-10 min-w-0">
          
          {activeSection === 'intro' && (
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span>Documentation Overview</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900">
                Introduction to BUITEMS AI
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                Welcome to the official developer and user documentation for <strong className="text-zinc-900 font-semibold">BUITEMS Study AI</strong>. Our platform bridges the gap between advanced autonomous AI agents and decentralized academic knowledge management, empowering students and researchers with cutting-edge tools.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-4">
                <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all group">
                  <Cpu className="w-5 h-5 text-emerald-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-sm text-zinc-900 mb-1">GPU Accelerated Nodes</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">Optimized inference pipelines ensuring ultra-low latency response cycles.</p>
                </div>
                <div className="p-5 rounded-2xl border border-zinc-200 bg-white shadow-sm hover:border-zinc-300 transition-all group">
                  <ShieldCheck className="w-5 h-5 text-teal-600 mb-2 group-hover:scale-110 transition-transform" />
                  <h3 className="font-bold text-sm text-zinc-900 mb-1">Secure & Decentralized</h3>
                  <p className="text-xs text-zinc-500 leading-relaxed">End-to-end encrypted academic data handled through private nodes.</p>
                </div>
              </div>
            </section>
          )}

          {activeSection === 'architecture' && (
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span>Core Engine</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900">
                Cyber Emerald Engine Architecture
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                The platform runs on optimized GPU processing nodes (<code className="text-emerald-700 font-mono bg-zinc-100 px-1.5 py-0.5 rounded border border-zinc-200">fiery_ai_core.tsx</code>), ensuring real-time response generation for complex mathematical modeling, code analysis, and document parsing.
              </p>
              
              <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-xs sm:text-sm text-emerald-900 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 shrink-0 text-emerald-600 mt-0.5" />
                <span><strong>Note:</strong> All queries are securely handled with token-based authentication and routed through localized decentralized nodes for privacy.</span>
              </div>
            </section>
          )}

          {activeSection === 'quickstart' && (
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span>Getting Started</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900">
                Quick Start Guide
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                Follow these simple steps to start building and querying study notes inside your dashboard environment.
              </p>
              <ol className="list-decimal list-inside space-y-3 text-sm text-zinc-700 pl-2 font-medium">
                <li>Create an account or log in via the authentication portal.</li>
                <li>Navigate to your personal <strong className="text-zinc-900 font-bold">Dashboard</strong>.</li>
                <li>Select a module like <strong className="text-emerald-600 font-bold">Note Expander</strong> or <strong className="text-emerald-600 font-bold">Ask Anything</strong>.</li>
                <li>Input your rough lecture text to receive structured summaries instantly.</li>
              </ol>
            </section>
          )}

          {activeSection === 'askanything' && (
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span>AI Engine Module</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900">
                Ask Anything & Quizzes
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                The Ask Anything engine parses complex syllabus parameters, formulating custom practice quizzes and contextual explanations tailored directly for BUITEMS coursework standards.
              </p>
            </section>
          )}

          {activeSection === 'expander' && (
            <section className="space-y-6">
              <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-semibold">
                <span>Vision Processing</span>
              </div>
              <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-zinc-900">
                Note Expander (Vision)
              </h1>
              <p className="text-zinc-600 text-sm sm:text-base leading-relaxed">
                Upload images of handwritten classroom notes or textbook pages. The OCR vision pipeline automatically structures raw fragments into professional, exam-ready study blocks.
              </p>
            </section>
          )}

        </main>

      </div>
    </div>
  );
}


// 'use client';

// import React, { useState } from 'react';
// import Link from 'next/link';
// import { Sparkles, BookOpen, Terminal, Code, Cpu, ShieldAlert, Menu, X, ArrowRight } from 'lucide-react';

// export default function DocumentationPage() {
//   const [activeSection, setActiveSection] = useState('introduction');
//   const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

//   const scrollToSection = (id) => {
//     setActiveSection(id);
//     setMobileMenuOpen(false);
//     const element = document.getElementById(id);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-orange-500 selection:text-white relative overflow-hidden">
      
//       {/* Background Glowing Orange Effect (As requested from reference) */}
//       <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-orange-600/15 blur-[160px] rounded-full pointer-events-none" />

//       {/* Navbar */}
//       <header className="sticky top-0 z-40 h-20 border-b border-zinc-900 bg-slate-950/80 backdrop-blur-xl flex items-center justify-between px-6 sm:px-12">
//         <div className="flex items-center gap-3">
//           <Link href="/" className="flex items-center gap-3">
//             <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center shadow-[0_0_25px_rgba(249,115,22,0.5)] text-white">
//               <Sparkles className="w-5 h-5 animate-pulse" />
//             </div>
//             <span className="font-extrabold text-lg tracking-wider text-white">BUITEMS <span className="text-orange-500">AI Docs</span></span>
//           </Link>
//         </div>

//         <div className="hidden md:flex items-center gap-6 text-sm font-semibold text-zinc-400">
//           <Link href="/" className="hover:text-white transition-colors">Home</Link>
//           <Link href="/dashboard" className="hover:text-white transition-colors">Dashboard</Link>
//           <Link href="/login" className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-orange-600 to-amber-600 text-white shadow-[0_0_20px_rgba(249,115,22,0.4)] hover:scale-105 transition-all">
//             Get Started
//           </Link>
//         </div>

//         <button 
//           onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
//           className="md:hidden p-2 text-zinc-400 hover:text-white"
//         >
//           {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
//         </button>
//       </header>

//       <div className="max-w-7xl mx-auto px-6 sm:px-12 flex relative z-10">
        
//         {/* Sidebar Navigation */}
//         <aside className={`fixed md:sticky top-20 z-30 h-[calc(100vh-5rem)] w-72 bg-slate-950/95 md:bg-transparent backdrop-blur-xl border-r border-zinc-900 p-6 overflow-y-auto transition-transform duration-300 ${mobileMenuOpen ? 'translate-x-0 left-0' : '-translate-x-full md:translate-x-0'}`}>
//           <div className="space-y-6">
//             <div>
//               <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">Getting Started</h3>
//               <ul className="space-y-1.5 text-sm font-medium">
//                 <li>
//                   <button onClick={() => scrollToSection('introduction')} className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeSection === 'introduction' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'}`}>
//                     Introduction
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => scrollToSection('architecture')} className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeSection === 'architecture' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'}`}>
//                     Core Architecture
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => scrollToSection('quickstart')} className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeSection === 'quickstart' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'}`}>
//                     Quick Start Guide
//                   </button>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">AI Engine & Modules</h3>
//               <ul className="space-y-1.5 text-sm font-medium">
//                 <li>
//                   <button onClick={() => scrollToSection('ask-anything')} className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeSection === 'ask-anything' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'}`}>
//                     Ask Anything & Quizzes
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => scrollToSection('note-expander')} className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeSection === 'note-expander' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'}`}>
//                     Note Expander (Vision)
//                   </button>
//                 </li>
//                 <li>
//                   <button onClick={() => scrollToSection('pdf-analysis')} className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeSection === 'pdf-analysis' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'}`}>
//                     PDF & Textbook Processing
//                   </button>
//                 </li>
//               </ul>
//             </div>

//             <div>
//               <h3 className="text-xs font-bold uppercase tracking-widest text-zinc-500 mb-3">API Reference</h3>
//               <ul className="space-y-1.5 text-sm font-medium">
//                 <li>
//                   <button onClick={() => scrollToSection('endpoints')} className={`w-full text-left px-3.5 py-2.5 rounded-xl transition-all ${activeSection === 'endpoints' ? 'bg-orange-500/15 text-orange-400 border border-orange-500/30 font-bold shadow-[0_0_15px_rgba(249,115,22,0.15)]' : 'text-zinc-400 hover:text-white hover:bg-zinc-900/60'}`}>
//                     REST Endpoints
//                   </button>
//                 </li>
//               </ul>
//             </div>
//           </div>
//         </aside>

//         {/* Main Content Area */}
//         <main className="flex-1 py-12 px-4 md:px-12 max-w-4xl space-y-16">
          
//           {/* Introduction */}
//           <section id="introduction" className="space-y-4">
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-500/10 border border-orange-500/20 text-orange-400 text-xs font-semibold shadow-sm">
//               <BookOpen className="w-3.5 h-3.5" /> Documentation Overview
//             </div>
//             <h1 className="text-3xl sm:text-4xl font-extrabold text-white tracking-tight">Introduction to BUITEMS AI</h1>
//             <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
//               Welcome to the official developer and user documentation for <strong className="text-white">BUITEMS Study AI</strong>. Our platform bridges the gap between advanced autonomous AI agents and decentralized academic knowledge management, empowering students and researchers with cutting-edge tools.
//             </p>
//           </section>

//           {/* Architecture */}
//           <section id="architecture" className="space-y-4 pt-6 border-t border-zinc-900">
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
//               <Cpu className="w-3.5 h-3.5 text-orange-500" /> Core Engine
//             </div>
//             <h2 className="text-2xl font-bold text-white">Cosmic Orange Engine Architecture</h2>
//             <p className="text-zinc-300 leading-relaxed text-sm sm:text-base">
//               The platform runs on optimized GPU processing nodes (`fiery_ai_core.tsx`), ensuring real-time response generation for complex mathematical modeling, code analysis, and document parsing.
//             </p>
//             <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 flex items-start gap-3 shadow-inner">
//               <ShieldAlert className="w-5 h-5 text-orange-500 shrink-0 mt-0.5" />
//               <p className="text-xs text-zinc-400 leading-relaxed">
//                 <strong className="text-zinc-200">Note:</strong> All queries are securely handled with token-based authentication and routed through localized decentralized nodes for privacy.
//               </p>
//             </div>
//           </section>

//           {/* Quick Start */}
//           <section id="quickstart" className="space-y-4 pt-6 border-t border-zinc-900">
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
//               <Terminal className="w-3.5 h-3.5 text-orange-500" /> Getting Started
//             </div>
//             <h2 className="text-2xl font-bold text-white">Quick Start Guide</h2>
//             <p className="text-zinc-300 text-sm sm:text-base">Follow these simple steps to configure and run your environment:</p>
            
//             <div className="space-y-3">
//               <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3 shadow-xl">
//                 <h4 className="text-sm font-bold text-white flex items-center gap-2.5">
//                   <span className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-xs shadow-[0_0_10px_rgba(249,115,22,0.4)]">1</span>
//                   Clone & Install Dependencies
//                 </h4>
//                 <div className="p-3.5 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-orange-400 overflow-x-auto">
//                   git clone https://github.com/buitems-ai/study-platform.git<br/>
//                   cd study-platform<br/>
//                   npm install
//                 </div>
//               </div>

//               <div className="p-5 rounded-2xl bg-zinc-900/40 border border-zinc-800 space-y-3 shadow-xl">
//                 <h4 className="text-sm font-bold text-white flex items-center gap-2.5">
//                   <span className="w-6 h-6 rounded-lg bg-orange-600 text-white flex items-center justify-center text-xs shadow-[0_0_10px_rgba(249,115,22,0.4)]">2</span>
//                   Configure Environment Variables
//                 </h4>
//                 <div className="p-3.5 rounded-xl bg-black border border-zinc-800 font-mono text-xs text-orange-400 overflow-x-auto">
//                   NEXT_PUBLIC_BACKEND_URL=http://localhost:5000<br/>
//                   MONGODB_URI=your_mongodb_cluster_connection_string
//                 </div>
//               </div>
//             </div>
//           </section>

//           {/* Ask Anything */}
//           <section id="ask-anything" className="space-y-4 pt-6 border-t border-zinc-900">
//             <h2 className="text-2xl font-bold text-white">Ask Anything & Automated Quizzes</h2>
//             <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
//               The <strong className="text-white">Ask Anything</strong> module responds to technical and general study queries. Typing keywords like <span className="text-orange-400 font-mono">"generate quiz"</span> or <span className="text-orange-400 font-mono">"mock test"</span> automatically formats a 50-question interactive assessment module stored directly in your local bookshelf.
//             </p>
//           </section>

//           {/* Note Expander */}
//           <section id="note-expander" className="space-y-4 pt-6 border-t border-zinc-900">
//             <h2 className="text-2xl font-bold text-white">Note Expander (Vision AI)</h2>
//             <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
//               Upload rough or handwritten class lecture images. The multimodal vision pipeline parses handwriting, rectifies conceptual errors, and constructs fully formatted notes with a dedicated <span className="text-orange-400 font-semibold">Corrections & Gaps</span> section.
//             </p>
//           </section>

//           {/* PDF Analysis */}
//           <section id="pdf-analysis" className="space-y-4 pt-6 border-t border-zinc-900">
//             <h2 className="text-2xl font-bold text-white">PDF & Textbook Processing</h2>
//             <p className="text-zinc-300 text-sm sm:text-base leading-relaxed">
//               Upload complete reference textbooks or chapters in PDF format. The system digests multi-page documents to synthesize chapter-by-chapter summaries, core formulas, and structured revision guides.
//             </p>
//           </section>

//           {/* API Endpoints */}
//           <section id="endpoints" className="space-y-4 pt-6 border-t border-zinc-900 pb-20">
//             <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-zinc-900 border border-zinc-800 text-zinc-300 text-xs font-semibold">
//               <Code className="w-3.5 h-3.5 text-orange-500" /> API Reference
//             </div>
//             <h2 className="text-2xl font-bold text-white">REST Endpoints Overview</h2>
            
//             <div className="overflow-x-auto rounded-2xl border border-zinc-800 bg-zinc-950/60 shadow-xl">
//               <table className="w-full text-left text-sm">
//                 <thead className="bg-zinc-900/80 text-xs uppercase font-mono text-zinc-400">
//                   <tr>
//                     <th className="px-4 py-3.5 border-b border-zinc-800">Endpoint</th>
//                     <th className="px-4 py-3.5 border-b border-zinc-800">Method</th>
//                     <th className="px-4 py-3.5 border-b border-zinc-800">Description</th>
//                   </tr>
//                 </thead>
//                 <tbody className="divide-y divide-zinc-800 text-xs font-mono text-zinc-300">
//                   <tr>
//                     <td className="px-4 py-4 text-orange-400">/api/auth/login</td>
//                     <td className="px-4 py-4 font-bold text-emerald-400">POST</td>
//                     <td className="px-4 py-4 font-sans text-zinc-400">Authenticates user and returns JWT token.</td>
//                   </tr>
//                   <tr>
//                     <td className="px-4 py-4 text-orange-400">/api/ai/ask-anything</td>
//                     <td className="px-4 py-4 font-bold text-emerald-400">POST</td>
//                     <td className="px-4 py-4 font-sans text-zinc-400">Processes general prompt queries.</td>
//                   </tr>
//                   <tr>
//                     <td className="px-4 py-4 text-orange-400">/api/ai/expand-notes</td>
//                     <td className="px-4 py-4 font-bold text-emerald-400">POST</td>
//                     <td className="px-4 py-4 font-sans text-zinc-400">Multimodal image notes expansion.</td>
//                   </tr>
//                   <tr>
//                     <td className="px-4 py-4 text-orange-400">/api/ai/pdf-analysis</td>
//                     <td className="px-4 py-4 font-bold text-emerald-400">POST</td>
//                     <td className="px-4 py-4 font-sans text-zinc-400">Analyzes and summarizes uploaded PDF text.</td>
//                   </tr>
//                 </tbody>
//               </table>
//             </div>
//           </section>

//         </main>
//       </div>
//     </div>
//   );
// }