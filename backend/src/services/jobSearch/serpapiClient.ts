import axios from 'axios';

export async function searchJobsOnSerpapi(query: string, location: string) {
  const apiKey = process.env.SERPAPI_KEY;
  if (!apiKey) {
    console.error('SERPAPI_KEY missing');
    throw new Error('SERPAPI_KEY missing in .env');
  }

  console.log(`Calling SerpAPI with query: ${query}, location: ${location}`);

  const response = await axios.get('https://serpapi.com/search', {
    params: {
      engine: 'google_jobs',
      q: query,
      location: location,
      api_key: apiKey,
    },
  });

  console.log('SerpAPI response status:', response.status);
  console.log('Jobs results count:', response.data.jobs_results?.length || 0);

  return response.data.jobs_results || [];
}
