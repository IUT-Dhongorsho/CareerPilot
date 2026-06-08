import { searchJobsMock } from './mockJobsApi';
import { searchJobsReal } from './realJobsApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const searchJobs = USE_MOCK ? searchJobsMock : searchJobsReal;
