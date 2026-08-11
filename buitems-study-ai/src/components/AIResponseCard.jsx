//4th edit

'use client';

import React, { useState } from 'react';
import { Bookmark, Check, CornerDownRight, Zap } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';

export default function AIResponseCard({ message, onRegenerate, onBookmark }) {
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [followUpInput, setFollowUpInput] = useState('');
  const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

  const handleBookmarkClick = (content) => {
    setIsBookmarked(true);
    if (onBookmark) onBookmark({ type: 'Response', content, timestamp: Date.now() });
  };

  // Extract clean text regardless of whether it's wrapped in result or direct string
  const resData = message.result || message;
  const responseText = typeof resData === 'string' 
    ? resData 
    : (resData.explanation || resData.definition || JSON.stringify(resData, null, 2));

  return (
    <div className="flex items-start gap-4 my-6 w-full max-w-4xl mx-auto px-4">
      {/* AI Icon Avatar */}
      <div className="p-2.5 rounded-2xl bg-zinc-100 text-zinc-900 shrink-0 border border-zinc-200 shadow-sm">
        <Zap className="w-5 h-5 text-emerald-600" />
      </div>

      {/* Main Content Box with Clean Spacing */}
      <div className="flex-1 space-y-4">
        <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm relative group space-y-3">
          
          {/* Top Bar with Bookmark Option */}
          <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
            <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
              BUITEMS Academic Output
            </span>
            <button 
              onClick={() => handleBookmarkClick(responseText)}
              className="text-zinc-400 hover:text-zinc-900 transition-colors p-1"
              title="Bookmark response"
            >
              {isBookmarked ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
            </button>
          </div>

          {/* Clean Formatted Markdown Text */}
          <div className="text-sm md:text-base leading-relaxed text-zinc-800 font-sans space-y-3">
            <ReactMarkdown 
              remarkPlugins={[remarkGfm]}
              components={{
                h1: ({node, ...props}) => <h1 className="text-xl font-extrabold text-zinc-900 mt-4 mb-2" {...props} />,
                h2: ({node, ...props}) => <h2 className="text-lg font-bold text-zinc-900 mt-4 mb-2" {...props} />,
                h3: ({node, ...props}) => <h3 className="text-base font-bold text-zinc-900 mt-3 mb-1.5" {...props} />,
                h4: ({node, ...props}) => <h4 className="text-sm font-bold text-emerald-700 mt-3 mb-1 uppercase tracking-wider" {...props} />,
                p: ({node, ...props}) => <p className="mb-2 last:mb-0" {...props} />,
                ul: ({node, ...props}) => <ul className="list-disc list-inside space-y-1.5 my-2 pl-2" {...props} />,
                ol: ({node, ...props}) => <ol className="list-decimal list-inside space-y-1.5 my-2 pl-2" {...props} />,
                li: ({node, ...props}) => <li className="text-zinc-800" {...props} />,
                strong: ({node, ...props}) => <strong className="font-bold text-zinc-900" {...props} />,
              }}
            >
              {responseText}
            </ReactMarkdown>
          </div>
        </div>

        {/* INLINE FOLLOW-UP Q&A */}
        <div className="pt-1">
          {!followUpSubmitted ? (
            <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-2 rounded-xl">
              <CornerDownRight className="w-4 h-4 text-zinc-400 ml-2" />
              <input 
                type="text"
                value={followUpInput}
                onChange={(e) => setFollowUpInput(e.target.value)}
                placeholder="Ask a contextual follow-up on this response..."
                className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm py-1.5 px-1 text-zinc-900 placeholder-zinc-400"
              />
              <button 
                onClick={() => { if(followUpInput.trim()) setFollowUpSubmitted(true); }}
                className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
              >
                Ask AI
              </button>
            </div>
          ) : (
            <div className="text-xs text-zinc-500 italic px-2">
              Follow-up query queued: "{followUpInput}"
            </div>
          )}
        </div>
      </div>
    </div>
  );
}




//3rd edit

// 'use client';

// import React, { useState } from 'react';
// import { Bookmark, Check, CornerDownRight, Zap } from 'lucide-react';

// export default function AIResponseCard({ message, onRegenerate, onBookmark }) {
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [followUpInput, setFollowUpInput] = useState('');
//   const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

//   const handleBookmarkClick = (content) => {
//     setIsBookmarked(true);
//     if (onBookmark) onBookmark({ type: 'Response', content, timestamp: Date.now() });
//   };

//   // Extract clean text regardless of whether it's wrapped in result or direct string
//   const resData = message.result || message;
//   const responseText = typeof resData === 'string' 
//     ? resData 
//     : (resData.explanation || resData.definition || JSON.stringify(resData, null, 2));

//   return (
//     <div className="flex items-start gap-4 my-6 w-full max-w-4xl mx-auto px-4">
//       {/* AI Icon Avatar */}
//       <div className="p-2.5 rounded-2xl bg-zinc-100 text-zinc-900 shrink-0 border border-zinc-200 shadow-sm">
//         <Zap className="w-5 h-5 text-emerald-600" />
//       </div>

//       {/* Main Content Box with Clean Spacing */}
//       <div className="flex-1 space-y-4">
//         <div className="p-6 rounded-2xl bg-white border border-zinc-200 shadow-sm relative group space-y-3">
          
//           {/* Top Bar with Bookmark Option */}
//           <div className="flex items-center justify-between border-b border-zinc-100 pb-3">
//             <span className="text-[11px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-md bg-zinc-100 text-zinc-700">
//               BUITEMS Academic Output
//             </span>
//             <button 
//               onClick={() => handleBookmarkClick(responseText)}
//               className="text-zinc-400 hover:text-zinc-900 transition-colors p-1"
//               title="Bookmark response"
//             >
//               {isBookmarked ? <Check className="w-4 h-4 text-emerald-600" /> : <Bookmark className="w-4 h-4" />}
//             </button>
//           </div>

//           {/* Clean Formatted Text with Relaxed Line Height and Spacing */}
//           <div className="text-sm md:text-base leading-relaxed text-zinc-800 whitespace-pre-wrap font-sans">
//             {responseText}
//           </div>
//         </div>

//         {/* INLINE FOLLOW-UP Q&A */}
//         <div className="pt-1">
//           {!followUpSubmitted ? (
//             <div className="flex items-center gap-2 bg-zinc-50 border border-zinc-200 p-2 rounded-xl">
//               <CornerDownRight className="w-4 h-4 text-zinc-400 ml-2" />
//               <input 
//                 type="text"
//                 value={followUpInput}
//                 onChange={(e) => setFollowUpInput(e.target.value)}
//                 placeholder="Ask a contextual follow-up on this response..."
//                 className="flex-1 bg-transparent border-none outline-none text-xs md:text-sm py-1.5 px-1 text-zinc-900 placeholder-zinc-400"
//               />
//               <button 
//                 onClick={() => { if(followUpInput.trim()) setFollowUpSubmitted(true); }}
//                 className="px-4 py-1.5 rounded-lg bg-zinc-900 text-white text-xs font-semibold hover:bg-zinc-800 transition-colors"
//               >
//                 Ask AI
//               </button>
//             </div>
//           ) : (
//             <div className="text-xs text-zinc-500 italic px-2">
//               Follow-up query queued: "{followUpInput}"
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }








