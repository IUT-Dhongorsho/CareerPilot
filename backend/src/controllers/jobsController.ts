import { Request, Response } from 'express';
import { searchJobsOnSerpapi } from '../services/jobSearch/serpapiClient.js';
import { computeFitScore } from '../utils/fitScoreCalculator.js';

export const searchJobs = async (req: Request, res: Response) => {
  try {
    const userId = (req as any).user?.id;
    if (!userId) return res.status(401).json({ error: 'Unauthorized' });

    const { q, location } = req.query;
    if (!q) return res.status(400).json({ error: 'Missing search query' });

    const jobsRaw = await searchJobsOnSerpapi(q as string, (location as string) || 'Dhaka');

    const enrichedJobs = await Promise.all(
      jobsRaw.map(async (job: any) => {
        const fit = await computeFitScore(userId, job.description || '');
        return {
          id: job.job_id || Math.random().toString(),
          title: job.title,
          company: job.company_name,
          location: job.location,
          salary: job.salary || 'Not specified',
          deadline: job.detected_extensions?.posted_at || 'Unknown',
          fitScore: fit.score,
          matchingSkills: fit.matchingSkills,
          missingSkills: fit.missingSkills,
          description: job.description,
        };
      })
    );

    res.json({ jobs: enrichedJobs });
  } catch (error) {
    console.error('Job search error:', error);
    res.status(500).json({ error: 'Failed to search jobs' });
  }
};
