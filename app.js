const state = { trails: [], health: null, active: null, node: 0, mode: "trace", filtered: [] };

const stages = [
  { kind:"official", label:"Official source", desc:"Primary public authority or BondStats-owned source." },
  { kind:"derived", label:"Raw series", desc:"Identifier or source series used as the input reference." },
  { kind:"derived", label:"Validation", desc:"Availability and structural checks before use." },
  { kind:"derived", label:"Normalization", desc:"Internal normalization into a consistent BondStats schema." },
  { kind:"output", label:"BondStats dataset", desc:"Dataset or internal data layer used by BondStats." },
  { kind:"output", label:"Downstream use", desc:"Tool or analytical surface that consumes the dataset." }
];

const $ = (id) => document.getElementById(id);

function fmtDate(iso){
  if(!iso) return "—";
  try{
    return new Intl.DateTimeFormat(undefined,{dateStyle:"medium",timeStyle:"short"}).format(new Date(iso));
  }catch{return iso;}
}

function activeHealth(){
  return state.health?.sources?.find(x => x.id === state.active?.id) || null;
}

function nodeValue(i){
  const t = state.active;
  if(!t) return {title:"—", meta:"—"};
  return [
    {title:t.authority, meta:t.category},
    {title:t.series, meta:"source identifier"},
    {title:"Source health + schema check", meta:"operational validation"},
    {title:"BondStats normalization", meta:"internal transformation"},
    {title:t.dataset, meta:"BondStats data layer"},
    {title:t.downstream, meta:"downstream dependency"}
  ][i];
}

function renderGraph(){
  const t = state.active;
  if(!t) return;
  $("trailTitle").textContent = t.title;
  $("trailCode").textContent = t.code;

  $("graph").innerHTML = stages.map((s,i)=>{
    const v = nodeValue(i);
    const dim = state.mode === "impact" && i < state.node ? " dim" : "";
    return `<article class="node${i===state.node?" selected":""}${dim}" data-node="${i}">
      <div class="node-stage">0${i+1}</div>
      <span class="node-kind">${s.label}</span>
      <h3>${escapeHtml(v.title)}</h3>
      <p>${escapeHtml(v.meta)}</p>
    </article>`;
  }).join("");

  document.querySelectorAll(".node").forEach(el=>{
    el.addEventListener("click", ()=>{
      state.node = Number(el.dataset.node);
      renderGraph();
      renderInspector();
    });
  });
}

function renderInspector(){
  const t = state.active;
  if(!t) return;
  const s = stages[state.node];
  const v = nodeValue(state.node);
  const h = activeHealth();

  let healthText = "Not applicable";
  let healthClass = "";
  if(state.node === 0 && h){
    if(h.status === "reachable"){
      healthText = `Reachable${h.http_status ? ` · HTTP ${h.http_status}` : ""}${h.latency_ms != null ? ` · ${h.latency_ms} ms` : ""}`;
      healthClass = "ok";
    }else if(h.status === "unreachable"){
      healthText = `Unreachable${h.http_status ? ` · HTTP ${h.http_status}` : ""}`;
      healthClass = "bad";
    }else{
      healthText = "Waiting for first automated check";
      healthClass = "warn";
    }
  }

  $("inspectorBody").innerHTML = `
    <h3>${escapeHtml(s.label)}</h3>
    <div class="field"><label>ACTIVE VALUE</label><div>${escapeHtml(v.title)}</div></div>
    <div class="field"><label>FUNCTION</label><div>${escapeHtml(s.desc)}</div></div>
    <div class="field"><label>TRAIL</label><div>${escapeHtml(t.title)}</div></div>
    <div class="field"><label>SOURCE AUTHORITY</label><div>${escapeHtml(t.authority)}</div></div>
    <div class="field"><label>SERIES / IDENTIFIER</label><div>${escapeHtml(t.series)}</div></div>
    <div class="field"><label>AUTOMATED SOURCE HEALTH</label><div class="${healthClass}">${escapeHtml(healthText)}</div></div>
    <div class="field"><label>LAST CHECK</label><div>${escapeHtml(h ? fmtDate(h.checked_at) : "—")}</div></div>
    <div class="field"><label>PRIMARY REFERENCE</label><div><a href="${t.source_url}" target="_blank" rel="noopener noreferrer">Open source ↗</a></div></div>
  `;
}

