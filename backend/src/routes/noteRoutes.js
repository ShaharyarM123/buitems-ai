  //2nd edit

  import express from 'express';
import OpenAI from 'openai';

const router = express.Router();

// Helper function to lazily initialize OpenRouter client
const getOpenAIClient = () => {
  const apiKey = process.env.OPENROUTER_API_KEY;
  if (!apiKey) {
    throw new Error('OPENROUTER_API_KEY is missing from environment variables.');
  }
  return new OpenAI({
    baseURL: "https://openrouter.ai/api/v1",
    apiKey,
  });
};

// 1. Note Expander Route (OpenRouter Llama 3)
router.post('/generate', async (req, res) => {
  try {
    const { text } = req.body;
    if (!text) {
      return res.status(400).json({ message: 'Please provide note text.' });
    }

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert academic tutor. Expand rough study notes into detailed, well-structured Markdown study guides with key concepts and bullet points.',
        },
        { role: 'user', content: text },
      ],
      model: 'meta-llama/llama-3.3-70b-instruct',
    });

    return res.status(200).json({ result: completion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('OpenRouter Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to generate notes with OpenRouter.' });
  }
});

// 2. Ask Anything Route (OpenRouter Llama 3)
router.post('/ask', async (req, res) => {
  try {
    const { question } = req.body;
    if (!question) {
      return res.status(400).json({ message: 'Question is required.' });
    }

    const openai = getOpenAIClient();

    const completion = await openai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a helpful university AI study assistant. Answer questions clearly, accurately, and concisely using Markdown formatting.',
        },
        { role: 'user', content: question },
      ],
      model: 'meta-llama/llama-3.3-70b-instruct',
    });

    return res.status(200).json({ result: completion.choices[0]?.message?.content || '' });
  } catch (error) {
    console.error('OpenRouter Error:', error);
    return res.status(500).json({ message: error.message || 'Failed to answer question with OpenRouter.' });
  }
});

export default router;
  
  
  
  
  
  
  // import express from 'express';
  // import Groq from 'groq-sdk';

  // const router = express.Router();

  // // Helper function to lazily initialize Groq
  // const getGroqClient = () => {
  //   const apiKey = process.env.GROQ_API_KEY;
  //   if (!apiKey) {
  //     throw new Error('GROQ_API_KEY is missing from environment variables.');
  //   }
  //   return new Groq({ apiKey });
  // };

  // // 1. Note Expander Route (Groq Llama 3)
  // router.post('/generate', async (req, res) => {
  //   try {
  //     const { text } = req.body;
  //     if (!text) {
  //       return res.status(400).json({ message: 'Please provide note text.' });
  //     }

  //     const groq = getGroqClient();

  //     const completion = await groq.chat.completions.create({
  //       messages: [
  //         {
  //           role: 'system',
  //           content: 'You are an expert academic tutor. Expand rough study notes into detailed, well-structured Markdown study guides with key concepts and bullet points.',
  //         },
  //         { role: 'user', content: text },
  //       ],
  //       model: 'llama-3.3-70b-versatile',
  //     });

  //     return res.status(200).json({ result: completion.choices[0]?.message?.content || '' });
  //   } catch (error) {
  //     console.error('Groq Error:', error);
  //     return res.status(500).json({ message: error.message || 'Failed to generate notes with Groq.' });
  //   }
  // });

  // // 2. Ask Anything Route (Groq Llama 3)
  // router.post('/ask', async (req, res) => {
  //   try {
  //     const { question } = req.body;
  //     if (!question) {
  //       return res.status(400).json({ message: 'Question is required.' });
  //     }

  //     const groq = getGroqClient();

  //     const completion = await groq.chat.completions.create({
  //       messages: [
  //         {
  //           role: 'system',
  //           content: 'You are a helpful university AI study assistant. Answer questions clearly, accurately, and concisely using Markdown formatting.',
  //         },
  //         { role: 'user', content: question },
  //       ],
  //       model: 'llama-3.3-70b-versatile',
  //     });

  //     return res.status(200).json({ result: completion.choices[0]?.message?.content || '' });
  //   } catch (error) {
  //     console.error('Groq Error:', error);
  //     return res.status(500).json({ message: error.message || 'Failed to answer question with Groq.' });
  //   }
  // });

  // export default router;