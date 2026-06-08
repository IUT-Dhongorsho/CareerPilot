export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  jobResults?: any[];
}

export interface ChatReceiveData {
  sessionId: string;
  role: string;
  content: string;
  jobResults?: any[];
}

export interface ChatSendData {
  sessionId: string;
  content: string;
}
