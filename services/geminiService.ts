import { GoogleGenAI } from "@google/genai";
import { MemoryTag, SensorData } from "../types";

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const getNavInstruction = (tags: MemoryTag[], sensors?: SensorData) => {
  const tagList = tags.map(t => `"${t.name}"`).join(', ');
  
  let sensorContext = "User Status: Stationary.";
  if (sensors) {
    sensorContext = `User Status: ${sensors.isMoving ? "Walking" : "Standing Still"}.`;
    if (sensors.heading !== null) {
      sensorContext += ` Facing: ${sensors.heading} degrees.`;
    }
  }

  const memoryContext = tags.length > 0 
    ? `\nMEMORY TAGS: User marked locations: [${tagList}]. If seen, announce: "You are near your ${tags[0].name}".` 
    : "";

  return `
You are "Vision2Action", an advanced safety guardian and navigation guide for a blind user.
${sensorContext}
${memoryContext}

Analyze the image and provide output in this strict priority order:

1. 🛑 SAFETY GUARDIAN (URGENT):
   - Immediately detect: Approaching Vehicles, Staircases (up/down), Edges/Drops, Wet Floors, Low hanging obstacles.
   - If a hazard is immediate, START response with "WARNING: [Hazard Name] [Instruction]". 
   - Example: "WARNING: Car approaching on right. Stop." or "WARNING: Downward stairs ahead."

2. 📍 MICRO NAVIGATION (Precision):
   - Give executable instructions based on the path.
   - Use approximate metric distances or steps if clear.
   - Example: "Walk forward 2 meters", "Turn 30 degrees left to avoid the pole", "Path clear for 5 steps".

3. 🛠️ AFFORDANCE & UTILITY (Object Purpose):
   - Do not just name objects; explain their utility/state.
   - Example: instead of "There is a chair", say "Empty chair 1 meter ahead, you can sit."
   - Example: instead of "A door", say "Closed door, handle is on the left."

4. STYLE:
   - Concise, direct, imperative. No fluff.
   - Max 2-3 sentences unless explaining a complex scene.
`;
};

const QA_SYSTEM_INSTRUCTION = `
You are a helpful visual assistant for a blind user. 
The user is asking a question about the current scene.
Answer conversationally and directly.
If the answer is not visible, say so.
Keep answers under 2 sentences.
`;

export const analyzeImage = async (base64Image: string, tags: MemoryTag[] = [], sensors?: SensorData): Promise<string> => {
  try {
    if (!base64Image || base64Image.length < 100) {
        console.warn("Invalid base64 image received");
        return "";
    }

    const cleanBase64 = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: "Guide me." }
          ]
        }
      ],
      config: {
        systemInstruction: getNavInstruction(tags, sensors),
        maxOutputTokens: 150, // Shorter for faster realtime response
        temperature: 0.4,
      }
    });

    return response.text || "";
  } catch (error) {
    console.error("Gemini Nav Error Details:", JSON.stringify(error, null, 2));
    return "";
  }
};

export const askAboutImage = async (base64Image: string, question: string): Promise<string> => {
  try {
     if (!base64Image || base64Image.length < 100) {
        return "I can't see the image clearly.";
    }

    const cleanBase64 = base64Image.includes('base64,') 
        ? base64Image.split('base64,')[1] 
        : base64Image;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            { inlineData: { mimeType: 'image/jpeg', data: cleanBase64 } },
            { text: question }
          ]
        }
      ],
      config: {
        systemInstruction: QA_SYSTEM_INSTRUCTION,
        maxOutputTokens: 300,
        temperature: 0.6,
      }
    });

    return response.text || "I couldn't see that.";
  } catch (error) {
    console.error("Gemini Q&A Error Details:", JSON.stringify(error, null, 2));
    return "I had trouble connecting to the assistant.";
  }
};