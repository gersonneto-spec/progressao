/* ============================================================
   PROGRESSÃO v3 — Aplicativo
   ============================================================ */

const K = { cfg: "pg3_cfg", ciclo: "pg3_ciclo", logs: "pg3_logs", subs: "pg3_subs", ses: "pg3_ses", cust: "pg3_cust", locs: "pg3_locs" };
const ler = (k, f) => { try { const v = JSON.parse(localStorage.getItem(k)); return v === null ? f : v; } catch (e) { return f; } };
const grava = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); return true; } catch (e) { return false; } };

let CFG = ler(K.cfg, { unidade: "kg", incSup: 2.5, incInf: 5, descPadrao: 90, primeiroDia: "A", graviton: true });
let CICLO = ler(K.ciclo, { semana: 1, diaIdx: 0, sessoes: 0, dias: [] });
let LOGS = ler(K.logs, {});
let SUBS = ler(K.subs, {});
let SES = ler(K.ses, null);
let CUST = ler(K.cust, []);        // exercícios do treino avulso
let LOCS = ler(K.locs, []);        // locais de treino já usados

const app = document.getElementById("app");
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const hoje = () => new Date().toISOString().slice(0, 10);
const ontem = () => { const d = new Date(); d.setDate(d.getDate() - 1); return d.toISOString().slice(0, 10); };
const dt = iso => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) : "";
const dtL = iso => iso ? iso.slice(8, 10) + "/" + iso.slice(5, 7) + "/" + iso.slice(2, 4) : "";
const U = () => CFG.unidade || "kg";

const treino = id => TREINOS.find(t => t.id === id);
const exsDe = t => t.ex.concat(CUST.filter(c => c.wid === t.id));
const exNome = ex => SUBS[ex.id] || ex.nome;
const todosEx = () => TREINOS.flatMap(t => exsDe(t).map(e => [t, e]));
const achaEx = id => todosEx().find(([, e]) => e.id === id) || null;
const diaAtual = () => DIAS[CICLO.diaIdx % 7];
const semAtual = () => Engine.semana(CICLO.semana);

/* ============================================================ recordes */
function recCarga(exId) { const h = LOGS[exId] || []; return h.length ? Math.max(...h.map(x => x.carga)) : 0; }
function recReps(exId) { const h = LOGS[exId] || []; return h.length ? Math.max(...h.map(x => x.reps)) : 0; }
function repsNaCarga(exId, carga) {
  const h = (LOGS[exId] || []).filter(x => x.carga === carga);
  return h.length ? Math.max(...h.map(x => x.reps)) : 0;
}
/* verifica se carga/reps informados batem recorde, comparando com o histórico salvo */
function checaPR(exId, carga, reps) {
  const h = LOGS[exId] || [];
  if (!h.length) return null;
  const rc = recCarga(exId);
  if (carga > rc) return { k: "carga", txt: "Recorde de carga. Anterior: " + fmtN(rc) + " " + U() + "." };
  if (carga === rc) {
    const rr = repsNaCarga(exId, carga);
    if (reps > rr) return { k: "reps", txt: "Recorde de repetições com " + fmtN(carga) + " " + U() + ". Anterior: " + rr + " reps." };
  }
  return null;
}

/* ============================================================ cronômetro */
const Timer = {
  left: 0, id: null, lbl: "Descanso",
  iniciar(seg, lbl) {
    if (!seg) return;
    this.left = seg; this.lbl = lbl || "Descanso";
    clearInterval(this.id);
    this.id = setInterval(() => { this.left--; this.pinta(); if (this.left <= 0) this.fim(); }, 1000);
    this.pinta();
  },
  mais(s) { if (this.el()) { this.left += s; this.pinta(); } },
  parar() { clearInterval(this.id); this.id = null; const e = this.el(); if (e) e.remove(); },
  fim() {
    clearInterval(this.id); this.id = null;
    if (navigator.vibrate) navigator.vibrate([200, 100, 200]);
    const e = this.el();
    if (e) { e.classList.add("fim"); e.querySelector(".t-time").textContent = "0:00"; e.querySelector(".t-lbl").textContent = "Descanso concluído. Próxima série."; }
    setTimeout(() => { const x = this.el(); if (x) x.remove(); }, 8000);
  },
  el() { return document.getElementById("timer"); },
  pinta() {
    let e = this.el();
    if (!e) {
      e = document.createElement("div"); e.id = "timer"; e.className = "timer";
      e.innerHTML = `<span class="t-lbl"></span><span class="t-time"></span>
        <button class="t-btn" data-tm="15">+15s</button><button class="t-btn" data-tm="stop">Pular</button>`;
      document.body.appendChild(e);
    }
    e.classList.remove("fim");
    const m = Math.floor(Math.max(0, this.left) / 60), s = Math.max(0, this.left) % 60;
    e.querySelector(".t-lbl").textContent = this.lbl;
    e.querySelector(".t-time").textContent = m + ":" + String(s).padStart(2, "0");
  }
};

/* ============================================================ folha inferior */
function folha(titulo, html) {
  let s = document.getElementById("folha");
  if (!s) { s = document.createElement("div"); s.id = "folha"; s.className = "folha"; document.body.appendChild(s); }
  s.innerHTML = `<div class="folha-bg" data-fecha></div><div class="folha-in">
    <div class="folha-h">${esc(titulo)}<button class="mini" data-fecha>Fechar</button></div>${html}</div>`;
  requestAnimationFrame(() => s.classList.add("abre"));
}
function fechaFolha() { const s = document.getElementById("folha"); if (s) { s.classList.remove("abre"); setTimeout(() => s.remove(), 200); } }

