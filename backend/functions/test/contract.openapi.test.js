const fs = require('fs');
const path = require('path');

/**
 * OpenAPI + app mount contract: paths must stay aligned with `src/app.js` and `docs/openapi.yaml`.
 * Spec is a living document; this test only guards critical MVP surface.
 */
describe('OpenAPI contract coverage (critical paths)', () => {
  const base = path.join(__dirname, '..');
  const openapi = fs.readFileSync(path.join(base, 'docs', 'openapi.yaml'), 'utf8');
  const app = fs.readFileSync(path.join(base, 'src', 'app.js'), 'utf8');

  test('openapi includes health and auth MVP paths', () => {
    ['/health', '/auth/register', '/auth/login'].forEach((p) => expect(openapi).toContain(p));
  });

  test('openapi includes core discovery and groups paths', () => {
    [
      '/activities',
      '/swipes',
      '/matches',
      '/groups/public',
      '/groups/{id}/join',
      '/groups/{id}/messages',
    ].forEach((p) => expect(openapi).toContain(p));
  });

  test('app mounts auth, v1, groups, activities, experiences, and experience-bookings', () => {
    expect(app).toContain("app.use('/auth', authRoutes)");
    expect(app).toContain("app.use('/api/v1/auth', authRoutes)");
    expect(app).toContain("app.use('/api/v1', apiVersionV1)");
    expect(app).toContain("app.use('/groups', groupsRoutes)");
    expect(app).toContain("app.use('/api/v1/groups', writeRateLimit, groupsRoutes)");
    expect(app).toContain("app.use('/activities', activitiesRoutes)");
    expect(app).toContain("app.use('/api/v1/activities', activitiesRoutes)");
    expect(app).toContain("app.use('/experiences', experiencesRoutes)");
    expect(app).toContain("app.use('/api/v1/experiences', experiencesRoutes)");
    expect(app).toContain("app.use('/experience-bookings', experienceBookingsRoutes)");
    expect(app).toContain("app.use('/api/v1/experience-bookings', experienceBookingsRoutes)");
  });
});
