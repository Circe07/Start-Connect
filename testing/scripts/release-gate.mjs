import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const checklistPath = resolve(process.cwd(), "testing/release/release-gates.md");
const txt = readFileSync(checklistPath, "utf8");
const requiredMarkers = [
  "Environment & Smoke",
  "Contract Validation",
  "E2E MVP Flows",
  "Security",
  "Performance Smoke",
  "Frontend Connectivity Kit",
];

const missing = requiredMarkers.filter((m) => !txt.includes(m));
if (missing.length > 0) {
  console.error("Release gate document incomplete:", missing);
  process.exit(1);
}

console.log("Release gate checklist is present and complete.");

