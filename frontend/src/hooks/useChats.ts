import { useQuery } from '@tanstack/react-query';
import { ChatSummary, getChats } from '@/services/chat/chatService';

export default function useChats() {
  return useQuery<ChatSummary[]>({
    queryKey: ['chats'],
    queryFn: async () => {
      const response = await getChats();

      if (!response.success) {
        throw new Error(response.error || 'Failed to load chats');
      }

      return (response.data?.chats || []) as ChatSummary[];
    },
    staleTime: 30 * 1000,
  });
}