/* biblioteca: todos os exercícios do programa e suas substituições */
function biblioteca() {
  const m = new Map();
  TREINOS.forEach(t => t.ex.forEach(e => {
    if (!m.has(e.nome)) m.set(e.nome, { nome: e.nome, grupo: e.grupo, tipo: e.tipo, membro: e.membro, series: e.series, repMin: e.repMin, repMax: e.repMax, rir: 1, desc: e.desc, subs: e.subs || [] });
    (e.subs || []).forEach(s => { if (!m.has(s)) m.set(s, { nome: s, grupo: e.grupo, tipo: e.tipo, membro: e.membro, series: e.series, repMin: e.repMin, repMax: e.repMax, rir: 1, desc: e.desc, subs: [] }); });
  }));
  return [...m.values()].sort((a, b) => a.grupo.localeCompare(b.grupo) || a.nome.localeCompare(b.nome));
}
const semAcento = s => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
function folhaBiblioteca() {
  folha("Adicionar exercício", `
    <input id="lib-q" class="lib-busca" placeholder="Buscar exercício" autocomplete="off">
    <div id="lib-lista" class="lib-lista"></div>
    <button class="btn ghost" style="width:100%;margin-top:10px" data-novoex>Criar exercício que não está na lista</button>`);
  pintaLib("");
  setTimeout(() => { const i = document.getElementById("lib-q"); if (i) i.focus(); }, 220);
}
function pintaLib(q) {
  const box = document.getElementById("lib-lista"); if (!box) return;
  const termo = semAcento(q || "");
  const itens = biblioteca().filter(x => !termo || semAcento(x.nome).includes(termo) || semAcento(x.grupo).includes(termo)).slice(0, 40);
  box.innerHTML = itens.length ? itens.map(x => `<button class="sub-b" data-libpick="${esc(x.nome)}">
    <b style="font-weight:600">${esc(x.nome)}</b><br><span style="font-family:var(--f-mono);font-size:10.5px;color:var(--ink-3)">${esc(x.grupo)} · ${x.series}x${x.repMin}-${x.repMax}</span></button>`).join("")
    : `<p class="empty">Nada encontrado. Crie o exercício pelo botão abaixo.</p>`;
}
function folhaNovoEx() {
  folha("Novo exercício", `<div class="form">
    <label>Nome</label><input id="nx-nome" placeholder="Ex.: Panturrilha no leg press">
    <label>Grupo muscular</label>
    <select id="nx-grupo">${["Peito","Costas","Ombro","Braço","Perna","Abdômen"].map(g => `<option>${g}</option>`).join("")}</select>
    <label>Tipo</label>
    <select id="nx-tipo"><option value="isolador">Isolador</option><option value="composto">Composto</option></select>
    <div class="form-row">
      <div><label>Séries</label><input id="nx-ser" type="number" value="3"></div>
      <div><label>Descanso (s)</label><input id="nx-desc" type="number" value="75"></div>
    </div>
    <div class="form-row">
      <div><label>Reps mín.</label><input id="nx-rmin" type="number" value="10"></div>
      <div><label>Reps máx.</label><input id="nx-rmax" type="number" value="12"></div>
    </div>
    <button class="btn" style="width:100%;margin-top:16px" data-salvarex>Adicionar ao treino avulso</button>
  </div>`);
}
function addCust(base) {
  CUST.push(Object.assign({ id: "cx" + Date.now().toString(36), wid: "Z", tec: null, notas: [] }, base));
  grava(K.cust, CUST);
}

function aviso(msg) {
  let t = document.querySelector(".toast");
  if (!t) { t = document.createElement("div"); t.className = "toast"; document.body.appendChild(t); }
  t.textContent = msg;
  requestAnimationFrame(() => t.classList.add("show"));
  clearTimeout(aviso._t); aviso._t = setTimeout(() => t.classList.remove("show"), 2400);
}

/* ============================================================ gráfico */
function grafico(serie) {
  const W = 340, H = 150, ml = 36, mr = 14, mt = 14, mb = 24;
  const iw = W - ml - mr, ih = H - mt - mb;
  const vs = serie.map(p => p.v);
  let lo = Math.min(...vs), hi = Math.max(...vs);
  if (hi === lo) { hi = lo * 1.1 || 1; lo = Math.max(0, lo * 0.9); }
  const pd = (hi - lo) * .12; lo = Math.max(0, lo - pd); hi += pd;
  const x = i => ml + (serie.length === 1 ? iw / 2 : (i / (serie.length - 1)) * iw);
  const y = v => mt + ih - ((v - lo) / (hi - lo)) * ih;
  const grid = [0, .5, 1].map(t => {
    const v = lo + (hi - lo) * t, yy = y(v);
    return `<line x1="${ml}" x2="${W - mr}" y1="${yy.toFixed(1)}" y2="${yy.toFixed(1)}" class="g-grid"/>
      <text x="${ml - 6}" y="${(yy + 3.5).toFixed(1)}" class="g-tick" text-anchor="end">${fmtN(v)}</text>`;
  }).join("");
  const d = serie.map((p, i) => (i ? "L" : "M") + x(i).toFixed(1) + " " + y(p.v).toFixed(1)).join(" ");
  const area = d + ` L${x(serie.length - 1).toFixed(1)} ${mt + ih} L${x(0).toFixed(1)} ${mt + ih} Z`;
  const maxI = vs.indexOf(Math.max(...vs));
  const dots = serie.map((p, i) => {
    const on = i === serie.length - 1 || i === maxI;
    return `<circle cx="${x(i).toFixed(1)}" cy="${y(p.v).toFixed(1)}" r="${on ? 4.5 : 3}" class="g-dot${on ? " on" : ""}" data-v="${p.v}" data-d="${p.d}" data-r="${p.r}"/>`;
  }).join("");
  const lp = serie[serie.length - 1];
  return `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Evolução da carga">
    ${grid}<path d="${area}" class="g-area"/><path d="${d}" class="g-line"/>${dots}
    <text x="${(x(serie.length - 1) - 4).toFixed(1)}" y="${(y(lp.v) - 10).toFixed(1)}" class="g-lbl" text-anchor="end">${fmtN(lp.v)}</text>
    <text x="${ml}" y="${H - 6}" class="g-tick">${dt(serie[0].d)}</text>
    <text x="${W - mr}" y="${H - 6}" class="g-tick" text-anchor="end">${dt(lp.d)}</text>
  </svg><p class="g-cap" id="gcap">Toque em um ponto para ver a sessão.</p>`;
}

/* ============================================================ navegação */
function nav(atual) {
  return `<div class="navbar">
    <button data-ir="" class="${atual === "p" ? "on" : ""}">Painel</button>
    <button data-ir="t" class="${atual === "t" ? "on" : ""}">Treino</button>
    <button data-ir="h" class="${atual === "h" ? "on" : ""}">Histórico</button>
    <button data-ir="c" class="${atual === "c" ? "on" : ""}">Ajustes</button>
  </div>`;
}
const topo = (extra) => `<header class="topbar">
  <div class="mark">PRO<span>GRESSÃO</span></div>
  <div class="meta">${extra || "Semana " + CICLO.semana + " · Dia " + diaAtual()}</div>
</header>`;

