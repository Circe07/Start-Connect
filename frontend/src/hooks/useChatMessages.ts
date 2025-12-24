import { useQuery } from '@tanstack/react-query';
import {
  ChatMessage,
  ChatSummary,
  getChatMessages,
} from '@/services/chat/chatService';

const toDate = (value: any): Date | null => {
  if (!value) return null;

  if (typeof value.toDate === 'function') {
    const parsed = value.toDate();
    if (!Number.isNaN(parsed?.getTime?.())) return parsed;
  }

  if (typeof value === 'string' || value instanceof Date) {
    const parsed = new Date(value);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  if (typeof value.seconds === 'number') {
    const parsed = new Date(value.seconds * 1000);
    if (!Number.isNaN(parsed.getTime())) return parsed;
  }

  return null;
};

export interface UseChatMessagesResult {
  chat?: ChatSummary;
  messages: (ChatMessage & { createdAt?: Date | null })[];
}

export default function useChatMessages(chatId?: string) {
  return useQuery<UseChatMessagesResult>({
    queryKey: ['chatMessages', chatId],
    queryFn: async () => {
      if (!chatId) {
        return { messages: [] };
      }

      const response = await getChatMessages(chatId);

      if (!response.success) {
        throw new Error(response.error || 'No se pudieron cargar los mensajes');
      }

      const chat = response.data?.chat as ChatSummary | undefined;
      const messages = (response.data?.messages || []) as ChatMessage[];

      return {
        chat,
        messages: messages.map(message => ({
          ...message,
          createdAt: toDate(message.createdAt) || undefined,
        })),
      };
    },
    enabled: Boolean(chatId),
    refetchInterval: 5000,
  });
}
