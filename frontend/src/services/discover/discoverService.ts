import API_CONFIG from '@/api/api-config';
import { getAuthToken } from '../storage/authStorage';

export type SwipeEntityType = 'person' | 'group' | 'activity';

export interface SwipeCandidate {
  id: string;
  type: SwipeEntityType;
  title: string;
  subtitle?: string;
  description?: string;
  raw?: any;
}

interface DiscoverResponse<T> {
  success: boolean;
  data?: T;
  error?: string;
}

const createRequestId = () =>
  `discover-${Date.now()}-${Math.random().toString(16).slice(2, 10)}`;

const parseBody = async (response: Response) => {
  const raw = await response.text();
  if (!raw.trim()) {
    return {};
  }
  try {
    return JSON.parse(raw);
  } catch {
    return {};
  }
};

const toError = (payload: any, fallback: string): string => {
  if (typeof payload?.error === 'string') return payload.error;
  if (typeof payload?.error?.message === 'string') return payload.error.message;
  if (typeof payload?.message === 'string') return payload.message;
  return fallback;
};

const discoverRequestWithFallback = async (
  candidates: string[],
  options: { method?: string; body?: any } = {},
): Promise<DiscoverResponse<any>> => {
  const token = getAuthToken();
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    'x-request-id': createRequestId(),
  };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }

  for (const endpoint of candidates) {
    const response = await fetch(`${API_CONFIG.BASE_URL}${endpoint}`, {
      method: options.method || 'GET',
      headers,
      body: options.body ? JSON.stringify(options.body) : undefined,
    });

    if (response.status === 404) {
      continue;
    }

    const payload = await parseBody(response);
    if (!response.ok || payload?.success === false) {
      return {
        success: false,
        error: toError(payload, `Request failed with status ${response.status}`),
      };
    }

    return { success: true, data: payload?.data ?? payload };
  }

  return {
    success: false,
    error: 'Discover endpoints are not available in this environment.',
  };
};

const normalizeCandidates = (payload: any): SwipeCandidate[] => {
  const activities = Array.isArray(payload?.activities) ? payload.activities : [];
  const groups = Array.isArray(payload?.groups) ? payload.groups : [];
  const users = Array.isArray(payload?.users) ? payload.users : [];

  const userCards: SwipeCandidate[] = users.map((item: any) => ({
    id: `person:${item.id || item.uid}`,
    type: 'person',
    title: item.name || item.username || item.email || 'Persona',
    subtitle: item.username ? `@${item.username}` : undefined,
    description: item.bio || '',
    raw: item,
  }));

  const groupCards: SwipeCandidate[] = groups.map((item: any) => ({
    id: `group:${item.id}`,
    type: 'group',
    title: item.name || 'Grupo',
    subtitle: item.sport || 'Grupo',
    description: item.description || '',
    raw: item,
  }));

  const activityCards: SwipeCandidate[] = activities.map((item: any) => ({
    id: `activity:${item.id}`,
    type: 'activity',
    title: item.title || item.name || 'Actividad',
    subtitle: item.sport || item.category || 'Actividad',
    description: item.description || '',
    raw: item,
  }));

  return [...userCards, ...groupCards, ...activityCards];
};

export const getSwipeCandidates = async (): Promise<
  DiscoverResponse<{ items: SwipeCandidate[] }>
> => {
  const response = await discoverRequestWithFallback(
    ['/v1/discover/activities', '/discover/activities'],
    { method: 'GET' },
  );

  if (!response.success) {
    return { success: false, error: response.error };
  }

  return {
    success: true,
    data: { items: normalizeCandidates(response.data || {}) },
  };
};

export const submitSwipe = async (args: {
  candidate: SwipeCandidate;
  direction: 'like' | 'pass';
}): Promise<DiscoverResponse<{ isMatch?: boolean }>> => {
  const profileId =
    args.candidate.raw?.id ||
    args.candidate.raw?.uid ||
    args.candidate.id.replace(/^(person|group|activity):/, '');

  return discoverRequestWithFallback(['/v1/discover/swipe', '/discover/swipe'], {
    method: 'POST',
    body: {
      targetType: args.candidate.type,
      targetId: profileId,
      direction: args.direction,
    },
  });
};

export const getSwipeMatches = async (): Promise<DiscoverResponse<any>> =>
  discoverRequestWithFallback(['/v1/discover/matches', '/discover/matches'], {
    method: 'GET',
  });
