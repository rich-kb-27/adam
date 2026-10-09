import { NextResponse } from 'next/server';
import { GoogleGenAI } from '@google/genai';

// Initialize the Gemini client using the server-side environment variable
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function POST(request: Request) {
  try {
    const { text, history } = await request.json();

    if (!text || typeof text !== 'string') {
      return NextResponse.json({ error: 'Journal text or message is required' }, { status: 400 });
    }

    // Prompt engineered for an interactive, empathetic AI therapist + risk triage
    const prompt = `
      You are an AI virtual wellness therapist and mental health support guide for university students (specifically at Cavendish University Zambia). 
      Your goal is to converse empathetically with the student, validate their feelings, offer gentle psychological coping tools, and ask a thoughtful follow-up question to keep the conversation going like a real therapy session.

      At the same time, evaluate their current message for emotional distress and psychological risk.

      Previous conversation history context:
      ${JSON.stringify(history || [])}

      Current Student Message: "${text}"

      You must output a valid JSON object ONLY, with no markdown formatting blocks around it (no \`\`\`json), using this exact structure:
      {
        "riskScore": number between 0.00 and 1.00,
        "riskLevel": "Low" or "Medium" or "High",
        "feedback": "Your warm, conversational, therapist-like response to the student, including a gentle follow-up question."
      }
      
      Guidelines for risk scoring:
      - 0.0 to 0.49 (Low): Stable, positive, or standard academic stress.
      - 0.5 to 0.79 (Medium): Notable anxiety, burnout, feeling overwhelmed, or sadness.
      - 0.8 to 1.0 (High): Severe distress, hopelessness, crisis indicators, or explicit mentions of giving up/self-harm.
    `;

    // Call the model using gemini-3.5-flash
    const response = await ai.models.generateContent({
      model: 'gemini-3.5-flash',
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
      { error: 'Failed to process therapist chat analysis' },
      { status: 500 }
    );
  }
}