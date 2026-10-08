import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client using the server-side environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { text } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Journal text is required' }, { status: 400 });
    }

    // Prompt engineered specifically for mental wellness risk triage
    const prompt = `
      You are an AI mental health risk triage assistant for a university wellness platform. 
      Analyze the following student journal entry for emotional tone, distress, and psychological risk.
      
      Student Journal Entry: "${text}"

      You must output a valid JSON object ONLY, with no markdown formatting blocks around it (no \`\`\`json), using this exact structure:
      {
        "riskScore": number between 0.00 and 1.00,
        "riskLevel": "Low" or "Medium" or "High",
        "feedback": "A compassionate, brief, and constructive feedback or coping suggestion for the student."
      }
      
      Guidelines for risk scoring:
      - 0.0 to 0.49 (Low): Stable, positive, or standard academic stress.
      - 0.5 to 0.79 (Medium): Notable anxiety, burnout, feeling overwhelmed, or sadness.
      - 0.8 to 1.0 (High): Severe distress, hopelessness, crisis indicators, or explicit mentions of giving up/self-harm.
    `;

    // Call the model (using gemini-2.5-flash for fast, efficient text classification)
    const response = await ai.models.generateContent({
      model: 'gemini-3.8-flash',
      contents: prompt,
    });

    const rawText = response.text ? response.text.trim() : '';
    
    // Clean up potential markdown code blocks if the model included them anyway
    const cleanedJson = rawText.replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '');
    
    const analysisResult = JSON.parse(cleanedJson);

    return NextResponse.json(analysisResult);
  } catch (error) {
    console.error('LLM Analysis Error:', error);
    return NextResponse.json(
      { error: 'Failed to process journal analysis' },
      { status: 500 }
    );
  }
}