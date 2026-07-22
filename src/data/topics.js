// The learning track: an ordered list of topics. Each topic unlocks only after
// its `prerequisite` is mastered, so the order of this array IS the study plan
// (divisão → frações → porcentagem → equação → funções).
//
// This is plain data on purpose: adding a new topic later means adding an object
// here and a matching generator in lib/generators.js — nothing else.

// `glyph` is the math symbol shown in the topic's coloured badge (see
// components/TopicGlyph.jsx). `color` tints that badge. Both are easy to change
// — swap a glyph or a hex value here and the whole UI follows.
export const TOPICS = [
  {
    id: 'divisao',
    name: 'Divisão',
    glyph: '÷',
    color: '#7aa2f7',
    blurb: 'A base de tudo: exata, com resto, longa e com decimais.',
    levels: ['Exata', 'Com resto', 'Divisão longa', 'Com decimais'],
    prerequisite: null, // the first topic is always available
  },
  {
    id: 'fracoes',
    name: 'Frações',
    glyph: '½',
    color: '#e0a97a',
    blurb: 'Simplificar e operar com frações.',
    levels: ['Simplificar', 'Somar e subtrair', 'Multiplicar', 'Dividir'],
    prerequisite: 'divisao',
  },
  {
    id: 'porcentagem',
    name: 'Porcentagem',
    glyph: '%',
    color: '#7ecb8f',
    blurb: 'Porcentagem de um valor, comparação e aumento/desconto.',
    levels: ['Porcentagem de um valor', 'Que porcentagem é', 'Aumento e desconto'],
    prerequisite: 'fracoes',
  },
  {
    id: 'equacao1',
    name: 'Equação de 1º grau',
    glyph: '=',
    color: '#c99ae0',
    blurb: 'Isolar o x e resolver equações lineares.',
    levels: ['ax = b', 'ax + b = c', 'ax + b = cx + d'],
    prerequisite: 'porcentagem',
  },
  {
    id: 'funcoes',
    name: 'Funções',
    glyph: 'ƒ',
    color: '#e39191',
    blurb: 'Função do 1º grau: calcular, achar a raiz e o coeficiente.',
    levels: ['Calcular f(x)', 'Raiz da função', 'Coeficiente angular'],
    prerequisite: 'equacao1',
  },
]

// Look up a topic by id. Returns undefined if not found.
export function getTopic(id) {
  return TOPICS.find((topic) => topic.id === id)
}
