import { GoogleGenerativeAI } from '@google/generative-ai';
import { env } from '../config/env';
import { SmartArchitecturalParser } from './SmartArchitecturalParser';

// Schema for structured output matching our domain intent
const intentResponseSchema = {
  type: "OBJECT",
  properties: {
    plotWidth: { type: "INTEGER", description: "Plot width in mm" },
    plotDepth: { type: "INTEGER", description: "Plot depth in mm" },
    rooms: {
      type: "ARRAY",
      items: {
        type: "OBJECT",
        properties: {
          type: { type: "STRING", description: "Type of room (e.g. Bedroom, Kitchen, LivingRoom, Bathroom, DiningRoom, Pooja, Study, Balcony)" },
          area: { type: "INTEGER", description: "Target area in square mm" }
        },
        required: ["type", "area"]
      }
    },
    preferences: {
      type: "OBJECT",
      properties: {
        vastu: { type: "BOOLEAN", description: "Whether Vastu rules apply" }
      },
      required: ["vastu"]
    }
  },
  required: ["plotWidth", "plotDepth", "rooms", "preferences"]
};

export class AIService {
  private ai: GoogleGenerativeAI;

  constructor() {
    this.ai = new GoogleGenerativeAI(env.GEMINI_API_KEY);
  }

  public async extractIntent(prompt: string) {
    // 1. Try Gemini API if key is configured
    if (env.GEMINI_API_KEY && env.GEMINI_API_KEY.length > 5 && !env.GEMINI_API_KEY.includes('dummy')) {
      try {
        const systemInstruction = `You are a professional architectural planning assistant. 
Extract the user's design requirements into a structured JSON payload.
For large houses (e.g., 4 BHK, 5 BHK, 6 BHK, villas, big houses), include all required bedrooms, bathrooms (at least 3-5), living hall, kitchen, dining room, and any requested specialty rooms like pooja room, study, or balconies.
Assume standard room sizes in mm² (e.g., Master Bedroom: 20000000 sq mm, Bedroom: 15000000 sq mm, Living: 35000000 sq mm, Kitchen: 14000000 sq mm, Bath: 5000000 sq mm).
Convert all dimensions to millimetres. Provide realistic plot dimensions scaled to the house size.`;

        const model = this.ai.getGenerativeModel({
          model: 'gemini-1.5-flash',
          systemInstruction,
          generationConfig: {
            responseMimeType: 'application/json',
            responseSchema: intentResponseSchema as any,
          }
        });

        // Set a 3.5-second timeout for snappy user experience
        const timeoutPromise = new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI Request Timeout')), 3500)
        );

        const responsePromise = model.generateContent(prompt);
        const result: any = await Promise.race([responsePromise, timeoutPromise]);
        
        const text = result?.response?.text();
        if (text) {
          const parsed = JSON.parse(text);
          if (parsed.rooms && parsed.rooms.length > 0) {
            return parsed;
          }
        }
      } catch (e: any) {
        console.warn("AI Cloud API bypassed/rate-limited. Engaging Smart Architectural Parser.", e.message);
      }
    }

    // 2. High-precision Architectural Rule Engine & NLP Parser
    // Accurately extracts 1BHK, 2BHK, 3BHK, 4BHK, 5BHK, 6BHK, Luxury Villas, custom plot sizes, and specialty rooms!
    return SmartArchitecturalParser.parse(prompt);
  }
}
