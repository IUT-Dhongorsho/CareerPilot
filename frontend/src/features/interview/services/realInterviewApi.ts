import axiosClient from '../../../lib/api/axiosClient';

export const startInterviewReal = async (jobTitle: string, jobDescription: string) => {
  const res = await axiosClient.post('/interview/start', { jobTitle, jobDescription });
  return res.data;
};

export const answerQuestionReal = async (sessionId: string, answer: string) => {
  const res = await axiosClient.post('/interview/answer', { sessionId, answer });
  return res.data;
};

export const getInterviewStateReal = async (sessionId: string) => {
  const res = await axiosClient.get(`/interview/state/${sessionId}`);
  return res.data;
};
