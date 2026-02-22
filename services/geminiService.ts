import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { SYSTEM_INSTRUCTION } from "../constants";

let chatInstance: Chat | null = null;

const getChatInstance = () => {
  if (!process.env.API_KEY) {
    console.error("API Key is missing!");
    throw new Error("API Key is missing.");
  }

  if (!chatInstance) {
    const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
    chatInstance = ai.chats.create({
      model: 'gemini-3-flash-preview',
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.7, // Slightly creative but consistent
      },
    });
  }
  return chatInstance;
};

export const sendMessageToGemini = async (
  message: string,
  onChunk: (text: string) => void
): Promise<string> => {
  const chat = getChatInstance();
  let fullText = "";

  try {
    const resultStream = await chat.sendMessageStream({ message });

    for await (const chunk of resultStream) {
      const c = chunk as GenerateContentResponse;
      if (c.text) {
        fullText += c.text;
        onChunk(fullText);
      }
    }
  } catch (error) {
    console.error("Error sending message to Gemini:", error);
    throw error;
  }

  return fullText;
};

export const resetChat = () => {
  chatInstance = null;
};
