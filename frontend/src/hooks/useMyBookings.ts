import { useQuery } from '@tanstack/react-query';
import { getMyBookings } from '@/services/bookings/bookingsService';

export interface Booking {
  id: string;
  userId: string;
  venueId: string;
  facilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  status?: string;
  createdAt?: any;
}

const extractBookings = (response: any): Booking[] => {
  if (!response) {
    return [];
  }

  const payload = response.data || {};
  if (Array.isArray(payload.bookings)) {
    return payload.bookings as Booking[];
  }

  return [];
};

export default function useMyBookings() {
  return useQuery<Booking[]>({
    queryKey: ['bookings'],
    queryFn: async () => {
      const response = await getMyBookings();

      if (!response.success) {
        throw new Error(response.error || 'Failed to fetch bookings');
      }

      return extractBookings(response);
    },
  });
}
