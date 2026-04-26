import { readFileSync } from "node:fs";
import { resolve } from "node:path";

const checklistPath = resolve(process.cwd(), "testing/release/release-gates.md");
const txt = readFileSync(checklistPath, "utf8");
const sloPath = resolve(process.cwd(), "testing/release/slo-targets.md");
const rollbackPath = resolve(process.cwd(), "testing/release/rollback-runbook.md");
const observabilityPath = resolve(process.cwd(), "testing/release/observability-runbook.md");
const migrationPath = resolve(process.cwd(), "testing/release/layer-migration-status.md");
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

const sloText = readFileSync(sloPath, "utf8");
const rollbackText = readFileSync(rollbackPath, "utf8");
const requiredSloMarkers = ["Availability SLO", "Latency SLO", "Reliability SLO", "Alert Thresholds"];
const missingSloMarkers = requiredSloMarkers.filter((m) => !sloText.includes(m));
if (missingSloMarkers.length > 0) {
  console.error("SLO document incomplete:", missingSloMarkers);
  process.exit(1);
}

const requiredRollbackMarkers = ["Trigger Conditions", "Fast Rollback Procedure", "Communication"];
const missingRollbackMarkers = requiredRollbackMarkers.filter((m) => !rollbackText.includes(m));
if (missingRollbackMarkers.length > 0) {
  console.error("Rollback runbook incomplete:", missingRollbackMarkers);
  process.exit(1);
}

const observabilityText = readFileSync(observabilityPath, "utf8");
const observabilityMarkers = ["Core Metrics", "Alert Policies", "Dashboard Panels", "Incident Response"];
const missingObservabilityMarkers = observabilityMarkers.filter((m) => !observabilityText.includes(m));
if (missingObservabilityMarkers.length > 0) {
  console.error("Observability runbook incomplete:", missingObservabilityMarkers);
  process.exit(1);
}

const migrationText = readFileSync(migrationPath, "utf8");
const migrationMarkers = ["Migrated to `transport -> domain -> data`", "Remaining Work"];
const missingMigrationMarkers = migrationMarkers.filter((m) => !migrationText.includes(m));
if (missingMigrationMarkers.length > 0) {
  console.error("Layer migration status incomplete:", missingMigrationMarkers);
  process.exit(1);
}

console.log("Release gate checklist is present and complete.");

