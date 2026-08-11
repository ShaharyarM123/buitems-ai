//8th edit

import OpenAI from 'openai';

export async function handleAIController(req, res) {
  try {
    // OpenRouter client initialize kar rahe hain OpenAI SDK ke zariye
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
    let systemPrompt = '';
    let userPrompt = prompt;

    if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
      systemPrompt = `You are an expert BUITEMS senior academic professor and university AI study assistant. Answer questions clearly, accurately, and comprehensively using rich Markdown formatting (use headings, bullet points, bold text, and clear paragraphs).`;
    }
    else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
      systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes and expand them into an extensive, detailed, beautifully structured Markdown study guide with key concepts, definitions, formulas, and bullet points.`;
      userPrompt = `Please review, correct, complete, and expand these notes thoroughly:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
    } 
    else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
      systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Provide a thorough, deep analysis and complete breakdown using clean Markdown formatting.`;
      userPrompt = question || prompt;
    }

    let selectedModel = 'meta-llama/llama-3.3-70b-instruct';
    if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
      selectedModel = 'meta-llama/llama-3.2-11b-vision-instruct';
    }

    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 2500,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response generated.';
    
    // Ab yeh direct clean markdown string return karega jese baqi AIs karte hain
    return res.status(200).json({ success: true, result: aiResponse });

  } catch (error) {
    console.error('AI Controller Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
  }
}





//7th edit

// import OpenAI from 'openai';

// export async function handleAIController(req, res) {
//   try {
//     // OpenRouter client initialize kar rahe hain OpenAI SDK ke zariye
//     const openai = new OpenAI({
//       baseURL: "https://openrouter.ai/api/v1",
//       apiKey: process.env.OPENROUTER_API_KEY,
//     });

//     const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
//     let systemPrompt = '';
//     let userPrompt = prompt;

//    if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
//       systemPrompt = `You are an expert BUITEMS senior academic professor. For any topic, provide a rich, detailed study breakdown with clear paragraphs.
//       NEVER return nested objects, arrays, or JSON inside the values. ALL values must be plain text strings with standard line breaks (\n).
//       You MUST output your response strictly as a valid JSON object with these exact keys, with NO extra text or markdown wrapping around the JSON:
//       {
//         "definition": "Provide a precise, formal academic definition as a plain text string...",
//         "formula": "Provide key dates, milestones, or key formulas as a plain text string (leave blank if none)...",
//         "explanation": "Provide a massive, highly detailed explanation containing paragraphs and bullet points formatted purely as a normal text string using standard line breaks. Do not create sub-objects or arrays."
//       }`;
//     }
//     else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
//       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes and provide an extensive, detailed structured JSON response:
//       {
//         "definition": "Key definitions extracted or corrected...",
//         "formula": "Formulas or key dates found...",
//         "explanation": "Extensive, comprehensive study notes with complete explanations..."
//       }`;
//       userPrompt = `Please review, correct, complete, and expand these notes thoroughly:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
//     } 
//     else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
//       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Output strict JSON with deep details:
//       {
//         "definition": "Key terms or definitions...",
//         "formula": "Relevant equations or dates...",
//         "explanation": "Extensive contextual analysis, thorough breakdown, and complete answer..."
//       }`;
//       userPrompt = question || prompt;
//     }

//     // OpenRouter ke compatible model names set kar diye hain
//     let selectedModel = 'meta-llama/llama-3.3-70b-instruct';
//     if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
//       selectedModel = 'meta-llama/llama-3.2-11b-vision-instruct';
//     }

//     const completion = await openai.chat.completions.create({
//       model: selectedModel,
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: userPrompt }
//       ],
//       temperature: 0.3,
//       max_tokens: 2048,
//     });

//     const rawContent = completion.choices[0]?.message?.content || '{}';
    
//     let parsedData;
//     try {
//       let cleaned = rawContent.trim();
//       cleaned = cleaned.replace(/^```json\s*/i, '');
//       cleaned = cleaned.replace(/^```\s*/i, '');
//       cleaned = cleaned.replace(/\s*```$/, '');
      
//       const firstBrace = cleaned.indexOf('{');
//       const lastBrace = cleaned.lastIndexOf('}');
      
//       if (firstBrace !== -1 && lastBrace !== -1) {
//         cleaned = cleaned.substring(firstBrace, lastBrace + 1);
//       }

//       parsedData = JSON.parse(cleaned);
//     } catch (e) {
//       parsedData = {
//         definition: "Overview & Key Subject Breakdown",
//         formula: "Comprehensive Study Guide",
//         explanation: rawContent.replace(/[{}]/g, '')
//       };
//     }
    
