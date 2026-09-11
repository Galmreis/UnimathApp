# Unimath

App de treino de matemática que fiz para estudar para o vestibular da UFRGS (CC/EC).

<!-- SUA VOZ AQUI: 2 ou 3 frases sobre por que você fez isso. O que não funcionava
     quando você estudava do jeito antigo? O que te fez querer resolver isso com código?
     Escreve do jeito que você contaria para um amigo, não para um recrutador. -->

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

## Como funciona

**Questão é gerada, não armazenada.** `lib/generators.js` tem uma função por tópico que
monta a questão a partir de números aleatórios. Como a resolução passo a passo é construída
dos mesmos números, a explicação sempre bate com a questão.

**Estado num lugar só.** `StoreProvider` guarda tudo que persiste. As telas leem com
`useStore()` e só alteram através de ações.

**Progressão é regra pura.** `lib/mastery.js` acumula as respostas numa janela dos últimos
10. Bateu 80%, o nível está fixado e você sobe.

<!-- SUA VOZ AQUI: a parte que deu mais trabalho de fazer funcionar. Escolhe uma coisa
     que você realmente quebrou a cabeça e conta em 3 ou 4 linhas: o que você tentou
     primeiro, por que não funcionou, como resolveu. Sugestões do próprio código:
       - useScrollMemory.js: por que useLayoutEffect e não useEffect
       - checkAnswer.js: aceitar fração e decimal como a mesma resposta
       - ranks.js: o pool de questões do teste de pareamento -->

## Estado atual

Uso no meu dia a dia. Não tem backend, não tem conta, não sincroniza entre aparelhos.

<!-- SUA VOZ AQUI: o que você quer fazer em seguida, ou o que decidiu não fazer e por quê -->
