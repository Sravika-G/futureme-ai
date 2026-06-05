const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

// Load environment variables
dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());

// Serve static frontend files
app.use(express.static(path.join(__dirname, '../frontend')));

// Initialize Gemini API client
const apiKey = process.env.GEMINI_API_KEY;
let genAI = null;

if (apiKey && apiKey !== 'your_api_key_here' && apiKey !== 'replace_with_your_gemini_api_key') {
  genAI = new GoogleGenerativeAI(apiKey);
} else {
  console.warn('WARNING: GEMINI_API_KEY is not set or is using a placeholder. Gemini requests will fail until a valid key is set in backend/.env');
}

// Helper to clean markdown JSON wrappers and extract balanced curly brace blocks
function cleanJsonString(str) {
  let cleaned = str.trim();
  // Remove markdown code block symbols if present
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```json\s*/i, '');
    cleaned = cleaned.replace(/^```\s*/, '');
    cleaned = cleaned.replace(/```$/, '');
  }
  cleaned = cleaned.trim();

  // Extract first balanced JSON block to handle extra trailing braces or text
  const start = cleaned.indexOf('{');
  if (start !== -1) {
    let depth = 0;
    for (let i = start; i < cleaned.length; i++) {
      if (cleaned[i] === '{') {
        depth++;
      } else if (cleaned[i] === '}') {
        depth--;
        if (depth === 0) {
          return cleaned.substring(start, i + 1);
        }
      }
    }
  }
  return cleaned;
}

/**
 * Route: POST /api/generate-futureme
 * Body: { name, age, goal, struggle, oneYearVision, tone }
 */
app.post('/api/generate-futureme', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env'
      });
    }

    const { name, age, goal, struggle, oneYearVision, tone } = req.body;

    // Validate inputs
    if (!name || !age || !goal || !struggle || !oneYearVision || !tone) {
      return res.status(400).json({
        success: false,
        error: 'Missing required profile fields. Please complete all parameters.'
      });
    }

    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    // Define tone behavior specifications
    let toneDescription = '';
    switch (tone.toLowerCase()) {
      case 'motivational':
        toneDescription = 'Warm, inspiring, supportive, encouraging, focusing on potentials and emotional lift.';
        break;
      case 'brutally honest':
        toneDescription = 'Direct, sharp, no excuses, confronting self-sabotaging patterns, highly realistic and challenging.';
        break;
      case 'calm mentor':
        toneDescription = 'Peaceful, wise, grounded, patient, providing long-term perspective and calm clarity.';
        break;
      case 'ceo mode':
        toneDescription = 'Strategic, focused, execution-heavy, treating life like an enterprise, optimizing systems and action items.';
        break;
      default:
        toneDescription = 'Personal, emotionally intelligent, clear, and action-oriented.';
    }

    const prompt = `You are FutureMe, the future successful version of the user who has overcome struggles and reached their vision. You are not a generic motivational coach. You speak with emotional intelligence, clarity, and deep personal understanding. Your job is to help the current version of the user see who they are becoming, what they must change, and what they should do next.

Write as if you are the user's future self speaking directly to their current self.

Tone specification selected by user: ${tone} (${toneDescription})

User details:
Name: ${name}
Age: ${age}
Goal: ${goal}
Current struggle: ${struggle}
One-year vision: ${oneYearVision}

Return ONLY a valid JSON object in this exact format. Do not include markdown code block markers or any trailing text:
{
  "message": "A powerful, personalized 120-180 word message from the future self matching the tone specification.",
  "futureIdentity": "A concise description (3-6 words) of who the user is becoming, e.g., 'Disciplined Global Founder' or 'Consistent Mindful Engineer'.",
  "nextMoves": [
    "Specific actionable next step 1",
    "Specific actionable next step 2",
    "Specific actionable next step 3"
  ],
  "habit": "One small, specific daily habit they should start today, phrased in an actionable way.",
  "warning": "One mistake or distraction loop their future self warns them about.",
  "mantra": "A short, memorable, inspiring line they can repeat daily."
}`;

    const result = await model.generateContent({
      contents: [{ role: 'user', parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: 'application/json',
        responseSchema: {
          type: "object",
          properties: {
            message: { type: "string" },
            futureIdentity: { type: "string" },
            nextMoves: {
              type: "array",
              items: { type: "string" }
            },
            habit: { type: "string" },
            warning: { type: "string" },
            mantra: { type: "string" }
          },
          required: ["message", "futureIdentity", "nextMoves", "habit", "warning", "mantra"]
        }
      }
    });

    const rawResponse = result.response.text();
    const cleanedResponse = cleanJsonString(rawResponse);
    
    let responseData;
    try {
      responseData = JSON.parse(cleanedResponse);
    } catch (parseErr) {
      console.error('Failed to parse Gemini output as JSON. Raw output:', rawResponse);
      return res.status(500).json({
        success: false,
        error: 'FutureMe output format parsing error. Please try again.'
      });
    }

    res.json({
      success: true,
      data: responseData
    });

  } catch (error) {
    console.error('Error generating FutureMe blueprint:', error);
    res.status(500).json({
      success: false,
      error: 'FutureMe could not respond right now. Try again.'
    });
  }
});

/**
 * Route: POST /api/chat-futureme
 * Body: { userProfile: { name, age, goal, struggle, oneYearVision, tone }, chatHistory: [{ role, message }], question }
 */
app.post('/api/chat-futureme', async (req, res) => {
  try {
    if (!genAI) {
      return res.status(500).json({
        success: false,
        error: 'Gemini API key is not configured. Please add GEMINI_API_KEY to backend/.env'
      });
    }

    const { userProfile, chatHistory, question } = req.body;

    if (!userProfile || !question) {
      return res.status(400).json({
        success: false,
        error: 'Missing profile parameters or question.'
      });
    }

    const { name, age, goal, struggle, oneYearVision, tone } = userProfile;
    const model = genAI.getGenerativeModel({ model: 'gemini-3.5-flash' });

    // Format chat history
    let historyStr = '';
    if (chatHistory && chatHistory.length > 0) {
      historyStr = chatHistory.map(chat => {
        const roleName = chat.role === 'user' ? name : 'FutureMe';
        return `${roleName}: ${chat.message}`;
      }).join('\n');
    } else {
      historyStr = 'No previous messages.';
    }

    // Determine tone description
    let toneDescription = '';
    if (tone) {
      switch (tone.toLowerCase()) {
        case 'motivational':
          toneDescription = 'Warm, inspiring, supportive, encouraging, focusing on potentials and emotional lift.';
          break;
        case 'brutally honest':
          toneDescription = 'Direct, sharp, no excuses, confronting self-sabotaging patterns, highly realistic and challenging.';
          break;
        case 'calm mentor':
          toneDescription = 'Peaceful, wise, grounded, patient, providing long-term perspective and calm clarity.';
          break;
        case 'ceo mode':
          toneDescription = 'Strategic, focused, execution-heavy, treating life like an enterprise, optimizing systems and action items.';
          break;
      }
    }

    const prompt = `You are FutureMe, the future version of the user who already achieved their one-year vision of "${oneYearVision}". Reply directly to the user’s question. Be personal, sharp, honest, and useful. Do not sound like a normal AI assistant. Do not mention that you are Gemini, an AI model, or a language model. Speak like the future self who is already there.

User Profile:
Name: ${name}
Age: ${age}
Goal: ${goal}
Struggle: ${struggle}
One-year vision: ${oneYearVision}
Tone: ${tone} (${toneDescription})

Recent Chat History:
${historyStr}

Current Question from Current Self (${name}):
${question}

Requirements for Reply:
1. Reply in 2-5 short paragraphs.
2. Give at least one clear, pragmatic action.
3. Align strictly with the tone selected: "${tone}". Do not break character. Do not be overly polite or generic. Speak with authority and love.`;

    const result = await model.generateContent(prompt);
    const replyText = result.response.text();

    res.json({
      success: true,
      reply: replyText.trim()
    });

  } catch (error) {
    console.error('Error in chat-futureme:', error);
    res.status(500).json({
      success: false,
      error: 'FutureMe could not respond right now. Try again.'
    });
  }
});

// Fallback all other requests to index.html
app.get('*', (req, res) => {
  res.sendFile(path.join(__dirname, '../frontend/index.html'));
});

app.listen(PORT, () => {
  console.log(`FutureMe server successfully running on http://localhost:${PORT}`);
});