//     return res.status(200).json({ success: true, result: parsedData });

//   } catch (error) {
//     console.error('AI Controller Error:', error);
//     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
//   }
// }





//6th edit
// import { Groq } from 'groq-sdk';

// export async function handleAIController(req, res) {
//   try {
//     const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
//     const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
//     let systemPrompt = '';
//     let userPrompt = prompt;

//    if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
//       systemPrompt = `You are an expert BUITEMS senior academic professor. For any topic, provide a rich, detailed study breakdown with clear paragraphs.
//       NEVER return nested objects, arrays, or JSON inside the values. ALL values must be plain text strings with standard line breaks (\n).
//       You MUST output your response strictly as a valid JSON object with these exact keys, with NO extra text or markdown wrapping around the JSON:
//       {
//         "definition": "Provide a precise, formal academic definition as a plain text string...",
//         "formula": "Provide key dates, milestones, or key formulas as a plain text string (leave blank if none)...",
//         "explanation": "Provide a massive, highly detailed explanation containing paragraphs and bullet points formatted purely as a normal text string using standard line breaks. Do not create sub-objects or arrays."
//       }`;
    
//       // userPrompt = prompt || 'Please provide a detailed academic breakdown of the topic.';
//     }
//     else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
//       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes and provide an extensive, detailed structured JSON response:
//       {
//         "definition": "Key definitions extracted or corrected...",
//         "formula": "Formulas or key dates found...",
//         "explanation": "Extensive, comprehensive study notes with complete explanations..."
//       }`;
//       userPrompt = `Please review, correct, complete, and expand these notes thoroughly:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
//     } 
//     else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
//       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Output strict JSON with deep details:
//       {
//         "definition": "Key terms or definitions...",
//         "formula": "Relevant equations or dates...",
//         "explanation": "Extensive contextual analysis, thorough breakdown, and complete answer..."
//       }`;
//       userPrompt = question || prompt;
//     }

//     // Yahan humne default model ko 'llama-3.3-70b-versatile' kar diya hai taaki ChatGPT jaisa detailed aur high-quality jawab aaye
//     let selectedModel = 'llama-3.3-70b-versatile';
//     if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
//       selectedModel = 'llama-3.2-11b-vision-preview';
//     }

//     const completion = await groq.chat.completions.create({
//       model: selectedModel,
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: userPrompt }
//       ],
//       temperature: 0.3,
//       max_tokens: 2048,
//     });

//     const rawContent = completion.choices[0]?.message?.content || '{}';
    
//     let parsedData;
//     try {
//       let cleaned = rawContent.trim();
//       cleaned = cleaned.replace(/^```json\s*/i, '');
//       cleaned = cleaned.replace(/^```\s*/i, '');
//       cleaned = cleaned.replace(/\s*```$/, '');
      
//       const firstBrace = cleaned.indexOf('{');
//       const lastBrace = cleaned.lastIndexOf('}');
      
//       if (firstBrace !== -1 && lastBrace !== -1) {
//         cleaned = cleaned.substring(firstBrace, lastBrace + 1);
//       }

//       parsedData = JSON.parse(cleaned);
//     } catch (e) {
//       parsedData = {
//         definition: "Overview & Key Subject Breakdown",
//         formula: "Comprehensive Study Guide",
//         explanation: rawContent.replace(/[{}]/g, '')
//       };
//     }
    
//     return res.status(200).json({ success: true, result: parsedData });

//   } catch (error) {
//     console.error('AI Controller Error:', error);
//     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
//   }
// }





// //5h edit

// import { Groq } from 'groq-sdk';

// export async function handleAIController(req, res) {
//   try {
//     const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
//     const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
//     let systemPrompt = '';
//     let userPrompt = prompt;

//     if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
//       systemPrompt = `CRITICAL RULE: You are an expert BUITEMS senior academic tutor. Do NOT provide short or one-line summaries. Write extensive, long, and highly detailed academic breakdowns covering architecture, working principles, components, and practical examples.
//       NEVER confuse technical terms with the university name 'BUITEMS'. 
//       You MUST output your response strictly as a valid JSON object with these exact keys, with NO extra text or markdown wrapping around the JSON:
//       {
//         "definition": "Provide a precise, formal academic key definition or core concept...",
//         "formula": "Any relevant mathematical or physical formulas/equations here (or leave blank if none)...",
//         "explanation": "Provide a massive, highly detailed multi-paragraph or multi-point breakdown covering deep operational details, core components, mechanisms, and comprehensive real-world uses. Make it long and informative."
//       }`;
//     }
//     else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
//       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes and provide an extensive, detailed structured JSON response:
//       {
//         "definition": "Key definitions extracted or corrected...",
//         "formula": "Formulas found or completed...",
//         "explanation": "Extensive, comprehensive study notes with complete explanations..."
//       }`;
//       userPrompt = `Please review, correct, complete, and expand these notes thoroughly:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
//     } 
//     else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
//       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Output strict JSON with deep details:
//       {
//         "definition": "Key terms or definitions...",
//         "formula": "Relevant equations or formulas...",
//         "explanation": "Extensive contextual analysis, thorough breakdown, and complete answer..."
//       }`;
//       userPrompt = question || prompt;
//     }

