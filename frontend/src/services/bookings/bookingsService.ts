import { apiRequest } from '../core/apiClient';
import { AuthResponse } from '@/types/interface/auth/authResponse';

export interface BookingData {
  venueId: string;
  facilityId: string;
  date: string;
  startTime: string;
  endTime: string;
  notes?: string;
}

export interface AvailabilityResponse {
  success: boolean;
  taken: Array<{
    start: string;
    end: string;
  }>;
  error?: string;
}

/**
 * Create a new booking
 * POST /bookings
 */
export const createBooking = async (
  bookingData: BookingData,
): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/bookings', {
    method: 'POST',
    body: JSON.stringify(bookingData),
  });
  return apiResponse;
};

/**
 * Get user's bookings
 * GET /bookings/me
 */
export const getMyBookings = async (): Promise<AuthResponse> => {
  const apiResponse = await apiRequest('/bookings/me', { method: 'GET' });
  return apiResponse;
};

/**
 * Get availability for a facility on a specific date
 * GET /bookings/:venueId/:facilityId/:date
 */
export const getAvailability = async (
  venueId: string,
  facilityId: string,
  date: string,
): Promise<AvailabilityResponse> => {
  const apiResponse = await apiRequest(
    `/bookings/${venueId}/${facilityId}/${date}`,
    { method: 'GET' },
  );

  if (apiResponse.success) {
    return apiResponse;
  }

  return {
    success: false,
    taken: [],
    error: apiResponse.error || 'Failed to fetch availability',
  };
};
