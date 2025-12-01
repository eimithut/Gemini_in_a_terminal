
import { GoogleGenAI, Chat, GenerateContentResponse } from "@google/genai";
import { ChatMode } from "../types";

// --- SYSTEM INSTRUCTIONS ---

// 1. TERMINAL MODE (Arch/EndeavourOS Persona)
const TERMINAL_INSTRUCTION = `
You are an EndeavourOS (Arch Linux based) terminal emulator. 
The user is "operator" (root privileges available via sudo).
Your goal is to simulate a real Linux shell environment realistically.

RULES:
1. When the user types a command (e.g., 'yay -S firefox', 'ls -la', 'cat /etc/os-release'), output EXACTLY what that command would output in a real terminal.
2. For package managers ('yay', 'pacman'):
   - Simulate the installation process but keep it CONCISE (avoid huge logs).
   - Show "Resolving dependencies...", "Checking for conflicts...".
   - Output package size information.
   - Simulate a progress bar (e.g. "[####################] 100%").
   - Keep the simulated dependency list SHORT (max 3-5 packages).
   - Total output should generally be under 20 lines.
   - End with the standard success messages.
3. For 'neofetch' or 'uname -a': Show details for EndeavourOS Linux x86_64, Kernel 6.x.
4. If the input is NOT a command (e.g., "Hello", "Help"), treat it as if the user typed it into a shell. You can respond with "command not found" OR, if it looks like a question, use 'echo' to print a brief, technical answer.
5. Do NOT use Markdown formatting (like bold/italic) unless it helps simulate terminal highlighting. Avoid code blocks for the whole message; just output raw text.
`;

// 2. ASSISTANT MODE (Normal Friendly AI)
const ASSISTANT_INSTRUCTION = `
You are a helpful, friendly, and intelligent AI assistant. 
You are NOT restricted to a terminal persona. 
You can use Markdown (bold, lists, code blocks) to format your responses beautifully.
Your goal is to help the user with their questions, coding tasks, or creative writing naturally and politely.
IMPORTANT: Do NOT use emojis. Keep the aesthetic clean and text-based.
`;

let ai: GoogleGenAI | null = null;
let chatSession: Chat | null = null;
let currentMode: ChatMode = 'terminal';

const getAiClient = (): GoogleGenAI => {
  if (!ai) {
    // API_KEY is strictly from process.env.API_KEY, injected via vite.config.ts
    const apiKey = process.env.API_KEY;
    if (!apiKey) {
      console.error("API_KEY is missing from environment variables.");
    }
    ai = new GoogleGenAI({ apiKey: apiKey || "" });
  }
  return ai;
};

// Initialize or Reset Chat Session based on Mode
export const switchChatMode = (mode: ChatMode): void => {
  currentMode = mode;
  chatSession = null; // Force recreation on next getChatSession call
};

export const getChatSession = (): Chat => {
  if (!chatSession) {
    const client = getAiClient();
    const instruction = currentMode === 'terminal' ? TERMINAL_INSTRUCTION : ASSISTANT_INSTRUCTION;
    
    chatSession = client.chats.create({
      model: 'gemini-2.5-flash',
      config: {
        systemInstruction: instruction,
      },
    });
  }
  return chatSession;
};

export const sendMessageToGeminiStream = async (message: string): Promise<AsyncIterable<GenerateContentResponse>> => {
  const chat = getChatSession();
  try {
    const result = await chat.sendMessageStream({ message });
    return result;
  } catch (error) {
    console.error("Gemini API Error:", error);
    throw error;
  }
};
