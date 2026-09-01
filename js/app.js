/* ============================================================
   PROGRESSÃO — app v2.0
   Registro simples: peso da última série + técnica por exercício
   ============================================================ */

const LS = {
  logs: "gg_logs_v1", subs: "gg_subs_v1", last: "gg_last_v1",
  locs: "gg_locs_v1", lloc: "gg_lloc_v1", cust: "gg_cust_v1"
};

const read = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? f : v; } catch (e) { return f; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

let logs = read(LS.logs, {});
let subs = read(LS.subs, {});
let last = read(LS.last, {});
let locs = read(LS.locs, []);
let lloc = read(LS.lloc, "");
let cust = read(LS.cust, []);

const app = document.getElementById("app");
const esc = s => String(s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const today = () => new Date().toISOString().slice(0, 10);
const brDate = iso => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "";
const brFull = iso => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(2, 4) : "";
const fmt = n => (Math.round(n * 10) / 10).toString().replace(".", ",");
const tecOf = k => TECNICAS.find(t => t.k === (k || "")) || TECNICAS[0];
const desc = s => s < 60 ? s + "s" : (s % 60 === 0 ? (s / 60) + " min" : Math.floor(s / 60) + "min" + String(s % 60).padStart(2, "0"));

const findWorkout = id => PROGRAM.workouts.find(w => w.id === id);
const exsOf = w => w.exercises.concat(cust.filter(c => c.wid === w.id));
const allPairs = () => PROGRAM.workouts.flatMap(w => exsOf(w).map(e => [w, e]));
const findEx = id => allPairs().find(([, e]) => e.id === id) || null;
const exName = ex => subs[ex.id] || ex.name;
const groupOf = (w, e) => e.g || e.group || w.group;
const daysAgo = iso => iso ? Math.round((Date.now() - new Date(iso + "T12:00:00").getTime()) / 864e5) : null;

/* entradas antigas (grade de séries) continuam legíveis */
const entW = s => s.w != null ? s.w : (s.sets || []).reduce((a, x) => Math.max(a, x.w || 0), 0);
const entT = s => s.t != null ? s.t : ((s.sets || []).map(x => x.t).find(Boolean) || "");
const entN = s => s.n || (s.sets ? s.sets.length : 0);

/* ------------------------------------------------ biblioteca de exercícios */
function biblioteca() {
  const m = new Map();
  PROGRAM.workouts.forEach(w => w.exercises.forEach(e => {
    const g = groupOf(w, e);
    if (!m.has(e.name)) m.set(e.name, { name: e.name, group: g, sets: e.sets, repsMin: e.repsMin, repsMax: e.repsMax, rir: e.rir, rest: e.rest, inc: e.inc, cue: e.cue, alts: e.alts || [] });
    (e.alts || []).forEach(a => { if (!m.has(a)) m.set(a, { name: a, group: g, sets: e.sets, repsMin: e.repsMin, repsMax: e.repsMax, rir: e.rir, rest: e.rest, inc: e.inc, cue: "", alts: [] }); });
  }));
  cust.forEach(c => { if (!m.has(c.name)) m.set(c.name, { ...c, alts: [] }); });
  return [...m.values()].sort((a, b) => a.group.localeCompare(b.group) || a.name.localeCompare(b.name));
}
const semAcento = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

/* ------------------------------------------------ leitura da última vez */
function ultima(exId) { const h = logs[exId]; return h && h.length ? h[0] : null; }

/* estagnação: 3 registros sem aumento de peso */
function stall(exId) {
  const h = (logs[exId] || []).slice(0, 3);
  if (h.length < 3) return null;
  const w = h.map(entW);
  if (w[0] > w[1] || w[1] > w[2]) return null;
  return { n: 3, since: h[2].d };
}

/* ------------------------------------------------ volume semanal */
function weekWindow(offset) {
  const end = new Date(); end.setHours(12, 0, 0, 0); end.setDate(end.getDate() - offset * 7);
  const start = new Date(end); start.setDate(start.getDate() - 6);
  return [start.toISOString().slice(0, 10), end.toISOString().slice(0, 10)];
}
function volumeByGroup(offset) {
  const [a, b] = weekWindow(offset), out = {};
  allPairs().forEach(([w, e]) => {
    const g = groupOf(w, e);
    if (g === "Livre") return;
    (logs[e.id] || []).forEach(s => { if (s.d >= a && s.d <= b) out[g] = (out[g] || 0) + (entN(s) || e.sets || 0); });
  });
  return out;
}

/* ------------------------------------------------ gráfico */
function lineChart(series) {
  const W = 340, H = 148, ml = 34, mr = 12, mt = 12, mb = 24;
  const iw = W - ml - mr, ih = H - mt - mb;
  const vs = series.map(p => p.v);
  let lo = Math.min(...vs), hi = Math.max(...vs);
  if (hi === lo) { hi = lo + (lo * 0.1 || 1); lo = Math.max(0, lo - (lo * 0.1 || 1)); }
  const pad = (hi - lo) * 0.12; lo = Math.max(0, lo - pad); hi += pad;
  const x = i => ml + (series.length === 1 ? iw / 2 : (i / (series.length - 1)) * iw);
  const y = v => mt + ih - ((v - lo) / (hi - lo)) * ih;
  const grid = [0, .5, 1].map(t => {
    const v = lo + (hi - lo) * t, yy = y(v);
    return `<line x1="${ml}" x2="${W - mr}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" class="g-grid"/>
      <text x="${ml - 6}" y="${(yy + 3.5).toFixed(1)}" class="g-tick" text-anchor="end">${fmt(v)}</text>`;
  }).join("");
  const d = series.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1)).join(" ");
  const area = d + ` L${x(series.length - 1).toFixed(1)} ${mt + ih} L${x(0).toFixed(1)} ${mt + ih} Z`;
  const maxI = vs.indexOf(Math.max(...vs));
  const dots = series.map((p, i) => {
    const on = i === series.length - 1 || i === maxI;
    return `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${on ? 4.5 : 3}" class="g-dot${on ? " on" : ""}" data-v="${p.v}" data-d="${p.d}"/>`;
  }).join("");
  const lp = series[series.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Peso por sessão">
    ${grid}<path d="${area}" class="g-area"/><path d="${d}" class="g-line"/>${dots}
    <text x="${(x(series.length - 1) - 4).toFixed(1)}" y="${(y(lp.v) - 10).toFixed(1)}" class="g-lbl" text-anchor="end">${fmt(lp.v)} kg</text>
    <text x="${ml}" y="${H - 6}" class="g-tick">${brDate(series[0].d)}</text>
    <text x="${W - mr}" y="${H - 6}" class="g-tick" text-anchor="end">${brDate(lp.d)}</text>
  </svg><p class="g-cap" id="g-cap">Toque em um ponto para ver a sessão.</p>`;
}

/* ------------------------------------------------ timer */
const Timer = {
  left: 0, id: null, label: "Descanso",
  start(sec, label) {
    this.left = sec; this.label = label || "Descanso";
    clearInterval(this.id);
    this.id = setInterval(() => { this.left--; this.paint(); if (this.left <= 0) this.done(); }, 1000);
    this.paint();
  },
  add(s) { if (this.el()) { this.left += s; this.paint(); } },
  stop() { clearInterval(this.id); this.id = null; const e = this.el(); if (e) e.remove(); },
  done() {
    clearInterval(this.id); this.id = null;
    if (navigator.vibrate) navigator.vibrate([180, 90, 180]);
    const e = this.el();
    if (e) { e.classList.add("fim"); e.querySelector(".t-time").textContent = "0:00"; e.querySelector(".t-lbl").textContent = "Descanso concluído"; }
    setTimeout(() => { const x = this.el(); if (x) x.remove(); }, 6000);
  },
  el() { return document.getElementById("timer"); },
  paint() {
    let e = this.el();
    if (!e) {
      e = document.createElement("div"); e.id = "timer"; e.className = "timer";
      e.innerHTML = `<span class="t-lbl"></span><span class="t-time"></span>
        <button class="t-btn" data-t="15">+15s</button><button class="t-btn" data-t="stop">Pular</button>`;
      document.body.appendChild(e);
    }
    const m = Math.floor(Math.max(0, this.left) / 60), s = Math.max(0, this.left) % 60;
    e.querySelector(".t-lbl").textContent = this.label;
    e.querySelector(".t-time").textContent = m + ":" + String(s).padStart(2, "0");
  }
};

/* ------------------------------------------------ sheet */
function sheet(title, html) {
  let s = document.getElementById("sheet");
  if (!s) { s = document.createElement("div"); s.id = "sheet"; s.className = "sheet"; document.body.appendChild(s); }
  s.innerHTML = `<div class="sheet-bg" data-sheet-close></div>
    <div class="sheet-in"><div class="sheet-h">${esc(title)}<button class="mini" data-sheet-close>Fechar</button></div>${html}</div>`;
  requestAnimationFrame(() => s.classList.add("open"));
}
function closeSheet() { const s = document.getElementById("sheet"); if (s) { s.classList.remove("open"); setTimeout(() => s.remove(), 200); } }

/* ------------------------------------------------ home */
function viewHome() {
  const sessions = Object.values(logs).reduce((a, h) => a + h.length, 0);
  const wk = volumeByGroup(0);
  const wkSets = Object.values(wk).reduce((a, b) => a + b, 0);
  const stalls = allPairs().filter(([, e]) => stall(e.id));

  const cards = PROGRAM.workouts.map((w, i) => {
    const d = daysAgo(last[w.id]);
    const when = d === null ? "nunca feito" : d === 0 ? "feito hoje" : d === 1 ? "ontem" : "há " + d + " dias";
    const n = exsOf(w).length;
    return `
    <button class="card ${w.priority ? "pri" : "sec-pri"} rise" style="animation-delay:${40 + i * 30}ms" data-go="w/${w.id}">
      <div class="grp">${esc(w.group)}${w.priority ? " &middot; prioridade" : ""}</div>
      <h3>${esc(w.title)}</h3>
      <p class="focus">${esc(w.focus)}</p>
      <div class="tags">
        ${w.duration ? `<span class="tag">${w.duration} min</span>` : ""}
        <span class="tag">${n} ${n === 1 ? "exercício" : "exercícios"}</span>
        <span class="tag ${d !== null && d <= 2 ? "ok" : ""}">${when}</span>
      </div>
    </button>`;
  }).join("");

  app.innerHTML = `
  <header class="topbar">
    <div class="mark">PRO<span>GRESSÃO</span></div>
    <div class="meta">v2.1</div>
  </header>

  <section class="hero rise">
    <h1>Treino por <em>ponto fraco</em></h1>
    <p>Escolha o treino, marque o que fez e anote só o peso da última série.</p>
    <div class="stat-row">
      <div class="stat"><div class="k">Sessões</div><div class="v">${sessions}</div></div>
      <div class="stat"><div class="k">Séries 7d</div><div class="v">${wkSets}</div></div>
      <div class="stat"><div class="k">Alertas</div><div class="v" style="${stalls.length ? "color:var(--amber)" : ""}">${stalls.length}</div></div>
    </div>
  </section>

  ${stalls.length ? `
  <button class="card alert rise" data-go="v">
    <div class="grp">Estagnação</div>
    <h3 style="font-size:18px">${stalls.length} ${stalls.length === 1 ? "exercício parado" : "exercícios parados"}</h3>
    <p class="focus" style="margin:6px 0 0">${stalls.slice(0, 3).map(([, e]) => esc(exName(e))).join(", ")}${stalls.length > 3 ? " e mais" : ""}.</p>
  </button>` : ""}

  <div class="sec">Treinos</div>
  ${cards}
  <button class="add-ex" data-go="w/livre">+ Montar treino do dia</button>

  <div class="sec">Acompanhamento</div>
  <button class="card" data-go="v">
    <h3>Volume semanal</h3>
    <p class="focus" style="margin:0">Séries por grupo nos últimos 7 dias e alertas de estagnação.</p>
  </button>
  <button class="card" data-go="h">
    <h3>Histórico</h3>
    <p class="focus" style="margin:0">Evolução de peso por exercício, com técnica e local.</p>
  </button>`;
}

/* ------------------------------------------------ treino */
function viewWorkout(id) {
  const w = findWorkout(id);
  if (!w) return go("");

  const ex = exsOf(w).map((e, i) => {
    const u = ultima(e.id), st = stall(e.id), cur = exName(e);
    const swapped = cur !== e.name, isC = !!e.wid;
    const uw = u ? entW(u) : 0, ut = u ? entT(u) : "";

    let nota = "";
    if (st) nota = `<div class="ult stall">&#9888; Mesmo peso há 3 sessões. Reduza o volume esta semana ou troque o exercício.</div>`;
    else if (u) nota = `<div class="ult">Última: <b>${fmt(uw)} kg</b>${ut ? " · " + tecOf(ut).n : ""} · ${brDate(u.d)}${u.loc ? " · " + esc(u.loc) : ""}</div>`;

    return `
    <article class="ex rise" style="animation-delay:${40 + i * 30}ms" id="ex-${e.id}">
      <div class="ex-head">
        <div class="ex-num">${i + 1}</div>
        <div class="ex-title">
          <h4>${esc(cur)}</h4>
          <div class="prescr">
            <b>${e.sets}x${e.repsMin}${e.repsMax !== e.repsMin ? "-" + e.repsMax : ""}</b><span class="dot">/</span>
            <span>RIR ${e.rir}</span><span class="dot">/</span>
            <span>desc. ${desc(e.rest)}</span>
            ${swapped ? `<span class="dot">/</span><span style="color:var(--accent)">trocado</span>` : ""}
            ${isC ? `<span class="dot">/</span><span>avulso</span>` : ""}
          </div>
        </div>
      </div>
      ${nota}
      <div class="reg">
        <label class="peso">
          <input type="number" inputmode="decimal" step="0.5" placeholder="${uw ? fmt(uw) : "peso"}" data-w="${e.id}">
          <span>kg</span>
        </label>
        <button class="tec" data-tec="${e.id}" data-k="">Técnica</button>
        <button class="done" data-done data-rest="${e.rest}" data-nome="${esc(cur)}" data-ex="${e.id}">&#10003;</button>
      </div>
      <div class="ex-tools">
        ${e.alts && e.alts.length ? `<button class="mini" data-alts="${e.id}">Trocar (${e.alts.length})</button>` : ""}
        ${e.cue ? `<button class="mini" data-cue="${e.id}">Como executar</button>` : ""}
        ${logs[e.id] && logs[e.id].length ? `<button class="mini" data-go="hx/${e.id}">Evolução</button>` : ""}
        ${swapped ? `<button class="mini" data-reset="${e.id}">Original</button>` : ""}
        ${isC ? `<button class="mini danger" data-delc="${e.id}">Remover</button>` : ""}
      </div>
      ${e.cue ? `<p class="cue" id="cue-${e.id}" style="display:none">${esc(e.cue)}${e.tech ? " " + esc(PROGRAM.techniques[e.tech] || "") : ""}</p><div style="height:12px"></div>` : ""}
      ${e.alts && e.alts.length ? `<div class="alts" id="alts-${e.id}">
        <button class="alt ${!swapped ? "cur" : ""}" data-pick="${e.id}" data-name="${esc(e.name)}">${esc(e.name)}</button>
        ${e.alts.map(a => `<button class="alt ${cur === a ? "cur" : ""}" data-pick="${e.id}" data-name="${esc(a)}">${esc(a)}</button>`).join("")}
        <button class="alt" data-libswap="${e.id}" style="border-style:dashed">Escolher outro exercício da lista</button>
      </div>` : ""}
    </article>`;
  }).join("");

  app.innerHTML = `
  <header class="topbar">
    <button class="back" data-go="">&larr; Treinos</button>
    <div class="mark" style="font-size:15px">${esc(w.group)}</div>
    ${w.duration ? `<div class="meta">${w.duration} min</div>` : ""}
  </header>
  <section class="hero rise" style="padding-bottom:12px">
    <h1 style="font-size:clamp(25px,7vw,34px)">${esc(w.title)}</h1>
    <p style="margin-bottom:0">${esc(w.focus)}</p>
  </section>
  <p class="brief rise">${esc(w.brief)}</p>
  <div class="local rise">
    <label for="loc">Local do treino</label>
    <input id="loc" list="loclist" placeholder="Onde você treinou hoje" value="${esc(lloc)}" autocomplete="off">
    <datalist id="loclist">${locs.map(l => `<option value="${esc(l)}"></option>`).join("")}</datalist>
  </div>
  ${ex || `<p class="empty">Nenhum exercício ainda. Adicione abaixo.</p>`}
  <button class="add-ex" data-addex="${w.id}">+ Adicionar exercício</button>
  ${w.id === "livre" && exsOf(w).length ? `<button class="mini" style="width:100%;padding:12px" data-esvazia="${w.id}">Esvaziar treino do dia</button>` : ""}
  <div class="bar"><div class="bar-in">
    <button class="btn ghost" data-clear>Limpar</button>
    <button class="btn" data-save="${w.id}">Salvar treino</button>
  </div></div>`;
}

