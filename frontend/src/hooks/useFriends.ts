import { useQuery } from '@tanstack/react-query';
import { FriendSummary, getFriends } from '@/services/friends/friendsService';

export default function useFriends() {
  return useQuery<FriendSummary[]>({
    queryKey: ['friends'],
    queryFn: async () => {
      const response = await getFriends();

      if (!response.success) {
        throw new Error(response.error || 'No se pudieron cargar los amigos');
      }

      return (response.data?.friends || []) as FriendSummary[];
    },
    staleTime: 60 * 1000,
  });
}
