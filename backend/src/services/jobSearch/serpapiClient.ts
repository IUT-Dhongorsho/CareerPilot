import axios from 'axios';

export async function searchJobsOnSerpapi(query: string, location: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) throw new Error('SERPAPI_KEY missing in .env');

  const response = await axios.get('https://serpapi.com/search', {
    params: {
      engine: 'google_jobs',
      q: query,
      location: location,
      api_key: apiKey,
    },
  });
  return response.data.jobs_results || [];
}
