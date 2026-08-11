//2ne edit

'use client';
import React from 'react';
import { Sparkles } from 'lucide-react';

export default function LoadingScreen({ message = "Redirecting to Dashboard..." }) {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-zinc-950/95 backdrop-blur-2xl px-4 overflow-hidden select-none">
      
      {/* Background Ambient Glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-80 sm:w-[500px] h-80 sm:h-[500px] bg-gradient-to-tr from-cyan-500/10 via-purple-500/10 to-orange-500/10 blur-[140px] rounded-full pointer-events-none" />

      {/* Custom CSS for Snake/Trail Animation */}
      <style jsx>{`
        @keyframes trailMove {
          0% {
            transform: rotate(0deg) translateX(0px) scale(1);
          }
          50% {
            transform: rotate(180deg) translateX(15px) scale(1.05);
          }
          100% {
            transform: rotate(360deg) translateX(0px) scale(1);
          }
        }
        .snake-dot {
          animation: trailMove 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>

      {/* Center Trailing Snake Animation Container */}
      <div className="relative w-40 h-24 flex items-center justify-center">
        {/* SVG Curved Path with Trailing Glowing Dots */}
        <svg className="absolute w-36 h-20 overflow-visible" viewBox="0 0 120 60" fill="none">
          <path
            id="curvePath"
            d="M 10 45 Q 40 5, 70 30 T 110 25"
            stroke="rgba(255,255,255,0.05)"
            strokeWidth="4"
            strokeLinecap="round"
          />
        </svg>

        {/* Trailing Snake Segments (Gradient Trail matching the GIF) */}
        <div className="absolute flex items-center gap-1.5 animate-bounce">
          <div className="w-3.5 h-3.5 rounded-full bg-cyan-400 shadow-[0_0_12px_#22d3ee]" />
          <div className="w-3.5 h-3.5 rounded-full bg-indigo-400 shadow-[0_0_12px_#818cf8]" />
          <div className="w-4 h-4 rounded-full bg-purple-500 shadow-[0_0_15px_#a855f7]" />
          <div className="w-4 h-4 rounded-full bg-pink-500 shadow-[0_0_15px_#ec4899]" />
          <div className="w-3.5 h-3.5 rounded-full bg-rose-400 shadow-[0_0_12px_#fb7185]" />
          <div className="w-3 h-3 rounded-full bg-amber-400 shadow-[0_0_10px_#fbbf24]" />
        </div>
      </div>

      {/* Dynamic Text Messaging */}
      <div className="mt-8 text-center space-y-2 relative z-10 max-w-xs sm:max-w-md">
        <h3 className="text-base sm:text-lg font-extrabold tracking-widest bg-gradient-to-r from-cyan-300 via-purple-300 to-orange-300 bg-clip-text text-transparent uppercase">
          BUITEMS Study AI
        </h3>
        <p className="text-xs sm:text-sm font-medium text-zinc-400 tracking-wide animate-pulse">
          {message}
        </p>
      </div>

      {/* Smooth Multi-Color Loading Indicator Bar */}
      <div className="mt-6 w-40 sm:w-56 h-1 bg-zinc-900 rounded-full overflow-hidden border border-zinc-800 relative">
        <div className="h-full bg-gradient-to-r from-cyan-400 via-purple-500 to-orange-400 w-full animate-pulse" />
      </div>

    </div>
  );
}





// 'use client';
// import React from 'react';
// import { Sparkles } from 'lucide-react';

// export default function LoadingScreen({ message = "Redirecting to Dashboard..." }) {
//   return (
//     <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-[#0c0a12]/95 backdrop-blur-2xl px-4 overflow-hidden select-none">
      
//       {/* Mobile Responsive Purple & Orange Glow Beams */}
//       <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 sm:w-[450px] h-72 sm:h-[450px] bg-gradient-to-tr from-purple-600/30 via-pink-600/20 to-orange-500/30 blur-[100px] rounded-full pointer-events-none" />

//       {/* Center Spinner Ring & Pulsing Logo */}
//       <div className="relative flex items-center justify-center">
//         {/* Outer Dual Gradient Spinner Ring */}
//         <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-full border-4 border-transparent border-t-purple-500 border-r-orange-500 animate-spin" />
        
//         {/* Inner Glowing Badge */}
//         <div className="absolute w-12 h-12 sm:w-16 sm:h-16 rounded-2xl bg-gradient-to-tr from-purple-900/60 to-orange-950/60 border border-purple-500/40 flex items-center justify-center shadow-[0_0_25px_rgba(168,85,247,0.4)] animate-pulse">
//           <Sparkles className="w-6 h-6 sm:w-7 sm:h-7 text-orange-400 animate-spin" style={{ animationDuration: '4s' }} />
//         </div>
//       </div>

//       {/* Dynamic Text Messaging */}
//       <div className="mt-8 text-center space-y-2 relative z-10 max-w-xs sm:max-w-md">
//         <h3 className="text-base sm:text-lg font-extrabold tracking-widest bg-gradient-to-r from-purple-200 via-pink-200 to-orange-300 bg-clip-text text-transparent uppercase">
//           BUITEMS Study AI
//         </h3>
//         <p className="text-xs sm:text-sm font-medium text-purple-300/80 tracking-wide animate-pulse">
//           {message}
//         </p>
//       </div>

//       {/* Smooth Loading Indicator Bar */}
//       <div className="mt-6 w-40 sm:w-56 h-1 bg-purple-950/60 rounded-full overflow-hidden border border-purple-900/40 relative">
//         <div className="h-full bg-gradient-to-r from-purple-500 via-pink-500 to-orange-500 w-full animate-pulse" />
//       </div>

//     </div>
//   );
// }