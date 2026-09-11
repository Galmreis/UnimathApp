// The question bank for the "Provas" mode (ENEM / UFRGS style).
//
// Training questions are generated from random numbers (lib/generators.js), but
// real exam questions are contextual and multiple choice, so they live here as
// plain data. lib/papers.js filters and draws from this list.
//
// One question:
//   id           unique slug, never reused (React key + log key)
//   source       must be in EXAM_SOURCES
//   year         the paper's year, or null
//   number       the question's number in the paper, or null
//   origin       'official' transcribed as printed
//                'adapted'  real question, numbers or wording changed
//                'authored' written in that exam's style, not a real question
//   topicId      a topic in data/topics.js (pick the dominant skill)
//   level        that topic's level index
//   statement    question text, Portuguese, plain text
//   alternatives exactly 5, in the paper's order, all different
//   correct      index 0-4, checked against the official key
//   solution     2 to 4 worked steps
//   en           statement/alternatives/solution in English, same order
//
// Rules that npm run check enforces, and a few it can't:
//   - no images. If it needs a figure, rewrite the data into the text (that
//     makes it 'adapted') or skip the question.
//   - no question groups. Repeat the shared context in each statement, since
//     questions are drawn individually.
//   - keep the numbers exact, don't round an alternative.
//   - to add a board, put its name in EXAM_SOURCES and catalogue one question.
//     Empty boards never show up as a filter chip.
//
// Papers and answer keys: INEP for ENEM, COPERSE for UFRGS.
//
// Everything here is origin: 'authored', written so the mode has content to run
// on. Replace or extend with catalogued papers; nothing else needs to change.

export const EXAM_SOURCES = ['ENEM', 'UFRGS']