/* ============================================================ PAINEL */
function vPainel() {
  const s = semAtual(), d = diaAtual();
  const t = d === "R" ? null : treino(d);
  const pct = Math.round(((CICLO.semana - 1) * 7 + CICLO.diaIdx) / 84 * 100);
  const seq = sequencia();
  const evo = evoluiram();
  const pend = t ? exsDe(t).filter(e => !(SES && SES.treino === t.id && SES.feitos[e.id])).length : 0;

  app.innerHTML = topo() + nav("p") + `
  <section class="hero rise">
    <h1>Semana ${CICLO.semana} <em>de 12</em></h1>
    <p>${esc(s.foco)}</p>
    <div class="pbar"><i style="width:${pct}%"></i></div>
    <p style="font-family:var(--f-mono);font-size:11px;color:var(--ink-3);margin:8px 0 0">${pct}% do ciclo concluído</p>
  </section>

  <div class="grid-3 rise">
    <div class="stat azul"><div class="k">Sessões</div><div class="v">${CICLO.sessoes}</div></div>
    <div class="stat verde"><div class="k">Sequência</div><div class="v">${seq}<small> dias</small></div></div>
    <div class="stat ${s.descarga ? "amarelo" : ""}"><div class="k">RIR alvo</div><div class="v" style="font-size:20px">${s.rirCTxt} / ${s.rirITxt}</div></div>
  </div>

  <div class="sec">Treino de hoje</div>
  ${t ? `
  <div class="card destaque plain">
    <div class="grp">Dia ${t.id} · ${esc(t.grupo)}</div>
    <h3>${esc(t.titulo)}</h3>
    <p class="focus">${exsDe(t).length} exercícios · ${pend} ${pend === 1 ? "pendente" : "pendentes"} · ${PERFIL.duracao} min</p>
    <div class="tags">
      <span class="tag azul">Compostos RIR ${s.rirCTxt}</span>
      <span class="tag">Isoladores RIR ${s.rirITxt}</span>
      ${s.tec ? `<span class="tag amarelo">Técnicas ativas</span>` : ""}
      ${s.descarga ? `<span class="tag amarelo">Descarga</span>` : ""}
    </div>
    <div class="btns" style="padding:14px 0 0">
      <button class="btn grande" data-ir="t">${SES && SES.treino === t.id ? "Continuar treino" : "Iniciar treino"}</button>
    </div>
  </div>` : `
  <div class="card plain">
    <div class="grp">Dia 7</div>
    <h3>Descanso</h3>
    <p class="focus">Recuperação. Depois do descanso, o ciclo reinicia pelo treino A.</p>
    <div class="btns" style="padding:14px 0 0"><button class="btn verde" data-descanso>Concluir dia de descanso</button></div>
  </div>`}

  <div class="sec">Trocar o treino do dia</div>
  <div class="chips" style="padding:0 0 4px">
    ${TREINOS.filter(x => !x.avulso).map(x => `<button class="mini ${x.id === d ? "on" : ""}" data-dia="${x.id}">${x.id} · ${esc(x.grupo)}</button>`).join("")}
    <button class="mini ${d === "R" ? "on" : ""}" data-dia="R">Descanso</button>
  </div>

  <div class="sec">Fora do programa</div>
  <button class="card" data-avulso>
    <div class="grp">Avulso</div>
    <h3>Treino avulso</h3>
    <p class="focus">Monte a sessão na hora e registre igual aos treinos do ciclo. Não avança o dia do programa.</p>
  </button>

  ${evo.length ? `<div class="sec">Cargas que evoluíram</div>
  ${evo.slice(0, 6).map(x => `<button class="card" data-ir="hx/${x.id}">
      <div class="grp">${esc(x.grupo)}</div>
      <h3 style="font-size:17px">${esc(x.nome)}</h3>
      <p class="focus"><span style="color:var(--verde)">${fmtN(x.de)} → ${fmtN(x.para)} ${U()}</span> na última progressão</p>
    </button>`).join("")}` : ""}

  ${estagnados().length ? `<div class="sec">Atenção</div>
  ${estagnados().slice(0, 5).map(x => `<button class="card" data-ir="hx/${x.id}">
      <div class="grp" style="color:var(--amarelo)">Estagnação</div>
      <h3 style="font-size:17px">${esc(x.nome)}</h3>
      <p class="focus">${x.n} sessões sem ganho de carga nem de repetições, desde ${dt(x.desde)}.</p>
    </button>`).join("")}` : ""}

  <p class="rodape">${esc(AVISO_SEGURANCA)}<br>Dor articular não é intensidade.</p>`;
}

function sequencia() {
  const ds = [...new Set((CICLO.dias || []).map(x => x.d))].sort().reverse();
  if (!ds.length) return 0;
  let n = 1;
  for (let i = 0; i < ds.length - 1; i++) {
    const a = new Date(ds[i] + "T12:00:00"), b = new Date(ds[i + 1] + "T12:00:00");
    if (Math.round((a - b) / 864e5) === 1) n++; else break;
  }
  const ultimo = new Date(ds[0] + "T12:00:00");
  const dif = Math.round((new Date(hoje() + "T12:00:00") - ultimo) / 864e5);
  return dif > 1 ? 0 : n;
}
function evoluiram() {
  const out = [];
  todosEx().forEach(([t, e]) => {
    const h = LOGS[e.id];
    if (h && h.length >= 2 && h[0].carga > h[1].carga) out.push({ id: e.id, nome: exNome(e), grupo: e.grupo, de: h[1].carga, para: h[0].carga, d: h[0].d });
  });
  return out.sort((a, b) => b.d.localeCompare(a.d));
}
function estagnados() {
  const out = [];
  todosEx().forEach(([t, e]) => {
    const s = Engine.estagnado(e.id, LOGS);
    if (s) out.push({ id: e.id, nome: exNome(e), n: s.n, desde: s.desde });
  });
  return out;
}

/* ============================================================ TREINO */
function abreSessao(tid) {
  if (!SES || SES.treino !== tid) {
    SES = { treino: tid, semana: CICLO.semana, inicio: Date.now(), d: hoje(), loc: LOCS[0] || "", idx: 0, feitos: {}, aq: false };
    grava(K.ses, SES);
    return;
  }
  // sessão aberta sem nenhum registro acompanha a semana e o dia atuais
  if (!Object.keys(SES.feitos).length) {
    let mudou = false;
    if (SES.semana !== CICLO.semana) { SES.semana = CICLO.semana; mudou = true; }
    if (!SES.dManual && SES.d !== hoje()) { SES.d = hoje(); mudou = true; }
    if (mudou) grava(K.ses, SES);
  }
}
function vTreino() {
  const d = diaAtual();
  if (d === "R" && !SES) { return vPainel(); }
  const tid = SES ? SES.treino : d;
  const t = treino(tid);
  if (!t) return vPainel();
  abreSessao(tid);

  const lista = exsDe(t);
  const total = lista.length;
  const feitos = Object.keys(SES.feitos).length;
  const i = Math.min(SES.idx, total - 1);
  const ex = lista[i];
  const par = ex && ex.ss && ex.ssOrdem === 1 ? lista[i + 1] : null;

  app.innerHTML = topo("Treino " + t.id + " · " + (i + 1) + "/" + total) + `
  <section class="hero rise" style="padding-bottom:12px">
    <h1 style="font-size:clamp(23px,6.4vw,32px)">${esc(t.titulo)}</h1>
    <p style="margin-bottom:10px">${feitos} de ${total} exercícios concluídos${t.nota ? " · " + esc(t.nota) : ""}</p>
    <div class="pbar"><i style="width:${Math.round(feitos / total * 100)}%"></i></div>
  </section>

  <div class="card plain rise">
    <div class="grp">Sessão</div>
    <div class="sessao" style="padding:12px 0 0">
      <div class="quando">
        <button class="mini ${SES.d === hoje() ? "on" : ""}" data-quando="hoje">Treinei hoje</button>
        <button class="mini ${SES.d === ontem() ? "on" : ""}" data-quando="ontem">Treinei ontem</button>
        <button class="mini" data-quando="outra">Outra data</button>
      </div>
      <input type="date" id="ses-data" value="${SES.d}" max="${hoje()}">
      <input type="text" id="ses-loc" list="locs" placeholder="Local do treino" value="${esc(SES.loc || "")}" autocomplete="off">
      <datalist id="locs">${LOCS.map(l => `<option value="${esc(l)}"></option>`).join("")}</datalist>
    </div>
  </div>

  ${!SES.aq ? `
  <div class="card plain rise">
    <div class="grp">Aquecimento geral</div>
    <h3 style="font-size:18px">3 a 5 minutos de bicicleta leve ou mobilidade</h3>
    <p class="focus">O objetivo é elevar a temperatura, não gerar cansaço.</p>
    <div class="btns" style="padding:13px 0 0"><button class="btn ghost" data-aqgeral>Concluir aquecimento geral</button></div>
  </div>` : ""}

  ${ex ? cardEx(t, ex, i, par) : `<p class="empty">Nenhum exercício ainda. Adicione abaixo.</p>`}
  ${t.avulso ? `<button class="btn ghost" style="width:100%;margin-bottom:14px" data-addex>+ Adicionar exercício</button>` : ""}

  <div class="btns duo" style="padding:0">
    <button class="btn ghost" data-nav="-1" ${i === 0 ? "disabled" : ""}>← Anterior</button>
    <button class="btn ghost" data-nav="1" ${i >= total - 1 ? "disabled" : ""}>Próximo →</button>
  </div>

  <div class="bar"><div class="bar-in">
    <button class="btn ghost" style="flex:0 0 auto" data-ir="">Sair</button>
    <button class="btn verde" data-fim>Finalizar treino</button>
  </div></div>`;
}

