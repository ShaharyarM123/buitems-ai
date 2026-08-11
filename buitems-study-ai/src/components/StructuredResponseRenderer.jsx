






//6th edit

import React from 'react';
import { Layers, FileCode, CheckCircle2, Calculator, BookOpen } from 'lucide-react';

export default function StructuredResponseRenderer({ message }) {
  let resData = message.result || message.text;

  try {
    if (typeof resData === 'string' && resData.trim().startsWith('{')) {
      resData = JSON.parse(resData);
    }
  } catch (e) {}

  const isStructuredObject = typeof resData === 'object' && resData !== null;
  const definition = isStructuredObject ? (resData.definition || '') : '';
  
  // Safe extraction for formula to ensure it is always treated as a string
  let formula = isStructuredObject ? resData.formula : '';
  if (typeof formula !== 'string') {
    formula = formula ? String(formula) : '';
  }

  // Safe extraction for explanation (handles both strings, objects, and arrays)
  let rawExplanation = isStructuredObject ? resData.explanation : '';
  let explanationSections = [];

  if (Array.isArray(rawExplanation)) {
    explanationSections = rawExplanation;
  } else if (typeof rawExplanation === 'string') {
    try {
      const parsed = JSON.parse(rawExplanation);
      if (Array.isArray(parsed)) {
        explanationSections = parsed;
      }
    } catch (e) {
      // Agar normal string hui toh yahan handle hogi
    }
  }

  return (
    <div className="flex justify-start w-full my-4">
      <div className="flex items-start gap-4 max-w-[92%] w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-zinc-100 shadow-2xl">
        <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 shrink-0 mt-0.5 border border-zinc-700/50">
          <Layers className="w-5 h-5" />
        </div>
        
        <div className="space-y-4 w-full overflow-hidden">
          {/* Header Bar */}
          <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
            <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 font-bold flex items-center gap-2">
              <FileCode className="w-4 h-4 text-amber-400" /> BUITEMS Structured Academic Output
            </span>
            <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300 font-mono">
              Optimized View
            </span>
          </div>

          {/* Render Structured Sections Cleanly */}
          <div className="space-y-3">
            {/* Definition Section */}
            {definition && (
              <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-200 space-y-1.5 shadow-sm">
                <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
                  <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Key Definition
                </div>
                <p className="leading-relaxed font-sans">{typeof definition === 'string' ? definition : JSON.stringify(definition)}</p>
              </div>
            )}

            {/* Formula Section with Safe String Check */}
            {formula && formula.trim() !== '' && (
              <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 font-mono flex items-start gap-3 shadow-sm">
                <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="space-y-1 w-full">
                  <span className="font-bold uppercase tracking-wide text-amber-400 block">Governing Formula / Key Info</span>
                  <span className="leading-relaxed whitespace-pre-wrap block">{formula}</span>
                </div>
              </div>
            )}

            {/* Explanation / Uses Section */}
            {rawExplanation && (
              <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-xs text-zinc-300 space-y-3 font-sans">
                <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2 mb-2">
                  <BookOpen className="w-3.5 h-3.5 shrink-0" /> Core Explanation & Analysis
                </div>

                {explanationSections.length > 0 ? (
                  <div className="space-y-3">
                    {explanationSections.map((sec, idx) => (
                      <div key={idx} className="bg-zinc-900/70 p-3.5 rounded-xl border border-zinc-800/60 space-y-1.5">
                        {sec.heading && (
                          <h4 className="text-amber-400 font-bold text-sm tracking-wide">{sec.heading}</h4>
                        )}
                        <p className="text-zinc-200 leading-relaxed">{sec.content || sec}</p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-zinc-200 leading-relaxed whitespace-pre-line space-y-2">
                    {typeof rawExplanation === 'string' ? rawExplanation : JSON.stringify(rawExplanation, null, 2)}
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
} 



//5th edit

// import React from 'react';
// import { Layers, FileCode, CheckCircle2, Calculator, BookOpen } from 'lucide-react';

// export default function StructuredResponseRenderer({ message }) {
//   let resData = message.result || message.text;

//   try {
//     if (typeof resData === 'string' && resData.trim().startsWith('{')) {
//       resData = JSON.parse(resData);
//     }
//   } catch (e) {}

//   const isStructuredObject = typeof resData === 'object' && resData !== null;
//   const definition = isStructuredObject ? (resData.definition || '') : '';
//   const formula = isStructuredObject ? (resData.formula || '') : '';
//   const rawExplanation = isStructuredObject ? (resData.explanation || '') : (typeof resData === 'string' ? resData : '');

//   return (
//     <div className="flex justify-start w-full my-4">
//       <div className="flex items-start gap-4 max-w-[92%] w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-zinc-100 shadow-2xl">
//         <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 shrink-0 mt-0.5 border border-zinc-700/50">
//           <Layers className="w-5 h-5" />
//         </div>
        
//         <div className="space-y-4 w-full overflow-hidden">
//           {/* Header Bar */}
//           <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
//             <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 font-bold flex items-center gap-2">
//               <FileCode className="w-4 h-4 text-amber-400" /> BUITEMS Structured Academic Output
//             </span>
//             <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300 font-mono">
//               Optimized View
//             </span>
//           </div>

//           {/* Render Structured Sections Cleanly */}
//           <div className="space-y-3">
//             {/* Definition Section */}
//             {definition && (
//               <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-200 space-y-1.5 shadow-sm">
//                 <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
//                   <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Key Definition
//                 </div>
//                 <p className="leading-relaxed font-sans">{definition}</p>
//               </div>
//             )}

//             {/* Formula Section */}
//           {/* Formula Section with Safe String Check */}
//             {formula && formula.trim() !== '' && (
//               <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 font-mono flex items-start gap-3 shadow-sm">
//                 <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
//                 <div className="space-y-1 w-full">
//                   <span className="font-bold uppercase tracking-wide text-amber-400 block">Governing Formula / Key Info</span>
//                   <span className="leading-relaxed whitespace-pre-wrap block">{formula}</span>
//                 </div>
//               </div>
//             )}

//             {/* Explanation / Uses Section (Clean Paragraph/Text Rendering) */}
//             {rawExplanation && (
//               <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-xs text-zinc-300 space-y-2 font-sans">
//                 <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2 mb-2">
//                   <BookOpen className="w-3.5 h-3.5 shrink-0" /> Core Explanation & Analysis
//                 </div>
//                 <div className="text-zinc-200 leading-relaxed whitespace-pre-line space-y-2">
//                   {rawExplanation}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }













// 4th edit 

// import React from 'react';
// import { Layers, FileCode, CheckCircle2, Calculator, BookOpen } from 'lucide-react';

// export default function StructuredResponseRenderer({ message }) {
//   let resData = message.result || message.text;

//   try {
//     if (typeof resData === 'string' && resData.trim().startsWith('{')) {
//       resData = JSON.parse(resData);
//     }
//   } catch (e) {}

//   const isStructuredObject = typeof resData === 'object' && resData !== null;
//   const definition = isStructuredObject ? (resData.definition || '') : '';
//   const formula = isStructuredObject ? (resData.formula || '') : '';
//   const rawExplanation = isStructuredObject ? (resData.explanation || '') : (typeof resData === 'string' ? resData : '');

//   // Explanation ko clean list items mein split karna
//   let listItems = [];
//   if (rawExplanation) {
//     // Agar text sentences ya bullet markers par mushtamil hai
//     listItems = rawExplanation
//       .split(/(?<=[.!?])\s+|\n-|\n•|\n\d+\.\s+/)
//       .map(item => item.trim())
//       .filter(item => item.length > 2);
//   }


// // Duplicate ya definition se milti julti lines ko filter karne ki behtareen logic
//   const filteredListItems = listItems.filter(item => {
//     if (!definition) return true;
//     const lowerItem = item.toLowerCase();
//     const lowerDef = definition.toLowerCase();
    
//     // Agar pehla point definition ka lamba hissa repeat kar raha ho toh usay hata dein
//     const isRedundant = 
//       lowerItem.includes('is a separate network') || 
//       lowerItem.includes('is a dedicated') ||
//       lowerDef.substring(0, 25) === lowerItem.substring(0, 25);

//     return !isRedundant;
//   });

//   // Agar filtering ke baad sab kuch nikal jaye toh fallback ke tor par original items dikha dein
//   const finalDisplayItems = filteredListItems.length > 0 ? filteredListItems : listItems;

//   return (
//     <div className="flex justify-start w-full my-4">
//       <div className="flex items-start gap-4 max-w-[92%] w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-zinc-100 shadow-2xl">
//         <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 shrink-0 mt-0.5 border border-zinc-700/50">
//           <Layers className="w-5 h-5" />
//         </div>
        
//         <div className="space-y-4 w-full overflow-hidden">
//           {/* Header Bar */}
//           <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
//             <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 font-bold flex items-center gap-2">
//               <FileCode className="w-4 h-4 text-amber-400" /> BUITEMS Structured Academic Output
//             </span>
//             <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300 font-mono">
//               Optimized View
//             </span>
//           </div>

//           {/* Render Structured Sections Cleanly */}
//           <div className="space-y-3">
//             {/* Definition Section (Only Once) */}
//             {definition && (
//               <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-200 space-y-1.5 shadow-sm">
//                 <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
//                   <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Key Definition
//                 </div>
//                 <p className="leading-relaxed font-sans">{definition}</p>
//               </div>
//             )}

//             {/* Formula Section */}
//             {formula && formula.trim() !== '' && (
//               <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 font-mono flex items-start gap-3 shadow-sm">
//                 <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
//                 <div className="space-y-1 w-full">
//                   <span className="font-bold uppercase tracking-wide text-amber-400 block">Governing Formula</span>
//                   <span className="leading-relaxed whitespace-pre-wrap block">{formula}</span>
//                 </div>
//               </div>
//             )}

//             {/* Explanation / Uses Section (Clean Bullet Cards without repetition) */}
//             {rawExplanation && (
//               <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-xs text-zinc-300 space-y-2 font-sans">
//                  <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2 mb-2">
//                   <BookOpen className="w-3.5 h-3.5 shrink-0" /> Core Explanation & Uses
//                 </div>
//                 <div className="space-y-2">
//                   {finalDisplayItems.map((item, idx) => (
//                     <div key={idx} className="flex items-start gap-2.5 bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/60 shadow-sm">
//                       <span className="text-amber-400 font-bold text-sm mt-0.5">•</span>
//                       <p className="leading-relaxed text-zinc-200">{item.replace(/^[-•\d+\.\s]+/, '')}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }




















//======== 3rd edit ============================//

// import React from 'react';
// import { Layers, FileCode, CheckCircle2, Calculator, BookOpen } from 'lucide-react';

// export default function StructuredResponseRenderer({ message }) {
//   let resData = message.result || message.text;

//   try {
//     if (typeof resData === 'string' && resData.trim().startsWith('{')) {
//       resData = JSON.parse(resData);
//     }
//   } catch (e) {}

//   const isStructuredObject = typeof resData === 'object' && resData !== null;
//   const definition = isStructuredObject ? (resData.definition || '') : '';
//   const formula = isStructuredObject ? (resData.formula || '') : '';
//   const explanation = isStructuredObject ? (resData.explanation || '') : (typeof resData === 'string' ? resData : '');

//   // Paragraph ko sentences ya comma-separated items mein tod kar clean list banana
//   let listItems = [];
//   if (explanation) {
//     // Agar text mein "include:" ya similar words hon ya sentences hon toh unhe split karein
//     if (explanation.includes(':')) {
//       const parts = explanation.split(':');
//       const introText = parts[0];
//       const itemsPart = parts.slice(1).join(':');
//       listItems = itemsPart.split(/,|\band\b|\./).map(i => i.trim()).filter(i => i.length > 2);
//       if (listItems.length > 0) {
//         listItems[0] = `${introText}: ${listItems[0]}`;
//       }
//     }
    
//     // Agar list items phir bhi nahi bane toh sentences/full stops par split kar lein
//     if (listItems.length <= 1) {
//       listItems = explanation.split(/(?<=[.!?])\s+/).filter(item => item.trim().length > 0);
//     }
//   }

//   return (
//     <div className="flex justify-start w-full my-4">
//       <div className="flex items-start gap-4 max-w-[92%] w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-zinc-100 shadow-2xl">
//         <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 shrink-0 mt-0.5 border border-zinc-700/50">
//           <Layers className="w-5 h-5" />
//         </div>
        
//         <div className="space-y-4 w-full overflow-hidden">
//           {/* Header Bar */}
//           <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
//             <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 font-bold flex items-center gap-2">
//               <FileCode className="w-4 h-4 text-amber-400" /> BUITEMS Structured Academic Output
//             </span>
//             <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300 font-mono">
//               Optimized View
//             </span>
//           </div>

//           {/* Render Structured Sections Cleanly */}
//           <div className="space-y-3">
//             {/* Definition Section */}
//             {definition && (
//               <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-200 space-y-1.5 shadow-sm">
//                 <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
//                   <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Key Definition
//                 </div>
//                 <p className="leading-relaxed font-sans">{definition}</p>
//               </div>
//             )}

//             {/* Formula Section */}
//             {formula && formula.trim() !== '' && (
//               <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 font-mono flex items-start gap-3 shadow-sm">
//                 <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
//                 <div className="space-y-1 w-full">
//                   <span className="font-bold uppercase tracking-wide text-amber-400 block">Governing Formula</span>
//                   <span className="leading-relaxed whitespace-pre-wrap block">{formula}</span>
//                 </div>
//               </div>
//             )}

//             {/* Explanation / Uses Section (Clean Bullet Cards) */}
//             {explanation && (
//               <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-xs text-zinc-300 space-y-2 font-sans">
//                 <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2 mb-2">
//                   <BookOpen className="w-3.5 h-3.5 shrink-0" /> Core Explanation & Uses
//                 </div>
//                 <div className="space-y-2">
//                   {listItems.map((item, idx) => (
//                     <div key={idx} className="flex items-start gap-2.5 bg-zinc-900/70 p-3 rounded-xl border border-zinc-800/60 shadow-sm">
//                       <span className="text-amber-400 font-bold text-sm mt-0.5">•</span>
//                       <p className="leading-relaxed text-zinc-200">{item.replace(/^[-•\d+\.\s]+/, '')}</p>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }


















// ===============2nd edit============================//

// import React from 'react';
// import { Layers, FileCode, CheckCircle2, Calculator, BookOpen } from 'lucide-react';

// export default function StructuredResponseRenderer({ message }) {
//   let resData = message.result || message.text;

//   // Agar JSON string hai toh usko parse karein
//   try {
//     if (typeof resData === 'string' && resData.trim().startsWith('{')) {
//       resData = JSON.parse(resData);
//     }
//   } catch (e) {
//     // Agar parse na ho toh raw string hi rehne dein
//   }

//   // Agar data object ki shakal mein hai (definition, formula, explanation)
//   const isStructuredObject = typeof resData === 'object' && resData !== null;
//   const definition = isStructuredObject ? (resData.definition || '') : '';
//   const formula = isStructuredObject ? (resData.formula || '') : '';
//   const explanation = isStructuredObject ? (resData.explanation || '') : (typeof resData === 'string' ? resData : '');

//   return (
//     <div className="flex justify-start w-full my-4">
//       <div className="flex items-start gap-4 max-w-[92%] w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-zinc-100 shadow-2xl">
//         <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 shrink-0 mt-0.5 border border-zinc-700/50">
//           <Layers className="w-5 h-5" />
//         </div>
        
//         <div className="space-y-4 w-full overflow-hidden">
//           {/* Header Bar */}
//           <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
//             <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 font-bold flex items-center gap-2">
//               <FileCode className="w-4 h-4 text-amber-400" /> BUITEMS Structured Academic Output
//             </span>
//             <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300 font-mono">
//               Optimized View
//             </span>
//           </div>

//           {/* Render Structured Sections Cleanly */}
//           <div className="space-y-3">
//             {/* Definition Section */}
//             {definition && (
//               <div className="p-4 rounded-xl bg-zinc-950/60 border border-zinc-800/80 text-xs text-zinc-200 space-y-1.5 shadow-sm">
//                 <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
//                   <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> Key Definition
//                 </div>
//                 <p className="leading-relaxed font-sans">{definition}</p>
//               </div>
//             )}

//             {/* Formula Section */}
//             {formula && formula.trim() !== '' && (
//               <div className="p-4 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 font-mono flex items-start gap-3 shadow-sm">
//                 <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
//                 <div className="space-y-1 w-full">
//                   <span className="font-bold uppercase tracking-wide text-amber-400 block">Governing Formula</span>
//                   <span className="leading-relaxed whitespace-pre-wrap block">{formula}</span>
//                 </div>
//               </div>
//             )}

//             {/* Explanation / Uses Section */}
//             {explanation && (
//               <div className="p-4 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-xs text-zinc-300 space-y-1.5 font-sans">
//                 <div className="font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
//                   <BookOpen className="w-3.5 h-3.5 shrink-0" /> Core Explanation & Uses
//                 </div>
//                 <p className="leading-relaxed whitespace-pre-wrap">{explanation}</p>
//               </div>
//             )}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }







//=============1st edit============================//
// import React from 'react';
// import { Layers, FileCode, CheckCircle2, Calculator } from 'lucide-react';

// export default function StructuredResponseRenderer({ message }) {
//   let displayContent = message.text;

//   try {
//     if (typeof displayContent === 'string' && displayContent.startsWith('{')) {
//       const parsed = JSON.parse(displayContent);
//       displayContent = parsed.result || parsed.text || parsed.content || displayContent;
//     }
//   } catch (e) {}

//   const cleanText = typeof displayContent === 'string' 
//     ? displayContent.replace(/\\n/g, '\n') 
//     : JSON.stringify(displayContent);

//   // Split content into blocks first
//   const rawSections = cleanText.split(/\n\s*\n/).filter(Boolean);

//   // Process sections to break inline numbered lists/formulas into individual items
//   const processedItems = [];
//   rawSections.forEach((sec) => {
//     const formattedSec = sec.replace(/\*\*(.*?)\*\*/g, '$1');
    
//     // Check if a single block contains multiple inline numbered items (e.g. "1. ... 2. ... 3. ...")
//     if (/(?:\d+\.\s+[A-Z])/g.test(formattedSec)) {
//       // Split by pattern like " 2. ", " 3. " etc., keeping the number attached
//       const splitFormulas = formattedSec.split(/(?=\d+\.\s+[A-Za-z])/g);
//       splitFormulas.forEach(item => {
//         if (item.trim()) processedItems.push({ type: 'formula', content: item.trim() });
//       });
//     } else {
//       const isHeading = formattedSec.length < 60 && !formattedSec.includes('.') && !formattedSec.includes('=');
//       processedItems.push({ 
//         type: isHeading ? 'heading' : 'paragraph', 
//         content: formattedSec 
//       });
//     }
//   });

//   return (
//     <div className="flex justify-start w-full my-4">
//       <div className="flex items-start gap-4 max-w-[92%] w-full bg-zinc-900 border border-zinc-800/80 rounded-2xl p-6 text-zinc-100 shadow-2xl">
//         <div className="p-2.5 rounded-xl bg-zinc-800 text-amber-400 shrink-0 mt-0.5 border border-zinc-700/50">
//           <Layers className="w-5 h-5" />
//         </div>
        
//         <div className="space-y-4 w-full overflow-hidden">
//           {/* Header Bar */}
//           <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
//             <span className="text-xs font-mono tracking-wider uppercase text-zinc-400 font-bold flex items-center gap-2">
//               <FileCode className="w-4 h-4 text-amber-400" /> BUITEMS Structured Academic Output
//             </span>
//             <span className="text-[10px] bg-zinc-800 border border-zinc-700 px-2.5 py-1 rounded-full text-zinc-300 font-mono">
//               Optimized View
//             </span>
//           </div>

//           {/* Render Items Separately */}
//           <div className="space-y-2.5">
//             {processedItems.map((item, idx) => {
//               if (item.type === 'heading') {
//                 return (
//                   <div key={idx} className="pt-3 text-xs font-bold uppercase tracking-wide text-amber-400 flex items-center gap-2">
//                     <CheckCircle2 className="w-3.5 h-3.5 shrink-0" /> {item.content}
//                   </div>
//                 );
//               }

//               if (item.type === 'formula') {
//                 return (
//                   <div key={idx} className="p-3 rounded-xl bg-zinc-950/80 border border-zinc-800/90 text-xs text-zinc-200 font-mono flex items-start gap-3 shadow-sm">
//                     <Calculator className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
//                     <span className="leading-relaxed whitespace-pre-wrap">{item.content}</span>
//                   </div>
//                 );
//               }

//               return (
//                 <div key={idx} className="p-3.5 rounded-xl bg-zinc-950/40 border border-zinc-800/50 text-xs text-zinc-300 leading-relaxed font-sans">
//                   {item.content}
//                 </div>
//               );
//             })}
//           </div>
//         </div>
//       </div>
//     </div>
//   );
// }