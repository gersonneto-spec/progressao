/* =========================================================
   PROGRESSÃO - Base de treinos
   Prioridade: PEITO / COSTAS / OMBRO (pontos fracos)
   Secundário: BRACO
   ========================================================= */

const PROGRAM = {
  meta: {
    athlete: "Gerson",
    split: "PPL com foco em pontos fracos",
    priority: ["Costas (largura)", "Ombro (deltoide lateral e posterior)", "Peito (porção superior)"],
    updated: "2026-09-01"
  },

  workouts: [
    /* ---------------------------------------------------- COSTAS A */
    {
      id: "costas-a",
      group: "Costas",
      title: "Costas A — Largura",
      focus: "Dorsal superior, abertura na altura da axila",
      duration: 50,
      priority: true,
      brief: "Puxada vertical primeiro, com o sistema nervoso fresco. Remada entra depois como densidade, nunca antes.",
      exercises: [
        {
          id: "ca1", name: "Pulldown pegada aberta pronada",
          sets: 4, repsMin: 8, repsMax: 10, rir: 1, rest: 120, inc: 5,
          cue: "Pegada 1,5x a largura dos ombros. Tronco travado a 15 graus. Barra até a clavícula, pausa de 1s. Cotovelo em direção ao quadril.",
          tech: null,
          alts: ["Barra fixa assistida (gravitron ou elástico)", "Pulldown convergente unilateral na máquina", "Barra fixa pronada com peso, se o dia estiver bom"]
        },
        {
          id: "ca2", name: "Remada Cavalinho (T-bar) pegada neutra",
          sets: 3, repsMin: 8, repsMax: 10, rir: 1, rest: 105, inc: 5,
          cue: "Tronco entre 30 e 45 graus. Sem hiperextensão lombar. Puxa até o umbigo com pausa de 1s na contração.",
          tech: null,
          alts: ["Remada curvada com barra", "Remada serrote com halter pesado", "Remada na máquina peito apoiado"]
        },
        {
          id: "ca3", name: "Pulldown unilateral no cabo, sentado de lado",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 70, inc: 2.5,
          cue: "Deixa o ombro subir na excêntrica (protração completa) e puxa alongando o range. É aqui que a largura da porção superior aparece.",
          tech: null,
          alts: ["Pulldown unilateral em pe no cabo alto", "Pullover unilateral no cabo", "Lat prayer (puxada ajoelhado)"]
        },
        {
          id: "ca4", name: "Remada baixa pegada neutra",
          sets: 3, repsMin: 10, repsMax: 12, rir: 0, rest: 75, inc: 5,
          cue: "Amplitude completa, sem jogar o tronco. Última série em rest-pause.",
          tech: "rest-pause",
          alts: ["Remada na máquina peito apoiado", "Remada no cabo com corda até o pescoço", "Remada Hammer unilateral"]
        },
        {
          id: "ca5", name: "Bi-set: Pullover no cabo alto + Crucifixo inverso",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Pullover 12-15 emendado com crucifixo inverso 15-20. Última série do pullover em myo-reps.",
          tech: "myo-reps",
          alts: ["Pullover com halter no banco + face pull", "Straight-arm pulldown com barra + peck deck invertido"]
        },
        {
          id: "ca6", name: "Negativas na barra fixa (progressão)",
          sets: 2, repsMin: 4, repsMax: 4, rir: 0, rest: 90, inc: 0,
          cue: "Sobe com apoio ou salto, desce em 5 segundos controlados. Só 1x por semana. É o que destrava a barra fixa em 6 a 8 semanas.",
          tech: null,
          alts: ["Barra fixa assistida com carga minima", "Scapular pull-up 3x12"]
        }
      ]
    },

    /* ---------------------------------------------------- COSTAS B */
    {
      id: "costas-b",
      group: "Costas",
      title: "Costas B — Espessura",
      focus: "Trapézio médio, romboides, dorsal inferior",
      duration: 50,
      priority: true,
      brief: "Sessão de densidade. Remada pesada na frente, puxada vertical no fim com foco metabólico.",
      exercises: [
        {
          id: "cb1", name: "Remada curvada com barra pegada pronada",
          sets: 4, repsMin: 6, repsMax: 8, rir: 2, rest: 150, inc: 5,
          cue: "Tronco a 45 graus, core travado. Se a lombar fadigar antes das costas, troque pela versão com peito apoiado.",
          tech: null,
          alts: ["Remada Cavalinho pegada pronada aberta", "Remada Smith com peito apoiado", "Pendlay row"]
        },
        {
          id: "cb2", name: "Remada na máquina com peito apoiado, pegada pronada",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 5,
          cue: "Pegada aberta e cotovelo alto, a 75 graus do tronco. Isso puxa trapézio médio e não dorsal.",
          tech: null,
          alts: ["Remada no cabo com corda até o queixo", "Remada Hammer bilateral pegada larga"]
        },
        {
          id: "cb3", name: "Remada serrote com halter",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 75, inc: 2.5,
          cue: "Range completo com alongamento embaixo. Não rode o tronco para ganhar amplitude.",
          tech: null,
          alts: ["Remada unilateral no cabo baixo ajoelhado", "Meadows row"]
        },
        {
          id: "cb4", name: "Pulldown pegada supinada fechada",
          sets: 3, repsMin: 10, repsMax: 12, rir: 0, rest: 75, inc: 5,
          cue: "Cotovelo colado ao tronco, barra até a parte baixa do peito. Pega dorsal inferior e bico do bíceps.",
          tech: "rest-pause",
          alts: ["Pulldown pegada neutra fechada (triangulo)", "Barra fixa supinada assistida"]
        },
        {
          id: "cb5", name: "Encolhimento com halteres, pausa de 2s",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Sobe reto, sem rodar o ombro. Segura 2s no topo. Trapézio superior fecha o efeito 3D junto com o deltoide.",
          tech: null,
          alts: ["Encolhimento na barra Smith", "Farmer walk pesado 3x40m"]
        },
        {
          id: "cb6", name: "Face pull no cabo alto",
          sets: 3, repsMin: 15, repsMax: 20, rir: 0, rest: 45, inc: 2.5,
          cue: "Corda na altura dos olhos, rotação externa no fim. Saúde do ombro e deltoide posterior.",
          tech: null,
          alts: ["Crucifixo inverso na máquina", "Rear delt fly no cabo cruzado"]
        }
      ]
    },

    /* ---------------------------------------------------- PEITO A */
    {
      id: "peito-a",
      group: "Peito",
      title: "Peito A — Porção superior",
      focus: "Clavicular (peitoral superior) e transição com deltoide anterior",
      duration: 50,
      priority: true,
      brief: "Inclinado primeiro. A porção superior e o que separa um peito bom de um peito completo.",
      exercises: [
        {
          id: "pa1", name: "Supino inclinado com halteres (30 graus)",
          sets: 4, repsMin: 8, repsMax: 10, rir: 1, rest: 150, inc: 2.5,
          cue: "Banco em 30 graus, não 45. Escápula retraída e deprimida. Desce até o alongamento sem bater os halteres no topo.",
          tech: null,
          alts: ["Supino inclinado na barra", "Supino inclinado no Smith", "Press inclinado na máquina Hammer"]
        },
        {
          id: "pa2", name: "Supino reto com barra",
          sets: 3, repsMin: 6, repsMax: 8, rir: 2, rest: 150, inc: 5,
          cue: "Arco torácico natural, pés firmes. Barra na linha do mamilo. Aqui é carga, não congestão.",
          tech: null,
          alts: ["Supino reto com halteres", "Supino no Smith", "Press na máquina peito"]
        },
        {
          id: "pa3", name: "Crucifixo no cabo baixo para cima",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 75, inc: 2.5,
          cue: "Trajetória de baixo para cima, maos se encontrando na altura do queixo. É o melhor isolador da porção clavicular.",
          tech: null,
          alts: ["Crucifixo inclinado com halteres", "Peck deck com banco elevado"]
        },
        {
          id: "pa4", name: "Supino declinado ou paralelas com peso",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 5,
          cue: "Fecha a porção inferior e da a borda inferior do peitoral. Tronco levemente a frente nas paralelas.",
          tech: null,
          alts: ["Paralelas assistidas", "Press declinado na máquina", "Crucifixo no cabo alto para baixo"]
        },
        {
          id: "pa5", name: "Peck deck (crucifixo na máquina)",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 5,
          cue: "Última série em myo-reps. Pausa de 1s na contração maxima em todas as reps.",
          tech: "myo-reps",
          alts: ["Crucifixo no cabo na altura do peito", "Crucifixo com halteres no banco reto"]
        }
      ]
    },

    /* ---------------------------------------------------- PEITO B */
    {
      id: "peito-b",
      group: "Peito",
      title: "Peito B — Volume e alongamento",
      focus: "Estímulo em amplitude alongada, densidade geral do peitoral",
      duration: 50,
      priority: true,
      brief: "Sessão com foco na posição alongada, que é onde o peitoral responde melhor a hipertrofia.",
      exercises: [
        {
          id: "pb1", name: "Supino reto com halteres, amplitude maxima",
          sets: 4, repsMin: 8, repsMax: 12, rir: 1, rest: 120, inc: 2.5,
          cue: "Desce até sentir o alongamento total, com 2s na excêntrica. Não trave o cotovelo no topo.",
          tech: null,
          alts: ["Supino reto na barra", "Press na máquina Hammer", "Supino no Smith"]
        },
        {
          id: "pb2", name: "Crucifixo inclinado com halteres",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 2.5,
          cue: "Cotovelo levemente flexionado e fixo. Para a subida antes das maos se tocarem para manter tensão.",
          tech: null,
          alts: ["Crucifixo no cabo baixo", "Peck deck com banco elevado"]
        },
        {
          id: "pb3", name: "Supino inclinado no Smith",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 5,
          cue: "Trajetória guiada permite chegar mais perto da falha com segurança.",
          tech: null,
          alts: ["Supino inclinado com halteres", "Press inclinado na máquina"]
        },
        {
          id: "pb4", name: "Cross-over no cabo alto",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Cruza as maos na frente do quadril e segura 1s. Passo a frente para tirar a folga do cabo.",
          tech: null,
          alts: ["Cross-over no cabo na altura do peito", "Peck deck"]
        },
        {
          id: "pb5", name: "Flexão com déficit até a falha",
          sets: 2, repsMin: 15, repsMax: 25, rir: 0, rest: 60, inc: 0,
          cue: "Maos em halteres ou steps para descer alem da linha do peito. Finalizador metabólico.",
          tech: null,
          alts: ["Flexão no TRX", "Press na máquina com série descendente"]
        }
      ]
    },

    /* ---------------------------------------------------- OMBRO */
    {
      id: "ombro",
      group: "Ombro",
      title: "Ombro — Efeito 3D",
      focus: "Deltoide lateral e posterior, que sao os que dao largura vista de frente",
      duration: 45,
      priority: true,
      brief: "Lateral e posterior vem antes do desenvolvimento. Anterior ja recebe estímulo suficiente nos dias de peito.",
      exercises: [
        {
          id: "om1", name: "Elevação lateral no cabo unilateral",
          sets: 4, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Cabo passando por trás do corpo. Tensão constante desde o início do movimento, o que o halter não entrega. Sem impulso de tronco.",
          tech: null,
          alts: ["Elevação lateral com halteres sentado", "Elevação lateral na máquina", "Lateral raise com elástico"]
        },
        {
          id: "om2", name: "Desenvolvimento com halteres sentado",
          sets: 3, repsMin: 8, repsMax: 10, rir: 1, rest: 120, inc: 2.5,
          cue: "Cotovelo levemente a frente do plano do corpo. Desce até a altura da orelha.",
          tech: null,
          alts: ["Desenvolvimento no Smith", "Press na máquina de ombro", "Desenvolvimento Arnold"]
        },
        {
          id: "om3", name: "Crucifixo inverso no peck deck",
          sets: 4, repsMin: 15, repsMax: 20, rir: 0, rest: 60, inc: 5,
          cue: "Deltoide posterior gosta de volume e reps altas. Cotovelo levemente flexionado, sem puxar com o trapézio.",
          tech: null,
          alts: ["Rear delt fly no cabo cruzado", "Crucifixo inverso com halteres inclinado no banco"]
        },
        {
          id: "om4", name: "Elevação lateral com halteres, série descendente",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Última série: falha, reduz 30 % da carga, falha de novo, reduz mais 30 %, falha.",
          tech: "drop-set",
          alts: ["Elevação lateral na máquina com drop", "Lateral no cabo com drop"]
        },
        {
          id: "om5", name: "Face pull com rotação externa",
          sets: 3, repsMin: 15, repsMax: 20, rir: 0, rest: 45, inc: 2.5,
          cue: "Cotovelo acima da linha do ombro. Termina com as maos abertas em posição de duplo bíceps.",
          tech: null,
          alts: ["Rear delt no cabo unilateral", "Band pull-apart 3x25"]
        }
      ]
    },

    /* ---------------------------------------------------- UPPER WEAK POINTS */
    {
      id: "upper-wp",
      group: "Upper",
      title: "Upper Weak Points",
      focus: "Sessão combinada dos três pontos fracos em um só treino",
      duration: 60,
      priority: true,
      brief: "Use quando a semana apertar e você só tiver um dia de superior. Um estímulo pesado por grupo, mais isoladores.",
      exercises: [
        {
          id: "uw1", g: "Costas", name: "Pulldown pegada aberta pronada",
          sets: 4, repsMin: 8, repsMax: 10, rir: 1, rest: 120, inc: 5,
          cue: "Abre a sessão pelo ponto mais fraco: largura de dorsal.",
          tech: null,
          alts: ["Barra fixa assistida", "Pulldown convergente unilateral"]
        },
        {
          id: "uw2", g: "Peito", name: "Supino inclinado com halteres",
          sets: 4, repsMin: 8, repsMax: 10, rir: 1, rest: 120, inc: 2.5,
          cue: "Banco em 30 graus. Porção clavicular.",
          tech: null,
          alts: ["Supino inclinado no Smith", "Press inclinado na máquina"]
        },
        {
          id: "uw3", g: "Costas", name: "Remada Cavalinho pegada neutra",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 5,
          cue: "Densidade de costas com pausa na contração.",
          tech: null,
          alts: ["Remada na máquina peito apoiado", "Remada baixa neutra"]
        },
        {
          id: "uw4", g: "Ombro", name: "Elevação lateral no cabo unilateral",
          sets: 4, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Sem impulso. Tensão constante.",
          tech: null,
          alts: ["Elevação lateral com halteres", "Lateral na máquina"]
        },
        {
          id: "uw5", g: "Peito", name: "Bi-set: Peck deck + Crucifixo inverso",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 5,
          cue: "Emenda os dois sem descanso. Fecha peito e deltoide posterior no mesmo bloco.",
          tech: "myo-reps",
          alts: ["Cross-over + face pull", "Crucifixo no cabo + rear delt fly"]
        }
      ]
    },


    /* ---------------------------------------------------- PERNA A */
    {
      id: "perna-a",
      group: "Perna",
      title: "Perna A — Quadríceps",
      focus: "Quadríceps, com ênfase no vasto lateral e no reto femoral",
      duration: 50,
      priority: false,
      brief: "Agachamento primeiro enquanto há força. Extensora no fim, porque fadiga o joelho e atrapalha o resto.",
      exercises: [
        { id: "pna1", name: "Agachamento livre com barra", sets: 4, repsMin: 6, repsMax: 8, rir: 2, rest: 180, inc: 5,
          cue: "Desce até a coxa passar da paralela, joelho acompanhando a linha do pé. Core travado, sem soltar o quadril no fundo.",
          tech: null, alts: ["Agachamento no Smith", "Hack machine", "Agachamento goblet com halter"] },
        { id: "pna2", name: "Leg press 45 graus", sets: 4, repsMin: 10, repsMax: 12, rir: 1, rest: 120, inc: 10,
          cue: "Pés na largura do quadril e na parte baixa da plataforma para carregar o quadríceps. Não deixe o lombar sair do encosto.",
          tech: null, alts: ["Hack machine", "Agachamento na máquina Smith", "Prensa horizontal"] },
        { id: "pna3", name: "Passada com halteres", sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 2.5,
          cue: "Passo longo carrega glúteo, passo curto carrega quadríceps. Aqui use passo curto e tronco reto.",
          tech: null, alts: ["Búlgaro com halteres", "Afundo estático no Smith", "Step-up no banco"] },
        { id: "pna4", name: "Cadeira extensora", sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 75, inc: 5,
          cue: "Pausa de 1s no topo. Última série em drop-set.",
          tech: "drop-set", alts: ["Extensora unilateral", "Sissy squat"] },
        { id: "pna5", name: "Panturrilha em pé", sets: 4, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 5,
          cue: "Amplitude total, 2s de alongamento embaixo e pausa de 1s no topo. Panturrilha só responde a range completo.",
          tech: null, alts: ["Panturrilha no leg press", "Panturrilha no Smith"] }
      ]
    },

    /* ---------------------------------------------------- PERNA B */
    {
      id: "perna-b",
      group: "Perna",
      title: "Perna B — Posterior e glúteo",
      focus: "Isquiotibiais e glúteo máximo, com foco na cadeia posterior",
      duration: 50,
      priority: false,
      brief: "Cadeia posterior costuma ser o ponto fraco de quem prioriza superior. Terra romeno primeiro, com controle na excêntrica.",
      exercises: [
        { id: "pnb1", name: "Levantamento terra romeno com barra", sets: 4, repsMin: 8, repsMax: 10, rir: 2, rest: 150, inc: 5,
          cue: "Joelho levemente flexionado e fixo. Empurre o quadril para trás até sentir o alongamento do posterior, sem arredondar a lombar.",
          tech: null, alts: ["Terra romeno com halteres", "Terra romeno no Smith", "Good morning com barra"] },
        { id: "pnb2", name: "Mesa flexora deitada", sets: 4, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 5,
          cue: "Quadril colado no banco. Excêntrica de 3s, que é onde o isquiotibial mais responde.",
          tech: null, alts: ["Cadeira flexora sentada", "Flexora unilateral em pé", "Nordic curl assistido"] },
        { id: "pnb3", name: "Elevação pélvica com barra (hip thrust)", sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 120, inc: 5,
          cue: "Queixo para baixo, costela fechada. Pausa de 2s na contração máxima, sem hiperestender a lombar.",
          tech: null, alts: ["Hip thrust na máquina", "Ponte de glúteo com barra", "Glúteo no cabo"] },
        { id: "pnb4", name: "Cadeira abdutora", sets: 3, repsMin: 15, repsMax: 20, rir: 0, rest: 60, inc: 5,
          cue: "Tronco levemente inclinado à frente para pegar o glúteo médio, que é o que dá o contorno lateral do quadril.",
          tech: null, alts: ["Abdução no cabo", "Caminhada lateral com elástico"] },
        { id: "pnb5", name: "Panturrilha sentado", sets: 4, repsMin: 15, repsMax: 20, rir: 0, rest: 60, inc: 5,
          cue: "Joelho flexionado isola o sóleo, que é o músculo que dá volume visto de lado.",
          tech: "rest-pause", alts: ["Panturrilha no leg press com joelho flexionado", "Panturrilha unilateral sentado"] }
      ]
    },

    /* ---------------------------------------------------- LIVRE */
    {
      id: "livre",
      group: "Livre",
      title: "Treino do dia",
      focus: "Sessão montada na hora, com exercícios escolhidos por você",
      duration: 0,
      priority: false,
      brief: "Para treino fora do programa, academia diferente ou dia em que você quer improvisar. Monte a lista pelo botão de adicionar e esvazie quando quiser recomeçar.",
      exercises: []
    },
    /* ---------------------------------------------------- BRACO */
    {
      id: "braco",
      group: "Braco",
      title: "Braco — Volume",
      focus: "Bíceps (cabeça longa) e tríceps (cabeça longa)",
      duration: 40,
      priority: false,
      brief: "Complemento. As duas cabecas longas respondem ao alongamento, entao a ordem privilegia exercícios com o braco atras ou acima do corpo.",
      exercises: [
        {
          id: "br1", name: "Rosca inclinada com halteres (banco a 60 graus)",
          sets: 4, repsMin: 10, repsMax: 12, rir: 1, rest: 90, inc: 2.5,
          cue: "Braco atras da linha do tronco. E a posição alongada da cabeça longa do bíceps.",
          tech: null,
          alts: ["Rosca no cabo baixo atras do corpo", "Rosca Scott inversa para alongamento"]
        },
        {
          id: "br2", name: "Tríceps na polia alta com corda",
          sets: 4, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Abre a corda no final. Cotovelo colado ao tronco.",
          tech: null,
          alts: ["Tríceps na barra reta", "Tríceps unilateral no cabo pegada inversa"]
        },
        {
          id: "br3", name: "Tríceps testa com barra EZ ou francês no cabo",
          sets: 3, repsMin: 10, repsMax: 12, rir: 1, rest: 75, inc: 2.5,
          cue: "Braco acima da cabeça alonga a cabeça longa do tríceps, que responde por dois terços do volume do braco.",
          tech: null,
          alts: ["Tríceps francês com halter unilateral", "Extensão overhead no cabo com corda"]
        },
        {
          id: "br4", name: "Rosca martelo com corda no cabo",
          sets: 3, repsMin: 12, repsMax: 15, rir: 0, rest: 60, inc: 2.5,
          cue: "Braquial e braquiorradial empurram o bíceps para cima e engrossam o braco visto de lado.",
          tech: "rest-pause",
          alts: ["Rosca martelo com halteres", "Rosca inversa com barra EZ"]
        },
        {
          id: "br5", name: "Rosca direta na barra W, série descendente",
          sets: 2, repsMin: 10, repsMax: 12, rir: 0, rest: 60, inc: 2.5,
          cue: "Finalizador. Última série com drop de 30 %.",
          tech: "drop-set",
          alts: ["Rosca no cabo com barra reta", "Rosca concentrada"]
        }
      ]
    }
  ],

  techniques: {
    "rest-pause": "Leve a série até a falha técnica, descanse 15 segundos, execute mais reps até falhar de novo, repita uma vez. Somente na última série do exercício.",
    "myo-reps": "Série de ativação até RIR 0, depois 3 a 4 minisséries de 4 a 5 reps com 15 segundos de descanso entre elas.",
    "drop-set": "Chegue a falha, reduza 30 % da carga sem descanso e va a falha novamente. Repita mais uma vez se o exercício for de isolamento."
  }
};

const SPLITS = [
  { name: "5 dias", days: ["costas-a", "peito-a", "ombro", "perna-a", "costas-b"] },
  { name: "6 dias", days: ["peito-a", "costas-a", "perna-a", "ombro", "costas-b", "perna-b"] },
  { name: "3 dias (semana apertada)", days: ["upper-wp", "perna-a", "ombro"] }
];

/* Séries efetivas por grupo por semana — faixa alvo para hipertrofia */
const ALVO = {
  "Costas": [14, 20], "Peito": [12, 18], "Ombro": [12, 20],
  "Braço": [8, 14], "Perna": [12, 18], "Livre": [0, 0]
};

const TECNICAS = [
  { k: "", n: "Normal", s: "—" },
  { k: "myo", n: "Myo-reps", s: "MYO" },
  { k: "clu", n: "Cluster", s: "CLU" },
  { k: "rp", n: "Rest-pause", s: "RP" },
  { k: "bo", n: "Back-off", s: "BO" },
  { k: "drop", n: "Drop-set", s: "DROP" }
];
