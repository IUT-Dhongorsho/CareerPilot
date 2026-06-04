import { mockLogin, mockSignup, mockLogout } from './mockAuthApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const login = USE_MOCK ? mockLogin : mockLogin;
export const signup = USE_MOCK ? mockSignup : mockSignup;
export const logout = USE_MOCK ? mockLogout : mockLogout;
