import { existsSync, readFileSync } from "node:fs";
import { resolve } from "node:path";

const requiredFiles = [
  "package.json",
  "firebase.json",
  ".env",
  ".env.example",
  "functions/package.json",
  "functions/src/app.js",
  "functions/docs/openapi.yaml",
];

const missing = requiredFiles.filter((f) => !existsSync(resolve(process.cwd(), f)));
if (missing.length > 0) {
  console.error("Missing required files:", missing);
  process.exit(1);
}

const envPath = resolve(process.cwd(), ".env");
const envText = readFileSync(envPath, "utf8");
const requiredEnv = ["AUTH_API_KEY", "FIREBASE_PROJECT_ID", "FIREBASE_DATABASE_ID"];
const missingEnv = requiredEnv.filter((k) => !new RegExp(`^${k}=.+$`, "m").test(envText));
if (missingEnv.length > 0) {
  console.error("Missing required env vars in .env:", missingEnv);
  process.exit(1);
}

console.log("Smoke env checks passed.");
console.log("Next commands:");
console.log("  1) npm install");
console.log("  2) cd functions && npm install");
console.log("  3) firebase emulators:start --only functions,firestore");
console.log("  4) npm test");

