import Groq from 'groq-sdk';
import * as dotenv from 'dotenv';

dotenv.config();

const groq = new Groq({
  apiKey: process.env.GROQ_API_KEY,
});

export interface InterviewSummary {
  score: number;
  strengths: string[];
  improvements: string[];
  technicalFeedback: string;
  communicationFeedback: string;
}

/**
 * Generates an AI summary of the interview transcript using Groq.
 */
export async function generateInterviewSummary(transcript: string): Promise<InterviewSummary> {
  if (!transcript || transcript.trim() === '') {
    return {
      score: 0,
      strengths: [],
      improvements: ['No transcript provided.'],
      technicalFeedback: 'N/A',
      communicationFeedback: 'N/A',
    };
  }

  const prompt = `
    Analyze the following interview transcript and provide a detailed summary.
    
    Transcript:
    ${transcript}

    Respond ONLY with a JSON object in the following format:
    {
      "score": number (1-10),
      "strengths": ["string"],
      "improvements": ["string"],
      "technicalFeedback": "string",
      "communicationFeedback": "string"
    }
  `;

  try {
    const chatCompletion = await groq.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are an expert interview coach and technical recruiter. Provide constructive feedback based on the interview transcript. Ensure the output is strictly valid JSON.',
        },
        {
          role: 'user',
          content: prompt,
        },
      ],
      model: 'llama-3.3-70b-versatile',
      response_format: { type: 'json_object' },
    });

    const content = chatCompletion.choices[0]?.message?.content;
    if (!content) {
      throw new Error('Failed to generate summary: Empty response from Groq');
    }

    // Safely parse JSON
    try {
      return JSON.parse(content) as InterviewSummary;
    } catch (parseError) {
      console.error('Error parsing Groq response JSON:', parseError);
      // Fallback: try to extract JSON if it's wrapped in markdown
      const jsonMatch = content.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        return JSON.parse(jsonMatch[0]) as InterviewSummary;
      }
      throw parseError;
    }
  } catch (error) {
    console.error('Error generating interview summary:', error);
    // Return a default summary in case of error to avoid failing the whole webhook
    return {
      score: 0,
      strengths: [],
      improvements: ['Failed to generate AI summary due to an internal error.'],
      technicalFeedback: 'N/A',
      communicationFeedback: 'N/A',
    };
  }
}
