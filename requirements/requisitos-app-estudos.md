# Requisitos — App de Estudos para o Vestibular (foco UFRGS: CC / EC)

Documento de requisitos, não de código. Serve de mapa pra construção posterior.
Inspiração de método: Soromath — treino ativo, feedback imediato, sessões curtas e diárias.

---

## 1. Objetivo

Um app web que gera questões aleatórias por tópico e dificuldade, seguindo o planejamento de estudo (divisão → frações/porcentagem → equação de 1º grau → funções → conteúdo do vestibular), com foco em uso no celular (o "ônibus da manhã") e adaptação pra desktop. A meta é replicar o que fez a tabuada funcionar: responder, corrigir na hora, ver o progresso subir.

## 2. Princípios de produto (o "porquê" de cada decisão)

- **Treino ativo, não passivo.** O usuário resolve; o app corrige na hora. Nada de só assistir.
- **Sessão curta é o padrão.** O fluxo principal é uma sessão de ~30 min / ~20 questões. O app nunca deve fazer o usuário sentir que "precisa" estudar horas.
- **Progresso visível.** O usuário precisa ver um número subir (acertos, % da semana, dias seguidos). Esse é o combustível.
- **Só avança quando fixou.** O app não empurra o próximo tópico enquanto o atual não atinge um limiar de acerto. Fixação vence velocidade.
- **Descanso é sagrado.** Sem notificações agressivas, sem "streak" que dá culpa se você faltar um dia. Perder um dia não pode parecer punição.

## 3. Stack técnica

- **Front-end:** HTML + CSS + JS, com **React** e **Vite** (dev rápido, build simples).
- **Estilo:** CSS puro ou uma lib leve (ex.: CSS Modules). Evitar dependência pesada no começo.
- **Back-end (fase posterior):** **Node.js** (ex.: Express) — só quando houver contas de usuário ou dados na nuvem. No MVP, não é necessário.
- **Armazenamento no MVP:** dados de progresso salvos **localmente no navegador** (o app roda sem servidor). *Observação de dev: em produção isso é `localStorage`; note que artefatos de preview têm limitação nisso, então localStorage é pro app rodando no seu próprio ambiente/build, não dentro de preview.*
- **Geração de questões:** funções em JS que criam a questão na hora a partir de parâmetros (não um banco fixo de perguntas). Ex.: sortear dois números dentro de uma faixa e montar a divisão.

## 4. Requisitos funcionais

### 4.1 Tópicos e trilha de aprendizado
- O conteúdo é organizado em **tópicos** (ex.: Divisão, Frações, Porcentagem, Equação de 1º grau, Funções...).
- Cada tópico tem **subníveis de dificuldade** (ex.: Divisão → exata → com resto → longa → decimais).
- Os tópicos seguem uma **ordem de pré-requisito**: um tópico fica bloqueado até o anterior atingir o limiar de fixação.
- A trilha deve refletir o planejamento de 4 meses e depois expandir pro conteúdo do vestibular (funções, trigonometria, geometria, etc.).

### 4.2 Geração de questões
- Questões geradas **aleatoriamente por parâmetros**, não tiradas de um banco fixo (garante repetição infinita sem decorar respostas).
- Cada tópico tem sua própria lógica de geração (ex.: divisão sorteia divisor e dividendo dentro de faixas por dificuldade).
- A dificuldade controla as faixas (números maiores, com resto, com decimais, etc.).
- Cada questão tem: enunciado, resposta correta e (fase posterior) explicação do passo a passo.

### 4.3 Sessão de treino (fluxo principal)
- Botão grande "Treinar agora" na tela inicial.
- Sessão padrão: número fixo de questões (ex.: 20) ou tempo (ex.: 30 min) — o usuário escolhe nas configurações.
- Fluxo de cada questão: mostra enunciado → usuário responde → feedback **imediato** (certo/errado + resposta certa) → próxima.
- Ao final: resumo da sessão (acertos, tempo, % ) e incentivo curto.

### 4.4 Correção e feedback
- Feedback na hora, questão a questão (não só no final).
- Em caso de erro: mostrar a resposta correta e (fase posterior) o passo a passo.
- Registrar cada resposta pra alimentar as métricas de progresso.

