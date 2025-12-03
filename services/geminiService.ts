import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const JSON_SYSTEM_INSTRUCTION = `
You are a specialized JSON assistant. Your task is to output strictly valid JSON based on the user's request. 
Do not include markdown formatting like \`\`\`json ... \`\`\`. 
Return ONLY the raw JSON string.
If the user asks to fix JSON, output the corrected valid JSON.
If the user asks to generate data, generate a rich, nested JSON structure suitable for visualization.
`;

export const generateJsonWithGemini = async (prompt: string): Promise<string> => {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
      config: {
        systemInstruction: JSON_SYSTEM_INSTRUCTION,
        responseMimeType: 'application/json'
      }
    });

    return response.text || '{}';
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
