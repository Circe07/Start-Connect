import { getCenters } from '@/services/centers/authCenters';
import { useQuery } from '@tanstack/react-query';

export default function useGetCenters() {
  return useQuery({
    queryKey: ['center'],
    queryFn: getCenters,
    staleTime: 50000,
  });
}
