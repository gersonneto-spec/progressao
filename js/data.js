/* ============================================================
   PROGRESSÃO v3 — Base de dados
   Perfil, ciclo de 12 semanas e os 6 treinos
   ============================================================ */

const PERFIL = {
  nome: "Gerson", idade: 37, altura: 2.02, peso: 102,
  nivel: "Avançado", frequencia: "6 treinos por semana", duracao: 50,
  objetivo: "Hipertrofia com prioridade em peitoral superior, espessura das costas, deltoide lateral e posterior, cabeça longa do tríceps e quadríceps."
};

/* opções de RIR do registro. v = valor numérico para comparação */
const RIRS = [
  { k: "3+", v: 3, n: "RIR 3+" },
  { k: "2", v: 2, n: "RIR 2" },
  { k: "1.5", v: 1.5, n: "RIR 1,5" },
  { k: "1", v: 1, n: "RIR 1" },
  { k: "0.5", v: 0.5, n: "RIR 0,5" },
  { k: "0", v: 0, n: "RIR 0" },
  { k: "F", v: -0.5, n: "Falha técnica" }
];

/* ------------------------------------------------------------
   Periodização — 12 semanas
   rirC = RIR alvo dos compostos, rirI = dos isoladores
   tec  = técnicas intensificadoras ativas
   ------------------------------------------------------------ */
const SEMANAS = [
  { n: 1,  rirC: 2,   rirI: 1.5, rirCTxt: "2",   rirITxt: "1 a 2",   tec: false, descarga: false, fatorCarga: 1,     foco: "Volume completo. Sem intensificadores. Estabelecer as cargas do bloco." },
  { n: 2,  rirC: 1.5, rirI: 1.5, rirCTxt: "1,5", rirITxt: "1,5",     tec: false, descarga: false, fatorCarga: 1,     foco: "Acrescentar repetições mantendo a carga da semana 1." },
  { n: 3,  rirC: 1,   rirI: 0.5, rirCTxt: "1",   rirITxt: "0 a 1",   tec: true,  descarga: false, fatorCarga: 1,     foco: "Pico do bloco. Myo-reps, rest-pause e drop-sets liberados." },
  { n: 4,  rirC: 3,   rirI: 3,   rirCTxt: "3",   rirITxt: "3",       tec: false, descarga: true,  fatorCarga: 0.875, foco: "Descarga. 60% das séries, 85 a 90% da carga, nenhuma técnica." },
  { n: 5,  rirC: 2,   rirI: 2,   rirCTxt: "2",   rirITxt: "2",       tec: false, descarga: false, fatorCarga: 1,     foco: "Volume completo. Retomar as cargas da semana 3, até 5% abaixo." },
  { n: 6,  rirC: 1.5, rirI: 1.5, rirCTxt: "1,5", rirITxt: "1,5",     tec: false, descarga: false, fatorCarga: 1,     foco: "Repetições antes de carga." },
  { n: 7,  rirC: 1,   rirI: 0.5, rirCTxt: "1",   rirITxt: "0 a 1",   tec: true,  descarga: false, fatorCarga: 1,     foco: "Pico do bloco. Técnicas avançadas liberadas." },
  { n: 8,  rirC: 3,   rirI: 3,   rirCTxt: "3",   rirITxt: "3",       tec: false, descarga: true,  fatorCarga: 0.875, foco: "Descarga. Mesmas regras da semana 4." },
  { n: 9,  rirC: 1.5, rirI: 1.5, rirCTxt: "1,5", rirITxt: "1,5",     tec: false, descarga: false, fatorCarga: 1,     foco: "Parte inferior da faixa com carga maior." },
  { n: 10, rirC: 1,   rirI: 1,   rirCTxt: "1",   rirITxt: "1",       tec: false, descarga: false, fatorCarga: 1,     foco: "Consolidar carga e subir repetições." },
  { n: 11, rirC: 1,   rirI: 0.25, rirCTxt: "1",  rirITxt: "0 a 0,5", tec: true,  descarga: false, fatorCarga: 1,     foco: "Pico final. Nunca levar composto livre à falha." },
  { n: 12, rirC: 1,   rirI: 1,   rirCTxt: "1",   rirITxt: "1",       tec: false, descarga: false, fatorCarga: 1,     foco: "Recorde de repetições com a mesma carga. Sem teste de 1RM." }
];

