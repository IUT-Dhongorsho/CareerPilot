export const searchJobsMock = async (query: string, location?: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return [
    { id: '1', title: 'ML Intern', company: 'Google', location: location || 'Dhaka', salary: '$50k', deadline: '2026-06-30', fitScore: 85, description: 'Work on LLMs' },
    { id: '2', title: 'AI Engineer', company: 'Microsoft', location: location || 'Dhaka', salary: '$60k', deadline: '2026-07-15', fitScore: 72, description: 'Build AI solutions' },
    { id: '3', title: 'Data Scientist', company: 'Local Startup', location: location || 'Dhaka', salary: '$40k', deadline: '2026-06-20', fitScore: 45, description: 'Analyze data' },
  ];
};
