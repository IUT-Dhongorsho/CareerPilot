import { sendMessageMock } from './mockChatApi';
// import { sendMessageReal } from './realChatApi';

const USE_MOCK = import.meta.env.VITE_USE_MOCK === 'true';

export const sendMessage = USE_MOCK ? sendMessageMock : sendMessageMock; // replace with realChatApi later
