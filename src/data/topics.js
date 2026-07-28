// The learning track: an ordered list of topics. Each topic unlocks only after
// its `prerequisite` is mastered, so the order of this array IS the study plan
// (adição → subtração → multiplicação → divisão → frações → porcentagem →
// equação → funções → potências).
//
// This is plain data on purpose: adding a new topic later means adding an object
// here and a matching generator in lib/generators.js — nothing else.

// `glyph` is the math symbol shown in the topic's coloured badge (see
// components/TopicGlyph.jsx). `color` tints that badge. Both are easy to change
// — swap a glyph or a hex value here and the whole UI follows.
//
// `group` buckets topics into the sections shown on Home (label lives in
// lib/i18n.js as `group_<key>`). Topics with the same group render together, in
// track order; a new group key just needs a matching i18n label.
export const TOPICS = [
  {
    id: 'adicao',
    group: 'fundamentos',
    name: 'Adição',
    glyph: '+',
    color: '#7dcfff',
    blurb: 'O primeiro passo: somar com e sem reagrupar, e com decimais.',
    levels: ['Sem reagrupar', 'Com reagrupamento', 'Com decimais'],
    prerequisite: null, // the first topic is always available
    en: { name: 'Addition', levels: ['No carrying', 'With carrying', 'With decimals'] },
  },
  {
    id: 'subtracao',
    group: 'fundamentos',
    name: 'Subtração',
    glyph: '−',
    color: '#73daca',
    blurb: 'Tirar valores: sem e com reagrupamento, e com decimais.',
    levels: ['Sem reagrupar', 'Com reagrupamento', 'Com decimais'],
    prerequisite: 'adicao',
    en: { name: 'Subtraction', levels: ['No borrowing', 'With borrowing', 'With decimals'] },
  },
  {
    id: 'multiplicacao',
    group: 'fundamentos',
    name: 'Multiplicação',
    glyph: '×',
    color: '#ff9e64',
    blurb: 'Da tabuada à multiplicação de dois dígitos.',
    levels: ['Tabuada', 'Por um dígito', 'Dois dígitos'],
    prerequisite: 'subtracao',
    en: { name: 'Multiplication', levels: ['Times tables', 'By one digit', 'Two digits'] },
  },
  {
    id: 'divisao',
    group: 'fundamentos',
    name: 'Divisão',
    glyph: '÷',
    color: '#7aa2f7',
    blurb: 'A base de tudo: exata, com resto, longa e com decimais.',
    levels: ['Exata', 'Com resto', 'Divisão longa', 'Com decimais'],
    prerequisite: 'multiplicacao',
    en: { name: 'Division', levels: ['Exact', 'With remainder', 'Long division', 'With decimals'] },
  },
  {
    id: 'fracoes',
    group: 'avancado',
    name: 'Frações',
    glyph: '½',
    color: '#e0a97a',
    blurb: 'Simplificar e operar com frações.',
    levels: ['Simplificar', 'Somar e subtrair', 'Multiplicar', 'Dividir'],
    prerequisite: 'divisao',
    en: { name: 'Fractions', levels: ['Simplify', 'Add and subtract', 'Multiply', 'Divide'] },
  },
  {
    id: 'porcentagem',
    group: 'avancado',
    name: 'Porcentagem',
    glyph: '%',
    color: '#7ecb8f',
    blurb: 'Porcentagem de um valor, comparação e aumento/desconto.',
    levels: ['Porcentagem de um valor', 'Que porcentagem é', 'Aumento e desconto'],
    prerequisite: 'fracoes',
    en: { name: 'Percentage', levels: ['Percent of a value', 'What percent is it', 'Increase and discount'] },
  },
  {
    id: 'equacao1',
    group: 'avancado',
    name: 'Equação de 1º grau',
    glyph: '=',
    color: '#c99ae0',
    blurb: 'Isolar o x e resolver equações lineares.',
    levels: ['ax = b', 'ax + b = c', 'ax + b = cx + d'],
    prerequisite: 'porcentagem',
    en: { name: 'Linear equation', levels: ['ax = b', 'ax + b = c', 'ax + b = cx + d'] },
  },
  {
    id: 'funcoes',
    group: 'avancado',
    name: 'Funções',
    glyph: 'ƒ',
    color: '#e39191',
    blurb: 'Função do 1º grau: calcular, achar a raiz e o coeficiente.',
    levels: ['Calcular f(x)', 'Raiz da função', 'Coeficiente angular'],
    prerequisite: 'equacao1',
    en: { name: 'Functions', levels: ['Compute f(x)', 'Root of the function', 'Slope'] },
  },
  {
    id: 'potencias',
    group: 'avancado',
    name: 'Potências e raízes',
    glyph: '√',
    color: '#bb9af7',
    blurb: 'Potências de 10, potências de base pequena e raízes quadradas exatas.',
    levels: ['Potências de 10', 'Potências', 'Raiz quadrada'],
    prerequisite: 'funcoes',
    en: { name: 'Powers and roots', levels: ['Powers of ten', 'Powers', 'Square roots'] },
  },
]

// Look up a topic by id. Returns undefined if not found.
export function getTopic(id) {
  return TOPICS.find((topic) => topic.id === id)
}
