import { GoogleGenAI } from "@google/genai";
import { ASSESSMENT_PROMPT, COPILOT_PROMPT } from '../constants';

// In a real application, the API key would be handled more securely and not exposed on the client-side.
// Use Vite's import.meta.env.VITE_API_KEY for environment variable access
declare global {
  interface ImportMeta {
    env: {
      VITE_API_KEY: string;
      [key: string]: any;
    };
  }
}

const API_KEY = import.meta.env.VITE_API_KEY;

if (!API_KEY) {
  console.warn("VITE_API_KEY is not set. AI features will be unavailable until it is configured.");
}

let aiClient: GoogleGenAI | null = null;

const ensureClient = (): GoogleGenAI | null => {
  if (!API_KEY) {
    return null;
  }

  if (aiClient) {
    return aiClient;
  }

  try {
    aiClient = new GoogleGenAI({ apiKey: API_KEY });
    return aiClient;
  } catch (error) {
    console.error("Failed to initialise GoogleGenAI client:", error);
    aiClient = null;
    return null;
  }
};

export const generateAssessment = async (transcript: string, userHistory: string): Promise<string> => {
  const client = ensureClient();
  if (!client) {
    return "Error: AI services are not configured. Please contact support.";
  }
  
  try {
    const prompt = ASSESSMENT_PROMPT
      .replace('{{TRANSCRIPT}}', transcript)
      .replace('{{USER_HISTORY}}', userHistory);
    
    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text ?? "No response from Gemini API.";
  } catch (error) {
    console.error("Error generating assessment:", error);
    return "An error occurred while generating your assessment. Please try again later.";
  }
};

export const generateCopilotSuggestion = async (transcript: string): Promise<string> => {
  const client = ensureClient();
  if (!client) {
    return "Copilot unavailable.";
  }
  
  try {
    if (!transcript.trim()) {
        return "Start the conversation to get your first tip.";
    }
    const prompt = COPILOT_PROMPT.replace('{{TRANSCRIPT}}', transcript);
    
    const response = await client.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.3,
            maxOutputTokens: 60,
        }
    });
    
    return response.text ?? "No response from Gemini API.";
  } catch (error) {
    console.error("Error generating copilot suggestion:", error);
    return "Couldn't generate a tip. Keep going!";
  }
};