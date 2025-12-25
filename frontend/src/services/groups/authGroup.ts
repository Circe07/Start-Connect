import { Group } from '@/types/interface/group/group';
import { GroupMessage } from '@/types/interface/group/groupMessage';
import { GroupRequest } from '@/types/interface/group/groupRequest';
import { GroupResponse } from '@/types/interface/group/groupResponse';
import { apiRequest } from '../core/apiClient';

export const getPublicGroups = async (): Promise<GroupResponse> => {
  const response = await apiRequest(`/groups/public`, { method: 'GET' });
  if (!response.success) {
    throw new Error(response.error || 'No se pudieron cargar los grupos.');
  }
  return response.data as GroupResponse;
};

export const getMyGroups = async (): Promise<Group[]> => {
  const response = await apiRequest(`/groups/my-groups`, { method: 'GET' });
  if (!response.success) {
    throw new Error(response.error || 'No se pudieron cargar tus grupos.');
  }
  return (response.data?.groups || []) as Group[];
};

export const getGroupById = async (groupId: string): Promise<Group> => {
  const response = await apiRequest(`/groups/${groupId}`, { method: 'GET' });
  if (!response.success) {
    throw new Error(response.error || 'No se pudo cargar el grupo.');
  }
  return response.data?.group as Group;
};

export const joinGroup = async (groupId: string) => {
  return apiRequest(`/groups/${groupId}/join`, { method: 'POST' });
};

export const leaveGroup = async (groupId: string) => {
  return apiRequest(`/groups/${groupId}/leave`, { method: 'POST' });
};

export const sendGroupRequest = async (groupId: string) => {
  return apiRequest(`/group-requests/${groupId}`, { method: 'POST' });
};

export const getGroupRequests = async (
  groupId: string,
): Promise<GroupRequest[]> => {
  const response = await apiRequest(`/group-requests/${groupId}`, {
    method: 'GET',
  });
  if (!response.success) {
    throw new Error(response.error || 'No se pudieron cargar las solicitudes.');
  }
  return (response.data?.requests || []) as GroupRequest[];
};

export const approveGroupRequest = async (requestId: string) => {
  return apiRequest(`/group-requests/${requestId}/approve`, {
    method: 'PATCH',
  });
};

export const rejectGroupRequest = async (requestId: string) => {
  return apiRequest(`/group-requests/${requestId}/reject`, {
    method: 'PATCH',
  });
};

export const getGroupMessages = async (
  groupId: string,
  params?: { limit?: number; startAfterId?: string },
): Promise<{
  messages: GroupMessage[];
  hasMore?: boolean;
  nextStartAfterId?: string | null;
}> => {
  const searchParams = new URLSearchParams();
  if (params?.limit) {
    searchParams.append('limit', params.limit.toString());
  }
  if (params?.startAfterId) {
    searchParams.append('startAfterId', params.startAfterId);
  }

  const qs = searchParams.toString();
  const endpoint = qs
    ? `/groups/${groupId}/messages?${qs}`
    : `/groups/${groupId}/messages`;

  const response = await apiRequest(endpoint, { method: 'GET' });
  if (!response.success) {
    throw new Error(response.error || 'No se pudieron cargar los mensajes.');
  }

  return {
    messages: (response.data?.messages || []) as GroupMessage[],
    hasMore: response.data?.hasMore,
    nextStartAfterId: response.data?.nextStartAfterId,
  };
};

export const sendGroupMessage = async (
  groupId: string,
  payload: { content: string },
) => {
  return apiRequest(`/groups/${groupId}/messages`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
