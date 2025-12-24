import { apiRequest } from '@/services/core/apiClient';

export interface FriendProfile {
  userId: string;
  name?: string;
  username?: string;
  photo?: string;
  bio?: string;
}

export interface FriendSummary {
  id: string;
  friendId: string;
  profile: FriendProfile;
  createdAt?: any;
  updatedAt?: any;
}

export const getFriends = async () => {
  return apiRequest('/friends', { method: 'GET' });
};

export const addFriend = async (friendId: string) => {
  return apiRequest('/friends', {
    method: 'POST',
    body: JSON.stringify({ friendId }),
  });
};

export const removeFriend = async (friendId: string) => {
  return apiRequest(`/friends/${friendId}`, {
    method: 'DELETE',
  });
};
