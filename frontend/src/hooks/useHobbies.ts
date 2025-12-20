import { useEffect, useState } from 'react';
import { getMyHobbies, getAllHobbies } from '@/services/hobbies/hobbiesService';

export interface Hobby {
  id: string;
  name: string;
  icon?: string;
  category?: string;
}

export const useHobbies = () => {
  const [userHobbies, setUserHobbies] = useState<string[]>([]);
  const [allHobbies, setAllHobbies] = useState<Hobby[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadHobbies();
  }, []);

  const loadHobbies = async () => {
    setIsLoading(true);
    try {
      // Load user's hobbies
      const myHobbiesResponse = await getMyHobbies();
      if (myHobbiesResponse.success) {
        // Response could be an array or have data property
        const hobbiesArray = Array.isArray(myHobbiesResponse)
          ? myHobbiesResponse
          : myHobbiesResponse.data || [];
        setUserHobbies(hobbiesArray);
      }

      // Load all available hobbies
      const allHobbiesResponse = await getAllHobbies();
      if (allHobbiesResponse.success) {
        const hobbiesArray = Array.isArray(allHobbiesResponse)
          ? allHobbiesResponse
          : allHobbiesResponse.data || [];
        setAllHobbies(hobbiesArray);
      }

      setError(null);
    } catch (err: any) {
      console.error('Error loading hobbies:', err);
      setError(err.message || 'Failed to load hobbies');
    } finally {
      setIsLoading(false);
    }
  };

  return {
    userHobbies,
    allHobbies,
    isLoading,
    error,
    reload: loadHobbies,
    setUserHobbies,
  };
};