/* ------------------------------------------------ volume e alertas */
function viewVolume() {
  const cur = volumeByGroup(0), prev = volumeByGroup(1);
  const grupos = ["Costas", "Peito", "Ombro", "Braço", "Perna"];
  const maxV = Math.max(20, ...grupos.map(g => cur[g] || 0));

  const bars = grupos.map(g => {
    const v = cur[g] || 0, p = prev[g] || 0, [lo, hi] = ALVO[g];
    const st = v === 0 ? "zero" : v < lo ? "baixo" : v > hi ? "alto" : "ok";
    const txt = { zero: "sem estímulo", baixo: "abaixo do alvo", ok: "dentro do alvo", alto: "acima do alvo" }[st];
    const d = v - p;
    return `<div class="vol-row">
      <div class="vol-top"><span class="vol-g">${g}</span><span class="vol-n">${v} <small>séries</small></span></div>
      <div class="vol-track">
        <div class="vol-fill ${st}" style="width:${Math.min(100, (v / maxV) * 100)}%"></div>
        <div class="vol-band" style="left:${(lo / maxV) * 100}%;width:${((hi - lo) / maxV) * 100}%"></div>
      </div>
      <div class="vol-foot"><span class="st ${st}">${txt}</span>
        <span>alvo ${lo} a ${hi} · semana passada ${p}${d ? ` (${d > 0 ? "+" : ""}${d})` : ""}</span></div>
    </div>`;
  }).join("");

  const stalls = allPairs().map(([w, e]) => [w, e, stall(e.id)]).filter(([, , s]) => s);

  app.innerHTML = `
  <header class="topbar">
    <button class="back" data-go="">&larr; Treinos</button>
    <div class="mark" style="font-size:15px">Acompanhamento</div>
  </header>
  <section class="hero rise" style="padding-bottom:8px">
    <h1 style="font-size:clamp(25px,7vw,34px)">Volume semanal</h1>
    <p style="margin-bottom:0">Séries por grupo nos últimos 7 dias. A faixa sombreada é o alvo da semana.</p>
  </section>
  <div class="chart-box rise">${bars}</div>
  <div class="sec">Estagnação</div>
  ${stalls.length ? stalls.map(([w, e, s]) => `
    <button class="card alert" data-go="hx/${e.id}">
      <div class="grp">${esc(groupOf(w, e))}</div>
      <h3 style="font-size:18px">${esc(exName(e))}</h3>
      <p class="focus" style="margin:6px 0 0">Mesmo peso em 3 sessões, desde ${brDate(s.since)}. Reduza o volume esta semana ou troque o exercício.</p>
    </button>`).join("") : `<p class="empty">Nenhum exercício parado.</p>`}
  <div style="height:40px"></div>`;
}

