const { GoogleGenerativeAI } = require("@google/generative-ai");
const dotenv = require("dotenv");
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(apiKey);

async function main() {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-3.5-flash" });
    
    const prompt = "Generate a profile for a software engineer Sravika, age 23, tone Brutally Honest.";
    
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
    
    console.log("Success! Output:", result.response.text());
  } catch (err) {
    console.error("Failed to generate content:", err);
  }
}

main();
