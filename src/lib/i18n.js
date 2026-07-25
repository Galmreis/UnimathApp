// Tiny, dependency-free i18n. One flat dictionary per language; `makeT(lang)`
// returns a `t(key, params)` that looks up a template and fills `{placeholders}`.
// The app defaults to Portuguese — English is opt-in via the language setting.
//
// Generated question text (prompts, steps, tips) is NOT here: it's built from
// random numbers inside lib/generators.js and lib/strategies.js, which take a
// `lang` argument. This file only covers the fixed UI chrome and the labels.

export const LANGS = ['pt', 'en']

const DICT = {
  pt: {
    tagline: 'Matemática não é talento, é treino!',
    now: 'Agora',
    level_of: 'Nível {n}/{m}',
    trainNow: 'Treinar agora',
    fridayExam: 'Prova da sexta',
    stat_daysStudied: 'dias estudados',
    stat_questions: 'questões',
    stat_overall: 'acerto geral',
    stat_days: 'dias',
    stat_sessions: 'sessões',
    yourTrack: 'Sua trilha',
    lockedHint: 'Fixe o tópico anterior para liberar.',

    status_locked: 'Bloqueado',
    status_available: 'Disponível',
    status_in_progress: 'Em andamento',
    status_mastered: 'Fixado',

    // Session
    examTag: 'Prova',
    questionOf: 'Questão {n} de {m}',
    answerPlaceholderFraction: 'ex.: 3/4',
    answerPlaceholder: 'sua resposta',
    answerAria: 'Sua resposta',
    submit: 'Responder',
    correct: 'Certo!',
    wrongPrefix: 'Errou — resposta certa:',
    tipLabel: 'Dica',
    seeSummary: 'Ver resumo',
    next: 'Próxima',
    examNote: 'Prova sem correção na hora — o resultado aparece no fim.',
    quitConfirm: 'Sair da sessão? O que você fez agora não será salvo.',
    quitAria: 'Sair da sessão',
    stedAria: 'Passo a passo',

    // Summary
    ofCorrect: '{correct} de {total} certas',
    retakeExam: 'Refazer prova',
    trainAgain: 'Treinar de novo',
    backHome: 'Voltar ao início',
    practice90: 'Mandou muito bem! Consistência assim fixa rápido.',
    practice70: 'Bom ritmo. Seguindo assim, o nível fixa logo.',
    practice50: 'Tá evoluindo. Cada erro corrigido é aprendizado.',
    practice0: 'Sem pressa — repetir é o que fixa. Bora de novo.',
    examUp: 'Passou! Você avançou de nível.',
    examMasteredAll: 'Você fixou "{topic}" e completou toda a trilha! Mandou muito bem.',
    examMastered: 'Você fixou "{topic}"! O próximo tópico foi liberado.',
    examDown: 'Você voltou um nível para reforçar a base — sem crise, faz parte.',
    examStay: 'Quase lá. Repita o nível mais um pouco para fixar.',

    // Progress
    progressTitle: 'Progresso',
    improveTitle: 'Onde melhorar',
    improveMisses: '{misses} erros em {answered} questões',
    improveNone: 'Nenhum ponto fraco por agora — mandou bem!',
    byTopic: 'Por tópico',
    topicSub: 'Nível {n}/{m} · {answered} questões',
    recentSessions: 'Últimas sessões',
    noSessions: 'Você ainda não treinou. Que tal começar agora?',
    examsTitle: 'Provas da sexta',

    // Settings
    settingsTitle: 'Ajustes',
    sessionSize: 'Tamanho da sessão',
    byQuestions: 'Por questões',
    byTime: 'Por tempo',
    nQuestions: '{n} questões',
    nMin: '{n} min',
    feedbackGroup: 'Correção',
    explanations: 'Explicações passo a passo',
    explanationsHint: 'Mostra a resolução, passo a passo, na correção.',
    tipsSetting: 'Dica (estratégia)',
    tipsHint: 'Mostra um atalho de cálculo mental para cada questão.',
    appearance: 'Visual',
    theme: 'Tema',
    theme_midnight: 'Meia-noite',
    theme_dim: 'Suave',
    theme_sepia: 'Sépia',
    theme_forest: 'Floresta',
    theme_ocean: 'Oceano',
    theme_plum: 'Ameixa',
    theme_rose: 'Rosa',
    theme_slate: 'Ardósia',
    theme_clay: 'Argila',
    animations: 'Animações',
    animationsHint: 'Transições e movimentos suaves pela interface.',
    highContrast: 'Alto contraste',
    highContrastHint: 'Cores mais fortes para leitura fácil.',
    darkNote: 'O app usa modo escuro por padrão para cansar menos a vista.',
    language: 'Idioma',
    dataGroup: 'Dados',
    resetProgress: 'Zerar progresso',
    resetConfirm: 'Apagar TODO o progresso (tópicos, sessões e provas)? Isso não pode ser desfeito.',
    about: 'Unimath · treino de matemática para o vestibular. Seus dados ficam só neste navegador.',

    // NavBar
    nav_home: 'Início',
    nav_progress: 'Progresso',
    nav_settings: 'Ajustes',
  },
  en: {
    tagline: "Math isn't talent, it's practice!",
    now: 'Now',
    level_of: 'Level {n}/{m}',
    trainNow: 'Train now',
    fridayExam: 'Friday exam',
    stat_daysStudied: 'days studied',
    stat_questions: 'questions',
    stat_overall: 'overall accuracy',
    stat_days: 'days',
    stat_sessions: 'sessions',
    yourTrack: 'Your track',
    lockedHint: 'Master the previous topic to unlock.',

    status_locked: 'Locked',
    status_available: 'Available',
    status_in_progress: 'In progress',
    status_mastered: 'Mastered',

    examTag: 'Exam',
    questionOf: 'Question {n} of {m}',
    answerPlaceholderFraction: 'e.g. 3/4',
    answerPlaceholder: 'your answer',
    answerAria: 'Your answer',
    submit: 'Answer',
    correct: 'Correct!',
    wrongPrefix: 'Wrong — correct answer:',
    tipLabel: 'Tip',
    seeSummary: 'See summary',
    next: 'Next',
    examNote: "No feedback during the exam — you'll see the result at the end.",
    quitConfirm: "Leave the session? Your progress here won't be saved.",
    quitAria: 'Leave the session',
    stedAria: 'Step by step',

    ofCorrect: '{correct} of {total} correct',
    retakeExam: 'Retake exam',
    trainAgain: 'Train again',
    backHome: 'Back to home',
    practice90: 'Nailed it! Consistency like this sticks fast.',
    practice70: 'Good pace. Keep it up and the level will stick soon.',
    practice50: "You're getting there. Every fixed mistake is learning.",
    practice0: 'No rush — repetition is what makes it stick. Go again.',
    examUp: 'You passed! You moved up a level.',
    examMasteredAll: 'You mastered "{topic}" and finished the whole track! Well done.',
    examMastered: 'You mastered "{topic}"! The next topic is unlocked.',
    examDown: 'You dropped a level to shore up the basics — no worries, it happens.',
    examStay: 'Almost there. Repeat the level a bit more to lock it in.',

    progressTitle: 'Progress',
    improveTitle: 'Where to improve',
    improveMisses: '{misses} misses in {answered} questions',
    improveNone: 'No weak spots right now — nice work!',
    byTopic: 'By topic',
    topicSub: 'Level {n}/{m} · {answered} questions',
    recentSessions: 'Recent sessions',
    noSessions: "You haven't trained yet. Why not start now?",
    examsTitle: 'Friday exams',

    settingsTitle: 'Settings',
    sessionSize: 'Session size',
    byQuestions: 'By questions',
    byTime: 'By time',
    nQuestions: '{n} questions',
    nMin: '{n} min',
    feedbackGroup: 'Feedback',
    explanations: 'Step-by-step explanations',
    explanationsHint: 'Shows the worked solution, step by step, in the feedback.',
    tipsSetting: 'Tip (strategy)',
    tipsHint: 'Shows a mental-math shortcut for each question.',
    appearance: 'Appearance',
    theme: 'Theme',
    theme_midnight: 'Midnight',
    theme_dim: 'Dim',
    theme_sepia: 'Sepia',
    theme_forest: 'Forest',
    theme_ocean: 'Ocean',
    theme_plum: 'Plum',
    theme_rose: 'Rose',
    theme_slate: 'Slate',
    theme_clay: 'Clay',
    animations: 'Animations',
    animationsHint: 'Smooth transitions and motion across the interface.',
    highContrast: 'High contrast',
    highContrastHint: 'Stronger colors for easier reading.',
    darkNote: 'The app uses dark mode by default to be easier on the eyes.',
    language: 'Language',
    dataGroup: 'Data',
    resetProgress: 'Reset progress',
    resetConfirm: "Erase ALL progress (topics, sessions and exams)? This can't be undone.",
    about: 'Unimath · math practice for the entrance exam. Your data stays only in this browser.',

    nav_home: 'Home',
    nav_progress: 'Progress',
    nav_settings: 'Settings',
  },
}

// Build a translator bound to one language. `t('questionOf', { n, m })` fills
// {n}/{m}. Missing keys fall back to the key name so nothing renders blank.
export function makeT(lang) {
  const table = DICT[lang] ?? DICT.pt
  return function t(key, params) {
    let str = table[key] ?? DICT.pt[key] ?? key
    if (params) {
      for (const [k, v] of Object.entries(params)) str = str.replaceAll(`{${k}}`, v)
    }
    return str
  }
}

// A topic with its display strings swapped to `lang`. Structural fields (id,
// glyph, color, prerequisite, level count) are untouched; only name/levels move.
export function localizeTopic(topic, lang) {
  if (!topic || lang !== 'en' || !topic.en) return topic
  return { ...topic, ...topic.en }
}
