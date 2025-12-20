import { GroupResponse } from '@/types/interface/group/groupResponse';
import { apiRequest } from '../core/apiClient';

export const getPublicGroups = async (): Promise<GroupResponse> => {
  const { data } = await apiRequest(`/groups/public`, { method: 'GET' });
  return data;
};
