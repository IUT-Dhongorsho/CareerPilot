import { Request, Response } from 'express';
import { createSession, getSession, updateSession } from '../services/interview/sessions.js';
import { getUserCVChunks } from '../services/rag/retriever.js';
import Groq from 'groq-sdk';

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

export const startInterview = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { jobTitle, jobDescription } = req.body;
    if (!jobTitle || !jobDescription) {
      return res.status(400).json({ error: 'Missing jobTitle or jobDescription' });
    }

    const cvChunks = await getUserCVChunks(userId, `interview questions for ${jobTitle}`, 10);
    const cvText = cvChunks.join('\n');

    const prompt = `You are an interviewer for a ${jobTitle} position. Based on the candidate's CV: ${cvText} and the job description: ${jobDescription}, ask ONE behavioral or technical question. Keep it concise. Return only the question text.`;
    const completion = await groq.chat.completions.create({
      model: 'llama3-70b-8192',
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
    });
    const firstQuestion = completion.choices[0]?.message?.content || 'Tell me about yourself.';

    const sessionId = await createSession(userId, jobTitle, jobDescription);
    await updateSession(sessionId, { questionsAsked: [firstQuestion] });

    res.json({ sessionId, question: firstQuestion, questionNumber: 1 });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to start interview' });
  }
};

export const answerQuestion = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });
    const { sessionId, answer } = req.body;
    if (!sessionId || !answer) return res.status(400).json({ error: 'Missing sessionId or answer' });

    const session = await getSession(sessionId);
    if (!session) return res.status(404).json({ error: 'Session not found' });
    if (session.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });

    const updatedAnswers = [...session.answers, answer];
    const nextIndex = session.currentQuestionIndex + 1;
    const isComplete = nextIndex >= 5;

    let nextQuestion = null;
    let feedback = null;

    if (!isComplete) {
      const cvChunks = await getUserCVChunks(userId, session.jobTitle, 5);
      const cvText = cvChunks.join('\n');
      const prompt = `You are an interviewer. The candidate answered: "${answer}". Provide brief constructive feedback (2 sentences). Then ask the next interview question for a ${session.jobTitle} position. The job description: ${session.jobDescription}. Candidate's CV: ${cvText}. Return JSON: { "feedback": "...", "nextQuestion": "..." }`;
      const completion = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: prompt }],
        temperature: 0.7,
      });
      const result = JSON.parse(completion.choices[0]?.message?.content || '{"feedback":"Good answer.","nextQuestion":"Tell me about a challenge you faced."}');
      feedback = result.feedback;
      nextQuestion = result.nextQuestion;

      await updateSession(sessionId, {
        answers: updatedAnswers,
        currentQuestionIndex: nextIndex,
        questionsAsked: [...session.questionsAsked, nextQuestion],
      });
    } else {
      const cvChunks = await getUserCVChunks(userId, session.jobTitle, 5);
      const cvText = cvChunks.join('\n');
      const summaryPrompt = `Based on the interview for ${session.jobTitle}, with questions: ${session.questionsAsked.join(', ')} and answers: ${updatedAnswers.join(', ')}, provide a short evaluation (strengths, areas to improve). Candidate's CV: ${cvText}. Return as plain text.`;
      const completion = await groq.chat.completions.create({
        model: 'llama3-70b-8192',
        messages: [{ role: 'user', content: summaryPrompt }],
        temperature: 0.5,
      });
      feedback = completion.choices[0]?.message?.content || 'Interview completed. Good luck!';
      nextQuestion = null;
      await updateSession(sessionId, { answers: updatedAnswers, currentQuestionIndex: nextIndex });
    }

    res.json({
      feedback,
      nextQuestion,
      isComplete,
      questionNumber: nextIndex + 1,
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Failed to process answer' });
  }
};

export const getSessionState = async (req: Request, res: Response) => {
  const userId = (req as any).user?.id;
  const { sessionId } = req.params;
  const session = await getSession(sessionId);
  if (!session) return res.status(404).json({ error: 'Session not found' });
  if (session.userId !== userId) return res.status(403).json({ error: 'Unauthorized' });
  res.json({
    jobTitle: session.jobTitle,
    questionsAsked: session.questionsAsked,
    currentQuestionIndex: session.currentQuestionIndex,
    answers: session.answers,
  });
};
