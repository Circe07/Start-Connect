const fs = require('fs');
const path = require('path');

describe('v1 route mounts', () => {
  test('app mounts v1 routes for remaining modules', () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, '../src/app.js'), 'utf8');
    [
      '/api/v1/admin',
      '/api/v1/hobbies',
      '/api/v1/contacts',
      '/api/v1/groupsRequests',
      '/api/v1/maps',
      '/api/v1/centers',
      '/api/v1/bookings',
      '/api/v1/activities',
      '/api/v1/swipes',
      '/api/v1/matches',
    ].forEach((route) => {
      expect(appSource).toContain(route);
    });
  });
});