/* ------------------------------------------------ histórico */
function viewHistory() {
  const rows = allPairs().filter(([, e]) => logs[e.id] && logs[e.id].length).map(([w, e]) => {
    const h = logs[e.id], best = h.reduce((a, s) => Math.max(a, entW(s)), 0);
    return `<button class="card" data-go="hx/${e.id}">
      <div class="grp">${esc(groupOf(w, e))}</div>
      <h3 style="font-size:18px">${esc(exName(e))}</h3>
      <div class="tags">
        <span class="tag">${h.length} ${h.length === 1 ? "sessão" : "sessões"}</span>
        <span class="tag hot">recorde ${fmt(best)} kg</span>
        ${stall(e.id) ? `<span class="tag warn">parado</span>` : ""}
        <span class="tag">${brDate(h[0].d)}</span>
      </div>
    </button>`;
  }).join("");

  app.innerHTML = `
  <header class="topbar">
    <button class="back" data-go="">&larr; Treinos</button>
    <div class="mark" style="font-size:15px">Histórico</div>
  </header>
  <section class="hero rise" style="padding-bottom:8px">
    <h1 style="font-size:clamp(25px,7vw,34px)">Histórico</h1>
    <p style="margin-bottom:0">Toque em um exercício para ver a evolução do peso.</p>
  </section>
  ${rows || `<p class="empty">Nenhuma sessão registrada ainda.</p>`}
  <div style="height:40px"></div>`;
}

