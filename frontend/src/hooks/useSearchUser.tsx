import { useEffect, useMemo, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { PublicUserSummary, searchUsers } from '@/services/user/userService';

const MINIMUM_CHARACTERS = 2;
const DEBOUNCE_DELAY = 350;

export default function useSearchUser() {
  const [searchText, setSearchText] = useState('');
  const [debouncedValue, setDebouncedValue] = useState('');

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(searchText.trim());
    }, DEBOUNCE_DELAY);

    return () => clearTimeout(handler);
  }, [searchText]);

  const query = useQuery<PublicUserSummary[]>({
    queryKey: ['userSearch', debouncedValue],
    enabled: debouncedValue.length >= MINIMUM_CHARACTERS,
    queryFn: async () => {
      const response = await searchUsers(debouncedValue);

      if (!response.success) {
        throw new Error(response.error || 'No se pudieron buscar usuarios');
      }

      return response.users || [];
    },
  });

  const results = useMemo(() => query.data || [], [query.data]);

  return {
    searchText,
    debouncedValue,
    handleSearch: setSearchText,
    results,
    isLoading: query.isFetching,
    error: (query.error as Error) || null,
    minimumChars: MINIMUM_CHARACTERS,
    hasTypedEnough: debouncedValue.length >= MINIMUM_CHARACTERS,
  };
}
