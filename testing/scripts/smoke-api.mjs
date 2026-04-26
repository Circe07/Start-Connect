const baseUrl =
  process.env.SMOKE_BASE_URL ||
  "http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api";

const email = process.env.SMOKE_USER_EMAIL;
const password = process.env.SMOKE_USER_PASSWORD;

async function run() {
  const health = await fetch(`${baseUrl}/health`);
  if (!health.ok) throw new Error(`Health check failed: ${health.status}`);
  const healthBody = await health.json();
  if (healthBody.status !== "ok") throw new Error("Health payload invalid");

  if (!email || !password) {
    console.log("Smoke health passed. Auth smoke skipped (set SMOKE_USER_EMAIL/PASSWORD to enable).");
    return;
  }

  const login = await fetch(`${baseUrl}/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });
  if (!login.ok) throw new Error(`Login smoke failed: ${login.status}`);

  const loginBody = await login.json();
  if (!loginBody.token) throw new Error("Login smoke missing token");

  const groups = await fetch(`${baseUrl}/groups/public?limit=5`, {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  });
  if (!groups.ok) throw new Error(`Groups smoke failed: ${groups.status}`);

  const activities = await fetch(`${baseUrl}/activities?city=Barcelona&limit=5`, {
    headers: { Authorization: `Bearer ${loginBody.token}` },
  });
  if (!activities.ok) throw new Error(`Activities smoke failed: ${activities.status}`);

  console.log("Smoke API checks passed.");
}

run().catch((err) => {
  console.error(err.message);
  process.exit(1);
});

