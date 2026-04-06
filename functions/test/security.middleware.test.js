const { createRes } = require("./helpers");
const fs = require("fs");
const path = require("path");

describe("Security middleware tests", () => {
  let errorSpy;

  beforeEach(() => {
    errorSpy = jest.spyOn(console, "error").mockImplementation(() => {});
  });

  afterEach(() => {
    errorSpy.mockRestore();
  });

  test("auth middleware rejects missing bearer token", async () => {
    jest.resetModules();
    jest.doMock("../src/config/firebase", () => ({
      admin: { auth: () => ({ verifyIdToken: async () => ({ uid: "u1" }) }) },
    }));
    const authMiddleware = require("../src/middleware/auth");
    const req = { headers: {} };
    const res = createRes();
    const next = jest.fn();
    await authMiddleware(req, res, next);
    expect(res.statusCode).toBe(401);
    expect(next).not.toHaveBeenCalled();
  });

  test("admin middleware enforces admin role", async () => {
    jest.resetModules();
    jest.doMock("../src/config/firebase", () => ({
      admin: { auth: () => ({ verifyIdToken: async () => ({ uid: "u1", role: "member" }) }) },
    }));
    const adminMiddleware = require("../src/middleware/admin");
    const req = { headers: { authorization: "Bearer token1" } };
    const res = createRes();
    const next = jest.fn();
    await adminMiddleware(req, res, next);
    expect(res.statusCode).toBe(403);
    expect(next).not.toHaveBeenCalled();
  });

  test("rate limit middleware is configured", () => {
    const { authRateLimit } = require("../src/middleware/rateLimit");
    expect(typeof authRateLimit).toBe("function");
  });

  test("error handler does not expose internal details for 500", () => {
    const errorHandler = require("../src/middleware/errorHandler");
    const req = {};
    const res = createRes();
    const err = new Error("internal stack detail");
    errorHandler(err, req, res, () => {});
    expect(res.statusCode).toBe(500);
    expect(res.body.message).toBe("Error interno.");
    expect(JSON.stringify(res.body)).not.toContain("internal stack detail");
  });

  test("app contains CORS allowlist logic", () => {
    const appSource = fs.readFileSync(path.resolve(__dirname, "../src/app.js"), "utf8");
    expect(appSource).toContain("CORS_ORIGINS");
    expect(appSource).toContain("origin not allowed");
  });
});

