# Unimath

App de treino de matemática que fiz para estudar para o vestibular da UFRGS (CC/EC).

Resolvi criar esse projeto pois sempre tive muita dificuldade em matemática num geral. Ter uma forma fácil e acessível de aprender matemática de forma gratuita e interativa era um desafio bem grande pra mim, então aqui está a minha solução.

A ideia é treino ativo e sessão curta todo dia: o app gera questão nova na hora, corrige
na hora, guarda seu progresso e só libera o próximo tópico quando você fixa o atual.

## Rodando

```bash
npm install
npm run dev      # http://localhost:5173
npm run build
npm run check    # roda o self-check da lógica pura
```

## Stack

React 18 + Vite, CSS Modules e `localStorage`. Sem backend. Funciona offline depois de
carregar. Interface em português ou inglês.

## Estrutura

```
src/
  data/        topics.js (a trilha de tópicos), exams.js (banco ENEM/UFRGS)
  lib/         lógica pura, sem React: geração de questão, correção, progressão, ranks
  store/       StoreProvider (contexto) + persistência em localStorage
  components/  peças de UI reutilizáveis
  screens/     uma tela por arquivo
```

## Como funciona (elementos importantes)

**Questão é gerada, não armazenada:** `lib/generators.js` tem uma função por tópico que
monta a questão a partir de números aleatórios. Como a resolução passo a passo é construída
dos mesmos números, a explicação sempre bate com a questão.

**Estado num lugar só:** `StoreProvider` guarda tudo que persiste. As telas leem com
`useStore()` e só alteram através de ações.

**Progressão é regra pura.** `lib/mastery.js` acumula as respostas numa janela dos últimos
10. Bateu 80%, o nível está fixado e você sobe.

## Estado atual

Uso no meu dia a dia. Não tem backend, não tem conta, não sincroniza entre aparelhos.

No momento, a ideia do projeto é não ter muitos elementos de gameficação. O máximo que tenho
em mente é um leaderboard local se eu for colocar um backend no futuro.