//     // Yahan hum free aur fast model hi use kar rahe hain
//     let selectedModel = 'llama-3.1-8b-instant';
//     if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
//       selectedModel = 'llama-3.2-11b-vision-preview';
//     }

//     const completion = await groq.chat.completions.create({
//       model: selectedModel,
//       messages: [
//         { role: 'system', content: systemPrompt },
//         { role: 'user', content: userPrompt }
//       ],
//       temperature: 0.3,
//       max_tokens: 2048, // Taaki lamba output generate kare
//     });

//     const rawContent = completion.choices[0]?.message?.content || '{}';
    
//     let parsedData;
//     try {
//       const cleanedJSON = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
//       parsedData = JSON.parse(cleanedJSON);
//     } catch (e) {
//       parsedData = {
//         definition: "Key Definition extracted from analysis.",
//         formula: "See explanation below.",
//         explanation: rawContent
//       };
//     }
    
//     return res.status(200).json({ success: true, result: parsedData });

//   } catch (error) {
//     console.error('AI Controller Error:', error);
//     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
//   }
// }







// //4th edit

// // import { Groq } from 'groq-sdk';

// // export async function handleAIController(req, res) {
// //   try {
// //     const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// //     const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
// //     let systemPrompt = '';
// //     let userPrompt = prompt;

// //     if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
// //       systemPrompt = `CRITICAL RULE: You are an expert BUITEMS senior academic professor. Provide an extensive, highly detailed, and deep comprehensive study breakdown for university students. Do NOT give short summaries; write rich, long, and thorough explanations with complete architectural details, working principles, components, and real-world scenarios.
// //       NEVER confuse technical or academic terms with the university name 'BUITEMS'. 
// //       You MUST output your response strictly as a valid JSON object with these exact keys, with NO extra text or markdown wrapping around the JSON:
// //       {
// //         "definition": "Provide a precise, formal academic key definition or core concept here...",
// //         "formula": "Any relevant mathematical or physical formulas/equations here (or leave blank if none)...",
// //         "explanation": "Provide a massive, highly detailed multi-paragraph or multi-point breakdown covering architecture, deep operational details, core components, mechanisms, and comprehensive real-world uses. Make it long, rich, and deeply informative just like advanced AI models."
// //       }`;
// //     }
// //     else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
// //       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes and provide an extensive, highly detailed structured JSON response:
// //       {
// //         "definition": "Key definitions extracted or corrected...",
// //         "formula": "Formulas found or completed...",
// //         "explanation": "Extensive, comprehensive, and deeply detailed study notes with complete explanations..."
// //       }`;
// //       userPrompt = `Please review, correct, complete, and expand these notes thoroughly:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
// //     } 
// //     else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
// //       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Output strict JSON with deep details:
// //       {
// //         "definition": "Key terms or definitions...",
// //         "formula": "Relevant equations or formulas...",
// //         "explanation": "Extensive contextual analysis, thorough breakdown, and complete answer to the user's question..."
// //       }`;
// //       userPrompt = question || prompt;
// //     }

// //     // Yahan humne 70b versatile model default kar diya hai taaki hamesha long aur detailed output aaye
// //     let selectedModel = 'llama-3.3-70b-versatile';
// //     if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
// //       selectedModel = 'llama-3.2-11b-vision-preview';
// //     }

// //     const completion = await groq.chat.completions.create({
// //       model: selectedModel,
// //       messages: [
// //         { role: 'system', content: systemPrompt },
// //         { role: 'user', content: userPrompt }
// //       ],
// //       temperature: 0.4,
// //       max_tokens: 2048, // Taaki lamba aur detailed response cut na ho
// //     });

// //     const rawContent = completion.choices[0]?.message?.content || '{}';
    
