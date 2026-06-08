import axiosClient from '../../../lib/api/axiosClient';

export const searchJobsReal = async (query: string, location?: string) => {
  const response: any = await axiosClient.get('/jobs/search', {
    params: { q: query, location: location || 'Dhaka' },
  });
  return response.jobs;
};
