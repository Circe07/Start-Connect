import API_CONFIG from '@/config/api';
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
  warnings?: string[];
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

const normalizeUsers = (users: any[]): SwipeCandidate[] =>
  users
    .filter(item => item?.id || item?.uid)
    .map((item: any) => ({
      id: `person:${item.id || item.uid}`,
      type: 'person' as const,
      title: item.name || item.username || item.email || 'Persona',
      subtitle: item.username ? `@${item.username}` : undefined,
      description: item.bio || '',
      raw: item,
    }));

const normalizeGroups = (groups: any[]): SwipeCandidate[] =>
  groups
    .filter(item => item?.id)
    .map((item: any) => ({
      id: `group:${item.id}`,
      type: 'group' as const,
      title: item.name || 'Grupo',
      subtitle: item.sport || 'Grupo',
      description: item.description || '',
      raw: item,
    }));

const normalizeActivities = (activities: any[]): SwipeCandidate[] =>
  activities
    .filter(item => item?.id)
    .map((item: any) => ({
      id: `activity:${item.id}`,
      type: 'activity' as const,
      title: item.title || item.name || 'Actividad',
      subtitle: item.sport || item.category || 'Actividad',
      description: item.description || '',
      raw: item,
    }));

const dedupeCandidates = (items: SwipeCandidate[]): SwipeCandidate[] => {
  const seen = new Set<string>();
  return items.filter(item => {
    if (seen.has(item.id)) {
      return false;
    }
    seen.add(item.id);
    return true;
  });
};

const getUsersSource = async (): Promise<DiscoverResponse<SwipeCandidate[]>> => {
  const response = await discoverRequestWithFallback(
    ['/v1/users?limit=20', '/users?limit=20'],
    { method: 'GET' },
  );

  if (!response.success) {
    return { success: false, error: response.error };
  }

  const users = Array.isArray(response.data?.users) ? response.data.users : [];
  return { success: true, data: normalizeUsers(users) };
};

const getGroupsSource = async (): Promise<DiscoverResponse<SwipeCandidate[]>> => {
  const response = await discoverRequestWithFallback(
    ['/v1/groups/public', '/groups/public'],
    { method: 'GET' },
  );

  if (!response.success) {
    return { success: false, error: response.error };
  }

  const groups = Array.isArray(response.data?.groups) ? response.data.groups : [];
  return { success: true, data: normalizeGroups(groups) };
};

const getActivitiesSource = async (): Promise<DiscoverResponse<SwipeCandidate[]>> => {
  const response = await discoverRequestWithFallback(
    ['/v1/discover/activities', '/discover/activities'],
    { method: 'GET' },
  );

  if (!response.success) {
    return { success: false, error: response.error };
  }

  const activities = Array.isArray(response.data?.activities)
    ? response.data.activities
    : [];
  return { success: true, data: normalizeActivities(activities) };
};

export const getSwipeCandidates = async (): Promise<
  DiscoverResponse<{ items: SwipeCandidate[] }>
> => {
  const [usersResult, groupsResult, activitiesResult] = await Promise.all([
    getUsersSource(),
    getGroupsSource(),
    getActivitiesSource(),
  ]);

  const warnings: string[] = [];
  if (!usersResult.success) warnings.push(`users: ${usersResult.error}`);
  if (!groupsResult.success) warnings.push(`groups: ${groupsResult.error}`);
  if (!activitiesResult.success) warnings.push(`activities: ${activitiesResult.error}`);

  const merged = dedupeCandidates([
    ...(usersResult.data || []),
    ...(groupsResult.data || []),
    ...(activitiesResult.data || []),
  ]);

  if (merged.length === 0) {
    return {
      success: false,
      error:
        warnings[0] ||
        'No se encontraron datos de personas, grupos ni actividades.',
      warnings,
    };
  }

  return {
    success: true,
    data: { items: merged },
    warnings,
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
