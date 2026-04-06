jest.mock("../src/config/firebase", () => {
  return {
    admin: { auth: () => ({}) },
    db: {},
    FieldValue: { serverTimestamp: () => "SERVER_TIME" },
  };
});

// Mock node-fetch used by controller
jest.mock("node-fetch", () => jest.fn());

const fetch = require("node-fetch");
const { createRes } = require("./helpers");

describe("auth.refresh", () => {
  beforeEach(() => {
    process.env.AUTH_API_KEY = "test-key";
    fetch.mockReset();
  });

  test("returns 400 if refreshToken missing", async () => {
    const { refresh } = require("../src/controllers/auth.controller");
    const req = { body: {} };
    const res = createRes();
    await refresh(req, res);
    expect(res.statusCode).toBe(400);
  });

  test("returns 200 with token fields on success", async () => {
    const { refresh } = require("../src/controllers/auth.controller");

    fetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        id_token: "newIdToken",
        refresh_token: "newRefresh",
        user_id: "u1",
      }),
    });

    const req = { body: { refreshToken: "rt1" } };
    const res = createRes();
    await refresh(req, res);

    expect(res.statusCode).toBe(200);
    expect(res.body).toEqual({
      success: true,
      token: "newIdToken",
      refreshToken: "newRefresh",
      uid: "u1",
    });
  });
});

