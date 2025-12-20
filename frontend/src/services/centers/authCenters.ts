import { apiRequest } from '../core/apiClient';
import type { CenterResponse } from '@/types/interface/centers/centerResponse';

export const getCenters = async (): Promise<CenterResponse> => {
  const { data } = await apiRequest('/centers', { method: 'GET' });
  return data;
};
