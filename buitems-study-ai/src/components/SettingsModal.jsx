//2nd edit

'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from 'next-themes';
import { X, Edit2, Moon, Sun, LogOut, Check, Sparkles } from 'lucide-react';

export default function SettingsModal({ isOpen, onClose }) {
  const router = useRouter();
  const { theme, setTheme } = useTheme();
  const [mounted, setMounted] = useState(false);
  const [profileName, setProfileName] = useState('MIR SHAHARYAR');
  const [isEditingName, setIsEditingName] = useState(false);
  const [tempName, setTempName] = useState(profileName);

  useEffect(() => {
    setMounted(true);
    const savedName = localStorage.getItem('profileName');
    if (savedName) {
      setProfileName(savedName);
      setTempName(savedName);
    }
  }, []);

  if (!isOpen) return null;

  const handleLogout = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('profileName');
    router.push('/');
  };

  const handleSaveName = () => {
    if (tempName.trim()) {
      setProfileName(tempName.trim());
      localStorage.setItem('profileName', tempName.trim());
    }
    setIsEditingName(false);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-md bg-slate-900/90 dark:bg-zinc-900/95 border border-slate-800 dark:border-zinc-800 rounded-3xl p-5 sm:p-6 shadow-[0_0_50px_rgba(0,0,0,0.8)] text-slate-100 dark:text-zinc-100 transition-all backdrop-blur-xl">
        
        {/* Ambient Top Glow */}
        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/15 blur-[50px] rounded-full pointer-events-none" />

        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-slate-800 dark:border-zinc-800 relative z-10">
          <div className="flex items-center gap-2.5">
            <div className="w-7 h-7 rounded-xl bg-blue-600/20 border border-blue-500/30 flex items-center justify-center text-blue-400">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <h2 className="text-base font-extrabold tracking-tight">Settings</h2>
          </div>
          <button 
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-slate-800 dark:hover:bg-zinc-800 text-slate-400 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Body Content */}
        <div className="space-y-3.5 my-5 relative z-10">
          
          {/* Profile Name Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 dark:border-zinc-800 bg-slate-950/60 dark:bg-zinc-950/50 flex flex-col sm:flex-row sm:items-center justify-between gap-3 transition-all hover:border-slate-700">
            <div className="w-full">
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-bold block mb-1">Profile Name</span>
              {isEditingName ? (
                <div className="flex items-center gap-2 mt-1">
                  <input
                    type="text"
                    value={tempName}
                    onChange={(e) => setTempName(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 dark:bg-zinc-900 border border-blue-500/50 rounded-xl text-xs text-white outline-none shadow-[0_0_10px_rgba(59,130,246,0.15)]"
                    autoFocus
                  />
                  <button 
                    onClick={handleSaveName} 
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs rounded-xl font-bold flex items-center gap-1 shrink-0 transition-all shadow-[0_0_10px_rgba(59,130,246,0.3)]"
                  >
                    <Check className="w-3.5 h-3.5" /> Save
                  </button>
                </div>
              ) : (
                <h3 className="font-bold text-sm tracking-wide truncate pr-2">{profileName}</h3>
              )}
            </div>
            
            {!isEditingName && (
              <button 
                onClick={() => { setTempName(profileName); setIsEditingName(true); }}
                className="flex items-center justify-center gap-1.5 text-blue-400 hover:text-blue-300 text-xs font-semibold px-3 py-1.5 rounded-xl bg-blue-600/10 border border-blue-500/30 hover:bg-blue-600/25 transition-all shrink-0 self-start sm:self-auto"
              >
                <Edit2 className="w-3.5 h-3.5" /> Edit Name
              </button>
            )}
          </div>

          {/* Appearance Mode Box */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 dark:border-zinc-800 bg-slate-950/60 dark:bg-zinc-950/50 flex items-center justify-between gap-3 transition-all hover:border-slate-700">
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-bold block mb-0.5">Appearance Mode</span>
              <h3 className="font-bold text-xs sm:text-sm tracking-wide text-slate-200">
                {mounted && theme === 'dark' ? 'Dark Mode Active' : 'Light Mode Active'}
              </h3>
            </div>

            {mounted && (
              <button
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                className="flex items-center gap-2 px-3.5 py-2 rounded-xl border border-slate-700 dark:border-zinc-700 bg-slate-900 dark:bg-zinc-900 text-xs font-semibold hover:border-slate-600 transition-all shadow-sm shrink-0"
              >
                {theme === 'dark' ? <Sun className="w-3.5 h-3.5 text-amber-400" /> : <Moon className="w-3.5 h-3.5 text-indigo-400" />}
                <span className="hidden xs:inline">{theme === 'dark' ? 'Light Theme' : 'Dark Theme'}</span>
              </button>
            )}
          </div>

          {/* Session Control Box (Logout) */}
          <div className="p-3.5 sm:p-4 rounded-2xl border border-slate-800/80 dark:border-zinc-800 bg-slate-950/60 dark:bg-zinc-950/50 flex items-center justify-between gap-3 transition-all hover:border-slate-700">
            <div>
              <span className="text-[10px] font-mono tracking-wider uppercase text-slate-400 dark:text-zinc-500 font-bold block mb-0.5">Session Control</span>
              <p className="text-xs text-slate-400 dark:text-zinc-400">Sign out and clear storage.</p>
            </div>

            <button
              onClick={handleLogout}
              className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-400 text-xs font-bold transition-all shadow-sm shrink-0"
            >
              <LogOut className="w-3.5 h-3.5" /> Logout
            </button>
          </div>

        </div>

        {/* Footer Close Button */}
        <div className="flex justify-end pt-3 border-t border-slate-800 dark:border-zinc-800 relative z-10">
          <button
            onClick={onClose}
            className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 dark:bg-zinc-100 dark:hover:bg-white text-white dark:text-zinc-900 text-xs font-bold transition-all border border-slate-700 dark:border-transparent shadow"
          >
            Close Settings
          </button>
        </div>

      </div>
    </div>
  );
}




