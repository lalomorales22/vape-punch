
import { GoogleGenAI, Chat } from "@google/genai";
import { ChatMessage } from "../types";

const API_KEY = process.env.API_KEY || '';

class GeminiService {
  private client: GoogleGenAI | null = null;
  private chatSession: Chat | null = null;

  constructor() {
    if (API_KEY) {
      this.client = new GoogleGenAI({ apiKey: API_KEY });
    }
  }

  public isConfigured(): boolean {
    return !!this.client;
  }

  public async startChat(contextData: string): Promise<void> {
    if (!this.client) throw new Error("API Key missing");

    const systemInstruction = `
      You are "Punch," a sleek, dark-humored, but highly effective anti-vaping coach. 
      Your goal is to help the user quit vaping by analyzing their habits using detailed 0-100 scale biometric data.
      
      Data schema includes: 
      - Stress, Hunger, Thirst, Stomach (Pain), Energy, Mood, Focus, Urge Intensity (all 0-100 scale).
      - Sleep hours.
      
      Analyze complex patterns. For example:
      - High Urge Intensity + Low Energy + High Stress? Suggest rest or meditation, not nicotine.
      - Vaping when Mood is low vs High? Identify if they vape to cope or to celebrate.
      - High Focus + Vape? They might use it as a stimulant. Suggest alternative focus tools.
      
      If they successfully logged a "CRAVING" (meaning they resisted), praise them heavily and analyze the metrics that made it possible (e.g. "You resisted because your Energy was high").
      
      Keep responses concise, punchy, and raw. Do not be overly polite. Be a supportive drill sergeant.
      
      Current Data Context:
      ${contextData}
    `;

    this.chatSession = this.client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: systemInstruction,
      },
    });
  }

  public async sendMessage(text: string): Promise<ChatMessage> {
    if (!this.chatSession) {
       await this.startChat("No context provided yet.");
    }
    
    if (!this.chatSession) throw new Error("Failed to initialize chat");

    try {
      const response = await this.chatSession.sendMessage({ message: text });
      return {
        id: crypto.randomUUID(),
        role: 'model',
        text: response.text || "I'm speechless. Try again.",
      };
    } catch (error) {
      console.error("Gemini Error:", error);
      return {
        id: crypto.randomUUID(),
        role: 'model',
        text: "Connection severed. I can't reach the cloud right now.",
        isError: true
      };
    }
  }
  
  public async analyzeHabits(dataContext: string): Promise<string> {
      if (!this.client) return "AI not configured.";
      
      const model = this.client.models;
      const prompt = `
        Analyze this vaping habit data (0-100 scale metrics).
        Look for correlations between Urge Intensity and variables like Stress, Energy, or Time.
        Give me 3 bullet points of deep insight into why the user is vaping and how to stop.
        Data: ${dataContext}
      `;
      
      try {
          const result = await model.generateContent({
              model: 'gemini-2.5-flash',
              contents: prompt
          });
          return result.text || "No analysis generated.";
      } catch (e) {
          return "Analysis failed due to network error.";
      }
  }
}

export const geminiService = new GeminiService();