const TECNICAS = {
  drop: { n: "Drop-set simples", d: "Na última série, chegue à falha técnica, reduza a carga de 20 a 25% uma única vez e faça mais 6 a 10 repetições." },
  myo:  { n: "Myo-reps", d: "Série de ativação de 12 a 15 repetições perto da falha. Descanse 15 a 20 segundos e faça 3 a 5 minisséries de 3 a 5 repetições. Pare ao perder uma repetição ou a técnica." },
  rest: { n: "Rest-pause", d: "Leve a última série à falha técnica, descanse de 10 a 15 segundos e faça duas minisséries curtas." }
};

/* ------------------------------------------------------------
   Treinos
   tipo: composto | compostoLivre | isolador
   membro: sup | inf   (define o incremento de carga)
   estrutura: topset (top set + back-offs com redução de 5 a 8%)
   ss: id da supersérie, ordem 1 ou 2
   ------------------------------------------------------------ */
const TREINOS = [
  {
    id: "A", titulo: "Peito + costas: espessura", grupo: "Peito e Costas",
    ex: [
      { id: "a1", nome: "Supino inclinado na máquina convergente", tipo: "composto", membro: "sup", grupo: "Peito",
        series: 3, repMin: 6, repMax: 10, desc: [90, 120], estrutura: "topset", backoffs: 2,
        notas: ["Excêntrica de 3 segundos", "Pausa controlada no alongamento"],
        subs: ["Supino inclinado no Smith", "Supino inclinado com halteres"] },
      { id: "a2", nome: "Supino reto com halteres", tipo: "composto", membro: "sup", grupo: "Peito",
        series: 3, repMin: 8, repMax: 12, desc: [75, 90],
        notas: ["Excêntrica de 3 segundos"],
        subs: ["Supino reto na máquina convergente", "Supino reto no Smith"] },
      { id: "a3", nome: "Remada T apoiada", tipo: "composto", membro: "sup", grupo: "Costas",
        series: 3, repMin: 6, repMax: 10, desc: [90, 120],
        notas: ["Peito sempre apoiado", "Pausa de 1 segundo na contração"],
        subs: ["Remada articulada apoiada", "Remada com halteres apoiado no banco inclinado"] },
      { id: "a4", nome: "Remada no Smith", tipo: "composto", membro: "sup", grupo: "Costas",
        series: 3, repMin: 8, repMax: 12, desc: [75, 90],
        notas: ["Puxar em direção ao abdômen superior", "Excêntrica de 3 segundos"],
        subs: ["Remada curvada com barra", "Remada baixa com barra reta"] },
      { id: "a5", nome: "Peck deck", tipo: "isolador", membro: "sup", grupo: "Peito",
        series: 2, repMin: 12, repMax: 15, desc: [45, 60], tec: "drop",
        notas: ["Tensão contínua"],
        subs: ["Crossover na altura do peito", "Crucifixo reto com halteres"] }
    ]
  },
  {
    id: "B", titulo: "Ombros + braços", grupo: "Ombros e Braços",
    nota: "Sem desenvolvimento. O deltoide anterior já recebe estímulo nos dois treinos de peito.",
    ex: [
      { id: "b1", nome: "Elevação lateral na máquina", tipo: "isolador", membro: "sup", grupo: "Ombro",
        series: 4, repMin: 10, repMax: 15, desc: [45, 60], tec: "myo",
        notas: ["Sem impulso de tronco"],
        subs: ["Elevação lateral com halteres", "Elevação lateral bilateral na polia"] },
      { id: "b2", nome: "Elevação lateral na polia", tipo: "isolador", membro: "sup", grupo: "Ombro",
        series: 2, repMin: 12, repMax: 20, desc: [30, 45], ss: "ss1", ssOrdem: 1,
        notas: ["Tensão contínua desde o início do movimento"],
        subs: ["Elevação lateral com halteres", "Elevação lateral na máquina"] },
      { id: "b3", nome: "Crucifixo inverso", tipo: "isolador", membro: "sup", grupo: "Ombro",
        series: 3, repMin: 12, repMax: 20, desc: [60, 60], ss: "ss1", ssOrdem: 2,
        notas: ["Tensão contínua", "Evitar impulso do tronco"],
        subs: ["Crucifixo inverso na polia", "Crucifixo inverso apoiado no banco"] },
      { id: "b4", nome: "Tríceps francês na polia", tipo: "isolador", membro: "sup", grupo: "Braço",
        series: 3, repMin: 8, repMax: 12, desc: [60, 75],
        notas: ["Prioridade para a cabeça longa", "Alongamento controlado"],
        subs: ["Tríceps francês unilateral", "Tríceps testa com barra W"] },
      { id: "b5", nome: "Paralelas ou tríceps na máquina", tipo: "composto", membro: "sup", grupo: "Braço",
        series: 3, repMin: 8, repMax: 12, desc: [60, 75],
        subs: ["Supino fechado no Smith", "Mergulho entre bancos com carga"] },
      { id: "b6", nome: "Tríceps corda", tipo: "isolador", membro: "sup", grupo: "Braço",
        series: 2, repMin: 12, repMax: 15, desc: [0, 0], ss: "ss2", ssOrdem: 1,
        subs: ["Tríceps com barra reta", "Tríceps unilateral na polia"] },
      { id: "b7", nome: "Rosca Scott", tipo: "isolador", membro: "sup", grupo: "Braço",
        series: 3, repMin: 8, repMax: 12, desc: [60, 75], ss: "ss2", ssOrdem: 2,
        notas: ["Controle total da fase excêntrica"],
        subs: ["Rosca Scott na máquina", "Rosca Scott com barra W"] },
      { id: "b8", nome: "Rosca martelo", tipo: "isolador", membro: "sup", grupo: "Braço",
        series: 2, repMin: 10, repMax: 15, desc: [45, 60],
        notas: ["Falha técnica permitida apenas na última série"],
        subs: ["Rosca martelo na polia com corda", "Rosca martelo alternada"] }
    ]
  },
  {
    id: "C", titulo: "Pernas + abdômen", grupo: "Pernas",
    ex: [
      { id: "c1", nome: "Hack squat", tipo: "composto", membro: "inf", grupo: "Perna",
        series: 4, repMin: 6, repMax: 10, desc: [120, 120], estrutura: "topset", backoffs: 3,
        notas: ["Amplitude completa e controlada"],
        subs: ["Agachamento no Smith", "Leg press 45° com os pés mais baixos"] },
      { id: "c2", nome: "Levantamento romeno", tipo: "compostoLivre", membro: "inf", grupo: "Perna",
        series: 3, repMin: 6, repMax: 10, desc: [90, 120],
        notas: ["Coluna neutra", "Quadril para trás", "Excêntrica de 3 segundos"],
        subs: ["Stiff com halteres", "Stiff no Smith"] },
      { id: "c3", nome: "Leg press 45°", tipo: "composto", membro: "inf", grupo: "Perna",
        series: 3, repMin: 10, repMax: 15, desc: [90, 90],
        notas: ["Não reduzir a amplitude para aumentar carga"],
        subs: ["Pendulum squat", "Agachamento no Smith"] },
      { id: "c4", nome: "Mesa flexora", tipo: "isolador", membro: "inf", grupo: "Perna",
        series: 3, repMin: 10, repMax: 15, desc: [60, 75],
        notas: ["Pausa de 1 segundo na contração"],
        subs: ["Cadeira flexora", "Flexora unilateral em pé"] },
      { id: "c5", nome: "Cadeira extensora", tipo: "isolador", membro: "inf", grupo: "Perna",
        series: 3, repMin: 12, repMax: 15, desc: [0, 0], tec: "drop", ss: "ss3", ssOrdem: 1,
        subs: ["Agachamento sissy assistido", "Leg press unilateral com os pés baixos"] },
      { id: "c6", nome: "Abdominal no cross", tipo: "isolador", membro: "sup", grupo: "Abdômen",
        series: 3, repMin: 10, repMax: 15, desc: [60, 60], ss: "ss3", ssOrdem: 2,
        subs: ["Abdominal na máquina", "Abdominal declinado com carga"] }
    ]
  },
  {
    id: "D", titulo: "Costas: largura", grupo: "Costas",
    ex: [
      { id: "d1", nome: "Barra fixa ou Graviton", tipo: "composto", membro: "sup", grupo: "Costas",
        series: 3, repMin: 6, repMax: 10, desc: [90, 120], especial: "graviton",
        notas: ["Ao atingir 10 repetições limpas, aumentar o lastro", "No Graviton, reduzir progressivamente a assistência"],
        subs: ["Puxada aberta pronada", "Puxada neutra articulada"] },
      { id: "d2", nome: "Puxada neutra fechada", tipo: "composto", membro: "sup", grupo: "Costas",
        series: 3, repMin: 8, repMax: 12, desc: [75, 90],
        notas: ["Direcionar os cotovelos para o quadril"],
        subs: ["Puxada com triângulo", "Puxada neutra na máquina articulada"] },
      { id: "d3", nome: "Pullover na polia", tipo: "isolador", membro: "sup", grupo: "Costas",
        series: 2, repMin: 10, repMax: 15, desc: [60, 60], tec: "rest",
        subs: ["Pullover na máquina", "Pullover com halter"] }
    ]
  },
  {
    id: "E", titulo: "Peito superior + deltoide lateral", grupo: "Peito e Ombro",
    ex: [
      { id: "e1", nome: "Supino inclinado no Smith", tipo: "composto", membro: "sup", grupo: "Peito",
        series: 3, repMin: 6, repMax: 10, desc: [90, 120], estrutura: "topset", backoffs: 2,
        notas: ["Banco entre 25° e 30°"],
        subs: ["Supino inclinado na máquina", "Supino inclinado com halteres"] },
      { id: "e2", nome: "Supino inclinado com halteres", tipo: "composto", membro: "sup", grupo: "Peito",
        series: 3, repMin: 8, repMax: 12, desc: [75, 90],
        notas: ["Amplitude controlada", "Excêntrica de 3 segundos"],
        subs: ["Supino inclinado na máquina", "Supino inclinado na polia"] },
      { id: "e3", nome: "Crossover de baixo para cima", tipo: "isolador", membro: "sup", grupo: "Peito",
        series: 3, repMin: 10, repMax: 15, desc: [60, 60], tec: "drop",
        subs: ["Crucifixo inclinado com halteres", "Peck deck com banco ajustado"] },
      { id: "e4", nome: "Elevação lateral na máquina", tipo: "isolador", membro: "sup", grupo: "Ombro",
        series: 4, repMin: 10, repMax: 15, desc: [45, 60],
        notas: ["Séries normais. O Myo-reps já foi usado no treino B."],
        subs: ["Elevação lateral com halteres", "Elevação lateral bilateral na polia"] },
      { id: "e5", nome: "Crucifixo inverso", tipo: "isolador", membro: "sup", grupo: "Ombro",
        series: 2, repMin: 12, repMax: 20, desc: [45, 60],
        subs: ["Crucifixo inverso na polia", "Crucifixo inverso apoiado no banco"] }
    ]
  },
  {
    id: "F", titulo: "Costas: especialização em espessura", grupo: "Costas",
    nota: "Treino curto, pesado e específico. Não é outro treino completo de costas.",
    ex: [
      { id: "f1", nome: "Remada alta apoiada no peito", tipo: "composto", membro: "sup", grupo: "Costas",
        series: 3, repMin: 8, repMax: 12, desc: [90, 90], estrutura: "topset", backoffs: 2,
        notas: ["Cotovelos entre 45° e 70°", "Pausa de 1 segundo na contração"],
        subs: ["Remada articulada aberta", "Remada com halteres apoiado no banco"] },
      { id: "f2", nome: "Remada unilateral articulada", tipo: "composto", membro: "sup", grupo: "Costas",
        series: 3, repMin: 10, repMax: 12, desc: [60, 75],
        notas: ["Cotovelo ligeiramente aberto", "Movimento controlado da escápula"],
        subs: ["Remada unilateral na polia", "Remada unilateral com halter apoiado"] },
      { id: "f3", nome: "Remada baixa aberta", tipo: "isolador", membro: "sup", grupo: "Costas",
        series: 2, repMin: 12, repMax: 15, desc: [60, 60], tec: "rest",
        subs: ["Remada alta na polia com apoio", "Remada articulada aberta"] }
    ]
  },
  {
    id: "Z", titulo: "Treino avulso", grupo: "Avulso", avulso: true,
    nota: "Sessão fora do programa. Monte a lista e registre normalmente. Não avança o dia do ciclo.",
    ex: []
  }
];

/* dias do ciclo: 6 treinos + descanso. Z (avulso) fica fora do ciclo */
const DIAS = ["A", "B", "C", "D", "E", "F", "R"];

const SUPERSERIES = {
  ss1: "Elevação lateral na polia + Crucifixo inverso",
  ss2: "Tríceps corda + Rosca Scott",
  ss3: "Cadeira extensora + Abdominal no cross"
};

const AVISO_SEGURANCA = "Interrompa o exercício em caso de dor aguda, tontura, falta de ar incomum, palpitação ou perda de controle do movimento.";
