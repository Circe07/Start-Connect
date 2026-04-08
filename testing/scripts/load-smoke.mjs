const baseUrl =
  process.env.BASE_URL || "http://127.0.0.1:5001/startandconnect-c44b2/europe-west1/api";
const durationMs = Number(process.env.LOAD_SMOKE_DURATION_MS || 15000);
const concurrency = Number(process.env.LOAD_SMOKE_CONCURRENCY || 20);

const target = `${baseUrl}/health`;
const startedAt = Date.now();
let total = 0;
let failed = 0;
let durations = [];

async function worker() {
  while (Date.now() - startedAt < durationMs) {
    const t0 = performance.now();
    try {
      const response = await fetch(target);
      if (!response.ok) failed++;
    } catch {
      failed++;
    } finally {
      durations.push(performance.now() - t0);
      total++;
    }
  }
}

await Promise.all(Array.from({ length: concurrency }, () => worker()));

durations.sort((a, b) => a - b);
const p95Index = Math.min(durations.length - 1, Math.floor(durations.length * 0.95));
const p95 = durations[p95Index] || 0;
const failureRate = total > 0 ? (failed / total) * 100 : 0;

console.log(
  JSON.stringify(
    {
      target,
      durationMs,
      concurrency,
      totalRequests: total,
      failedRequests: failed,
      failureRatePct: Number(failureRate.toFixed(2)),
      p95Ms: Number(p95.toFixed(2)),
    },
    null,
    2
  )
);

if (failureRate > 3) {
  console.error("Load smoke failed: failure rate too high.");
  process.exit(1);
}