function cardEx(t, ex, i, par) {
  const sem = SES.semana;
  const sug = Engine.sugestao(ex, sem, LOGS, CFG);
  const u = Engine.ultima(ex.id, LOGS);
  const tec = Engine.tecnica(ex, sem);
  const series = Engine.series(ex, sem);
  const aq = Engine.aquecimento(ex, sug.carga, Engine.ordemGrupo(t, ex), CFG);
  const bo = Engine.backoff(sug.carga, ex, CFG);
  const feito = SES.feitos[ex.id];
  const nome = exNome(ex);
  const est = Engine.estagnado(ex.id, LOGS);

  const listaEx = exsDe(t);
  const registro = (e, pos) => {
    const f = SES.feitos[e.id] || {};
    return `
    <div class="registro" data-reg="${e.id}">
      ${pos ? `<div class="ex-pos" style="padding-top:12px">${esc(pos)}</div>` : ""}
      <label>Última série válida — carga e repetições</label>
      <div class="reg2">
        <div class="campo"><input type="number" inputmode="decimal" step="0.5" id="c-${e.id}" value="${f.carga != null ? f.carga : ""}" placeholder="${sugDe(e) != null ? fmtN(sugDe(e)) : "0"}"><span>${U()}</span></div>
        <div class="campo"><input type="number" inputmode="numeric" id="r-${e.id}" value="${f.reps != null ? f.reps : ""}" placeholder="${e.repMin}-${e.repMax}"><span>reps</span></div>
      </div>
      <label>Intensidade da série (RIR)</label>
      <div class="rir-grid">
        ${RIRS.map(r => `<button class="rir-b ${r.k === "F" ? "f" : ""} ${f.rir === r.v ? "on" : ""}" data-rir="${e.id}|${r.v}">${r.k === "F" ? "Falha técnica" : r.n.replace("RIR ", "")}</button>`).join("")}
      </div>
      <label class="check"><input type="checkbox" id="dor-${e.id}" ${f.dor ? "checked" : ""}> Senti dor ou perdi a execução nesta série</label>
    </div>`;
  };

  const chips = e => {
    const s2 = Engine.series(e, sem), t2 = Engine.tecnica(e, sem);
    return `<div class="chips">
      <span class="tag azul">${s2} ${s2 === 1 ? "série válida" : "séries válidas"}</span>
      <span class="tag">${e.repMin} a ${e.repMax} reps</span>
      <span class="tag">RIR ${Engine.rirAlvoTxt(e, sem)}</span>
      <span class="tag">${e.desc && e.desc[0] ? "descanso " + e.desc[0] + " a " + e.desc[1] + "s" : "sem descanso"}</span>
      ${e.estrutura === "topset" ? `<span class="tag verde">Top set + ${e.backoffs} back-offs</span>` : ""}
      ${t2 ? `<span class="tag amarelo">${esc(t2.n)}</span>` : ""}
    </div>`;
  };

  const blocos = (e, sg, ul) => {
    const rc = recCarga(e.id), rr = rc ? repsNaCarga(e.id, rc) : 0;
    return `
    <div class="linha-num">
      <div class="bloco"><div class="k">Última</div><div class="v">${ul ? fmtN(ul.carga) : "—"}<small>${ul ? " " + U() : ""}</small></div>
        <div class="k" style="margin-top:4px;letter-spacing:.04em">${ul ? ul.reps + " reps · RIR " + fmtRir(ul.rir) : "sem registro"}</div></div>
      <div class="bloco recorde"><div class="k">Recorde</div><div class="v">${rc ? fmtN(rc) : "—"}<small>${rc ? " " + U() : ""}</small></div>
        <div class="k" style="margin-top:4px;letter-spacing:.04em">${rc ? rr + " reps nessa carga" : "a bater"}</div></div>
      <div class="bloco alvo"><div class="k">Sugerida hoje</div><div class="v">${sg.carga != null ? fmtN(sg.carga) : "—"}<small>${sg.carga != null ? " " + U() : ""}</small></div>
        <div class="k" style="margin-top:4px;letter-spacing:.04em">RIR ${Engine.rirAlvoTxt(e, sem)}</div></div>
    </div>`;
  };

  const aquec = (e, a) => !a.linhas.length ? "" : `
    <div class="aq" id="aq-${e.id}">
      <div class="ex-pos" style="margin-bottom:8px">Aquecimento${a.opcional ? " (dispensável se já estiver aquecido)" : ""}${a.semCarga ? " · digite a carga de trabalho abaixo para calcular" : ""}</div>
      ${linhasAq(a)}
    </div>`;

  const infos = (e, sg, bo2) => `
    <div class="painel-info">
      ${e.estrutura === "topset" && sg.carga ? `<div class="info-l"><span>Top set</span><b>${fmtN(sg.carga)} ${U()}</b></div>
      <div class="info-l"><span>${e.backoffs} back-offs</span><b>${fmtN(bo2)} ${U()}</b></div>` : ""}
      ${(e.notas || []).map(n => `<div class="info-l"><span>${esc(n)}</span><b></b></div>`).join("")}
    </div>`;

  const head = (e, pos) => `
    <div class="ex-top">
      <div class="ex-pos">${esc(pos)}</div>
      <h2>${esc(exNome(e))}</h2>
    </div>`;

  if (par) {
    const sugB = Engine.sugestao(par, sem, LOGS, CFG);
    const uB = Engine.ultima(par.id, LOGS);
    const aqB = Engine.aquecimento(par, sugB.carga, Engine.ordemGrupo(t, par), CFG);
    return `
    <article class="ex-card rise">
      <div class="ss-flag">Supersérie · ${esc(SUPERSERIES[ex.ss] || "")} · sem descanso entre os dois</div>
      ${head(ex, "Exercício " + (i + 1) + " de " + listaEx.length)}
      ${chips(ex)} ${blocos(ex, sug, u)} ${aquec(ex, aq)} ${infos(ex, sug, bo)}
      ${registro(ex, "Registro do primeiro exercício")}
      ${head(par, "Exercício " + (i + 2) + " de " + listaEx.length)}
      ${chips(par)} ${blocos(par, sugB, uB)} ${aquec(par, aqB)} ${infos(par, sugB, Engine.backoff(sugB.carga, par, CFG))}
      ${registro(par, "Registro do segundo exercício")}
      <div class="aviso azul"><b>Descanso</b>Só depois de completar os dois exercícios: ${Engine.descanso(par)} segundos.</div>
      <div class="btns">
        <button class="btn" data-concluir="${ex.id}|${par.id}">Concluir supersérie e descansar</button>
        <button class="btn ghost" data-subs="${ex.id}">Substituir exercícios</button>
      </div>
      ${listaSubs(ex)} ${listaSubs(par)}
    </article>`;
  }

  return `
  <article class="ex-card rise">
    ${head(ex, "Exercício " + (i + 1) + " de " + listaEx.length + (feito ? " · concluído" : ""))}
    ${chips(ex)}
    ${blocos(ex, sug, u)}
    <div class="aviso ${sug.tipo === "subir" ? "verde" : sug.tipo === "descarga" ? "" : "azul"}">
      <b>Carga de hoje</b>${esc(sug.txt)}
    </div>
    ${feito && feito.pr ? `<div class="aviso verde"><b>Novo recorde</b>${esc(feito.pr.txt)}</div>` : ""}
    ${est ? `<div class="aviso"><b>Estagnação</b>${est.n} sessões sem ganho. Considere trocar por uma substituição ou reduzir o volume nesta semana.</div>` : ""}
    ${tec ? `<div class="aviso"><b>Técnica da semana · ${esc(tec.n)}</b>${esc(tec.d)}</div>` : ""}
    ${aquec(ex, aq)}
    ${infos(ex, sug, bo)}
    ${registro(ex)}
    <div class="btns">
      <button class="btn" data-concluir="${ex.id}">Concluir exercício e descansar</button>
      <div class="btns duo" style="padding:0">
        <button class="btn ghost" data-descanso-manual="${Engine.descanso(ex)}|${esc(nome)}">Iniciar descanso</button>
        <button class="btn ghost" data-subs="${ex.id}">Substituir</button>
      </div>
      ${ex.wid ? `<button class="mini danger" data-delex="${ex.id}">Remover do treino avulso</button>` : ""}
    </div>
    ${listaSubs(ex)}
  </article>`;
}