// 'use client';

// import React, { useState } from 'react';
// import { Bookmark, Check, CornerDownRight, Zap } from 'lucide-react';

// export default function AIResponseCard({ message, onRegenerate, onBookmark }) {
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [followUpInput, setFollowUpInput] = useState('');
//   const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

//   const handleBookmarkClick = (sectionType, content) => {
//     setIsBookmarked(true);
//     if (onBookmark) onBookmark({ type: sectionType, content, timestamp: Date.now() });
//   };

//   // Extract proper fields whether data comes from direct object or string/result wrapper
//   const resData = message.result || message;
//   const definitionText = resData.definition || message.definitions;
//   const formulaText = resData.formula || message.formulas;
//   const explanationText = resData.explanation || message.text || (typeof resData === 'string' ? resData : '');

//   return (
//     <div className="flex items-start gap-4 my-4 w-full">
//       <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
//         <Zap className="w-5 h-5" />
//       </div>

//       <div className="flex-1 space-y-3">
//         {/* DEFINITIONS COMPARTMENT */}
//         {definitionText && (
//           <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative group">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
//                 Key Definition
//               </span>
//               <button 
//                 onClick={() => handleBookmarkClick('Definition', definitionText)}
//                 className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
//               >
//                 {isBookmarked ? <Check className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
//               </button>
//             </div>
//             <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{definitionText}</p>
//           </div>
//         )}

//         {/* FORMULAS COMPARTMENT */}
//         {formulaText && formulaText.trim() !== '' && (
//           <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm relative group font-mono">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 dark:bg-black/10">
//                 Governing Formula
//               </span>
//               <button 
//                 onClick={() => handleBookmarkClick('Formula', formulaText)}
//                 className="opacity-80 hover:opacity-100 transition-opacity"
//               >
//                 <Bookmark className="w-4 h-4" />
//               </button>
//             </div>
//             <div className="text-sm bg-black/20 dark:bg-black/5 p-3 rounded-xl overflow-x-auto">
//               {formulaText}
//             </div>
//           </div>
//         )}

//         {/* CORE EXPLANATION COMPARTMENT */}
//         <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
//           <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
//             Core Explanation & Uses
//           </span>
//           <div className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
//             {explanationText}
//           </div>
//         </div>

