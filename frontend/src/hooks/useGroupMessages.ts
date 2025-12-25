import { useQuery } from '@tanstack/react-query';
import { getGroupMessages } from '@/services/groups/authGroup';
import { GroupMessage } from '@/types/interface/group/groupMessage';

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

export interface UseGroupMessagesResult {
  messages: (GroupMessage & { createdAtDate?: Date | null })[];
}

export default function useGroupMessages(groupId?: string) {
  return useQuery<UseGroupMessagesResult>({
    queryKey: ['groupMessages', groupId],
    enabled: Boolean(groupId),
    queryFn: async () => {
      if (!groupId) {
        return { messages: [] };
      }
      const response = await getGroupMessages(groupId, { limit: 100 });
      return {
        messages: response.messages.map(message => ({
          ...message,
          createdAtDate: toDate(message.createdAt) || undefined,
        })),
      };
    },
    refetchInterval: 5000,
  });
}
