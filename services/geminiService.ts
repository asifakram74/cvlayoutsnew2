import { GoogleGenAI } from "@google/genai";
import { CVData } from "../types";

const apiKey = process.env.API_KEY || '';
const ai = new GoogleGenAI({ apiKey });

export const generateSummary = async (jobTitle: string, skills: string[]): Promise<string> => {
  if (!apiKey) return "API Key is missing. Please check your environment configuration.";

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Write a professional, concise, and impactful resume summary (approx 50-70 words) for a ${jobTitle} with the following skills: ${skills.join(', ')}. Do not use markdown formatting, just plain text.`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating summary:", error);
    return "Failed to generate summary. Please try again.";
  }
};

export const improveDescription = async (text: string, role: string): Promise<string> => {
  if (!apiKey) return text;

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `Rewrite the following resume bullet point or description to be more professional, action-oriented, and results-driven. It is for a ${role} role. Keep it concise. Text: "${text}"`,
    });
    return response.text?.trim() || text;
  } catch (error) {
    console.error("Error improving text:", error);
    return text;
  }
};

export const generateReview = async (cvData: CVData): Promise<string> => {
  if (!apiKey) return "API Key is missing.";
  
  const cvContext = JSON.stringify(cvData);

  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: `You are an expert technical recruiter. Review the following CV JSON data and provide 3 specific, actionable bullet points on how to improve it to stand out. Focus on impact and clarity. \n\nCV Data: ${cvContext}`,
    });
    return response.text || "";
  } catch (error) {
    console.error("Error generating review:", error);
    return "Could not generate review.";
  }
};