import { useQuery } from '@tanstack/react-query';
import { getPosts, PostSummary } from '@/services/posts/postService';

export default function usePosts(options: { enabled?: boolean } = {}) {
  const { enabled = true } = options;

  return useQuery<PostSummary[]>({
    queryKey: ['posts'],
    enabled,
    queryFn: async () => {
      const response = await getPosts({ limit: 25 });

      if (!response.success) {
        throw new Error(
          response.error || 'No se pudieron cargar las publicaciones',
        );
      }

      return (response.data?.posts || []) as PostSummary[];
    },
    staleTime: 15 * 1000,
  });
}
