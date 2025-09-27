

import { GoogleGenAI } from "@google/genai";
import { ASSESSMENT_PROMPT, COPILOT_PROMPT } from '../constants';

// In a real application, the API key would be handled more securely and not exposed on the client-side.
// We assume process.env.API_KEY is populated by the build environment.
const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.error("API_KEY is not set. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY! });

export const generateAssessment = async (transcript: string, userHistory: string): Promise<string> => {
  if (!API_KEY) {
    return "Error: API_KEY is not configured. Please contact support.";
  }
  
  try {
    const prompt = ASSESSMENT_PROMPT
      .replace('{{TRANSCRIPT}}', transcript)
      .replace('{{USER_HISTORY}}', userHistory);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating assessment:", error);
    return "An error occurred while generating your assessment. Please try again later.";
  }
};

export const generateCopilotSuggestion = async (transcript: string): Promise<string> => {
  if (!API_KEY) {
    return "Copilot unavailable.";
  }
  
  try {
    if (!transcript.trim()) {
        return "Start the conversation to get your first tip.";
    }
    const prompt = COPILOT_PROMPT.replace('{{TRANSCRIPT}}', transcript);
    
    const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
            temperature: 0.3,
            maxOutputTokens: 60,
        }
    });
    
    return response.text;
  } catch (error) {
    console.error("Error generating copilot suggestion:", error);
    return "Couldn't generate a tip. Keep going!";
  }
};