import { apiRequest } from '../core/apiClient';

export interface ParticipantProfile {
  userId: string;
  name?: string;
  username?: string;
  photo?: string;
}

export interface ChatSummary {
  id: string;
  participantIds: string[];
  participantProfiles?: Record<string, ParticipantProfile>;
  unreadCount?: Record<string, number>;
  lastMessage?: {
    text?: string;
    senderId?: string;
    createdAt?: any;
  };
  lastMessageAt?: any;
  metadata?: Record<string, any>;
}

export interface ChatMessage {
  id: string;
  chatId: string;
  senderId: string;
  text: string;
  attachments?: string[];
  createdAt: any;
  isReadBy?: Record<string, boolean>;
}

export const getChats = async () => {
  return apiRequest('/chats', { method: 'GET' });
};

export const createChat = async (participants: string[], metadata = {}) => {
  return apiRequest('/chats', {
    method: 'POST',
    body: JSON.stringify({ participants, metadata }),
  });
};

export const getChatMessages = async (
  chatId: string,
  params?: { limit?: number; cursor?: string },
) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) searchParams.append('limit', params.limit.toString());
  if (params?.cursor) searchParams.append('cursor', params.cursor);

  const queryString = searchParams.toString();
  const endpoint = queryString
    ? `/chats/${chatId}/messages?${queryString}`
    : `/chats/${chatId}/messages`;

  return apiRequest(endpoint, { method: 'GET' });
};

export const sendChatMessage = async (
  chatId: string,
  payload: { text: string; attachments?: string[] },
) => {
  return apiRequest(`/chats/${chatId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const markChatAsRead = async (chatId: string) => {
  return apiRequest(`/chats/${chatId}/read`, {
    method: 'POST',
  });
};
