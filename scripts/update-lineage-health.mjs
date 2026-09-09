import { readFile, writeFile, mkdir } from "node:fs/promises";

const registryPath = new URL("../src/data/lineage-registry.json", import.meta.url);
const outPath = new URL("../public/data/lineage-health.json", import.meta.url);
const registry = JSON.parse(await readFile(registryPath, "utf8"));

const TIMEOUT_MS = 15000;
const USER_AGENT = "BondStats-Data-Lineage-Health/2.0 (+https://www.bondstats.org/)";

async function checkSource(source) {
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try {
    let response;
    try {
      response = await fetch(source.health_url, {
        method: "HEAD",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": USER_AGENT, "accept": "*/*" }
      });
      if ([403, 405, 406, 501].includes(response.status)) {
        response = await fetch(source.health_url, {
          method: "GET",
          redirect: "follow",
          signal: controller.signal,
          headers: { "user-agent": USER_AGENT, "accept": "text/html,application/json,text/csv,*/*;q=0.8" }
        });
      }
    } finally {
      clearTimeout(timer);
    }

    const latency = Date.now() - started;
    const ok = response.status >= 200 && response.status < 400;
    return {
      id: source.id,
      trail_id: source.trail_id,
      status: ok ? "reachable" : "unreachable",
      http_status: response.status,
      latency_ms: latency,
      checked_at: new Date().toISOString(),
      content_type: response.headers.get("content-type"),
      note: ok ? "Endpoint responded successfully." : "Endpoint returned a non-success HTTP status."
    };
  } catch (error) {
    clearTimeout(timer);
    return {
      id: source.id,
      trail_id: source.trail_id,
      status: "unreachable",
      http_status: null,
      latency_ms: Date.now() - started,
      checked_at: new Date().toISOString(),
      content_type: null,
      note: error?.name === "AbortError" ? "Health check timed out." : "Health check request failed."
    };
  }
}

const results = [];
for (const source of registry.sources) {
  results.push(await checkSource(source));
  await new Promise(resolve => setTimeout(resolve, 350));
}

const reachable = results.filter(x => x.status === "reachable").length;
const unreachable = results.filter(x => x.status === "unreachable").length;
const payload = {
  generated_at: new Date().toISOString(),
  generator: "BondStats Financial Data Trail Explorer",
  version: 2,
  summary: { total: results.length, reachable, unreachable, unknown: 0 },
  sources: results
};

await mkdir(new URL("../public/data/", import.meta.url), { recursive: true });
await writeFile(outPath, JSON.stringify(payload, null, 2) + "\n", "utf8");
console.log(`Lineage health written: ${reachable}/${results.length} reachable`);
