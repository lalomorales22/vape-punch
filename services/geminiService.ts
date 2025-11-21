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
      Your goal is to help the user quit vaping by analyzing their habits.
      
      You have access to their tracking data in JSON format. 
      Data schema: { date, action (VAPE or CRAVING), stress (1-10), hunger (1-10), sleep (hours), thirst (1-10) }.
      
      Analyze patterns. For example:
      - If they vape when hunger is high, suggest eating instead.
      - If they vape when stress is high, suggest breathing exercises.
      - If they successfully logged a "CRAVING" (meaning they resisted), praise them heavily.
      - If they logged a "VAPE", be disappointed but constructive. Ask them why.
      
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
        // Fallback if chat wasn't initialized with context (shouldn't happen in flow)
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
        Analyze this vaping habit data and give me 3 bullet points of deep insight into why the user is vaping and how to stop.
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