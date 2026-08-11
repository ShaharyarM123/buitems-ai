//4th edit
'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { GraduationCap, LogIn, UserPlus, Menu, X } from 'lucide-react';

export default function Navbar() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  // Sirf home page ('/') par render hoga
  if (pathname !== '/') {
    return null;
  }

  const scrollToSection = (sectionId) => {
    setMobileMenuOpen(false);
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <header className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4">
      {/* Floating Glassmorphic Light Pill Navbar */}
      <nav className="w-full max-w-4xl bg-white/80 backdrop-blur-xl border border-zinc-200/80 rounded-full px-4 sm:px-6 py-2.5 flex items-center justify-between shadow-sm transition-all duration-300">
        
        {/* Left: Brand Logo / Name */}
        <Link href="/" className="flex items-center gap-2 group">
          <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-emerald-600 to-teal-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(16,185,129,0.3)] group-hover:scale-105 transition-transform">
            <GraduationCap className="w-4 h-4" />
          </div>
          <span className="text-xs sm:text-sm font-bold tracking-tight text-zinc-900 flex items-center gap-1">
            BUITEMS <span className="text-emerald-600 font-semibold">Study AI</span>
          </span>
        </Link>

        {/* Center Links (Desktop) */}
        <div className="hidden md:flex items-center gap-1 bg-zinc-100/80 border border-zinc-200/60 rounded-full px-3 py-1">
          <button 
            onClick={() => scrollToSection('section-0')} 
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-white transition-all cursor-pointer shadow-none hover:shadow-sm"
          >
            Home
          </button>
          
          <button 
            onClick={() => scrollToSection('section-1')} 
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-white transition-all cursor-pointer shadow-none hover:shadow-sm"
          >
            About
          </button>

          <button 
            onClick={() => scrollToSection('section-2')} 
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-white transition-all cursor-pointer shadow-none hover:shadow-sm"
          >
            Contact
          </button>

          <Link 
            href="/dashboard" 
            className="px-3.5 py-1.5 rounded-full text-xs font-semibold text-zinc-600 hover:text-zinc-900 hover:bg-white transition-all shadow-none hover:shadow-sm"
          >
            Dashboard
          </Link>
        </div>

        {/* Right Auth Buttons (Desktop) */}
        <div className="hidden sm:flex items-center gap-2">
          <Link 
            href="/login" 
            className="px-3 py-2 rounded-full text-xs font-semibold text-zinc-700 hover:text-zinc-900 hover:bg-zinc-100 transition-all flex items-center gap-1.5"
          >
            <LogIn className="w-3.5 h-3.5 text-emerald-600" />
            <span>Login</span>
          </Link>

          <Link 
            href="/signup" 
            className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-[0_4px_14px_rgba(16,185,129,0.3)] transition-all flex items-center gap-1.5 active:scale-95"
          >
            <UserPlus className="w-3.5 h-3.5" />
            <span>Sign Up</span>
          </Link>
        </div>

        {/* Mobile Menu Trigger */}
        <button 
          onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
          className="md:hidden p-2 rounded-full bg-zinc-100 border border-zinc-200 text-zinc-700 hover:text-black transition-colors"
          aria-label="Toggle Menu"
        >
          {mobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
        </button>

      </nav>

      {/* Mobile Dropdown Menu */}
      {mobileMenuOpen && (
        <div className="absolute top-16 left-4 right-4 bg-white/95 backdrop-blur-2xl border border-zinc-200 rounded-2xl p-4 flex flex-col gap-2 md:hidden shadow-xl z-50 animate-in fade-in slide-in-from-top-2">
          <button 
            onClick={() => scrollToSection('section-0')} 
            className="text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all"
          >
            Home
          </button>
          <button 
            onClick={() => scrollToSection('section-1')} 
            className="text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all"
          >
            About
          </button>
          <button 
            onClick={() => scrollToSection('section-2')} 
            className="text-left px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all"
          >
            Contact
          </button>
          <Link 
            href="/dashboard" 
            className="px-4 py-2.5 rounded-xl text-xs font-semibold text-zinc-700 hover:bg-zinc-100 hover:text-black transition-all"
          >
            Dashboard
          </Link>
          <div className="grid grid-cols-2 gap-2 pt-2 border-t border-zinc-200">
            <Link 
              href="/login" 
              className="py-2.5 rounded-xl text-xs font-semibold text-center bg-zinc-100 text-zinc-800 hover:bg-zinc-200 border border-zinc-200 transition-colors"
            >
              Login
            </Link>
            <Link 
              href="/signup" 
              className="py-2.5 rounded-xl text-xs font-semibold text-center bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md transition-all"
            >
              Sign Up
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}

//3ed edit

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { GraduationCap, LogIn, UserPlus } from 'lucide-react';

// export default function Navbar() {
//   const pathname = usePathname();

//   const scrollToSection = (sectionId) => {
//     if (pathname !== '/') {
//       window.location.href = `/#${sectionId}`;
//       return;
//     }
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <header className="absolute top-4 left-0 right-0 z-50 flex justify-center px-4">
//       {/* Floating Glassmorphic Pill Navbar with subtle transparent shade and blur */}
//       <nav className="w-full max-w-4xl bg-zinc-950/40 backdrop-blur-xl border border-white/10 rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300">
        
//         {/* Left: Brand Logo / Name */}
//         <Link href="/" className="flex items-center gap-2.5 group">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform">
//             <GraduationCap className="w-4 h-4" />
//           </div>
//           <span className="text-xs sm:text-sm font-semibold tracking-tight text-white flex items-center gap-1">
//             BUITEMS <span className="text-orange-400 font-normal">Study AI</span>
//           </span>
//         </Link>

//         {/* Center Links (Home, About, Contact, Dashboard) */}
//         <div className="hidden md:flex items-center gap-1 bg-zinc-900/30 border border-white/5 rounded-full px-3 py-1">
//           <button 
//             onClick={() => scrollToSection('section-0')} 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
//           >
//             Home
//           </button>
          
//           <button 
//             onClick={() => scrollToSection('section-1')} 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
//           >
//             About
//           </button>

//           <button 
//             onClick={() => scrollToSection('section-2')} 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all cursor-pointer"
//           >
//             Contact
//           </button>

//           <Link 
//             href="/dashboard" 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/50 transition-all"
//           >
//             Dashboard
//           </Link>
//         </div>

//         {/* Right Auth Buttons (Login & Signup) */}
//         <div className="flex items-center gap-2">
//           <Link 
//             href="/login" 
//             className="px-3.5 py-2 rounded-full text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/50 transition-all border border-transparent hover:border-zinc-700 flex items-center gap-1"
//           >
//             <LogIn className="w-3.5 h-3.5 text-orange-400" />
//             <span>Login</span>
//           </Link>

//           <Link 
//             href="/signup" 
//             className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center gap-1"
//           >
//             <UserPlus className="w-3.5 h-3.5" />
//             <span>Sign Up</span>
//           </Link>
//         </div>

//       </nav>
//     </header>
//   );
// }





//2nd edit 

// 'use client';

// import Link from 'next/link';
// import { usePathname } from 'next/navigation';
// import { GraduationCap, LogIn, UserPlus } from 'lucide-react';

// export default function Navbar() {
//   const pathname = usePathname();

//   const scrollToSection = (sectionId) => {
//     if (pathname !== '/') {
//       window.location.href = `/#${sectionId}`;
//       return;
//     }
//     const element = document.getElementById(sectionId);
//     if (element) {
//       element.scrollIntoView({ behavior: 'smooth' });
//     }
//   };

//   return (
//     <header className="fixed top-4 left-0 right-0 z-50 flex justify-center px-4">
//       {/* Floating Glassmorphic Pill Navbar */}
//       <nav className="w-full max-w-4xl bg-zinc-950/70 backdrop-blur-xl border border-zinc-800/80 rounded-full px-5 py-2.5 flex items-center justify-between shadow-[0_8px_32px_rgba(0,0,0,0.5)] transition-all duration-300">
        
//         {/* Left: Brand Logo / Name */}
//         <Link href="/" className="flex items-center gap-2.5 group">
//           <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-orange-600 to-amber-500 flex items-center justify-center text-white shadow-[0_0_15px_rgba(249,115,22,0.4)] group-hover:scale-105 transition-transform">
//             <GraduationCap className="w-4 h-4" />
//           </div>
//           <span className="text-xs sm:text-sm font-semibold tracking-tight text-white flex items-center gap-1">
//             BUITEMS <span className="text-orange-400 font-normal">Study AI</span>
//           </span>
//         </Link>

//         {/* Center Links (Home, About, Contact, Dashboard) */}
//         <div className="hidden md:flex items-center gap-1 bg-zinc-900/50 border border-zinc-800/60 rounded-full px-3 py-1">
//           <button 
//             onClick={() => scrollToSection('section-0')} 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
//           >
//             Home
//           </button>
          
//           <button 
//             onClick={() => scrollToSection('section-1')} 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
//           >
//             About
//           </button>

//           <button 
//             onClick={() => scrollToSection('section-2')} 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all cursor-pointer"
//           >
//             Contact
//           </button>

//           <Link 
//             href="/dashboard" 
//             className="px-4 py-1.5 rounded-full text-xs font-semibold text-zinc-300 hover:text-white hover:bg-zinc-800/60 transition-all"
//           >
//             Dashboard
//           </Link>
//         </div>

//         {/* Right Auth Buttons (Login & Signup) */}
//         <div className="flex items-center gap-2">
//           <Link 
//             href="/login" 
//             className="px-3.5 py-2 rounded-full text-xs font-semibold text-zinc-200 hover:text-white hover:bg-zinc-800/60 transition-all border border-transparent hover:border-zinc-700 flex items-center gap-1"
//           >
//             <LogIn className="w-3.5 h-3.5 text-orange-400" />
//             <span>Login</span>
//           </Link>

//           <Link 
//             href="/signup" 
//             className="px-4 py-2 rounded-full text-xs font-semibold bg-gradient-to-r from-orange-600 to-amber-600 hover:from-orange-500 hover:to-amber-500 text-white shadow-[0_0_15px_rgba(249,115,22,0.3)] transition-all flex items-center gap-1"
//           >
//             <UserPlus className="w-3.5 h-3.5" />
//             <span>Sign Up</span>
//           </Link>
//         </div>

//       </nav>
//     </header>
//   );
// }





// 'use client';

// import Link from 'next/link';
// import { useTheme } from 'next-themes';
// import { Sun, Moon, GraduationCap } from 'lucide-react';
// import { useState, useEffect } from 'react';

// export default function Navbar() {
//   const { theme, setTheme } = useTheme();
//   const [mounted, setMounted] = useState(false);

//   useEffect(() => setMounted(true), []);

//   return (
//     <header className="border-b border-zinc-200 dark:border-zinc-800 bg-white/80 dark:bg-black/80 backdrop-blur-md sticky top-0 z-50">
//       <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
//         <Link href="/" className="flex items-center gap-2 font-bold text-lg tracking-tight">
//           <div className="p-1.5 bg-black dark:bg-white text-white dark:text-black rounded-lg">
//             <GraduationCap className="w-5 h-5" />
//           </div>
//           <span>BUITEMS <span className="font-normal opacity-70">Study AI</span></span>
//         </Link>

//         {/* Navigation Links & Actions */}
//         <div className="flex items-center gap-6">
//           <div className="hidden sm:flex items-center gap-6">
//             <Link href="/" className="text-sm font-medium hover:opacity-75 transition-opacity">
//               Home
//             </Link>
//             <Link href="#section-1" className="text-sm font-medium hover:opacity-75 transition-opacity">
//               About
//             </Link>
//             <Link href="#section-2" className="text-sm font-medium hover:opacity-75 transition-opacity">
//               Contact
//             </Link>
//           </div>

//           <div className="flex items-center gap-4 border-l border-zinc-200 dark:border-zinc-800 pl-4">
//             <Link 
//               href="/dashboard" 
//               className="text-sm font-medium hover:underline px-2 py-1.5 hidden md:block"
//             >
//               Dashboard
//             </Link>
//             <Link 
//               href="/login" 
//               className="text-sm font-medium px-4 py-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
//             >
//               Login
//             </Link>

//             {mounted && (
//               <button
//                 onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
//                 className="p-2 rounded-lg border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
//                 aria-label="Toggle Theme"
//               >
//                 {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
//               </button>
//             )}
//           </div>
//         </div>
//       </div>
//     </header>
//   );
// }
