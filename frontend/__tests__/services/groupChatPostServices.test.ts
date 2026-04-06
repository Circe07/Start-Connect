import {
  getGroupMessages,
  getMyGroups,
  getPublicGroups,
  sendGroupMessage,
} from '../../src/services/groups/authGroup';
import {
  createChat,
  getChatMessages,
  markChatAsRead,
  sendChatMessage,
} from '../../src/services/chat/chatService';
import {
  addPostComment,
  createPost,
  deletePost,
  deletePostComment,
  getPostComments,
  getPosts,
  sharePost,
  togglePostLike,
} from '../../src/services/posts/postService';

jest.mock('../../src/services/core/apiClient', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = jest.requireMock('../../src/services/core/apiClient');

describe('group, chat and post service routes', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    apiRequest.mockResolvedValue({ success: true, data: {} });
  });

  it('builds group endpoints and maps group arrays', async () => {
    apiRequest.mockResolvedValueOnce({ success: true, data: { groups: [{ id: 'g1' }] } });
    await expect(getPublicGroups()).resolves.toEqual({ groups: [{ id: 'g1' }] });
    expect(apiRequest).toHaveBeenCalledWith('/groups/public', { method: 'GET' });

    apiRequest.mockResolvedValueOnce({ success: true, data: { groups: [{ id: 'g2' }] } });
    await expect(getMyGroups()).resolves.toEqual([{ id: 'g2' }]);
    expect(apiRequest).toHaveBeenCalledWith('/groups/my-groups', { method: 'GET' });
  });

  it('builds group messages query string', async () => {
    await getGroupMessages('g1', { limit: 20, startAfterId: 'm5' });
    expect(apiRequest).toHaveBeenCalledWith(
      '/groups/g1/messages?limit=20&startAfterId=m5',
      { method: 'GET' },
    );

    await sendGroupMessage('g1', { content: 'hola' });
    expect(apiRequest).toHaveBeenCalledWith('/groups/g1/messages', {
      method: 'POST',
      body: JSON.stringify({ content: 'hola' }),
    });
  });

  it('builds chat endpoints with query params', async () => {
    await createChat(['u1', 'u2'], { source: 'test' });
    expect(apiRequest).toHaveBeenCalledWith('/chats', {
      method: 'POST',
      body: JSON.stringify({ participants: ['u1', 'u2'], metadata: { source: 'test' } }),
    });

    await getChatMessages('c1', { limit: 10, cursor: 'next1' });
    expect(apiRequest).toHaveBeenCalledWith('/chats/c1/messages?limit=10&cursor=next1', {
      method: 'GET',
    });

    await sendChatMessage('c1', { text: 'hello' });
    expect(apiRequest).toHaveBeenCalledWith('/chats/c1/messages', {
      method: 'POST',
      body: JSON.stringify({ text: 'hello' }),
    });

    await markChatAsRead('c1');
    expect(apiRequest).toHaveBeenCalledWith('/chats/c1/read', { method: 'POST' });
  });

  it('builds post endpoints with cursor/limit and actions', async () => {
    await getPosts({ cursor: 'abc', limit: 5 });
    expect(apiRequest).toHaveBeenCalledWith('/posts?cursor=abc&limit=5', { method: 'GET' });

    await createPost({ media: [{ base64: 'x', mimeType: 'image/png' }] });
    expect(apiRequest).toHaveBeenCalledWith('/posts', {
      method: 'POST',
      body: JSON.stringify({ media: [{ base64: 'x', mimeType: 'image/png' }] }),
    });

    await deletePost('p1');
    expect(apiRequest).toHaveBeenCalledWith('/posts/p1', { method: 'DELETE' });

    await togglePostLike('p1');
    expect(apiRequest).toHaveBeenCalledWith('/posts/p1/like', { method: 'POST' });

    await getPostComments('p1', { limit: 15 });
    expect(apiRequest).toHaveBeenCalledWith('/posts/p1/comments?limit=15', { method: 'GET' });

    await addPostComment('p1', { content: 'nice' });
    expect(apiRequest).toHaveBeenCalledWith('/posts/p1/comments', {
      method: 'POST',
      body: JSON.stringify({ content: 'nice' }),
    });

    await deletePostComment('p1', 'c9');
    expect(apiRequest).toHaveBeenCalledWith('/posts/p1/comments/c9', { method: 'DELETE' });

    await sharePost('p1', { note: 'share' });
    expect(apiRequest).toHaveBeenCalledWith('/posts/p1/share', {
      method: 'POST',
      body: JSON.stringify({ note: 'share' }),
    });
  });
});
