// findHighlights.js
// Ye file transcript ko Google Gemini (FREE tier) ko bhejti hai,
// aur best "viral moments" ke timestamps mangwati hai

import { GoogleGenerativeAI } from "@google/generative-ai";

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

/**
 * Transcript segments se best highlight clips dhundta hai (Gemini free tier)
 * @param {Array} segments - transcribeAudio() se mila hua data
 * @returns {Array} highlight clips: [{start, end, title, reason}]
 */
export async function findHighlights(segments) {
  const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });

  // Poora transcript ek readable text mein convert karo, timestamps ke saath
  const transcriptText = segments
    .map((s) => `[${s.start.toFixed(1)}s - ${s.end.toFixed(1)}s] ${s.text}`)
    .join("\n");

  const prompt = `Neeche ek video transcript hai, timestamps ke saath.
Is transcript mein se 3-5 best "viral short clip" moments dhundo jo 20-60 second ke ho,
jo apne aap mein complete/samajh aane wale hon (self-contained hooks).

Sirf JSON array format mein jawab do, kuch aur mat likho, koi markdown formatting nahi:
[
  {"start": 12.5, "end": 45.2, "title": "Short catchy title", "reason": "kyun ye achha clip hai"}
]

Transcript:
${transcriptText}`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();

  // Gemini ka jawab JSON string hota hai, use parse karo
  try {
    const cleaned = responseText.replace(/```json|```/g, "").trim();
    return JSON.parse(cleaned);
  } catch (err) {
    console.error("Highlight JSON parse error:", err);
    return [];
  }
}