function renderRows(){
  const rows = state.filtered;
  $("resultCount").textContent = `${rows.length} trail${rows.length===1?"":"s"}`;
  $("catalogRows").innerHTML = rows.map(t=>`
    <div class="row" data-id="${t.id}">
      <div>
        <div class="row-title">${escapeHtml(t.title)}</div>
        <div class="row-sub">${escapeHtml(t.code)}</div>
      </div>
      <div class="cell">${escapeHtml(t.authority)}</div>
      <div class="cell">${escapeHtml(t.dataset)}</div>
      <div class="cell">${escapeHtml(t.downstream)}</div>
    </div>
  `).join("");

  document.querySelectorAll(".row").forEach(el=>{
    el.addEventListener("click", ()=>{
      state.active = state.trails.find(t=>t.id===el.dataset.id);
      state.node = 0;
      renderGraph();
      renderInspector();
      window.scrollTo({top: document.querySelector(".workspace").offsetTop - 70, behavior:"smooth"});
    });
  });
}

function renderHealth(){
  const s = state.health?.summary;
  if(!s){
    $("healthState").textContent = "snapshot unavailable";
    $("healthState").className = "bad";
    return;
  }
  $("healthCount").textContent = String(s.total ?? "—");
  $("healthChecked").textContent = fmtDate(state.health.generated_at);

  if(s.unknown > 0){
    $("healthState").textContent = "awaiting first run";
    $("healthState").className = "warn";
  }else{
    $("healthState").textContent = `${s.reachable}/${s.total} reachable`;
    $("healthState").className = s.unreachable > 0 ? "bad" : "ok";
  }
}

function escapeHtml(v){
  return String(v ?? "")
    .replaceAll("&","&amp;")
    .replaceAll("<","&lt;")
    .replaceAll(">","&gt;")
    .replaceAll('"',"&quot;")
    .replaceAll("'","&#039;");
}

async function init(){
  try{
    const [registryRes, healthRes] = await Promise.all([
      fetch("./data/lineage-registry.json",{cache:"no-store"}),
      fetch("./data/lineage-health.json",{cache:"no-store"})
    ]);
    if(!registryRes.ok) throw new Error("registry unavailable");

    const registry = await registryRes.json();
    state.trails = registry.sources || [];
    state.filtered = [...state.trails];
    state.active = state.trails[0] || null;

    if(healthRes.ok) state.health = await healthRes.json();

    renderGraph();
    renderInspector();
    renderRows();
    renderHealth();
  }catch(err){
    $("trailTitle").textContent = "Unable to load lineage registry";
    $("graph").innerHTML = `<div class="node"><h3>Data load error</h3><p>${escapeHtml(err.message)}</p></div>`;
    $("healthState").textContent = "unavailable";
    $("healthState").className = "bad";
  }
}

$("searchInput").addEventListener("input", (e)=>{
  const q = e.target.value.trim().toLowerCase();
  state.filtered = !q ? [...state.trails] : state.trails.filter(t =>
    [t.title,t.code,t.authority,t.series,t.dataset,t.downstream,t.category]
      .some(v => String(v).toLowerCase().includes(q))
  );
  renderRows();
});

$("traceBtn").addEventListener("click", ()=>{
  state.mode = "trace";
  $("traceBtn").classList.add("active");
  $("impactBtn").classList.remove("active");
  renderGraph();
});

$("impactBtn").addEventListener("click", ()=>{
  state.mode = "impact";
  $("impactBtn").classList.add("active");
  $("traceBtn").classList.remove("active");
  renderGraph();
});

init();
