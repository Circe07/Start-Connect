import { apiRequest } from '../core/apiClient';
import { AuthResponse } from '@/types/interface/auth/authResponse';

export interface LocationQuery {
  lat: number;
  lng: number;
  radius?: number; // in meters, default 5000
}

export interface NearbyCenter {
  id: string;
  name: string;
  address: string;
  location: {
    lat: number;
    lng: number;
  };
  distance?: number; // in meters
  services?: string[];
  description?: string;
}

export interface MapsResponse extends AuthResponse {
  centers?: NearbyCenter[];
  data?: NearbyCenter[];
}

/**
 * Find nearby centers
 * GET /maps/nearby?lat=40.416&lng=-3.703&radius=5000
 */
export const getNearby = async (
  query: LocationQuery,
): Promise<MapsResponse> => {
  const params = new URLSearchParams({
    lat: query.lat.toString(),
    lng: query.lng.toString(),
    ...(query.radius && { radius: query.radius.toString() }),
  });

  const apiResponse = await apiRequest(`/maps/nearby?${params.toString()}`, {
    method: 'GET',
  });

  return apiResponse;
};

/**
 * Search centers by location name or query
 * GET /maps/search?q=Madrid&lat=40.4&lng=-3.7
 */
export const searchMapLocations = async (
  query: string,
  lat?: number,
  lng?: number,
): Promise<MapsResponse> => {
  const params = new URLSearchParams({ q: query });

  if (lat !== undefined) params.append('lat', lat.toString());
  if (lng !== undefined) params.append('lng', lng.toString());

  const apiResponse = await apiRequest(`/maps/search?${params.toString()}`, {
    method: 'GET',
  });

  return apiResponse;
};
