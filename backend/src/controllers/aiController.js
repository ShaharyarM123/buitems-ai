import OpenAI from 'openai';
import Chat from '../models/Chat.js'; // MongoDB Chat Schema Import

// 1. Main AI Response Generation + Save to MongoDB
export async function handleAIController(req, res) {
  try {
    const openai = new OpenAI({
      baseURL: "https://openrouter.ai/api/v1",
      apiKey: process.env.OPENROUTER_API_KEY,
    });

    const { endpoint, prompt, rawNotes, question, mode, fileName, hasImages, chatId } = req.body;
    const userId = req.user?.id; // authMiddleware se mili hui Authenticated User ID

    if (!userId) {
      return res.status(401).json({ success: false, error: 'User not authenticated.' });
    }

    // Prompts Setup
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
    } else {
      systemPrompt = `You are an expert BUITEMS senior academic professor and university AI study assistant.`;
    }

    // 2. Existing Chat Session Check ya Nayi Chat Session Banayein
    let chat;
    if (chatId) {
      chat = await Chat.findOne({ _id: chatId, userId });
    }

    if (!chat) {
      chat = new Chat({
        userId,
        title: (userPrompt || 'New Chat').slice(0, 30) + '...', // First prompt se Title generate hoga
        messages: []
      });
    }

    // Purani chat history load karke LLM memory context ke liye prepare karein
    const historyMessages = chat.messages.map(msg => ({
      role: msg.role,
      content: msg.content
    }));

    // Selected Model
    let selectedModel = 'meta-llama/llama-3.3-70b-instruct';
    if ((req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) && hasImages) {
      selectedModel = 'meta-llama/llama-3.2-11b-vision-instruct';
    }

    // OpenRouter API Call (System Prompt + Past History + Current Prompt)
    const completion = await openai.chat.completions.create({
      model: selectedModel,
      messages: [
        { role: 'system', content: systemPrompt },
        ...historyMessages, // Purani conversation AI context me pass hogi
        { role: 'user', content: userPrompt }
      ],
      temperature: 0.4,
      max_tokens: 2500,
    });

    const aiResponse = completion.choices[0]?.message?.content || 'No response generated.';

    // 3. User Message aur AI Response Database me Push Karein
    chat.messages.push({ role: 'user', content: userPrompt });
    chat.messages.push({ role: 'assistant', content: aiResponse });

    await chat.save();

    // Clean Markdown Response + Session details return hongi
    return res.status(200).json({ 
      success: true, 
      result: aiResponse,
      chatId: chat._id,
      title: chat.title,
      messages: chat.messages
    });

  } catch (error) {
    console.error('AI Controller Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
  }
}

// -------------------------------------------------------------
// HISTORY & SIDEBAR CONTROLLERS
// -------------------------------------------------------------

// 2. Left Sidebar ke liye Logged-in User ki Saari Chats ki List Fetch Karna
export async function getUserChatHistory(req, res) {
  try {
    const userId = req.user.id;
    const chats = await Chat.find({ userId })
      .select('_id title createdAt')
      .sort({ updatedAt: -1 });

    return res.status(200).json({ success: true, chats });
  } catch (error) {
    console.error('Get History Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch chat history.' });
  }
}

// 3. Left Sidebar se Kisi Chat par Click karne par Uske Message Load Karna
export async function getSingleChatMessages(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    const chat = await Chat.findOne({ _id: chatId, userId });
    if (!chat) {
      return res.status(404).json({ success: false, error: 'Chat session not found.' });
    }

    return res.status(200).json({ success: true, messages: chat.messages });
  } catch (error) {
    console.error('Get Single Chat Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to fetch conversation.' });
  }
}

// 4. Chat Delete Karna
export async function deleteChat(req, res) {
  try {
    const { chatId } = req.params;
    const userId = req.user.id;

    await Chat.findOneAndDelete({ _id: chatId, userId });
    return res.status(200).json({ success: true, message: 'Chat deleted successfully.' });
  } catch (error) {
    console.error('Delete Chat Error:', error);
    return res.status(500).json({ success: false, error: 'Failed to delete chat.' });
  }
}








//8th edit

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

//     if (req.path.includes('/ask-anything') || (endpoint && endpoint.includes('/ask-anything'))) {
//       systemPrompt = `You are an expert BUITEMS senior academic professor and university AI study assistant. Answer questions clearly, accurately, and comprehensively using rich Markdown formatting (use headings, bullet points, bold text, and clear paragraphs).`;
//     }
//     else if (req.path.includes('/expand-notes') || (endpoint && endpoint.includes('/expand-notes'))) {
//       systemPrompt = `You are an expert BUITEMS academic study assistant. Review rough notes and expand them into an extensive, detailed, beautifully structured Markdown study guide with key concepts, definitions, formulas, and bullet points.`;
//       userPrompt = `Please review, correct, complete, and expand these notes thoroughly:\n${rawNotes || prompt || 'Please analyze the attached notes/images.'}`;
//     } 
//     else if (req.path.includes('/pdf-analysis') || (endpoint && endpoint.includes('/pdf-analysis'))) {
//       systemPrompt = `You are a document analysis assistant reviewing: ${fileName || 'Document'}. Provide a thorough, deep analysis and complete breakdown using clean Markdown formatting.`;
//       userPrompt = question || prompt;
//     }

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
//       temperature: 0.4,
//       max_tokens: 2500,
//     });

//     const aiResponse = completion.choices[0]?.message?.content || 'No response generated.';
    
//     // Ab yeh direct clean markdown string return karega jese baqi AIs karte hain
//     return res.status(200).json({ success: true, result: aiResponse });

//   } catch (error) {
//     console.error('AI Controller Error:', error);
//     return res.status(500).json({ success: false, error: 'Failed to process AI generation request.' });
//   }
// }





