/* ============================================================
   PROGRESSÃO v3 — Motor
   Periodização, progressão de carga, aquecimento e alertas
   ============================================================ */

const Engine = {

  semana(n) { return SEMANAS[Math.min(11, Math.max(0, n - 1))]; },

  /* RIR alvo do exercício na semana */
  rirAlvo(ex, sem) {
    const s = this.semana(sem);
    return ex.tipo === "isolador" ? s.rirI : s.rirC;
  },
  rirAlvoTxt(ex, sem) {
    const s = this.semana(sem);
    return ex.tipo === "isolador" ? s.rirITxt : s.rirCTxt;
  },

  /* séries válidas considerando descarga (3 e 4 viram 2) */
  series(ex, sem) {
    const s = this.semana(sem);
    if (!s.descarga) return ex.series;
    return ex.series >= 3 ? 2 : ex.series;
  },

  /* técnica avançada ativa nesta semana para este exercício */
  tecnica(ex, sem) {
    const s = this.semana(sem);
    if (!ex.tec || !s.tec) return null;
    if (ex.tipo === "compostoLivre") return null;      // nunca em composto livre com barra
    return { k: ex.tec, ...TECNICAS[ex.tec] };
  },

  incremento(ex, cfg) { return ex.membro === "inf" ? (cfg.incInf || 5) : (cfg.incSup || 2.5); },
  arred(v, inc) { return Math.max(inc, Math.round(v / inc) * inc); },

  /* última sessão registrada */
  ultima(exId, logs) { const h = logs[exId]; return h && h.length ? h[0] : null; },

  /* ------------------------------------------------------------
     Sugestão de carga — dupla progressão
     ------------------------------------------------------------ */
  sugestao(ex, sem, logs, cfg) {
    const u = this.ultima(ex.id, logs);
    const s = this.semana(sem);
    const inc = this.incremento(ex, cfg);

    if (!u) return { carga: null, txt: "Primeira sessão. Escolha uma carga que deixe você no RIR alvo e registre.", tipo: "novo" };

    const rirProg = u.rirAlvo != null ? u.rirAlvo : this.rirAlvo(ex, u.semana || sem);
    const rirReal = u.rir;
    let base = u.carga, txt, tipo;

    if (u.dor) {
      base = u.carga;
      txt = "Você registrou dor ou execução inadequada na última sessão. Repita a carga e reavalie a execução antes de progredir.";
      tipo = "manter";
    } else if (rirReal < rirProg - 0.5) {
      base = u.carga;
      txt = "O RIR real ficou abaixo do programado. Repita " + fmtN(u.carga) + " kg ou reduza um incremento.";
      tipo = "manter";
    } else if (u.reps >= ex.repMax && rirReal >= rirProg) {
      const pct = ex.membro === "inf" ? 0.07 : 0.035;
      const alvo = u.carga * (1 + pct);
      base = Math.max(u.carga + inc, this.arred(alvo, inc));
      txt = "Bateu " + u.reps + " repetições no topo da faixa com RIR " + fmtRir(rirReal) + ". Suba a carga.";
      tipo = "subir";
    } else if (u.reps >= ex.repMin) {
      base = u.carga;
      txt = "Dentro da faixa. Mantenha a carga e busque uma repetição a mais.";
      tipo = "manter";
    } else {
      base = rirReal <= 0 ? this.arred(u.carga * 0.95, inc) : u.carga;
      txt = rirReal <= 0
        ? "Ficou abaixo de " + ex.repMin + " repetições em falha. Reduza cerca de 5%."
        : "Ficou abaixo da faixa. Mantenha a carga e busque as repetições.";
      tipo = "reduzir";
    }

    let carga = base;
    if (s.descarga) {
      carga = this.arred(base * s.fatorCarga, inc);
      txt = "Semana de descarga. Use cerca de 87% da carga habitual, RIR 3, sem técnicas.";
      tipo = "descarga";
    }

    if (ex.especial === "graviton") {
      txt = tipo === "subir"
        ? "No Graviton, progredir é reduzir a assistência. Na barra fixa, aumentar o lastro."
        : txt;
    }
    return { carga: this.arred(carga, inc), txt, tipo };
  },

  /* top set e back-offs: redução de 5 a 8% (usamos 6,5%) */
  backoff(carga, ex, cfg) {
    if (!carga || ex.estrutura !== "topset") return null;
    const inc = this.incremento(ex, cfg);
    return this.arred(carga * 0.935, inc);
  },

  /* ------------------------------------------------------------
     Aquecimento automático
     ordem: posição do exercício entre os compostos do mesmo grupo
     ------------------------------------------------------------ */
  aquecimento(ex, carga, ordemGrupo, cfg) {
    if (ex.especial === "graviton") {
      return { graviton: true, linhas: [
        { txt: "Depressão escapular", reps: "12" },
        { txt: "Assistência alta", reps: "6" },
        { txt: "Assistência moderada", reps: "3" }
      ]};
    }
    const semCarga = !carga;
    const inc = this.incremento(ex, cfg);
    const L = (p, r) => ({ pct: p, carga: semCarga ? null : this.arred(carga * p, inc), reps: r });

    if (ex.tipo === "isolador") return { linhas: [L(0.55, "10 a 12")], opcional: true, semCarga };
    if (ordemGrupo === 0) return { linhas: [L(0.4, "10"), L(0.6, "6"), L(0.75, "3"), L(0.85, "1 a 2")], semCarga };
    return { linhas: [L(0.6, "6"), L(0.8, "2 a 3")], opcional: true, semCarga };
  },

  /* posição do exercício entre os compostos do mesmo grupo dentro do treino */
  ordemGrupo(treino, ex) {
    const comps = treino.ex.filter(e => e.tipo !== "isolador" && e.grupo === ex.grupo);
    return comps.findIndex(e => e.id === ex.id);
  },

  /* descanso em segundos, considerando supersérie */
  descanso(ex) {
    if (ex.ss && ex.ssOrdem === 1) return 0;
    const d = ex.desc || [60, 60];
    return Math.round((d[0] + d[1]) / 2);
  },

  /* estagnação: 2 ou mais sessões sem ganho de carga nem de repetições */
  estagnado(exId, logs) {
    const h = (logs[exId] || []).slice(0, 3);
    if (h.length < 2) return null;
    const score = x => x.carga * 1000 + x.reps;
    for (let i = 0; i < h.length - 1; i++) if (score(h[i]) > score(h[i + 1])) return null;
    return { n: h.length, desde: h[h.length - 1].d };
  },

  /* recordes */
  recordes(exId, logs) {
    const h = logs[exId] || [];
    if (!h.length) return null;
    const carga = h.reduce((a, x) => x.carga > a.carga ? x : a, h[0]);
    const reps = h.reduce((a, x) => x.reps > a.reps ? x : a, h[0]);
    return { carga, reps };
  }
};

const fmtN = n => (Math.round(n * 10) / 10).toString().replace(".", ",");
const fmtRir = v => { const r = RIRS.find(x => x.v === v); return r ? r.n.replace("RIR ", "") : String(v); };
