import axiosClient from '../../../lib/api/axiosClient';

export const sendSkillGap = (jobTitle: string, jobDescription: string) =>
  axiosClient.post('/skill-gap', { jobTitle, jobDescription }).then(r => r.data);

export const sendCompanyCulture = (companyName: string) =>
  axiosClient.post('/company-culture', { companyName }).then(r => r.data);

export const sendATSFeedback = (jobTitle: string, jobDescription: string) =>
  axiosClient.post('/ats-feedback', { jobTitle, jobDescription }).then(r => r.data);

export const sendRoadmap = (jobTitle: string) =>
  axiosClient.post('/roadmap', { jobTitle }).then(r => r.data);
