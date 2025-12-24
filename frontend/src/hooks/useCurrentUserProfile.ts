import { useQuery } from '@tanstack/react-query';
import { getCurrentUser } from '@/services/user/userService';

export default function useCurrentUserProfile() {
  return useQuery({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      const response = await getCurrentUser();

      if (!response.success || !response.user) {
        throw new Error(response.error || 'Unable to load current user');
      }

      return response.user;
    },
    staleTime: 5 * 60 * 1000,
  });
}