function linhasAq(a) {
  return a.linhas.map(l => a.graviton
    ? `<div class="aq-l"><span class="p">—</span><span class="c">${esc(l.txt)}</span><span class="r">${l.reps} reps</span></div>`
    : `<div class="aq-l"><span class="p">${Math.round(l.pct * 100)}%</span><span class="c">${l.carga == null ? "—" : fmtN(l.carga) + " " + U()}</span><span class="r">${l.reps} reps</span></div>`
  ).join("");
}

/* recalcula o aquecimento quando o atleta digita a carga */
function recalcAq(exId, carga) {
  const box = document.getElementById("aq-" + exId);
  const p = achaEx(exId); if (!box || !p) return;
  const [t, e] = p;
  const a = Engine.aquecimento(e, carga, Engine.ordemGrupo(t, e), CFG);
  const cab = box.querySelector(".ex-pos");
  box.innerHTML = (cab ? cab.outerHTML : "") + linhasAq(a);
}

function sugDe(e) { const s = Engine.sugestao(e, SES ? SES.semana : CICLO.semana, LOGS, CFG); return s.carga; }

function listaSubs(e) {
  const cur = exNome(e);
  return `<div class="subs" id="subs-${e.id}">
    <button class="sub-b ${cur === e.nome ? "cur" : ""}" data-usar="${e.id}|${esc(e.nome)}">${esc(e.nome)} <span style="color:var(--ink-3)">(principal)</span></button>
    ${(e.subs || []).map(s => `<button class="sub-b ${cur === s ? "cur" : ""}" data-usar="${e.id}|${esc(s)}">${esc(s)}</button>`).join("")}
  </div>`;
}

/* concluir exercício */
function concluir(ids) {
  const lista = ids.split("|");
  let ok = 0; const prs = [];
  lista.forEach(id => {
    const c = document.getElementById("c-" + id), r = document.getElementById("r-" + id);
    const dor = document.getElementById("dor-" + id);
    const f = SES.feitos[id] || {};
    const carga = c && c.value !== "" ? parseFloat(c.value) : null;
    const reps = r && r.value !== "" ? parseInt(r.value, 10) : null;
    if (carga == null || reps == null || f.rir == null) return;
    const pr = checaPR(id, carga, reps);
    SES.feitos[id] = { carga, reps, rir: f.rir, dor: !!(dor && dor.checked), pr };
    if (pr) prs.push(pr);
    ok++;
  });
  if (ok < lista.length) return aviso("Preencha carga, repetições e RIR antes de concluir");
  grava(K.ses, SES);

  const t = treino(SES.treino);
  const ultimo = lista[lista.length - 1];
  const ex = exsDe(t).find(e => e.id === ultimo);
  const lx = exsDe(t);
  const prox = lx.findIndex(e => !SES.feitos[e.id]);
  SES.idx = prox === -1 ? lx.length - 1 : prox;
  grava(K.ses, SES);
  Timer.iniciar(Engine.descanso(ex) || CFG.descPadrao, "Descanso · " + exNome(ex));
  render();
  aviso(prs.length ? "Novo recorde. " + prs[0].txt : (ok > 1 ? "Supersérie registrada" : "Exercício registrado"));
}

/* finalizar treino */
function finalizar() {
  if (!SES) return;
  const t = treino(SES.treino);
  const ids = Object.keys(SES.feitos);
  if (!ids.length) {
    if (!confirmar("fim")) return aviso("Toque de novo para descartar a sessão");
    SES = null; grava(K.ses, null); return irPara("");
  }
  const dataSes = (document.getElementById("ses-data") || {}).value || SES.d || hoje();
  const locSes = ((document.getElementById("ses-loc") || {}).value || SES.loc || "").trim();
  SES.d = dataSes; SES.loc = locSes;
  if (locSes) { LOCS = [locSes].concat(LOCS.filter(l => l !== locSes)).slice(0, 12); grava(K.locs, LOCS); }
  ids.forEach(id => {
    const e = exsDe(t).find(x => x.id === id); if (!e) return;
    const f = SES.feitos[id];
    const sug = Engine.sugestao(e, SES.semana, LOGS, CFG);
    LOGS[id] = LOGS[id] || [];
    const reg = { d: dataSes, semana: SES.semana, treino: t.id, nome: exNome(e),
                  carga: f.carga, reps: f.reps, rir: f.rir, dor: !!f.dor, loc: locSes,
                  pr: f.pr ? f.pr.k : null,
                  rirAlvo: Engine.rirAlvo(e, SES.semana), sugerida: sug.carga };
    if (LOGS[id][0] && LOGS[id][0].d === reg.d) LOGS[id][0] = reg; else LOGS[id].unshift(reg);
    LOGS[id] = LOGS[id].slice(0, 500);
  });
  CICLO.sessoes++;
  CICLO.dias = (CICLO.dias || []).filter(x => !(x.d === dataSes && x.t === t.id));
  CICLO.dias.push({ d: dataSes, t: t.id, s: SES.semana });
  CICLO.dias = CICLO.dias.slice(-200);
  if (!t.avulso) avancaDia();
  SES = null; grava(K.ses, null);
  grava(K.logs, LOGS); grava(K.ciclo, CICLO);
  Timer.parar();
  aviso("Treino finalizado. " + ids.length + " exercícios registrados.");
  irPara("");
}

