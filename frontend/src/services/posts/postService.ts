import { apiRequest } from '@/services/core/apiClient';

export interface PostMedia {
  url: string;
  storagePath?: string;
  contentType?: string;
  size?: number;
}

export interface AuthorProfile {
  userId: string;
  name?: string;
  username?: string;
  photo?: string;
  bio?: string;
}

export interface PostSummary {
  id: string;
  authorId: string;
  authorProfile?: AuthorProfile | null;
  caption?: string;
  media: PostMedia[];
  likeCount?: number;
  commentCount?: number;
  shareCount?: number;
  viewerHasLiked?: boolean;
  tags?: string[];
  location?: string | null;
  visibility?: string;
  createdAt?: number | null;
  updatedAt?: number | null;
}

export interface PostComment {
  id: string;
  userId: string;
  authorProfile?: AuthorProfile | null;
  content: string;
  createdAt?: number | null;
}

export interface GetPostsResponse {
  posts: PostSummary[];
  nextCursor?: string | null;
}

export interface CreatePostPayload {
  caption?: string;
  media: Array<{ base64: string; mimeType: string }>;
  tags?: string[];
  location?: string | null;
  visibility?: string;
}

export const getPosts = async (params?: {
  cursor?: string;
  limit?: number;
}) => {
  const searchParams = new URLSearchParams();
  if (params?.cursor) searchParams.append('cursor', params.cursor);
  if (params?.limit) searchParams.append('limit', params.limit.toString());

  const qs = searchParams.toString();
  const endpoint = qs ? `/posts?${qs}` : '/posts';
  return apiRequest(endpoint, { method: 'GET' });
};

export const createPost = async (payload: CreatePostPayload) => {
  return apiRequest('/posts', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const deletePost = async (postId: string) => {
  return apiRequest(`/posts/${postId}`, {
    method: 'DELETE',
  });
};

export const togglePostLike = async (postId: string) => {
  return apiRequest(`/posts/${postId}/like`, {
    method: 'POST',
  });
};

export const getPostComments = async (
  postId: string,
  params?: { limit?: number },
) => {
  const searchParams = new URLSearchParams();
  if (params?.limit) {
    searchParams.append('limit', params.limit.toString());
  }

  const qs = searchParams.toString();
  const endpoint = qs
    ? `/posts/${postId}/comments?${qs}`
    : `/posts/${postId}/comments`;

  return apiRequest(endpoint, { method: 'GET' });
};

export const addPostComment = async (
  postId: string,
  payload: { content: string },
) => {
  return apiRequest(`/posts/${postId}/comments`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};

export const deletePostComment = async (postId: string, commentId: string) => {
  return apiRequest(`/posts/${postId}/comments/${commentId}`, {
    method: 'DELETE',
  });
};

export const sharePost = async (
  postId: string,
  payload: { context?: string; note?: string; targetUserId?: string } = {},
) => {
  return apiRequest(`/posts/${postId}/share`, {
    method: 'POST',
    body: JSON.stringify(payload),
  });
};
