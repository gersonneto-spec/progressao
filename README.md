# Progressão

Aplicativo de acompanhamento de musculação em português do Brasil. PWA sem build, roda offline no celular e no computador, com persistência local.

## Atleta

Gerson, 37 anos, 2,02 m, 102 kg. Nível avançado, 6 treinos por semana, até 50 minutos por sessão.
Objetivo: hipertrofia com prioridade em peitoral superior, espessura das costas, deltoide lateral e posterior, cabeça longa do tríceps e quadríceps.

## Princípio do registro

Ao terminar cada exercício o usuário informa apenas três coisas:

1. carga da última série válida;
2. repetições dessa série;
3. RIR da série (3+, 2, 1,5, 1, 0,5, 0 ou falha técnica).

Todo o resto é apresentado pelo app: séries válidas, faixa de repetições, RIR alvo da semana, descanso, aquecimento calculado, top set e back-offs, técnica avançada da semana, substituições e cronômetro.

## Divisão semanal

| Dia | Treino |
|---|---|
| A | Peito + costas: espessura |
| B | Ombros + braços |
| C | Pernas + abdômen |
| D | Costas: largura |
| E | Peito superior + deltoide lateral |
| F | Costas: especialização em espessura |
| 7 | Descanso, depois reinicia em A |

## Periodização de 12 semanas

Semanas 1, 2, 5, 6, 9, 10 e 12 acumulam volume e repetições. Semanas 3, 7 e 11 são de pico, com Myo-reps, rest-pause e drop-sets liberados. Semanas 4 e 8 são descarga: 60% das séries, cerca de 87% da carga, RIR 3 e nenhuma técnica.

Regras de segurança das técnicas: no máximo um intensificador por treino, nunca em composto livre com barra, nunca nas semanas de descarga.

## Progressão automática

Dupla progressão. A carga sobe quando a última série atinge o topo da faixa, o RIR real é igual ou maior que o programado e não houve registro de dor. Superiores sobem cerca de 3,5%, inferiores cerca de 7%, sempre arredondado para o menor incremento configurado. Dentro da faixa, mantém a carga e busca repetição. Abaixo da faixa em falha, reduz cerca de 5%. RIR real abaixo do programado nunca gera aumento.

No Graviton, progredir significa reduzir a assistência. Na barra fixa, aumentar o lastro ao atingir 10 repetições limpas.

## Aquecimento calculado

Primeiro composto do grupo: 40% x 10, 60% x 6, 75% x 3, 85% x 1 a 2.
Segundo composto do mesmo grupo: 60% x 6 e, se necessário, 80% x 2 a 3.
Isoladores: uma série de 10 a 12 com 55%.
Graviton: depressão escapular x 12, assistência alta x 6, assistência moderada x 3.

As cargas são calculadas sobre a carga sugerida do dia e recalculadas ao vivo quando o usuário digita outra carga.

## Telas

- **Painel**: semana, dia, treino do dia, sessões, sequência, percentual do ciclo, cargas que evoluíram, estagnação e botão de iniciar treino.
- **Treino**: um exercício por vez em card grande, com aquecimento, blocos de última carga, repetições, RIR e carga sugerida, técnica da semana, supersérie destacada, substituições, cronômetro e conclusão.
- **Histórico**: por exercício, com gráfico de carga, recordes de carga e de repetições, variação percentual, estagnação e todas as sessões.
- **Ajustes**: unidade, incrementos, descanso padrão, Graviton, semana e dia do ciclo, backup JSON, exportação CSV, importação e zerar ciclo.

## Persistência

Tudo em `localStorage`, salvo a cada ação. A sessão em andamento é retomada ao reabrir o app. Backup em JSON e histórico em CSV pelos botões de Ajustes.

## Estrutura

```
index.html               shell
css/style.css            tema escuro azul-marinho
js/data.js               perfil, periodização e os 6 treinos
js/engine.js             progressão, aquecimento e regras semanais
js/app.js                telas, cronômetro, persistência e backup
manifest.webmanifest     metadados PWA
sw.js                    service worker
```

## Segurança

Interrompa o exercício em caso de dor aguda, tontura, falta de ar incomum, palpitação ou perda de controle do movimento. Dor articular não é intensidade. Ao marcar dor no registro, o app não sugere progressão na sessão seguinte.