function avancaDia() {
  CICLO.diaIdx = (CICLO.diaIdx + 1) % 7;
  if (CICLO.diaIdx === 0) CICLO.semana = Math.min(12, CICLO.semana + 1);
  grava(K.ciclo, CICLO);
}

let _conf = {};
function confirmar(k) {
  if (_conf[k]) { _conf[k] = false; return true; }
  _conf[k] = true; setTimeout(() => _conf[k] = false, 4000); return false;
}

/* ============================================================ HISTÓRICO */
function vHist() {
  const linhas = todosEx().filter(([, e]) => LOGS[e.id] && LOGS[e.id].length).map(([t, e]) => {
    const h = LOGS[e.id], rec = Engine.recordes(e.id, LOGS), est = Engine.estagnado(e.id, LOGS);
    return `<button class="card" data-ir="hx/${e.id}">
      <div class="grp">Treino ${t.id} · ${esc(e.grupo)}</div>
      <h3 style="font-size:18px">${esc(exNome(e))}</h3>
      <div class="tags">
        <span class="tag">${h.length} ${h.length === 1 ? "sessão" : "sessões"}</span>
        <span class="tag azul">recorde ${fmtN(rec.carga.carga)} ${U()}</span>
        <span class="tag">${h[0].reps} reps · RIR ${fmtRir(h[0].rir)}</span>
        ${est ? `<span class="tag amarelo">estagnado</span>` : ""}
      </div>
    </button>`;
  }).join("");

  app.innerHTML = topo() + nav("h") + `
  <section class="hero rise" style="padding-bottom:8px">
    <h1>Histórico</h1>
    <p style="margin-bottom:0">Toque em um exercício para ver a evolução da carga, os recordes e todas as sessões.</p>
  </section>
  ${linhas || `<p class="empty">Nenhuma sessão registrada. Finalize um treino para começar o histórico.</p>`}
  <div style="height:30px"></div>`;
}

function vHistEx(id) {
  const p = achaEx(id), h = LOGS[id];
  if (!p || !h || !h.length) return irPara("h");
  const [t, e] = p;
  const cron = h.slice().reverse();
  const serie = cron.map(x => ({ d: x.d, v: x.carga, r: x.reps }));
  const rec = Engine.recordes(id, LOGS), est = Engine.estagnado(id, LOGS);
  const delta = serie.length > 1 && serie[0].v ? ((serie[serie.length - 1].v - serie[0].v) / serie[0].v) * 100 : 0;
  const sug = Engine.sugestao(e, CICLO.semana, LOGS, CFG);

  app.innerHTML = topo() + `
  <div style="margin-bottom:14px"><button class="back" data-ir="h">← Histórico</button></div>
  <section class="hero rise" style="padding-bottom:12px">
    <h1 style="font-size:clamp(22px,6vw,30px)">${esc(exNome(e))}</h1>
    <p style="margin-bottom:12px">Treino ${t.id} · ${esc(e.grupo)} · ${h.length} ${h.length === 1 ? "sessão" : "sessões"}</p>
    <div class="grid-3">
      <div class="stat azul"><div class="k">Recorde carga</div><div class="v">${fmtN(rec.carga.carga)}<small> ${U()}</small></div></div>
      <div class="stat"><div class="k">Recorde reps</div><div class="v">${rec.reps.reps}</div></div>
      <div class="stat ${delta >= 0 ? "verde" : "amarelo"}"><div class="k">Variação</div><div class="v">${delta >= 0 ? "+" : ""}${fmtN(delta)}<small>%</small></div></div>
    </div>
  </section>
  ${est ? `<div class="card plain" style="border-color:rgba(255,194,61,.4)"><div class="grp" style="color:var(--amarelo)">Estagnação</div>
    <p class="focus" style="margin-top:6px">${est.n} sessões sem ganho de carga nem de repetições, desde ${dt(est.desde)}. Considere substituir o exercício ou reduzir o volume por uma semana.</p></div>` : ""}
  <div class="card plain"><div class="grp">Estimativa para a próxima sessão</div>
    <p class="focus" style="margin-top:6px">${sug.carga != null ? "<b style='color:var(--azul)'>" + fmtN(sug.carga) + " " + U() + "</b> · " : ""}${esc(sug.txt)}</p></div>
  <div class="sec">Evolução da carga</div>
  <div class="chart-box rise">${serie.length > 1 ? grafico(serie) : `<p class="empty">Registre pelo menos duas sessões para a curva aparecer.</p>`}</div>
  <div class="sec">Sessões</div>
  <div class="hist">
    ${h.map((x, k) => `<div class="hl">
      <span class="d">${dtL(x.d)}</span>
      <span class="kg">${fmtN(x.carga)} ${U()}</span>
      <span class="rr">${x.reps} reps · RIR ${fmtRir(x.rir)} · S${x.semana}${x.dor ? " · dor" : ""}${x.loc ? " · " + esc(x.loc) : ""}</span>
      ${x.carga === rec.carga.carga && x.reps === repsNaCarga(id, x.carga) ? `<span class="pr">recorde</span>` : ""}
      <span class="tools"><button class="mini danger" data-apagar="${id}|${k}">Apagar</button></span>
    </div>`).join("")}
  </div>
  <div style="height:40px"></div>`;
}