### 4.5 Progresso e métricas (o "acertei X% no app")
- % de acerto por tópico e por sessão.
- Histórico simples (últimas sessões, evolução da %).
- Contador de dias estudados (sem punição por falha — mostra progresso, não cobra).
- **Limiar de fixação:** quando o acerto de um tópico passa de um valor (ex.: 80% em N questões seguidas), o app libera o próximo tópico e sinaliza "fixado".

### 4.6 A "prova da sexta"
- Modo especial de avaliação, sem consulta, com questões só do tópico da semana.
- Resultado registrado à parte, pra ver a evolução semana a semana.
- Decide se avança de degrau (8+/10 avança, 5–7 repete, <5 volta um passo).

### 4.7 Configurações
- Tamanho da sessão (nº de questões ou minutos).
- Tema visual (garantir modo escuro; opção de contraste).
- Reset de progresso (com confirmação).

## 5. Requisitos não-funcionais (experiência e visual)

### 5.1 Mobile-first
- Projetado primeiro pra tela de celular (uso no ônibus): botões grandes, alvos de toque confortáveis, resposta fácil com uma mão.
- Depois adaptado pra desktop (layout mais largo, mesmo conteúdo).
- Design **responsivo** (funciona de ~360px de largura até tela grande).

### 5.2 Interface limpa e "caseira"
- Poucos elementos por tela; uma ação principal clara em cada momento.
- Nada de poluição visual, banners ou distrações. A tela de treino mostra a questão e pouco mais.
- Tipografia legível e de bom tamanho (a leitura no ônibus, em movimento, precisa ser fácil).

### 5.3 Cores que não forçam a vista
- **Modo escuro como padrão.** Fundo escuro (não preto puro — um cinza-escuro azulado cansa menos), texto claro (não branco puro — um off-white reduz o brilho).
- Cor de destaque suave pra ações e acertos; vermelho de erro dessaturado, não berrante.
- Contraste suficiente pra leitura, sem ser agressivo.
- (Opcional, fase posterior) alternar claro/escuro.

### 5.4 Desempenho e uso offline
- Carregar rápido e funcionar mesmo com internet ruim (importante no ônibus).
- No MVP, como roda no navegador com dados locais, funciona offline naturalmente após carregar.

## 6. Modelo de dados (conceitual, não código)

- **Tópico:** id, nome, ordem, pré-requisito, lista de níveis de dificuldade.
- **Progresso do tópico:** tópico, nº de questões respondidas, nº de acertos, % atual, status (bloqueado / em andamento / fixado).
- **Sessão:** data, tópico, nº de questões, acertos, duração.
- **Resultado de prova (sexta):** data, tópico, acertos, total.

## 7. Escopo por fases (pra não travar no meio)

### Fase 1 — MVP (o mínimo que já é útil)
- 1 tópico completo (Divisão) com seus subníveis.
- Geração aleatória de questões e correção imediata.
- Sessão de 20 questões + resumo no final.
- % de acerto salva localmente no navegador.
- Modo escuro, mobile-first.
> Se você terminar só isso, já tem uma ferramenta usável no ônibus amanhã. Esse é o objetivo real do MVP.

### Fase 2 — Trilha e progresso
- Vários tópicos com ordem de pré-requisito e bloqueio/liberação.
- Limiar de fixação e histórico de sessões.
- Modo "prova da sexta".

### Fase 3 — Refino
- Passo a passo nas explicações de erro.
- Mais tópicos (funções, trigonometria, geometria...).
- Ajustes de tema e configurações.

### Fase 4 — Nuvem (opcional, só se precisar)
- Back-end em Node.js + contas de usuário.
- Sincronizar progresso entre celular e desktop.
> Só vale a pena se você quiser usar em vários aparelhos. Enquanto for só o seu celular, dados locais bastam — não adicione servidor sem necessidade.

## 8. Fora de escopo (por enquanto)

- Login social, ranking, multiplayer, gamificação pesada.
- Redação, humanas e conteúdo não-matemático (o app começa focado no que mais pesa em CC/EC).
- App nativo (iOS/Android) — é um app web, acessível pelo navegador do celular.

---

**Resumo do espírito:** um Soromath pessoal, feito por você, apontado pra Matemática de CC/EC da UFRGS. Começa pequeno (Divisão), roda no navegador do celular, feedback na hora, progresso visível. Cresce por camadas conforme sua base — e a sua prática de dev — evoluem juntas.
