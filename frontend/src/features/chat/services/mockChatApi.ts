import { searchJobsMock } from '../../jobs/services/mockJobsApi';

// Helper to simulate API delay
const delay = (ms: number) => new Promise(resolve => setTimeout(resolve, ms));

export const sendMessageMock = async (message: string, cvChunks: string[]) => {
  await delay(800);
  const lower = message.toLowerCase();

  // Job search intent
  const jobSearchPattern = /find me|search for|looking for|jobs? in|internships? in/i;
  if (jobSearchPattern.test(lower)) {
    const locationMatch = message.match(/(?:in|at)\s+([A-Za-z\s]+)/i);
    const location = locationMatch ? locationMatch[1].trim() : 'Dhaka';
    const jobs = await searchJobsMock(message, location);
    return {
      type: 'job_cards',
      content: `Found ${jobs.length} jobs in ${location}. See cards below.`,
      jobs,
    };
  }

  // Fit score intent
  if (lower.includes('am i ready') || lower.includes('fit for') || lower.includes('qualify for')) {
    return {
      type: 'text',
      content: `Based on your CV, you have ${cvChunks.join(', ').slice(0, 100)}... You're missing Docker and Kubernetes. Fit score: 72%.`,
    };
  }

  // Cover letter intent
  if (lower.includes('cover letter') || lower.includes('draft a letter')) {
    return {
      type: 'text',
      content: `Dear Hiring Manager,\n\nI am excited to apply for the position. As a developer with experience in ${cvChunks.join(', ').slice(0, 80)}..., I am confident I can contribute to your team.\n\nSincerely,\n[Your Name]`,
    };
  }

  // Roadmap intent
  if (lower.includes('roadmap') || lower.includes('learning plan') || lower.includes('study plan')) {
    return {
      type: 'text',
      content: `## 3-Month Roadmap\n\n**Month 1:** Learn core DSA & SQL\n**Month 2:** Build 2 portfolio projects\n**Month 3:** Apply to 20+ jobs & practice interviews`,
    };
  }

  // General chat fallback
  return {
    type: 'text',
    content: `I can help you find jobs, check your fit, draft cover letters, or build a learning roadmap. Try asking: "Find me ML jobs in Dhaka" or "Am I ready for a data engineer role?"`,
  };
};