/* ============================================================ AJUSTES */
function vConfig() {
  app.innerHTML = topo() + nav("c") + `
  <section class="hero rise" style="padding-bottom:6px">
    <h1>Ajustes</h1>
    <p style="margin-bottom:0">Atleta: ${esc(PERFIL.nome)}, ${PERFIL.idade} anos, ${fmtN(PERFIL.altura)} m, ${PERFIL.peso} kg. Nível ${esc(PERFIL.nivel.toLowerCase())}, ${esc(PERFIL.frequencia)}, até ${PERFIL.duracao} minutos por sessão.</p>
  </section>

  <div class="card plain form">
    <label>Unidade de carga</label>
    <select id="cf-un"><option value="kg" ${CFG.unidade === "kg" ? "selected" : ""}>Quilogramas (kg)</option><option value="lb" ${CFG.unidade === "lb" ? "selected" : ""}>Libras (lb)</option></select>
    <div class="form-row">
      <div><label>Menor incremento superior</label><input id="cf-is" type="number" step="0.5" value="${CFG.incSup}"></div>
      <div><label>Menor incremento inferior</label><input id="cf-ii" type="number" step="0.5" value="${CFG.incInf}"></div>
    </div>
    <label>Descanso padrão (segundos)</label>
    <input id="cf-dp" type="number" value="${CFG.descPadrao}">
    <label>Graviton disponível</label>
    <select id="cf-gv"><option value="1" ${CFG.graviton ? "selected" : ""}>Sim</option><option value="0" ${!CFG.graviton ? "selected" : ""}>Não, uso barra fixa com lastro</option></select>
    <label>Semana atual do ciclo</label>
    <select id="cf-sem">${SEMANAS.map(s => `<option value="${s.n}" ${s.n === CICLO.semana ? "selected" : ""}>Semana ${s.n}${s.descarga ? " (descarga)" : ""}</option>`).join("")}</select>
    <label>Dia atual do ciclo</label>
    <select id="cf-dia">${DIAS.map((d, k) => `<option value="${k}" ${k === CICLO.diaIdx ? "selected" : ""}>${d === "R" ? "Descanso" : "Treino " + d + " · " + treino(d).grupo}</option>`).join("")}</select>
    <button class="btn" style="width:100%;margin-top:18px" data-salvarcfg>Salvar ajustes</button>
  </div>

  <div class="sec">Backup e dados</div>
  <div class="card plain">
    <p class="focus" style="margin-bottom:14px">Tudo fica salvo apenas neste aparelho. Exporte de tempos em tempos para não perder o histórico.</p>
    <div class="btns" style="padding:0">
      <div class="btns duo" style="padding:0">
        <button class="btn ghost" data-exp="json">Exportar backup JSON</button>
        <button class="btn ghost" data-exp="csv">Exportar histórico CSV</button>
      </div>
      <button class="btn ghost" data-imp>Importar backup</button>
      <input type="file" id="arq" accept=".json,application/json" style="display:none">
      <button class="btn ghost" style="color:var(--vermelho);border-color:rgba(255,107,125,.4)" data-zerar>Zerar ciclo e histórico</button>
    </div>
    <textarea id="saida" style="display:none;width:100%;height:150px;margin-top:12px;background:var(--bg-2);color:var(--ink);border:1px solid var(--line);border-radius:11px;padding:11px;font-family:var(--f-mono);font-size:11px"></textarea>
  </div>

  <div class="sec">Substituições ativas</div>
  ${Object.keys(SUBS).length ? Object.entries(SUBS).map(([id, nome]) => {
    const p = achaEx(id); if (!p) return "";
    return `<div class="card plain"><div class="grp">${esc(p[1].nome)}</div>
      <h3 style="font-size:16px">${esc(nome)}</h3>
      <div class="btns" style="padding:10px 0 0"><button class="mini" data-desfaz="${id}">Voltar ao principal</button></div></div>`;
  }).join("") : `<p class="empty">Nenhuma substituição ativa. Elas permanecem até você trocar de novo.</p>`}

  <p class="rodape">${esc(AVISO_SEGURANCA)}</p>`;
}

/* ============================================================ export / import */
function exportar(tipo) {
  const out = document.getElementById("saida");
  let txt, nome, mime;
  if (tipo === "json") {
    txt = JSON.stringify({ v: 3, exportado: new Date().toISOString(), cfg: CFG, ciclo: CICLO, logs: LOGS, subs: SUBS }, null, 1);
    nome = "progressao-backup-" + hoje() + ".json"; mime = "application/json";
  } else {
    const l = ["data;semana;treino;exercicio;carga;reps;rir;dor"];
    todosEx().forEach(([t, e]) => (LOGS[e.id] || []).forEach(x =>
      l.push([x.d, x.semana, x.treino, (x.nome || e.nome).replace(/;/g, ","), x.carga, x.reps, fmtRir(x.rir), x.dor ? "sim" : "nao"].join(";"))));
    txt = l.join("\n"); nome = "progressao-historico-" + hoje() + ".csv"; mime = "text/csv";
  }
  try {
    const a = document.createElement("a");
    a.href = URL.createObjectURL(new Blob([txt], { type: mime + ";charset=utf-8" }));
    a.download = nome; document.body.appendChild(a); a.click(); a.remove();
  } catch (e) {}
  if (out) { out.style.display = "block"; out.value = txt; out.select(); }
  aviso("Arquivo gerado. Se o download não abrir, copie o texto abaixo.");
}
function importarTexto(txt) {
  try {
    const o = JSON.parse(txt);
    if (!o || !o.logs) throw 0;
    CFG = Object.assign(CFG, o.cfg || {}); CICLO = o.ciclo || CICLO; LOGS = o.logs || {}; SUBS = o.subs || {};
    grava(K.cfg, CFG); grava(K.ciclo, CICLO); grava(K.logs, LOGS); grava(K.subs, SUBS);
    render(); aviso("Backup restaurado");
  } catch (e) { aviso("Arquivo inválido"); }
}

