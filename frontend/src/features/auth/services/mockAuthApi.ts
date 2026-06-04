export const mockLogin = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  if (!email || !password) throw new Error('Email and password required');
  return { user: { id: 'mock-user-1', email }, token: 'mock-jwt-token' };
};

export const mockSignup = async (email: string, password: string) => {
  await new Promise(resolve => setTimeout(resolve, 500));
  return { user: { id: 'mock-user-1', email }, token: 'mock-jwt-token' };
};

export const mockLogout = async () => {
  await new Promise(resolve => setTimeout(resolve, 200));
  return { success: true };
};