//         {/* INLINE FOLLOW-UP Q&A */}
//         <div className="pt-2">
//           {!followUpSubmitted ? (
//             <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl">
//               <CornerDownRight className="w-4 h-4 text-zinc-400 ml-2" />
//               <input 
//                 type="text"
//                 value={followUpInput}
//                 onChange={(e) => setFollowUpInput(e.target.value)}
//                 placeholder="Ask a contextual follow-up on this response..."
//                 className="flex-1 bg-transparent border-none outline-none text-xs py-1 px-1 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
//               />
//               <button 
//                 onClick={() => { if(followUpInput.trim()) setFollowUpSubmitted(true); }}
//                 className="px-3 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
//               >
//                 Ask AI
//               </button>
//             </div>
//           ) : (
//             <div className="text-xs text-zinc-500 italic px-2">
//               Follow-up query queued: "{followUpInput}"
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }















// 'use client';

// import React, { useState } from 'react';
// import { Bookmark, Check, Share2, CornerDownRight, Zap } from 'lucide-react';

// export default function AIResponseCard({ message, onRegenerate, onBookmark }) {
//   const [isBookmarked, setIsBookmarked] = useState(false);
//   const [followUpInput, setFollowUpInput] = useState('');
//   const [followUpSubmitted, setFollowUpSubmitted] = useState(false);

//   const handleBookmarkClick = (sectionType, content) => {
//     setIsBookmarked(true);
//     if (onBookmark) onBookmark({ type: sectionType, content, timestamp: Date.now() });
//   };

//   return (
//     <div className="flex items-start gap-4 my-4 w-full">
//       <div className="p-2.5 rounded-2xl bg-zinc-100 dark:bg-zinc-800 text-zinc-900 dark:text-zinc-100 shrink-0 border border-zinc-200 dark:border-zinc-700 shadow-sm">
//         <Zap className="w-5 h-5" />
//       </div>

//       <div className="flex-1 space-y-3">
//         {/* DEFINITIONS COMPARTMENT */}
//         {message.definitions && (
//           <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm relative group">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
//                 Key Definition
//               </span>
//               <button 
//                 onClick={() => handleBookmarkClick('Definition', message.definitions)}
//                 className="text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-100 transition-colors"
//               >
//                 {isBookmarked ? <Check className="w-4 h-4 text-emerald-500" /> : <Bookmark className="w-4 h-4" />}
//               </button>
//             </div>
//             <p className="text-sm text-zinc-800 dark:text-zinc-200 font-medium">{message.definitions}</p>
//           </div>
//         )}

//         {/* FORMULAS COMPARTMENT */}
//         {message.formulas && (
//           <div className="p-4 rounded-2xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 shadow-sm relative group font-mono">
//             <div className="flex items-center justify-between mb-2">
//               <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-white/10 dark:bg-black/10">
//                 Governing Formula
//               </span>
//               <button 
//                 onClick={() => handleBookmarkClick('Formula', message.formulas)}
//                 className="opacity-80 hover:opacity-100 transition-opacity"
//               >
//                 <Bookmark className="w-4 h-4" />
//               </button>
//             </div>
//             <div className="text-sm bg-black/20 dark:bg-black/5 p-3 rounded-xl overflow-x-auto">
//               {message.formulas}
//             </div>
//           </div>
//         )}

//         {/* CORE EXPLANATION COMPARTMENT */}
//         <div className="p-4 rounded-2xl bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 shadow-sm space-y-2">
//           <span className="text-[11px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300">
//             Core Explanation
//           </span>
//           <div className="text-sm leading-relaxed text-zinc-800 dark:text-zinc-200 whitespace-pre-wrap">
//             {message.text}
//           </div>
//         </div>

//         {/* INLINE FOLLOW-UP Q&A */}
//         <div className="pt-2">
//           {!followUpSubmitted ? (
//             <div className="flex items-center gap-2 bg-zinc-100 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 p-1.5 rounded-xl">
//               <CornerDownRight className="w-4 h-4 text-zinc-400 ml-2" />
//               <input 
//                 type="text"
//                 value={followUpInput}
//                 onChange={(e) => setFollowUpInput(e.target.value)}
//                 placeholder="Ask a contextual follow-up on this response..."
//                 className="flex-1 bg-transparent border-none outline-none text-xs py-1 px-1 text-zinc-900 dark:text-zinc-100 placeholder-zinc-400"
//               />
//               <button 
//                 onClick={() => { if(followUpInput.trim()) setFollowUpSubmitted(true); }}
//                 className="px-3 py-1 rounded-lg bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 text-xs font-semibold"
//               >
//                 Ask AI
//               </button>
//             </div>
//           ) : (
//             <div className="text-xs text-zinc-500 italic px-2">
//               Follow-up query queued: "{followUpInput}"
//             </div>
//           )}
//         </div>
//       </div>
//     </div>
//   );
// }