//1st edit

// 'use client';

// import React, { useState, useEffect } from 'react';
// import { useRouter } from 'next/navigation';
// import { useTheme } from 'next-themes';
// import { X, Edit2, Moon, Sun, LogOut } from 'lucide-react';

// export default function SettingsModal({ isOpen, onClose }) {
//   const router = useRouter();
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);
//   const [profileName, setProfileName] = useState('MIR SHAHARYAR');
//   const [isEditingName, setIsEditingName] = useState(false);
//   const [tempName, setTempName] = useState(profileName);

//   useEffect(() => {
//     setMounted(true);
//     const savedName = localStorage.getItem('profileName');
//     if (savedName) setProfileName(savedName);
//   }, []);

//   if (!isOpen) return null;

//   // Logout Handler (Clears storage and redirects to landing/login page)
//   const handleLogout = () => {
//     localStorage.removeItem('token');
//     localStorage.removeItem('profileName');
//     router.push('/');
//   };

//   const handleSaveName = () => {
//     if (tempName.trim()) {
//       setProfileName(tempName);
//       localStorage.setItem('profileName', tempName);
//     }
//     setIsEditingName(false);
//   };

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
//       <div className="relative w-full max-w-lg bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 shadow-2xl text-zinc-900 dark:text-zinc-100 transition-all">
        
//         {/* Header */}
//         <div className="flex items-center justify-between pb-4 border-b border-zinc-200 dark:border-zinc-800">
//           <h2 className="text-xl font-bold tracking-tight">Settings</h2>
//           <button 
//             onClick={onClose}
//             className="p-1.5 rounded-full hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors"
//           >
//             <X className="w-5 h-5 text-zinc-500" />
//           </button>
//         </div>

//         {/* Body Content */}
//         <div className="space-y-4 my-6">
          
//           {/* Profile Name Box */}
//           <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between">
//             <div>
//               <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 font-bold block mb-1">Profile Name</span>
//               {isEditingName ? (
//                 <div className="flex items-center gap-2 mt-1">
//                   <input
//                     type="text"
//                     value={tempName}
//                     onChange={(e) => setTempName(e.target.value)}
//                     className="px-3 py-1 bg-white dark:bg-zinc-900 border border-zinc-300 dark:border-zinc-700 rounded-lg text-sm outline-none"
//                   />
//                   <button onClick={handleSaveName} className="px-3 py-1 bg-emerald-600 text-white text-xs rounded-lg font-medium">Save</button>
//                 </div>
//               ) : (
//                 <h3 className="font-bold text-base tracking-wide">{profileName}</h3>
//               )}
//             </div>
            
//             <button 
//               onClick={() => { setTempName(profileName); setIsEditingName(!isEditingName); }}
//               className="flex items-center gap-1.5 text-amber-500 hover:text-amber-600 text-xs font-semibold px-3 py-1.5 rounded-lg hover:bg-amber-500/10 transition-colors"
//             >
//               <Edit2 className="w-3.5 h-3.5" /> Edit Name
//             </button>
//           </div>

//           {/* Appearance Mode Box */}
//           <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between">
//             <div>
//               <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 font-bold block mb-1">Appearance Mode</span>
//               <h3 className="font-bold text-base tracking-wide">
//                 {mounted && theme === 'dark' ? 'Dark Mode' : 'Light Mode'}
//               </h3>
//             </div>

//             {mounted && (
//               <button
//                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//                 className="flex items-center gap-2 px-4 py-2 rounded-xl border border-zinc-300 dark:border-zinc-700 bg-white dark:bg-zinc-900 text-xs font-semibold hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors shadow-sm"
//               >
//                 {theme === 'dark' ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4 text-indigo-500" />}
//                 <span>{theme === 'dark' ? 'Switch to Light' : 'Switch to Dark'}</span>
//               </button>
//             )}
//           </div>

//           {/* Session Control Box (Logout) */}
//           <div className="p-4 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-950/50 flex items-center justify-between">
//             <div>
//               <span className="text-[10px] font-mono tracking-wider uppercase text-zinc-400 font-bold block mb-1">Session Control</span>
//               <p className="text-xs text-zinc-500 dark:text-zinc-400">Sign out and clear local storage.</p>
//             </div>

//             <button
//               onClick={handleLogout}
//               className="flex items-center gap-2 px-4 py-2 rounded-xl border border-red-500/30 bg-red-500/10 hover:bg-red-500/20 text-red-500 text-xs font-semibold transition-colors shadow-sm"
//             >
//               <LogOut className="w-4 h-4" /> Logout
//             </button>
//           </div>

//         </div>

//         {/* Footer Close Button */}
//         <div className="flex justify-end pt-2">
//           <button
//             onClick={onClose}
//             className="px-5 py-2.5 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold hover:opacity-90 transition-opacity"
//           >
//             Close
//           </button>
//         </div>

//       </div>
//     </div>
//   );
// }