export const EXAM_QUESTIONS = [
  // ---------------- ENEM style: context first, arithmetic second ----------------
  {
    id: 'enem-a01',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'porcentagem', level: 2,
    statement: 'Uma loja anuncia uma televisão por R$ 1.800,00. Na promoção de aniversário o preço cai 15% e, no pagamento à vista, há ainda 10% de desconto sobre o valor já promocional. Qual é o preço à vista?',
    alternatives: ['R$ 1.350,00', 'R$ 1.377,00', 'R$ 1.395,00', 'R$ 1.440,00', 'R$ 1.530,00'],
    correct: 1,
    solution: [
      '15% de 1.800 = 270, então o preço promocional é 1.800 − 270 = 1.530.',
      '10% de 1.530 = 153, então o preço à vista é 1.530 − 153 = 1.377.',
      'Cuidado: descontos sucessivos não se somam — 15% + 10% daria 1.350, que é a pegadinha.',
    ],
    en: {
      statement: 'A shop advertises a television for R$ 1,800.00. In the anniversary sale the price drops 15%, and paying up front takes another 10% off the already discounted value. What is the up-front price?',
      alternatives: ['R$ 1,350.00', 'R$ 1,377.00', 'R$ 1,395.00', 'R$ 1,440.00', 'R$ 1,530.00'],
      solution: [
        '15% of 1,800 = 270, so the sale price is 1,800 − 270 = 1,530.',
        '10% of 1,530 = 153, so the up-front price is 1,530 − 153 = 1,377.',
        "Careful: successive discounts don't add up — 15% + 10% would give 1,350, which is the trap.",
      ],
    },
  },
  {
    id: 'enem-a02',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'porcentagem', level: 1,
    statement: 'Em uma escola com 480 alunos, 96 participaram da olimpíada de matemática. Que percentual dos alunos participou?',
    alternatives: ['15%', '18%', '20%', '24%', '25%'],
    correct: 2,
    solution: [
      'A parte é 96 e o total é 480, então a razão é 96 ÷ 480 = 0,2.',
      '0,2 × 100 = 20%.',
    ],
    en: {
      statement: 'In a school with 480 students, 96 took part in the math olympiad. What percentage of the students took part?',
      alternatives: ['15%', '18%', '20%', '24%', '25%'],
      solution: [
        'The part is 96 and the whole is 480, so the ratio is 96 ÷ 480 = 0.2.',
        '0.2 × 100 = 20%.',
      ],
    },
  },
  {
    id: 'enem-a03',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'divisao', level: 1,
    statement: 'Uma fábrica precisa embalar 1.250 barras de cereal em caixas com 24 unidades cada. Quantas caixas completas serão formadas e quantas barras sobrarão?',
    alternatives: [
      '51 caixas e 6 barras',
      '52 caixas e 2 barras',
      '52 caixas e 12 barras',
      '52 caixas e 22 barras',
      '53 caixas e 2 barras',
    ],
    correct: 1,
    solution: [
      '24 × 50 = 1.200, e ainda cabem mais duas caixas: 24 × 52 = 1.248.',
      '1.250 − 1.248 = 2, então sobram 2 barras.',
      'São 52 caixas completas e resto 2.',
    ],
    en: {
      statement: 'A factory needs to pack 1,250 cereal bars into boxes of 24. How many full boxes will there be, and how many bars are left over?',
      alternatives: [
        '51 boxes and 6 bars',
        '52 boxes and 2 bars',
        '52 boxes and 12 bars',
        '52 boxes and 22 bars',
        '53 boxes and 2 bars',
      ],
      solution: [
        '24 × 50 = 1,200, and two more boxes still fit: 24 × 52 = 1,248.',
        '1,250 − 1,248 = 2, so 2 bars are left over.',
        'That is 52 full boxes with a remainder of 2.',
      ],
    },
  },
  {
    id: 'enem-a04',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'funcoes', level: 0,
    statement: 'O valor pago por uma corrida de aplicativo é dado por P(x) = 4,50 + 2,20x, em que x é a distância em quilômetros. Quanto custa uma corrida de 12 km?',
    alternatives: ['R$ 26,40', 'R$ 28,70', 'R$ 30,90', 'R$ 31,40', 'R$ 33,00'],
    correct: 2,
    solution: [
      'Substitua x = 12: P(12) = 4,50 + 2,20 × 12.',
      '2,20 × 12 = 26,40.',
      '4,50 + 26,40 = 30,90.',
    ],
    en: {
      statement: 'The price of a ride-hailing trip is P(x) = 4.50 + 2.20x, where x is the distance in kilometres. How much does a 12 km trip cost?',
      alternatives: ['R$ 26.40', 'R$ 28.70', 'R$ 30.90', 'R$ 31.40', 'R$ 33.00'],
      solution: [
        'Substitute x = 12: P(12) = 4.50 + 2.20 × 12.',
        '2.20 × 12 = 26.40.',
        '4.50 + 26.40 = 30.90.',
      ],
    },
  },
  {
    id: 'enem-a05',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'funcoes', level: 1,
    statement: 'Um tanque começa com 600 litros de água e vaza 25 litros por hora, de modo que o volume é V(t) = 600 − 25t, com t em horas. Depois de quantas horas o tanque estará vazio?',
    alternatives: ['15 h', '20 h', '24 h', '25 h', '30 h'],
    correct: 2,
    solution: [
      'O tanque vazio significa V(t) = 0, ou seja, 600 − 25t = 0.',
      '25t = 600, então t = 600 ÷ 25.',
      't = 24 horas.',
    ],
    en: {
      statement: 'A tank starts with 600 litres of water and leaks 25 litres per hour, so its volume is V(t) = 600 − 25t, with t in hours. After how many hours will the tank be empty?',
      alternatives: ['15 h', '20 h', '24 h', '25 h', '30 h'],
      solution: [
        'An empty tank means V(t) = 0, that is, 600 − 25t = 0.',
        '25t = 600, so t = 600 ÷ 25.',
        't = 24 hours.',
      ],
    },
  },
  {
    id: 'enem-a06',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'fracoes', level: 1,
    statement: 'Em uma pesquisa sobre deslocamento, 1/3 dos entrevistados escolheu o transporte público e 2/5 escolheu o carro. Que fração dos entrevistados escolheu uma dessas duas opções?',
    alternatives: ['3/8', '2/5', '11/15', '3/5', '13/15'],
    correct: 2,
    solution: [
      '3 e 5 não têm fator comum, então o denominador comum é 3 × 5 = 15.',
      '1/3 = 5/15 e 2/5 = 6/15.',
      '5/15 + 6/15 = 11/15.',
    ],
    en: {
      statement: 'In a commuting survey, 1/3 of the respondents chose public transport and 2/5 chose the car. What fraction of the respondents chose one of those two options?',
      alternatives: ['3/8', '2/5', '11/15', '3/5', '13/15'],
      solution: [
        '3 and 5 share no factor, so the common denominator is 3 × 5 = 15.',
        '1/3 = 5/15 and 2/5 = 6/15.',
        '5/15 + 6/15 = 11/15.',
      ],
    },
  },
  {
    id: 'enem-a07',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'multiplicacao', level: 2,
    statement: 'Um salão retangular mede 8,5 m por 6 m e será todo revestido com um piso que custa R$ 42,00 o metro quadrado. Qual é o custo do material?',
    alternatives: ['R$ 1.998,00', 'R$ 2.142,00', 'R$ 2.184,00', 'R$ 2.310,00', 'R$ 2.520,00'],
    correct: 1,
    solution: [
      'A área é 8,5 × 6 = 51 m².',
      '51 × 42 = 51 × 40 + 51 × 2 = 2.040 + 102.',
      'O custo é R$ 2.142,00.',
    ],
    en: {
      statement: 'A rectangular hall measures 8.5 m by 6 m and will be fully covered with flooring costing R$ 42.00 per square metre. What is the cost of the material?',
      alternatives: ['R$ 1,998.00', 'R$ 2,142.00', 'R$ 2,184.00', 'R$ 2,310.00', 'R$ 2,520.00'],
      solution: [
        'The area is 8.5 × 6 = 51 m².',
        '51 × 42 = 51 × 40 + 51 × 2 = 2,040 + 102.',
        'The cost is R$ 2,142.00.',
      ],
    },
  },
  {
    id: 'enem-a08',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'potencias', level: 0,
    statement: 'A distância média da Terra ao Sol é de aproximadamente 1,5 × 10⁸ km. Escrita em metros, essa distância é',
    alternatives: ['1,5 × 10⁹ m', '1,5 × 10¹⁰ m', '1,5 × 10¹¹ m', '1,5 × 10¹² m', '1,5 × 10¹³ m'],
    correct: 2,
    solution: [
      '1 km = 10³ m, então basta multiplicar por 10³.',
      '1,5 × 10⁸ × 10³ = 1,5 × 10⁸⁺³.',
      'A distância é 1,5 × 10¹¹ m.',
    ],
    en: {
      statement: 'The average distance from the Earth to the Sun is about 1.5 × 10⁸ km. Written in metres, that distance is',
      alternatives: ['1.5 × 10⁹ m', '1.5 × 10¹⁰ m', '1.5 × 10¹¹ m', '1.5 × 10¹² m', '1.5 × 10¹³ m'],
      solution: [
        '1 km = 10³ m, so just multiply by 10³.',
        '1.5 × 10⁸ × 10³ = 1.5 × 10⁸⁺³.',
        'The distance is 1.5 × 10¹¹ m.',
      ],
    },
  },
  {
    id: 'enem-a09',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'equacao1', level: 2,
    statement: 'Duas operadoras de telefonia oferecem planos: a operadora A cobra R$ 40,00 fixos mais R$ 0,50 por minuto; a operadora B cobra R$ 25,00 fixos mais R$ 0,80 por minuto. Para quantos minutos de uso os dois planos custam o mesmo?',
    alternatives: ['30 min', '40 min', '50 min', '60 min', '75 min'],
    correct: 2,
    solution: [
      'Iguale os dois custos: 40 + 0,50m = 25 + 0,80m.',
      'Junte os termos: 40 − 25 = 0,80m − 0,50m, ou seja, 15 = 0,30m.',
      'm = 15 ÷ 0,30 = 50 minutos.',
    ],
    en: {
      statement: 'Two phone carriers offer plans: carrier A charges a fixed R$ 40.00 plus R$ 0.50 per minute; carrier B charges a fixed R$ 25.00 plus R$ 0.80 per minute. For how many minutes of use do the two plans cost the same?',
      alternatives: ['30 min', '40 min', '50 min', '60 min', '75 min'],
      solution: [
        'Set the two costs equal: 40 + 0.50m = 25 + 0.80m.',
        'Collect the terms: 40 − 25 = 0.80m − 0.50m, that is, 15 = 0.30m.',
        'm = 15 ÷ 0.30 = 50 minutes.',
      ],
    },
  },
  {
    id: 'enem-a10',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'porcentagem', level: 0,
    statement: 'Um trabalhador recebe R$ 2.400,00 por mês e gasta 35% desse valor com aluguel. Quanto sobra depois de pagar o aluguel?',
    alternatives: ['R$ 840,00', 'R$ 1.440,00', 'R$ 1.520,00', 'R$ 1.560,00', 'R$ 1.640,00'],
    correct: 3,
    solution: [
      '10% de 2.400 = 240, então 30% = 720 e 5% = 120.',
      '35% de 2.400 = 720 + 120 = 840.',
      'Sobra 2.400 − 840 = 1.560.',
    ],
    en: {
      statement: 'A worker earns R$ 2,400.00 a month and spends 35% of it on rent. How much is left after paying the rent?',
      alternatives: ['R$ 840.00', 'R$ 1,440.00', 'R$ 1,520.00', 'R$ 1,560.00', 'R$ 1,640.00'],
      solution: [
        '10% of 2,400 = 240, so 30% = 720 and 5% = 120.',
        '35% of 2,400 = 720 + 120 = 840.',
        'What is left is 2,400 − 840 = 1,560.',
      ],
    },
  },
  {
    id: 'enem-a11',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'subtracao', level: 2,
    statement: 'O tanque de um carro comporta 48,5 litros de combustível. Depois de uma viagem, restam 12,75 litros. Quantos litros foram consumidos?',
    alternatives: ['34,25 L', '35,75 L', '36,25 L', '36,75 L', '37,25 L'],
    correct: 1,
    solution: [
      'Alinhe as casas decimais: 48,50 − 12,75.',
      '48,50 − 12,00 = 36,50 e 36,50 − 0,75 = 35,75.',
      'Foram consumidos 35,75 litros.',
    ],
    en: {
      statement: "A car's tank holds 48.5 litres of fuel. After a trip, 12.75 litres are left. How many litres were used?",
      alternatives: ['34.25 L', '35.75 L', '36.25 L', '36.75 L', '37.25 L'],
      solution: [
        'Line up the decimal places: 48.50 − 12.75.',
        '48.50 − 12.00 = 36.50 and 36.50 − 0.75 = 35.75.',
        '35.75 litres were used.',
      ],
    },
  },
  {
    id: 'enem-a12',
    source: 'ENEM', year: null, number: null, origin: 'authored',
    topicId: 'adicao', level: 2,
    statement: 'Uma corredora treinou 5,4 km na segunda-feira, 7,25 km na quarta-feira e 10,8 km no sábado. Qual foi a distância total percorrida na semana?',
    alternatives: ['22,45 km', '23,05 km', '23,45 km', '24,05 km', '24,45 km'],
    correct: 2,
    solution: [
      'Some primeiro os valores fáceis: 5,4 + 10,8 = 16,2.',
      '16,2 + 7,25 = 23,45.',
      'A distância total é 23,45 km.',
    ],
    en: {
      statement: 'A runner trained 5.4 km on Monday, 7.25 km on Wednesday and 10.8 km on Saturday. What was the total distance for the week?',
      alternatives: ['22.45 km', '23.05 km', '23.45 km', '24.05 km', '24.45 km'],
      solution: [
        'Add the easy values first: 5.4 + 10.8 = 16.2.',
        '16.2 + 7.25 = 23.45.',
        'The total distance is 23.45 km.',
      ],
    },
  },

  // ---------------- UFRGS style: short, direct, technical ----------------
  {
    id: 'ufrgs-a01',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'potencias', level: 1,
    statement: 'O valor da expressão (2³ · 2⁴) ÷ 2⁵ é',
    alternatives: ['2', '4', '8', '16', '32'],
    correct: 1,
    solution: [
      'Na multiplicação de mesma base os expoentes somam: 2³ · 2⁴ = 2⁷.',
      'Na divisão de mesma base os expoentes subtraem: 2⁷ ÷ 2⁵ = 2².',
      '2² = 4.',
    ],
    en: {
      statement: 'The value of the expression (2³ · 2⁴) ÷ 2⁵ is',
      alternatives: ['2', '4', '8', '16', '32'],
      solution: [
        'Multiplying the same base adds the exponents: 2³ · 2⁴ = 2⁷.',
        'Dividing the same base subtracts them: 2⁷ ÷ 2⁵ = 2².',
        '2² = 4.',
      ],
    },
  },
  {
    id: 'ufrgs-a02',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'potencias', level: 2,
    statement: 'O valor de √144 + √81 é',
    alternatives: ['15', '18', '21', '25', '27'],
    correct: 2,
    solution: [
      '12 × 12 = 144, então √144 = 12.',
      '9 × 9 = 81, então √81 = 9.',
      '12 + 9 = 21. Atenção: √144 + √81 não é √225.',
    ],
    en: {
      statement: 'The value of √144 + √81 is',
      alternatives: ['15', '18', '21', '25', '27'],
      solution: [
        '12 × 12 = 144, so √144 = 12.',
        '9 × 9 = 81, so √81 = 9.',
        '12 + 9 = 21. Careful: √144 + √81 is not √225.',
      ],
    },
  },
  {
    id: 'ufrgs-a03',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'fracoes', level: 3,
    statement: 'O resultado de (3/4) ÷ (9/8) é',
    alternatives: ['1/2', '2/3', '3/4', '27/32', '4/3'],
    correct: 1,
    solution: [
      'Dividir é multiplicar pelo inverso: (3/4) × (8/9).',
      'Cancele antes de multiplicar: 3 com 9 dá 1 e 3; 8 com 4 dá 2 e 1.',
      'Sobra (1/1) × (2/3) = 2/3.',
    ],
    en: {
      statement: 'The result of (3/4) ÷ (9/8) is',
      alternatives: ['1/2', '2/3', '3/4', '27/32', '4/3'],
      solution: [
        'Dividing means multiplying by the reciprocal: (3/4) × (8/9).',
        'Cancel before multiplying: 3 and 9 give 1 and 3; 8 and 4 give 2 and 1.',
        'What is left is (1/1) × (2/3) = 2/3.',
      ],
    },
  },
  {
    id: 'ufrgs-a04',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'fracoes', level: 0,
    statement: 'A fração 84/126, escrita na forma irredutível, é',
    alternatives: ['1/2', '2/3', '3/4', '4/7', '6/9'],
    correct: 1,
    solution: [
      'Divida os dois por 2: 84/126 = 42/63.',
      'Divida os dois por 21: 42/63 = 2/3.',
      '2 e 3 não têm fator comum, então 2/3 é irredutível (6/9 ainda dá para simplificar).',
    ],
    en: {
      statement: 'The fraction 84/126, written in lowest terms, is',
      alternatives: ['1/2', '2/3', '3/4', '4/7', '6/9'],
      solution: [
        'Divide both by 2: 84/126 = 42/63.',
        'Divide both by 21: 42/63 = 2/3.',
        '2 and 3 share no factor, so 2/3 is in lowest terms (6/9 can still be reduced).',
      ],
    },
  },
  {
    id: 'ufrgs-a05',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'equacao1', level: 1,
    statement: 'A solução da equação 7x + 12 = 54 é',
    alternatives: ['x = 4', 'x = 5', 'x = 6', 'x = 7', 'x = 8'],
    correct: 2,
    solution: [
      'Passe o 12 para o outro lado: 7x = 54 − 12 = 42.',
      'Divida por 7: x = 42 ÷ 7.',
      'x = 6.',
    ],
    en: {
      statement: 'The solution of the equation 7x + 12 = 54 is',
      alternatives: ['x = 4', 'x = 5', 'x = 6', 'x = 7', 'x = 8'],
      solution: [
        'Move the 12 to the other side: 7x = 54 − 12 = 42.',
        'Divide by 7: x = 42 ÷ 7.',
        'x = 6.',
      ],
    },
  },
  {
    id: 'ufrgs-a06',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'funcoes', level: 2,
    statement: 'A reta que passa pelos pontos A(1, 3) e B(5, 11) tem coeficiente angular igual a',
    alternatives: ['1/2', '1', '2', '4', '8'],
    correct: 2,
    solution: [
      'O coeficiente angular é a variação de y dividida pela variação de x.',
      'Δy = 11 − 3 = 8 e Δx = 5 − 1 = 4.',
      'a = 8 ÷ 4 = 2.',
    ],
    en: {
      statement: 'The line through the points A(1, 3) and B(5, 11) has slope equal to',
      alternatives: ['1/2', '1', '2', '4', '8'],
      solution: [
        'The slope is the change in y divided by the change in x.',
        'Δy = 11 − 3 = 8 and Δx = 5 − 1 = 4.',
        'a = 8 ÷ 4 = 2.',
      ],
    },
  },
  {
    id: 'ufrgs-a07',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'divisao', level: 3,
    statement: 'O quociente de 7,35 por 0,5 é',
    alternatives: ['1,47', '3,675', '14,7', '36,75', '147'],
    correct: 2,
    solution: [
      'Multiplique os dois números por 10 para tirar a vírgula do divisor: 73,5 ÷ 5.',
      'Dividir por 0,5 é o mesmo que dobrar: 7,35 × 2.',
      'O quociente é 14,7.',
    ],
    en: {
      statement: 'The quotient of 7.35 by 0.5 is',
      alternatives: ['1.47', '3.675', '14.7', '36.75', '147'],
      solution: [
        'Multiply both numbers by 10 to clear the decimal in the divisor: 73.5 ÷ 5.',
        'Dividing by 0.5 is the same as doubling: 7.35 × 2.',
        'The quotient is 14.7.',
      ],
    },
  },
  {
    id: 'ufrgs-a08',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'porcentagem', level: 2,
    statement: 'O preço de um produto sofreu um aumento de 20% e, em seguida, um desconto de 20%. Em relação ao preço inicial, o preço final é',
    alternatives: ['igual', '4% maior', '4% menor', '20% menor', '40% menor'],
    correct: 2,
    solution: [
      'Aumentar 20% é multiplicar por 1,20; descontar 20% é multiplicar por 0,80.',
      '1,20 × 0,80 = 0,96.',
      '0,96 do preço inicial é 4% menor que ele.',
    ],
    en: {
      statement: "A product's price went up 20% and then down 20%. Compared with the initial price, the final price is",
      alternatives: ['the same', '4% higher', '4% lower', '20% lower', '40% lower'],
      solution: [
        'A 20% increase multiplies by 1.20; a 20% discount multiplies by 0.80.',
        '1.20 × 0.80 = 0.96.',
        '0.96 of the initial price is 4% lower than it.',
      ],
    },
  },
  {
    id: 'ufrgs-a09',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'multiplicacao', level: 2,
    statement: 'O valor de 47 × 99 é',
    alternatives: ['4.553', '4.653', '4.743', '4.753', '4.853'],
    correct: 1,
    solution: [
      'Escreva 99 como 100 − 1.',
      '47 × 100 = 4.700 e 47 × 1 = 47.',
      '4.700 − 47 = 4.653.',
    ],
    en: {
      statement: 'The value of 47 × 99 is',
      alternatives: ['4,553', '4,653', '4,743', '4,753', '4,853'],
      solution: [
        'Write 99 as 100 − 1.',
        '47 × 100 = 4,700 and 47 × 1 = 47.',
        '4,700 − 47 = 4,653.',
      ],
    },
  },
  {
    id: 'ufrgs-a10',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'fracoes', level: 2,
    statement: 'Dois terços de três quartos de 480 é igual a',
    alternatives: ['180', '200', '240', '270', '320'],
    correct: 2,
    solution: [
      'Três quartos de 480: 480 ÷ 4 = 120, e 120 × 3 = 360.',
      'Dois terços de 360: 360 ÷ 3 = 120, e 120 × 2 = 240.',
      'O resultado é 240 — repare que (2/3) × (3/4) = 1/2, ou seja, metade de 480.',
    ],
    en: {
      statement: 'Two thirds of three quarters of 480 equals',
      alternatives: ['180', '200', '240', '270', '320'],
      solution: [
        'Three quarters of 480: 480 ÷ 4 = 120, and 120 × 3 = 360.',
        'Two thirds of 360: 360 ÷ 3 = 120, and 120 × 2 = 240.',
        'The result is 240 — note that (2/3) × (3/4) = 1/2, i.e. half of 480.',
      ],
    },
  },
  {
    id: 'ufrgs-a11',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'equacao1', level: 2,
    statement: 'A solução da equação x/3 + 4 = x/2 + 1 é',
    alternatives: ['x = 6', 'x = 9', 'x = 12', 'x = 18', 'x = 24'],
    correct: 3,
    solution: [
      'Multiplique tudo por 6 para tirar os denominadores: 2x + 24 = 3x + 6.',
      'Junte os termos: 24 − 6 = 3x − 2x.',
      'x = 18.',
    ],
    en: {
      statement: 'The solution of the equation x/3 + 4 = x/2 + 1 is',
      alternatives: ['x = 6', 'x = 9', 'x = 12', 'x = 18', 'x = 24'],
      solution: [
        'Multiply everything by 6 to clear the denominators: 2x + 24 = 3x + 6.',
        'Collect the terms: 24 − 6 = 3x − 2x.',
        'x = 18.',
      ],
    },
  },
  {
    id: 'ufrgs-a12',
    source: 'UFRGS', year: null, number: null, origin: 'authored',
    topicId: 'potencias', level: 1,
    statement: 'O valor de 3⁻² + 2⁻¹ é',
    alternatives: ['1/6', '5/18', '11/18', '13/18', '7/6'],
    correct: 2,
    solution: [
      'Expoente negativo inverte a base: 3⁻² = 1/9 e 2⁻¹ = 1/2.',
      'O denominador comum de 9 e 2 é 18: 1/9 = 2/18 e 1/2 = 9/18.',
      '2/18 + 9/18 = 11/18.',
    ],
    en: {
      statement: 'The value of 3⁻² + 2⁻¹ is',
      alternatives: ['1/6', '5/18', '11/18', '13/18', '7/6'],
      solution: [
        'A negative exponent flips the base: 3⁻² = 1/9 and 2⁻¹ = 1/2.',
        'The common denominator of 9 and 2 is 18: 1/9 = 2/18 and 1/2 = 9/18.',
        '2/18 + 9/18 = 11/18.',
      ],
    },
  },
]