// //     let parsedData;
// //     try {
// //       const cleanedJSON = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
// //       parsedData = JSON.parse(cleanedJSON);
// //     } catch (e) {
// //       parsedData = {
// //         definition: "Key Definition extracted from analysis.",
// //         formula: "See explanation below.",
// //         explanation: rawContent
// //       };
// //     }
    
// //     return res.status(200).json({ success: true, result: parsedData });

// //   } catch (error) {
// //     console.error('AI Controller Error:', error);
// //     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
// //   }
// // }







// //3rd edit

// // import { Groq } from 'groq-sdk';

// // export async function handleAIController(req, res) {
// //   try {
// //     const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// //     const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
// //     let systemPrompt = '';
// //     let userPrompt = prompt;

// //     if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
// //       systemPrompt = `CRITICAL RULE: You are an expert BUITEMS academic tutor. Answer the specific subject, protocol, or term requested with comprehensive detail, depth, and clarity tailored for university exams. 
// //       NEVER confuse technical or academic terms with the university name 'BUITEMS'. 
// //       You MUST output your response strictly as a valid JSON object with these exact keys, with NO extra text or markdown wrapping around the JSON:
// //       {
// //         "definition": "Provide a clear, precise, and standalone key definition or core concept here...",
// //         "formula": "Any relevant mathematical or physical formulas/equations here (or leave blank if none)...",
// //         "explanation": "Provide a rich, highly detailed, multi-layered explanation including core architecture, working mechanisms, real-world scenarios, and specific use-cases/places. Do NOT repeat the exact definition sentence verbatim, but expand heavily on everything related to it."
// //       }`;
// //     }
    
// //     else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
// //       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes, correct mistakes, and structure them into strict JSON:
// //       {
// //         "definition": "Key definitions extracted or corrected...",
// //         "formula": "Formulas found or completed...",
// //         "explanation": "Expanded, comprehensive study notes with corrected mistakes highlighted, avoiding any duplication of the definition..."
// //       }`;
// //       userPrompt = `Please review, correct, complete, and expand these notes:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
// //     } 
// //     else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
// //       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Output strict JSON:
// //       {
// //         "definition": "Key terms or definitions...",
// //         "formula": "Relevant equations or formulas...",
// //         "explanation": "Contextual analysis and answer to the user's question, keeping explanation strictly separate from the definition..."
// //       }`;
// //       userPrompt = question || prompt;
// //     }

// //     let selectedModel = 'llama-3.1-8b-instant';
// //     if (mode === 'think') {
// //       selectedModel = 'llama-3.3-70b-versatile';
// //     } else if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
// //       selectedModel = 'llama-3.2-11b-vision-preview';
// //     }

// //     const completion = await groq.chat.completions.create({
// //       model: selectedModel,
// //       messages: [
// //         { role: 'system', content: systemPrompt },
// //         { role: 'user', content: userPrompt }
// //       ],
// //       temperature: 0.2,
// //     });

// //     const rawContent = completion.choices[0]?.message?.content || '{}';
    
// //     let parsedData;
// //     try {
// //       const cleanedJSON = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
// //       parsedData = JSON.parse(cleanedJSON);
// //     } catch (e) {
// //       parsedData = {
// //         definition: "Key Definition extracted from analysis.",
// //         formula: "See explanation below.",
// //         explanation: rawContent
// //       };
// //     }
    
// //     return res.status(200).json({ success: true, result: parsedData });

// //   } catch (error) {
// //     console.error('AI Controller Error:', error);
// //     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
// //   }
// // }



// //2nd edit

// // import { Groq } from 'groq-sdk';

// // export async function handleAIController(req, res) {
// //   try {
// //     const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// //     const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
// //     let systemPrompt = '';
// //     let userPrompt = prompt;

// //     if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
// //       systemPrompt = `CRITICAL RULE: You are an expert BUITEMS academic tutor. Answer ONLY the specific subject, protocol, or term requested in the user's prompt right now with absolute focus. 
// //       NEVER confuse technical or academic terms with the university name 'BUITEMS'. 
// //       You MUST output your response strictly as a valid JSON object with these exact keys, with NO extra text or markdown wrapping around the JSON:
// //       {
// //         "definition": "The precise key definition or core concept here...",
// //         "formula": "Any relevant mathematical or physical formulas/equations here (or leave blank if none)...",
// //         "explanation": "Detailed step-by-step core explanation, breakdown, and examples here..."
// //       }`;
// //     }
// //     else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
// //       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes, correct mistakes, and structure them into strict JSON:
// //       {
// //         "definition": "Key definitions extracted or corrected...",
// //         "formula": "Formulas found or completed...",
// //         "explanation": "Expanded, comprehensive study notes with corrected mistakes highlighted..."
// //       }`;
// //       userPrompt = `Please review, correct, complete, and expand these notes:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
// //     } 
// //     else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
// //       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Output strict JSON:
// //       {
// //         "definition": "Key terms or definitions...",
// //         "formula": "Relevant equations or formulas...",
// //         "explanation": "Contextual analysis and answer to the user's question..."
// //       }`;
// //       userPrompt = question || prompt;
// //     }

