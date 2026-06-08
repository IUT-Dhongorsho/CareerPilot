import { searchJobsMock } from '../../jobs/services/mockJobsApi';

const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessageMock = async (message: string, cvChunks: string[]) => {
  await delay(800);
  const lower = message.toLowerCase();

  if (lower.includes('find me') || lower.includes('search for') || lower.includes('looking for')) {
    const locationMatch = message.match(/(?:in|at)\s+([A-Za-z\s]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : 'Dhaka';
    const jobs = await searchJobsMock(message, location);
    return {
      type: 'job_cards',
      content: `Found ${jobs.length} jobs in ${location}. See cards below.`,
      jobs,
    };
  }

  if (lower.includes('am i ready') || lower.includes('fit for')) {
    return {
      type: 'text',
      content: `Based on your CV, you have relevant experience but are missing some skills. Your fit score is approximately 72%.`,
    };
  }

  if (lower.includes('cover letter')) {
    return {
      type: 'text',
      content: `Dear Hiring Manager,\n\nI am excited to apply for the position. My experience in ${cvChunks.join(', ').slice(0, 100)} aligns well with your requirements.\n\nSincerely,\n[Your Name]`,
    };
  }

  if (lower.includes('roadmap')) {
    return {
      type: 'text',
      content: `## 3-Month Learning Roadmap\n\n**Month 1:** Learn core DSA & SQL\n**Month 2:** Build 2 portfolio projects\n**Month 3:** Apply to 20+ jobs & practice interviews`,
    };
  }

  return {
    type: 'text',
    content: `I can help you find jobs, check your fit, draft cover letters, or build a learning roadmap. Try asking: "Find me ML jobs in Dhaka" or "Am I ready for a data engineer role?"`,
  };
};
