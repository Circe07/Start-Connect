import {
  getCurrentUser,
  getUserById,
  searchUsers,
  updateCurrentUser,
} from '../../src/services/user/userService';
import {
  addHobbiesToUser,
  getAllHobbies,
  removeHobbyFromUser,
} from '../../src/services/hobbies/hobbiesService';
import { getNearby, searchMapLocations } from '../../src/services/maps/mapsService';
import {
  createBooking,
  getAvailability,
  getMyBookings,
} from '../../src/services/bookings/bookingsService';
import { addFriend, getFriends, removeFriend } from '../../src/services/friends/friendsService';
import { getCenters } from '../../src/services/centers/authCenters';
import { setAuthToken } from '../../src/services/storage/authStorage';

jest.mock('../../src/services/core/apiClient', () => ({
  apiRequest: jest.fn(),
}));

const { apiRequest } = jest.requireMock('../../src/services/core/apiClient');

describe('user and domain service behavior', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    setAuthToken(null);
    apiRequest.mockResolvedValue({ success: true, data: {} });
  });

  it('handles getCurrentUser without token', async () => {
    const res = await getCurrentUser();
    expect(res.success).toBe(false);
    expect(res.error).toContain('No authentication token');
  });

  it('falls back to /auth/me when /users/me has no user', async () => {
    setAuthToken('token');
    apiRequest
      .mockResolvedValueOnce({ success: true, data: {} })
      .mockResolvedValueOnce({ success: true, data: { user: { id: 'u1' } } });

    const res = await getCurrentUser();

    expect(apiRequest).toHaveBeenNthCalledWith(1, '/users/me', { method: 'GET' });
    expect(apiRequest).toHaveBeenNthCalledWith(2, '/auth/me', { method: 'GET' });
    expect(res.success).toBe(true);
    expect(res.user?.id).toBe('u1');
  });

  it('calls user search and profile endpoints', async () => {
    await getUserById('uid1');
    expect(apiRequest).toHaveBeenCalledWith('/users/uid1', { method: 'GET' });

    await updateCurrentUser({ bio: 'hello' });
    expect(apiRequest).toHaveBeenCalledWith('/users/me', {
      method: 'PATCH',
      body: JSON.stringify({ bio: 'hello' }),
    });

    apiRequest.mockResolvedValueOnce({ success: true, data: { users: [{ id: 'u1' }] } });
    const search = await searchUsers('ale', 10);
    expect(apiRequest).toHaveBeenCalledWith('/users?q=ale&limit=10', { method: 'GET' });
    expect(search.users?.length).toBe(1);
  });

  it('calls hobbies, maps, bookings, friends and centers endpoints', async () => {
    await getAllHobbies();
    expect(apiRequest).toHaveBeenCalledWith('/hobbies', { method: 'GET' });

    await addHobbiesToUser(['h1', 'h2']);
    expect(apiRequest).toHaveBeenCalledWith('/hobbies/me', {
      method: 'POST',
      body: JSON.stringify({ hobbies: ['h1', 'h2'] }),
    });

    await removeHobbyFromUser('h1');
    expect(apiRequest).toHaveBeenCalledWith('/hobbies/h1', {
      method: 'DELETE',
      body: JSON.stringify({ hobbies: ['h1'] }),
    });

    await getNearby({ lat: 1.1, lng: 2.2, radius: 5000 });
    expect(apiRequest).toHaveBeenCalledWith(
      '/maps/nearby?lat=1.1&lng=2.2&radius=5000',
      { method: 'GET' },
    );

    await searchMapLocations('Madrid', 40.4, -3.7);
    expect(apiRequest).toHaveBeenCalledWith('/maps/search?q=Madrid&lat=40.4&lng=-3.7', {
      method: 'GET',
    });

    await createBooking({
      venueId: 'v1',
      facilityId: 'f1',
      date: '2026-01-01',
      startTime: '10:00',
      endTime: '11:00',
    });
    expect(apiRequest).toHaveBeenCalledWith('/bookings', expect.any(Object));

    await getMyBookings();
    expect(apiRequest).toHaveBeenCalledWith('/bookings/me', { method: 'GET' });

    apiRequest.mockResolvedValueOnce({ success: false, error: 'bad' });
    const availability = await getAvailability('v1', 'f1', '2026-01-01');
    expect(availability.success).toBe(false);
    expect(availability.taken).toEqual([]);

    await getFriends();
    expect(apiRequest).toHaveBeenCalledWith('/friends', { method: 'GET' });

    await addFriend('u2');
    expect(apiRequest).toHaveBeenCalledWith('/friends', {
      method: 'POST',
      body: JSON.stringify({ friendId: 'u2' }),
    });

    await removeFriend('u2');
    expect(apiRequest).toHaveBeenCalledWith('/friends/u2', { method: 'DELETE' });

    await getCenters();
    expect(apiRequest).toHaveBeenCalledWith('/centers', { method: 'GET' });
  });
});
