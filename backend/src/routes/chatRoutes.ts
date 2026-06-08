import { Router } from 'express';
import { getSessions, getHistory, createSession, sendMessage } from '../controllers/chatController.js';
import { authMiddleware } from '../middleware/auth.middleware.js';

const router = Router();

router.get('/sessions', authMiddleware, getSessions);
router.get('/sessions/:sessionId/history', authMiddleware, getHistory);
router.post('/sessions', authMiddleware, createSession);
router.post('/sessions/:sessionId/messages', authMiddleware, sendMessage);

export default router;

// Skill Gap
router.post('/skill-gap', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { jobTitle, jobDescription } = req.body;
    const embedding = await getEmbedding(`skills for ${jobTitle}`);
    const chunks = await similaritySearch(userId, embedding, 8);
    const cvText = chunks.join('\n');
    const prompt = `CV:\n${cvText}\nJob: ${jobTitle}\nDesc: ${jobDescription}\nReturn JSON: {"matchingSkills":[],"missingSkills":[],"recommendations":[]}`;
    const text = await generateGroqResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { matchingSkills: [], missingSkills: [], recommendations: [] };
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Company Culture
router.post('/company-culture', authMiddleware, async (req, res) => {
  try {
    const { companyName } = req.body;
    const prompt = `Describe culture of ${companyName} in 3-5 bullet points.`;
    const culture = await generateGroqResponse(prompt);
    res.json({ culture });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// ATS Feedback
router.post('/ats-feedback', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { jobTitle, jobDescription } = req.body;
    const embedding = await getEmbedding(jobDescription);
    const chunks = await similaritySearch(userId, embedding, 10);
    const cvText = chunks.join('\n');
    const prompt = `ATS analysis for ${jobTitle}. CV:\n${cvText}\nReturn JSON: {"score":0-100,"missingKeywords":[],"suggestions":[]}`;
    const text = await generateGroqResponse(prompt);
    const jsonMatch = text.match(/\{[\s\S]*\}/);
    const data = jsonMatch ? JSON.parse(jsonMatch[0]) : { score: 50, missingKeywords: [], suggestions: [] };
    res.json(data);
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});

// Roadmap
router.post('/roadmap', authMiddleware, async (req, res) => {
  try {
    const userId = (req as any).user?.id;
    const { jobTitle } = req.body;
    const embedding = await getEmbedding(`skills for ${jobTitle}`);
    const chunks = await similaritySearch(userId, embedding, 10);
    const cvText = chunks.join('\n');
    const prompt = `Create 3-month learning roadmap for ${jobTitle} based on skills: ${cvText}. Return HTML with <h3>, <ul>, <li>.`;
    const roadmap = await generateGroqResponse(prompt);
    res.json({ roadmap });
  } catch (err) { res.status(500).json({ error: 'Failed' }); }
});
