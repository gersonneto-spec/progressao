# Progressão

PWA de treino de hipertrofia com foco nos pontos fracos: **costas (largura), ombro (deltoide lateral e posterior) e peito (porção superior)**.

Registro e progressão de carga, com histórico completo por exercício e local de treino. Roda offline no celular e salva tudo no próprio aparelho.

## O que ele faz

- **10 treinos prontos**: Costas A (largura), Costas B (espessura), Peito A (porção superior), Peito B (volume e alongamento), Ombro (efeito 3D), Upper Weak Points (sessão combinada), Perna A (quadríceps), Perna B (posterior e glúteo), Braço e Treino livre.
- **Registro simples**: um campo de peso da última série por exercício, mais o botão de concluído. Sem grade de séries.
- **Série avançada opcional** por exercício: myo-reps, cluster, rest-pause, back-off ou drop-set.
- **Biblioteca de substituições**: 2 a 3 alternativas por exercício, para máquina ocupada ou execução que você ainda não domina. A troca fica salva.
- **Histórico completo** por exercício: todas as sessões salvas, sem corte, com gráfico de carga máxima por sessão, recorde, variação percentual no período e volume total.
- **Local de treino** registrado em cada sessão, com sugestão dos locais já usados. Útil para comparar carga entre academias diferentes.
- **Timer de descanso** disparado ao marcar a série concluída, já com o tempo prescrito do exercício, com botão de mais 15 segundos e de pular.
- **Volume semanal por grupo muscular**: séries efetivas dos últimos 7 dias contra a faixa alvo de hipertrofia, com comparação com a semana anterior.
- **Detecção de estagnação**: 3 sessões com o mesmo peso disparam alerta com recomendação de deload ou troca.
- **Editar e apagar sessão** direto na tela de evolução do exercício.
- **Exercício avulso**: adicione qualquer exercício a qualquer treino, definindo grupo, séries, faixa de reps, descanso e incremento.
- **Tema claro**, pensado para leitura rápida no celular durante o treino.
- **Offline first**: service worker com cache do app inteiro. Depois do primeiro acesso, funciona sem internet na academia.

## Como instalar no celular

1. Abra a URL do GitHub Pages no navegador do celular.
2. **iPhone (Safari)**: botão de compartilhar, depois "Adicionar à Tela de Início".
3. **Android (Chrome)**: menu de três pontos, depois "Instalar app" ou "Adicionar à tela inicial".

O app abre em tela cheia, sem barra de navegador.

## Estrutura

```
index.html               shell do app
css/style.css            tema escuro, azul imperial e magenta
js/data.js               programa de treinos (edite aqui para mudar exercícios)
js/app.js                render, registro, progressão, substituições
manifest.webmanifest     metadados PWA
sw.js                    service worker (cache offline)
icons/                   ícones 192 e 512
```

## Editando os treinos

Todo o programa está em `js/data.js`. Cada exercício tem:

```js
{
  id: "ca1",                      // identificador único, usado no histórico
  name: "Pulldown pegada aberta pronada",
  sets: 4, repsMin: 8, repsMax: 10,
  rir: 1,                         // reps in reserve alvo
  rest: 120,                      // descanso em segundos
  inc: 5,                         // incremento de carga sugerido, em kg
  cue: "...",                     // orientação de execução
  tech: "rest-pause",             // null | "rest-pause" | "myo-reps" | "drop-set"
  alts: ["...", "..."]            // substituições
}
```

Não mude o `id` de um exercício depois de começar a registrar, porque o histórico é indexado por ele.

## Dados

Tudo fica no `localStorage` do próprio aparelho. Nada sai do celular, não existe servidor nem conta. Trocar de aparelho ou limpar os dados do navegador apaga o histórico.

## Publicação

Hospedado no GitHub Pages a partir da branch `main`, pasta raiz.

## Licença

Uso pessoal.