/* ------------------------------------------------ evolução */
function viewExercise(exId) {
  const pair = findEx(exId), h = logs[exId];
  if (!pair || !h || !h.length) return go("h");
  const [w, e] = pair;
  const chrono = h.slice().reverse();
  const series = chrono.map(s => ({ d: s.d, v: entW(s) })).filter(p => p.v > 0);
  const best = series.length ? Math.max(...series.map(p => p.v)) : 0;
  const delta = series.length > 1 && series[0].v ? ((series[series.length - 1].v - series[0].v) / series[0].v) * 100 : 0;
  const st = stall(exId);

  const sessions = h.map((s, i) => `
    <div class="hist-line">
      <span class="d">${brFull(s.d)}</span>
      <span class="kg">${fmt(entW(s))} kg</span>
      ${entT(s) ? `<span class="tec-tag">${tecOf(entT(s)).s}</span>` : ""}
      ${s.loc ? `<span class="loc-tag">${esc(s.loc)}</span>` : ""}
      <span class="row-tools">
        <button class="mini" data-edit="${exId}|${i}">Editar</button>
        <button class="mini danger" data-del="${exId}|${i}">Apagar</button>
      </span>
    </div>`).join("");

  app.innerHTML = `
  <header class="topbar">
    <button class="back" data-go="h">&larr; Histórico</button>
    <div class="mark" style="font-size:15px">${esc(groupOf(w, e))}</div>
  </header>
  <section class="hero rise" style="padding-bottom:12px">
    <h1 style="font-size:clamp(22px,6vw,30px)">${esc(exName(e))}</h1>
    <p style="margin-bottom:12px">${h.length} ${h.length === 1 ? "sessão" : "sessões"}</p>
    <div class="stat-row">
      <div class="stat"><div class="k">Recorde</div><div class="v">${fmt(best)}<small>kg</small></div></div>
      <div class="stat"><div class="k">Variação</div><div class="v" style="color:${delta >= 0 ? "var(--green)" : "var(--amber)"}">${delta >= 0 ? "+" : ""}${fmt(delta)}<small>%</small></div></div>
      <div class="stat"><div class="k">Última</div><div class="v">${fmt(entW(h[0]))}<small>kg</small></div></div>
    </div>
  </section>
  ${st ? `<div class="ult stall rise" style="margin:0 0 16px">&#9888; Mesmo peso em 3 sessões, desde ${brDate(st.since)}.</div>` : ""}
  <div class="sec">Peso por sessão</div>
  <div class="chart-box rise">${series.length > 1 ? lineChart(series) : `<p class="empty">Registre pelo menos duas sessões para a curva aparecer.</p>`}</div>
  <div class="sec">Todas as sessões</div>
  <div class="hist-ex">${sessions}</div>
  <div style="height:50px"></div>`;
}

/* ------------------------------------------------ sheets */
function tecSheet(onPick, atual) {
  sheet("Série avançada", `<div class="alts open" style="padding:0">
    ${TECNICAS.map(t => `<button class="alt ${t.k === (atual || "") ? "cur" : ""}" data-tecpick="${t.k}">${t.n}</button>`).join("")}
  </div>`);
  window.__tecPick = onPick;
}
function editSheet(exId, i) {
  const s = logs[exId][i];
  sheet("Sessão de " + brFull(s.d), `
    <div class="form">
      <label>Peso da última série (kg)</label>
      <input id="ed-w" type="number" inputmode="decimal" step="0.5" value="${entW(s) || ""}">
      <label>Série avançada</label>
      <select id="ed-t">${TECNICAS.map(t => `<option value="${t.k}" ${t.k === entT(s) ? "selected" : ""}>${t.n}</option>`).join("")}</select>
      <label>Local</label>
      <input id="ed-loc" value="${esc(s.loc || "")}" placeholder="Local do treino">
      <button class="btn" style="width:100%;margin-top:16px" data-saveedit="${exId}|${i}">Salvar alterações</button>
    </div>`);
}
function libSheet(modo, alvo) {
  // modo "add": adiciona ao treino alvo (wid). modo "swap": troca o exercício alvo (exId)
  const titulo = modo === "add" ? "Adicionar exercício" : "Trocar por outro exercício";
  sheet(titulo, `
    <div class="form" style="margin-bottom:10px">
      <input id="lib-q" placeholder="Buscar exercício" autocomplete="off">
    </div>
    <div id="lib-list" class="alts open" style="padding:0"></div>
    <button class="mini" style="width:100%;padding:13px;margin-top:6px" data-novoex="${esc(alvo)}" data-modo="${modo}">Criar exercício que não está na lista</button>`);
  window.__libModo = modo; window.__libAlvo = alvo;
  pintaLib("");
  setTimeout(() => { const i = document.getElementById("lib-q"); if (i) i.focus(); }, 250);
}
function pintaLib(q) {
  const box = document.getElementById("lib-list");
  if (!box) return;
  const termo = semAcento(q || "");
  const itens = biblioteca().filter(x => !termo || semAcento(x.name).includes(termo) || semAcento(x.group).includes(termo)).slice(0, 40);
  box.innerHTML = itens.length ? itens.map(x =>
    `<button class="alt" data-libpick="${esc(x.name)}"><b style="font-weight:600">${esc(x.name)}</b><br><span style="font-family:var(--font-mono);font-size:10.5px;color:var(--ink-3)">${esc(x.group)} · ${x.sets}x${x.repsMin}-${x.repsMax}</span></button>`
  ).join("") : `<p class="empty" style="padding:16px 0">Nenhum exercício com esse nome. Use o botão abaixo para criar.</p>`;
}

function addExSheet(alvo, modo) {
  sheet("Novo exercício", `
    <div class="form">
      <label>Nome do exercício</label>
      <input id="cx-name" placeholder="Ex.: Agachamento búlgaro">
      <label>Grupo muscular</label>
      <select id="cx-group">${["Costas", "Peito", "Ombro", "Braço", "Perna"].map(g => `<option>${g}</option>`).join("")}</select>
      <div class="form-row">
        <div><label>Séries</label><input id="cx-sets" type="number" inputmode="numeric" value="3"></div>
        <div><label>Reps mín.</label><input id="cx-rmin" type="number" inputmode="numeric" value="10"></div>
        <div><label>Reps máx.</label><input id="cx-rmax" type="number" inputmode="numeric" value="12"></div>
      </div>
      <label>Descanso (segundos)</label>
      <input id="cx-rest" type="number" inputmode="numeric" value="90">
      <button class="btn" style="width:100%;margin-top:16px" data-savecx="${esc(alvo)}" data-modo="${modo || "add"}">${modo === "swap" ? "Usar no lugar do atual" : "Adicionar ao treino"}</button>
    </div>`);
}

/* ------------------------------------------------ salvar */
function saveSession(wid) {
  const w = findWorkout(wid);
  const locI = document.getElementById("loc");
  const loc = locI ? locI.value.trim() : "";
  let count = 0;

  exsOf(w).forEach(e => {
    const inp = document.querySelector(`input[data-w="${e.id}"]`);
    const doneBtn = document.querySelector(`button[data-ex="${e.id}"]`);
    const tecBtn = document.querySelector(`button[data-tec="${e.id}"]`);
    const marcado = doneBtn && doneBtn.classList.contains("on");
    const peso = inp ? parseFloat(inp.value) : NaN;
    if (!marcado && isNaN(peso)) return;

    const entry = { d: today(), name: exName(e), w: isNaN(peso) ? 0 : peso, t: tecBtn ? tecBtn.getAttribute("data-k") : "", n: e.sets, loc };
    logs[e.id] = logs[e.id] || [];
    if (logs[e.id][0] && logs[e.id][0].d === entry.d) logs[e.id][0] = entry;
    else logs[e.id].unshift(entry);
    logs[e.id] = logs[e.id].slice(0, 400);
    count++;
  });

  if (!count) return toast("Marque ou anote pelo menos um exercício");
  if (loc) { lloc = loc; if (!locs.includes(loc)) locs.unshift(loc); locs = locs.slice(0, 12); save(LS.locs, locs); save(LS.lloc, lloc); }
  last[wid] = today();
  save(LS.logs, logs); save(LS.last, last);
  Timer.stop();
  toast(count + (count === 1 ? " exercício salvo" : " exercícios salvos"));
  setTimeout(() => go(""), 800);
}

function toast(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(toast._t);
  toast._t = setTimeout(() => t.classList.remove("show"), 2200);
}

/* ------------------------------------------------ eventos */
document.addEventListener("click", ev => {
  const t = ev.target.closest("button, .g-dot");
  if (!t) return;

  if (t.classList.contains("g-dot")) {
    const cap = document.getElementById("g-cap");
    if (cap) cap.textContent = brFull(t.getAttribute("data-d")) + " — " + fmt(parseFloat(t.getAttribute("data-v"))) + " kg";
    document.querySelectorAll(".g-dot.sel").forEach(d => d.classList.remove("sel"));
    t.classList.add("sel"); return;
  }
  if (t.hasAttribute("data-sheet-close")) return closeSheet();
  if (t.hasAttribute("data-t")) return t.getAttribute("data-t") === "stop" ? Timer.stop() : Timer.add(15);
  if (t.hasAttribute("data-go")) return go(t.getAttribute("data-go"));

  if (t.hasAttribute("data-tec")) {
    const b = t;
    return tecSheet(k => {
      b.setAttribute("data-k", k); b.textContent = k ? tecOf(k).n : "Técnica";
      b.classList.toggle("on", !!k); closeSheet();
    }, b.getAttribute("data-k"));
  }
  if (t.hasAttribute("data-tecpick")) { if (window.__tecPick) window.__tecPick(t.getAttribute("data-tecpick")); return; }

  if (t.hasAttribute("data-cue")) {
    const p = document.getElementById("cue-" + t.getAttribute("data-cue"));
    p.style.display = p.style.display === "none" ? "block" : "none";
    t.classList.toggle("on"); return;
  }
  if (t.hasAttribute("data-alts")) {
    document.getElementById("alts-" + t.getAttribute("data-alts")).classList.toggle("open");
    t.classList.toggle("on"); return;
  }
  if (t.hasAttribute("data-pick")) {
    const id = t.getAttribute("data-pick"), name = t.getAttribute("data-name");
    const orig = allPairs().map(([, e]) => e).find(e => e.id === id);
    if (orig && name === orig.name) delete subs[id]; else subs[id] = name;
    save(LS.subs, subs); render(); return toast("Exercício trocado");
  }
  if (t.hasAttribute("data-reset")) { delete subs[t.getAttribute("data-reset")]; save(LS.subs, subs); return render(); }

  if (t.hasAttribute("data-addex")) return libSheet("add", t.getAttribute("data-addex"));
  if (t.hasAttribute("data-libswap")) return libSheet("swap", t.getAttribute("data-libswap"));
  if (t.hasAttribute("data-novoex")) { closeSheet(); return setTimeout(() => addExSheet(t.getAttribute("data-novoex"), t.getAttribute("data-modo")), 220); }
  if (t.hasAttribute("data-libpick")) {
    const nome = t.getAttribute("data-libpick");
    const base = biblioteca().find(x => x.name === nome);
    if (window.__libModo === "swap") {
      const id = window.__libAlvo;
      const orig = allPairs().map(([, e]) => e).find(e => e.id === id);
      if (orig && nome === orig.name) delete subs[id]; else subs[id] = nome;
      save(LS.subs, subs); closeSheet(); render(); return toast("Exercício trocado");
    }
    cust.push({
      id: "cx" + Date.now().toString(36), wid: window.__libAlvo, name: nome,
      group: base.group, sets: base.sets, repsMin: base.repsMin, repsMax: base.repsMax,
      rir: base.rir, rest: base.rest, inc: base.inc || 2.5, cue: base.cue || "", tech: null, alts: base.alts || []
    });
    save(LS.cust, cust); closeSheet(); render(); return toast("Exercício adicionado");
  }
  if (t.hasAttribute("data-savecx")) {
    const name = document.getElementById("cx-name").value.trim();
    if (!name) return toast("Dê um nome ao exercício");
    if (t.getAttribute("data-modo") === "swap") {
      subs[t.getAttribute("data-savecx")] = name;
      save(LS.subs, subs); closeSheet(); render(); return toast("Exercício trocado");
    }
    cust.push({
      id: "cx" + Date.now().toString(36), wid: t.getAttribute("data-savecx"), name,
      group: document.getElementById("cx-group").value,
      sets: Math.max(1, parseInt(document.getElementById("cx-sets").value, 10) || 3),
      repsMin: parseInt(document.getElementById("cx-rmin").value, 10) || 10,
      repsMax: parseInt(document.getElementById("cx-rmax").value, 10) || 12,
      rir: 1, rest: parseInt(document.getElementById("cx-rest").value, 10) || 90,
      inc: 2.5, cue: "", tech: null, alts: []
    });
    save(LS.cust, cust); closeSheet(); render(); return toast("Exercício adicionado");
  }
  if (t.hasAttribute("data-esvazia")) {
    const wid = t.getAttribute("data-esvazia");
    if (t.dataset.confirm !== "1") { t.dataset.confirm = "1"; t.textContent = "Confirmar? Isso remove os exercícios, o histórico fica"; return; }
    cust = cust.filter(c => c.wid !== wid); save(LS.cust, cust); render(); return toast("Treino do dia esvaziado");
  }
  if (t.hasAttribute("data-delc")) {
    const id = t.getAttribute("data-delc");
    if (t.dataset.confirm !== "1") { t.dataset.confirm = "1"; t.textContent = "Confirmar?"; return; }
    cust = cust.filter(c => c.id !== id); save(LS.cust, cust); render(); return toast("Removido");
  }

  if (t.hasAttribute("data-edit")) { const [id, i] = t.getAttribute("data-edit").split("|"); return editSheet(id, +i); }
  if (t.hasAttribute("data-saveedit")) {
    const [id, i] = t.getAttribute("data-saveedit").split("|");
    const e = logs[id][+i];
    const wv = parseFloat(document.getElementById("ed-w").value);
    e.w = isNaN(wv) ? 0 : wv;
    e.t = document.getElementById("ed-t").value;
    e.loc = document.getElementById("ed-loc").value.trim();
    delete e.sets;
    save(LS.logs, logs); closeSheet(); render(); return toast("Sessão atualizada");
  }
  if (t.hasAttribute("data-del")) {
    const [id, i] = t.getAttribute("data-del").split("|");
    if (t.dataset.confirm !== "1") { t.dataset.confirm = "1"; t.textContent = "Confirmar?"; return; }
    logs[id].splice(+i, 1);
    if (!logs[id].length) { delete logs[id]; save(LS.logs, logs); return go("h"); }
    save(LS.logs, logs); render(); return toast("Sessão apagada");
  }

  if (t.hasAttribute("data-save")) return saveSession(t.getAttribute("data-save"));
  if (t.hasAttribute("data-clear")) {
    document.querySelectorAll("input[data-w]").forEach(i => i.value = "");
    document.querySelectorAll(".done.on").forEach(b => { b.classList.remove("on"); b.closest(".ex").classList.remove("feito"); });
    return toast("Limpo");
  }
  if (t.hasAttribute("data-done")) {
    t.classList.toggle("on");
    t.closest(".ex").classList.toggle("feito", t.classList.contains("on"));
    if (t.classList.contains("on")) Timer.start(parseInt(t.getAttribute("data-rest"), 10) || 90, "Descanso · " + t.getAttribute("data-nome"));
    return;
  }
});

document.addEventListener("input", ev => { if (ev.target.id === "lib-q") pintaLib(ev.target.value); });

/* ------------------------------------------------ router */
function go(hash) { location.hash = hash; }
function render() {
  const h = location.hash.replace(/^#\/?/, "");
  if (h === "h") viewHistory();
  else if (h === "v") viewVolume();
  else if (h.startsWith("hx/")) viewExercise(h.slice(3));
  else if (h.startsWith("w/")) viewWorkout(h.slice(2));
  else viewHome();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", () => { closeSheet(); render(); });
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
