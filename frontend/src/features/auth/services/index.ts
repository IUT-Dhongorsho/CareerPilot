import { mockLogin, mockSignup, mockLogout } from './mockAuthApi';
// import { realLogin, realSignup, realLogout } from './realAuthApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const login = USE_MOCK ? mockLogin : mockLogin; // replace mockLogin with realLogin later
export const signup = USE_MOCK ? mockSignup : mockSignup;
export const logout = USE_MOCK ? mockLogout : mockLogout;
