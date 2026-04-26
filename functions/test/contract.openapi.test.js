const fs = require('fs');
const path = require('path');

describe('OpenAPI contract coverage (critical paths)', () => {
  const root = path.resolve(__dirname, '..', '..');
  const openapi = fs.readFileSync(path.join(root, 'functions/docs/openapi.yaml'), 'utf8');
  const authRoutes = fs.readFileSync(path.join(root, 'functions/src/routes/auth.js'), 'utf8');
  const groupRoutes = fs.readFileSync(path.join(root, 'functions/src/routes/groups.js'), 'utf8');
  const actRoutes = fs.readFileSync(path.join(root, 'functions/src/routes/activities.js'), 'utf8');
  const swipeRoutes = fs.readFileSync(path.join(root, 'functions/src/routes/swipes.js'), 'utf8');
  const matchRoutes = fs.readFileSync(path.join(root, 'functions/src/routes/matches.js'), 'utf8');
  const app = fs.readFileSync(path.join(root, 'functions/src/app.js'), 'utf8');

  test('openapi includes critical MVP paths', () => {
    [
      '/health',
      '/auth/register',
      '/auth/login',
      '/auth/refresh',
      '/activities',
      '/swipes',
      '/matches',
      '/groups/public',
      '/groups/{id}/join',
      '/groups/{id}/messages',
    ].forEach((p) => expect(openapi).toContain(p));
  });

  test('critical paths are mounted in app and routes', () => {
    expect(app).toMatch(/app\.use\(['"]\/auth['"],\s*authRoutes\)/);
    expect(app).toMatch(/app\.use\(['"]\/groups['"],\s*groupsRoutes\)/);
    expect(app).toMatch(/app\.use\(['"]\/activities['"],\s*activitiesRoutes\)/);
    expect(app).toMatch(/app\.use\(['"]\/swipes['"],\s*swipesRoutes\)/);
    expect(app).toMatch(/app\.use\(['"]\/matches['"],\s*matchesRoutes\)/);

    expect(authRoutes).toContain('Router.post("/register"');
    expect(authRoutes).toContain('Router.post("/login"');
    expect(authRoutes).toContain('Router.post("/refresh"');
    expect(groupRoutes).toContain('router.get("/public"');
    expect(groupRoutes).toContain('router.post("/:id/join"');
    expect(groupRoutes).toContain('router.post("/:id/messages"');
    expect(actRoutes).toContain('router.get("/", authMiddleware');
    expect(swipeRoutes).toContain('router.post("/", authMiddleware');
    expect(matchRoutes).toContain('router.get("/", authMiddleware');
  });
});