/* ============================================================ eventos */
document.addEventListener("click", ev => {
  const el = ev.target.closest("button, .g-dot");
  if (!el) return;

  if (el.classList.contains("g-dot")) {
    const c = document.getElementById("gcap");
    if (c) c.textContent = dtL(el.getAttribute("data-d")) + " — " + fmtN(parseFloat(el.getAttribute("data-v"))) + " " + U() + " x " + el.getAttribute("data-r") + " reps";
    document.querySelectorAll(".g-dot.sel").forEach(d => d.classList.remove("sel"));
    el.classList.add("sel"); return;
  }
  if (el.hasAttribute("data-tm")) return el.getAttribute("data-tm") === "stop" ? Timer.parar() : Timer.mais(15);
  if (el.hasAttribute("data-ir")) return irPara(el.getAttribute("data-ir"));

  if (el.hasAttribute("data-fecha")) return fechaFolha();
  if (el.hasAttribute("data-addex")) return folhaBiblioteca();
  if (el.hasAttribute("data-novoex")) { fechaFolha(); return setTimeout(folhaNovoEx, 210); }
  if (el.hasAttribute("data-libpick")) {
    const nome = el.getAttribute("data-libpick");
    const b = biblioteca().find(x => x.nome === nome);
    addCust({ nome: b.nome, grupo: b.grupo, tipo: b.tipo, membro: b.membro, series: b.series, repMin: b.repMin, repMax: b.repMax, rir: 1, desc: b.desc, subs: b.subs });
    fechaFolha(); render(); return aviso("Exercício adicionado");
  }
  if (el.hasAttribute("data-salvarex")) {
    const nome = document.getElementById("nx-nome").value.trim();
    if (!nome) return aviso("Dê um nome ao exercício");
    const g = document.getElementById("nx-grupo").value;
    addCust({ nome, grupo: g, tipo: document.getElementById("nx-tipo").value,
      membro: g === "Perna" ? "inf" : "sup",
      series: parseInt(document.getElementById("nx-ser").value, 10) || 3,
      repMin: parseInt(document.getElementById("nx-rmin").value, 10) || 10,
      repMax: parseInt(document.getElementById("nx-rmax").value, 10) || 12,
      rir: 1, desc: [parseInt(document.getElementById("nx-desc").value, 10) || 75, parseInt(document.getElementById("nx-desc").value, 10) || 75], subs: [] });
    fechaFolha(); render(); return aviso("Exercício adicionado");
  }
  if (el.hasAttribute("data-delex")) {
    const id = el.getAttribute("data-delex");
    if (!confirmar("dx" + id)) { el.textContent = "Confirmar?"; return; }
    CUST = CUST.filter(c => c.id !== id); grava(K.cust, CUST); render(); return aviso("Exercício removido");
  }
  if (el.hasAttribute("data-quando")) {
    const q = el.getAttribute("data-quando");
    const inp = document.getElementById("ses-data");
    if (q === "outra") { inp.showPicker ? inp.showPicker() : inp.focus(); return; }
    SES.d = q === "hoje" ? hoje() : ontem(); SES.dManual = q !== "hoje"; grava(K.ses, SES); render();
    return aviso(q === "hoje" ? "Sessão marcada para hoje" : "Sessão marcada para ontem");
  }
  if (el.hasAttribute("data-avulso")) {
    SES = { treino: "Z", semana: CICLO.semana, inicio: Date.now(), d: hoje(), loc: LOCS[0] || "", idx: 0, feitos: {}, aq: true };
    grava(K.ses, SES); return irPara("t");
  }
  if (el.hasAttribute("data-dia")) {
    const d = el.getAttribute("data-dia");
    const k = DIAS.indexOf(d);
    if (k < 0) return;
    CICLO.diaIdx = k; grava(K.ciclo, CICLO);
    if (SES && SES.treino !== d) { SES = null; grava(K.ses, null); }
    render(); return aviso(d === "R" ? "Dia de descanso" : "Treino " + d + " selecionado");
  }
  if (el.hasAttribute("data-descanso")) { avancaDia(); render(); return aviso("Descanso concluído. Ciclo reiniciado no treino A."); }
  if (el.hasAttribute("data-aqgeral")) { SES.aq = true; grava(K.ses, SES); render(); return Timer.iniciar(180, "Aquecimento geral"); }
  if (el.hasAttribute("data-nav")) {
    const t = treino(SES.treino);
    SES.idx = Math.max(0, Math.min(exsDe(t).length - 1, SES.idx + parseInt(el.getAttribute("data-nav"), 10)));
    grava(K.ses, SES); return render();
  }
  if (el.hasAttribute("data-rir")) {
    const [id, v] = el.getAttribute("data-rir").split("|");
    SES.feitos[id] = Object.assign({}, SES.feitos[id], { rir: parseFloat(v) });
    grava(K.ses, SES);
    el.parentElement.querySelectorAll(".rir-b").forEach(b => b.classList.remove("on"));
    el.classList.add("on"); return;
  }
  if (el.hasAttribute("data-concluir")) return concluir(el.getAttribute("data-concluir"));
  if (el.hasAttribute("data-descanso-manual")) {
    const [s, n] = el.getAttribute("data-descanso-manual").split("|");
    return Timer.iniciar(parseInt(s, 10) || CFG.descPadrao, "Descanso · " + n);
  }
  if (el.hasAttribute("data-subs")) { const b = document.getElementById("subs-" + el.getAttribute("data-subs")); b.classList.toggle("open"); el.classList.toggle("on"); return; }
  if (el.hasAttribute("data-usar")) {
    const [id, nome] = el.getAttribute("data-usar").split("|");
    const p = achaEx(id);
    if (p && nome === p[1].nome) delete SUBS[id]; else SUBS[id] = nome;
    grava(K.subs, SUBS); render(); return aviso("Exercício atualizado");
  }
  if (el.hasAttribute("data-fim")) return finalizar();

  if (el.hasAttribute("data-apagar")) {
    const [id, k] = el.getAttribute("data-apagar").split("|");
    if (!confirmar("ap" + id + k)) { el.textContent = "Confirmar?"; return; }
    LOGS[id].splice(+k, 1);
    if (!LOGS[id].length) delete LOGS[id];
    grava(K.logs, LOGS);
    if (!LOGS[id]) return irPara("h");
    render(); return aviso("Registro apagado");
  }
  if (el.hasAttribute("data-salvarcfg")) {
    CFG.unidade = document.getElementById("cf-un").value;
    CFG.incSup = parseFloat(document.getElementById("cf-is").value) || 2.5;
    CFG.incInf = parseFloat(document.getElementById("cf-ii").value) || 5;
    CFG.descPadrao = parseInt(document.getElementById("cf-dp").value, 10) || 90;
    CFG.graviton = document.getElementById("cf-gv").value === "1";
    CICLO.semana = parseInt(document.getElementById("cf-sem").value, 10) || 1;
    CICLO.diaIdx = parseInt(document.getElementById("cf-dia").value, 10) || 0;
    grava(K.cfg, CFG); grava(K.ciclo, CICLO); render(); return aviso("Ajustes salvos");
  }
  if (el.hasAttribute("data-exp")) return exportar(el.getAttribute("data-exp"));
  if (el.hasAttribute("data-imp")) {
    const f = document.getElementById("arq");
    const s = document.getElementById("saida");
    s.style.display = "block"; s.placeholder = "Cole aqui o conteúdo do backup e toque em Importar novamente.";
    if (s.value.trim()) return importarTexto(s.value);
    f.click(); return;
  }
  if (el.hasAttribute("data-zerar")) {
    if (!confirmar("zerar")) { el.textContent = "Confirmar? Isso apaga tudo"; return; }
    LOGS = {}; SUBS = {}; SES = null; CICLO = { semana: 1, diaIdx: 0, sessoes: 0, dias: [] };
    grava(K.logs, LOGS); grava(K.subs, SUBS); grava(K.ses, null); grava(K.ciclo, CICLO);
    render(); return aviso("Ciclo e histórico zerados");
  }
  if (el.hasAttribute("data-desfaz")) { delete SUBS[el.getAttribute("data-desfaz")]; grava(K.subs, SUBS); render(); return; }
});

document.addEventListener("input", ev => {
  const id = ev.target.id || "";
  if (id === "lib-q") return pintaLib(ev.target.value);
  if (id === "ses-data" && SES) { SES.d = ev.target.value || hoje(); SES.dManual = SES.d !== hoje(); grava(K.ses, SES); return; }
  if (id === "ses-loc" && SES) { SES.loc = ev.target.value; grava(K.ses, SES); return; }
  if (id.startsWith("c-")) {
    const v = parseFloat(ev.target.value);
    if (!isNaN(v) && v > 0) recalcAq(id.slice(2), v);
  }
});

document.addEventListener("change", ev => {
  if (ev.target.id === "arq" && ev.target.files && ev.target.files[0]) {
    const fr = new FileReader();
    fr.onload = () => importarTexto(fr.result);
    fr.readAsText(ev.target.files[0]);
  }
});

/* ============================================================ rotas */
function irPara(h) { location.hash = h; if (!h) render(); }
function render() {
  const h = location.hash.replace(/^#\/?/, "");
  if (h === "t") vTreino();
  else if (h === "h") vHist();
  else if (h.startsWith("hx/")) vHistEx(h.slice(3));
  else if (h === "c") vConfig();
  else vPainel();
  window.scrollTo(0, 0);
}
window.addEventListener("hashchange", render);
render();

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("./sw.js").catch(() => {}));
}
