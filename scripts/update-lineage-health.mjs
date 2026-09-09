import { readFile, writeFile } from "node:fs/promises";

const registry = JSON.parse(
  await readFile(new URL("../data/lineage-registry.json", import.meta.url), "utf8")
);

const TIMEOUT_MS = 12000;
const USER_AGENT = "BondStats-Data-Lineage-Health/1.0 (+https://www.bondstats.org/)";

async function check(source){
  const started = Date.now();
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), TIMEOUT_MS);

  try{
    let response = await fetch(source.health_url, {
      method: "HEAD",
      redirect: "follow",
      signal: controller.signal,
      headers: { "user-agent": USER_AGENT, "accept": "*/*" }
    });

    if([403,405,406,501].includes(response.status)){
      response = await fetch(source.health_url, {
        method: "GET",
        redirect: "follow",
        signal: controller.signal,
        headers: { "user-agent": USER_AGENT, "accept": "*/*" }
      });
    }

    clearTimeout(timer);
    const ok = response.status >= 200 && response.status < 400;

    return {
      id: source.id,
      status: ok ? "reachable" : "unreachable",
      http_status: response.status,
      latency_ms: Date.now() - started,
      checked_at: new Date().toISOString()
    };
  }catch(error){
    clearTimeout(timer);
    return {
      id: source.id,
      status: "unreachable",
      http_status: null,
      latency_ms: Date.now() - started,
      checked_at: new Date().toISOString()
    };
  }
}

const results = [];
for(const source of registry.sources){
  results.push(await check(source));
  await new Promise(r => setTimeout(r, 250));
}

const reachable = results.filter(x => x.status === "reachable").length;
const payload = {
  generated_at: new Date().toISOString(),
  summary: {
    total: results.length,
    reachable,
    unreachable: results.length - reachable,
    unknown: 0
  },
  sources: results
};

await writeFile(
  new URL("../data/lineage-health.json", import.meta.url),
  JSON.stringify(payload, null, 2) + "\n",
  "utf8"
);

console.log(`Health snapshot updated: ${reachable}/${results.length} reachable`);