// //     let selectedModel = 'llama-3.1-8b-instant';
// //     if (mode === 'think') {
// //       selectedModel = 'llama-3.3-70b-versatile';
// //     } else if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
// //       selectedModel = 'llama-3.2-11b-vision-preview';
// //     }

// //     const completion = await groq.chat.completions.create({
// //       model: selectedModel,
// //       messages: [
// //         { role: 'system', content: systemPrompt },
// //         { role: 'user', content: userPrompt }
// //       ],
// //       temperature: 0.2,
// //     });

// //     const rawContent = completion.choices[0]?.message?.content || '{}';
    
// //     let parsedData;
// //     try {
// //       const cleanedJSON = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
// //       parsedData = JSON.parse(cleanedJSON);
// //     } catch (e) {
// //       parsedData = {
// //         definition: "Key Definition extracted from analysis.",
// //         formula: "See explanation below.",
// //         explanation: rawContent
// //       };
// //     }
    
// //     return res.status(200).json({ success: true, result: parsedData });

// //   } catch (error) {
// //     console.error('AI Controller Error:', error);
// //     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
// //   }
// // }







































// //1st edit


// // import { Groq } from 'groq-sdk';

// // export async function handleAIController(req, res) {
// //   try {
// //     const //groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
// //     const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages } = req.body;
    
// //     let systemPrompt = '';
// //     let userPrompt = '';

// //     if (req.path.includes('/ask-anything')) {
// //       systemPrompt = `CRITICAL RULE: You are an expert BUITEMS academic tutor. Answer ONLY the specific subject or question requested. 
// //       You MUST output your response strictly as a valid JSON object with these exact keys, with NO extra text or markdown wrapping around the JSON:
// //       {
// //         "definition": "The precise key definition or core concept here...",
// //         "formula": "Any relevant mathematical or physical formulas/equations here (or leave blank if none)...",
// //         "explanation": "Detailed step-by-step core explanation, breakdown, and examples here..."
// //       }`;
// //       userPrompt = prompt;
// //     }
// //     else if (req.path.includes('/expand-notes')) {
// //       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes, correct mistakes, and structure them into strict JSON:
// //       {
// //         "definition": "Key definitions extracted or corrected...",
// //         "formula": "Formulas found or completed...",
// //         "explanation": "Expanded, comprehensive study notes with corrected mistakes highlighted..."
// //       }`;
// //       userPrompt = `Please review, correct, complete, and expand these notes:\n${rawNotes || 'Please analyze the attached notes/images.'}`;
// //     } 
// //     else if (req.path.includes('/pdf-analysis')) {
// //       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Output strict JSON:
// //       {
// //         "definition": "Key terms or definitions...",
// //         "formula": "Relevant equations or formulas...",
// //         "explanation": "Contextual analysis and answer to the user's question..."
// //       }`;
// //       userPrompt = question;
// //     }

// //     let selectedModel = 'llama-3.1-8b-instant';
// //     if (mode === 'think') {
// //       selectedModel = 'llama-3.3-70b-versatile';
// //     } else if (req.path.includes('/expand-notes') && hasImages) {
// //       selectedModel = 'llama-3.2-11b-vision-preview';
// //     }

// //     const completion = await groq.chat.completions.create({
// //       model: selectedModel,
// //       messages: [
// //         { role: 'system', content: systemPrompt },
// //         { role: 'user', content: userPrompt }
// //       ],
// //       temperature: 0.3,
// //     });

// //     const rawContent = completion.choices[0]?.message?.content || '{}';
    
// //     let parsedData;
// //     try {
// //       const cleanedJSON = rawContent.replace(/```json/g, '').replace(/```/g, '').trim();
// //       parsedData = JSON.parse(cleanedJSON);
// //     } catch (e) {
// //       parsedData = {
// //         definition: "Key Definition extracted from analysis.",
// //         formula: "See explanation below.",
// //         explanation: rawContent
// //       };
// //     }
    
// //     // Send as a clean JSON object, NOT a stringified result
// //     return res.status(200).json({ success: true, result: parsedData });

// //   } catch (error) {
// //     console.error('AI Controller Error:', error);
// //     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
// //   }
// // }