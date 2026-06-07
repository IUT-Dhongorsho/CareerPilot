import { Request, Response } from 'express';
import { getUserCVChunks } from '../services/rag/retriever.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const extractProfile = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    // Retrieve all relevant CV chunks (use a generic query)
    const chunks = await getUserCVChunks(userId, 'name email phone education experience skills projects certifications', 15);
    const cvText = chunks.join('\n');

    const prompt = `Extract the following information from this CV text. Return ONLY valid JSON, no extra text.
CV:
${cvText}

Output JSON:
{
  "name": "full name",
  "email": "email address",
  "phone": "phone number",
  "education": [{ "degree": "", "institution": "", "year": "" }],
  "experience": [{ "title": "", "company": "", "duration": "", "description": "" }],
  "skills": ["skill1", "skill2"],
  "certifications": ["cert1", "cert2"]
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content || '{}';
    const profile = JSON.parse(content);
    res.json({ success: true, profile });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to extract profile' });
  }
};

export const analyzeCV = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const chunks = await getUserCVChunks(userId, 'resume feedback structure skills improvements', 20);
    const cvText = chunks.join('\n');

    const prompt = `You are an expert resume reviewer. Analyze this CV and provide structured feedback.
CV:
${cvText}

Return JSON:
{
  "overallScore": 0-100,
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "improvements": ["specific suggestion1", "suggestion2"],
  "atsCompatibility": "poor/fair/good/excellent"
}`;

    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.3,
    });

    const feedback = JSON.parse(completion.choices[0]?.message?.content || '{}');
    res.json({ success: true, feedback });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to analyze CV' });
  }
};
