// Question generators — the heart of the app. Instead of a fixed bank of
// questions (which you'd memorise), each topic builds a fresh question from
// random parameters every time. That gives effectively infinite practice.
//
// Every generator returns a question object:
//   { prompt, answer, kind: 'number'|'fraction', steps: string[], tips: string[] }
// `steps`  = the plain mechanical solution, built from the same random numbers.
// `tips`   = strategy / mental-math advice chosen from those numbers (see
//            lib/strategies.js). Both always match this exact question.
//
// Every generator takes a `lang` ('pt' | 'en', default 'pt'). Prompt/step text
// is chosen with the local `L(pt, en)` helper; `f(value)` formats decimals in
// the right convention. Numbers, operators and fractions read the same in both.

import { randInt, pick, reduceFraction, round, formatNumber, gcd } from './math.js'
import { getTopic } from '../data/topics.js'
import * as S from './strategies.js'

// Format the constant term of a linear expression, e.g. " + 3" / " - 2" / "".
function withSign(value) {
  if (value === 0) return ''
  return value > 0 ? ` + ${value}` : ` - ${Math.abs(value)}`
}

// A fraction as a readable string, reduced ("3/4", or "2" when whole).
function fracStr(frac) {
  const { n, d } = reduceFraction(frac.n, frac.d)
  return d === 1 ? String(n) : `${n}/${d}`
}

// A coefficient in front of x, dropping a leading 1: coefX(1)="x",
// coefX(-1)="-x", coefX(3)="3x".
function coefX(n) {
  if (n === 1) return 'x'
  if (n === -1) return '-x'
  return `${n}x`
}

// ----------------------------------------------------------------- Adição ----
function adicao(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  const f = (v) => formatNumber(v, lang)
  switch (level) {
    case 0: { // Sem reagrupar — every column sum stays below 10, so no carrying
      const t1 = randInt(1, 8), t2 = randInt(1, 9 - t1)
      const u1 = randInt(0, 9), u2 = randInt(0, 9 - u1)
      const a = t1 * 10 + u1, b = t2 * 10 + u2
      return {
        prompt: `${a} + ${b} = ?`, answer: a + b, kind: 'number',
        steps: [
          L(`Some as unidades: ${u1} + ${u2} = ${u1 + u2}.`, `Add the units: ${u1} + ${u2} = ${u1 + u2}.`),
          L(`Some as dezenas: ${t1} + ${t2} = ${t1 + t2}. Junte tudo: ${a + b}.`, `Add the tens: ${t1} + ${t2} = ${t1 + t2}. Put it together: ${a + b}.`),
        ],
        tips: S.adicaoTips(a, b, lang),
      }
    }
    case 1: { // Com reagrupamento — force the units column to spill past 10
      let a, b
      do { a = randInt(15, 89); b = randInt(15, 89) } while ((a % 10) + (b % 10) < 10)
      return {
        prompt: `${a} + ${b} = ?`, answer: a + b, kind: 'number',
        steps: [
          L(`Some as unidades: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)} — passa de 10, então "vai 1".`, `Add the units: ${a % 10} + ${b % 10} = ${(a % 10) + (b % 10)} — over 10, so carry 1.`),
          L(`Some as dezenas com o 1 que subiu: total ${a + b}.`, `Add the tens together with the carried 1: total ${a + b}.`),
        ],
        tips: S.adicaoTips(a, b, lang),
      }
    }
    default: { // Com decimais — tenths keep the arithmetic clean
      let A, B
      do { A = randInt(15, 199) } while (A % 10 === 0)
      do { B = randInt(15, 199) } while (B % 10 === 0)
      const a = A / 10, b = B / 10, ans = round((A + B) / 10, 1)
      return {
        prompt: `${f(a)} + ${f(b)} = ?`, answer: ans, kind: 'number',
        steps: [
          L(`Alinhe as vírgulas, uma embaixo da outra.`, `Line up the decimal points, one under the other.`),
          L(`Some como se fossem inteiros: ${f(a)} + ${f(b)} = ${f(ans)}.`, `Add as if they were whole numbers: ${f(a)} + ${f(b)} = ${f(ans)}.`),
        ],
        tips: S.adicaoDecimalTips(lang),
      }
    }
  }
}

// -------------------------------------------------------------- Subtração ----
function subtracao(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  const f = (v) => formatNumber(v, lang)
  switch (level) {
    case 0: { // Sem reagrupar — each top digit ≥ the one below it (no borrow)
      let a, b
      do {
        const t1 = randInt(2, 9), u1 = randInt(0, 9)
        a = t1 * 10 + u1
        b = randInt(1, t1) * 10 + randInt(0, u1)
      } while (a <= b)
      return {
        prompt: `${a} − ${b} = ?`, answer: a - b, kind: 'number',
        steps: [
          L(`Subtraia as unidades: ${a % 10} − ${b % 10} = ${(a % 10) - (b % 10)}.`, `Subtract the units: ${a % 10} − ${b % 10} = ${(a % 10) - (b % 10)}.`),
          L(`Subtraia as dezenas: ${Math.floor(a / 10)} − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - Math.floor(b / 10)}. Resultado: ${a - b}.`, `Subtract the tens: ${Math.floor(a / 10)} − ${Math.floor(b / 10)} = ${Math.floor(a / 10) - Math.floor(b / 10)}. Result: ${a - b}.`),
        ],
        tips: S.subtracaoTips(a, b, lang),
      }
    }
    case 1: { // Com reagrupamento — units of the top number fall short, so borrow
      let a, b
      do { a = randInt(20, 99); b = randInt(11, a - 1) } while ((a % 10) >= (b % 10))
      return {
        prompt: `${a} − ${b} = ?`, answer: a - b, kind: 'number',
        steps: [
          L(`Nas unidades, ${a % 10} − ${b % 10} não dá: peça 1 emprestado da dezena (${a % 10} vira ${a % 10 + 10}, e ${a % 10 + 10} − ${b % 10} = ${a % 10 + 10 - (b % 10)}).`, `In the units, ${a % 10} − ${b % 10} won't do: borrow 1 from the tens (${a % 10} becomes ${a % 10 + 10}, and ${a % 10 + 10} − ${b % 10} = ${a % 10 + 10 - (b % 10)}).`),
          L(`Desconte o empréstimo nas dezenas e finalize: ${a - b}.`, `Take the borrow off the tens and finish: ${a - b}.`),
        ],
        tips: S.subtracaoTips(a, b, lang),
      }
    }
    default: { // Com decimais
      let A, B
      do { A = randInt(30, 199) } while (A % 10 === 0)
      do { B = randInt(15, A - 5) } while (B % 10 === 0)
      const a = A / 10, b = B / 10, ans = round((A - B) / 10, 1)
      return {
        prompt: `${f(a)} − ${f(b)} = ?`, answer: ans, kind: 'number',
        steps: [
          L(`Alinhe as vírgulas uma sob a outra.`, `Line up the decimal points, one under the other.`),
          L(`Subtraia como se fossem inteiros: ${f(a)} − ${f(b)} = ${f(ans)}.`, `Subtract as if they were whole numbers: ${f(a)} − ${f(b)} = ${f(ans)}.`),
        ],
        tips: S.subtracaoDecimalTips(lang),
      }
    }
  }
}

// ---------------------------------------------------------- Multiplicação ----
function multiplicacao(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  switch (level) {
    case 0: { // Tabuada — single digit × single digit
      const a = randInt(2, 9), b = randInt(2, 9)
      return {
        prompt: `${a} × ${b} = ?`, answer: a * b, kind: 'number',
        steps: [
          L(`${a} × ${b} é somar ${a} um total de ${b} vezes.`, `${a} × ${b} is adding ${a} a total of ${b} times.`),
          `= ${a * b}.`,
        ],
        tips: S.multiplicacaoTabuadaTips(a, b, lang),
      }
    }
    case 1: { // Por um dígito — 2-digit × 1-digit, split by the distributive rule
      const a = randInt(11, 99), b = randInt(3, 9)
      const t = Math.floor(a / 10) * 10, u = a % 10
      return {
        prompt: `${a} × ${b} = ?`, answer: a * b, kind: 'number',
        steps: [
          L(`Separe ${a} em ${t} + ${u}.`, `Split ${a} into ${t} + ${u}.`),
          `${t} × ${b} = ${t * b}, ${u} × ${b} = ${u * b}.`,
          L(`Some: ${t * b} + ${u * b} = ${a * b}.`, `Add: ${t * b} + ${u * b} = ${a * b}.`),
        ],
        tips: S.multiplicacaoTips(a, b, lang),
      }
    }
    default: { // Dois dígitos — 2-digit × 2-digit, split the second factor
      const a = randInt(11, 99)
      let b
      do { b = randInt(11, 29) } while (b % 10 === 0)
      const t = Math.floor(b / 10) * 10, u = b % 10
      return {
        prompt: `${a} × ${b} = ?`, answer: a * b, kind: 'number',
        steps: [
          L(`Separe ${b} em ${t} + ${u}.`, `Split ${b} into ${t} + ${u}.`),
          `${a} × ${t} = ${a * t}, ${a} × ${u} = ${a * u}.`,
          L(`Some: ${a * t} + ${a * u} = ${a * b}.`, `Add: ${a * t} + ${a * u} = ${a * b}.`),
        ],
        tips: S.multiplicacaoTips(a, b, lang),
      }
    }
  }
}

// ---------------------------------------------------------------- Divisão ----
function divisao(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  const f = (v) => formatNumber(v, lang)
  switch (level) {
    case 0: { // Exata — dividend is an exact multiple of the divisor
      const b = randInt(2, 9)
      const q = randInt(2, 9)
      const a = b * q
      return {
        prompt: `${a} ÷ ${b} = ?`, answer: q, kind: 'number',
        steps: [
          L(`Pergunte: quantas vezes ${b} cabe em ${a}?`, `Ask: how many times does ${b} fit into ${a}?`),
          L(`${b} × ${q} = ${a}, então ${a} ÷ ${b} = ${q}.`, `${b} × ${q} = ${a}, so ${a} ÷ ${b} = ${q}.`),
        ],
        tips: S.divisaoExataTips(a, b, q, lang),
      }
    }
    case 1: { // Com resto — ask for either the quotient or the remainder
      const b = randInt(3, 9)
      const q = randInt(2, 12)
      const r = randInt(1, b - 1)
      const D = b * q + r
      if (pick([true, false])) {
        return {
          prompt: L(`Qual o RESTO de ${D} ÷ ${b}?`, `What is the REMAINDER of ${D} ÷ ${b}?`), answer: r, kind: 'number',
          steps: [
            L(`O maior múltiplo de ${b} até ${D} é ${b} × ${q} = ${b * q}.`, `The largest multiple of ${b} up to ${D} is ${b} × ${q} = ${b * q}.`),
            L(`O resto é o que sobra: ${D} − ${b * q} = ${r}.`, `The remainder is what's left: ${D} − ${b * q} = ${r}.`),
          ],
          tips: S.divisaoRestoTips(b, lang),
        }
      }
      return {
        prompt: L(`Qual o QUOCIENTE inteiro de ${D} ÷ ${b}?`, `What is the whole QUOTIENT of ${D} ÷ ${b}?`), answer: q, kind: 'number',
        steps: [
          L(`Quantas vezes ${b} cabe em ${D}? ${b} × ${q} = ${b * q} (e ${b} × ${q + 1} = ${b * (q + 1)} já passa de ${D}).`, `How many times does ${b} fit into ${D}? ${b} × ${q} = ${b * q} (and ${b} × ${q + 1} = ${b * (q + 1)} already goes past ${D}).`),
          L(`Então o quociente é ${q}.`, `So the quotient is ${q}.`),
        ],
        tips: S.divisaoRestoTips(b, lang),
      }
    }
    case 2: { // Divisão longa — bigger exact division
      const b = randInt(12, 39)
      const q = randInt(11, 99)
      const a = b * q
      return {
        prompt: `${a} ÷ ${b} = ?`, answer: q, kind: 'number',
        steps: [
          L(`Estime quantas vezes ${b} cabe em ${a}.`, `Estimate how many times ${b} fits into ${a}.`),
          L(`Confirme: ${b} × ${q} = ${a}. Logo ${a} ÷ ${b} = ${q}.`, `Check: ${b} × ${q} = ${a}. So ${a} ÷ ${b} = ${q}.`),
        ],
        tips: S.divisaoLongaTips(a, b, lang),
      }
    }
    default: { // Com decimais — divisors that divide 100 give clean 2-decimal answers
      const b = pick([2, 4, 5, 20, 25])
      const a = randInt(3, 99)
      const ans = round(a / b, 2)
      const whole = Math.floor(a / b)
      return {
        prompt: L(`${a} ÷ ${b} = ? (decimal)`, `${a} ÷ ${b} = ? (decimal)`), answer: ans, kind: 'number',
        steps: [
          L(`${b} cabe ${whole} vez(es) em ${a} (sobra ${a - whole * b}).`, `${b} fits ${whole} time(s) into ${a} (remainder ${a - whole * b}).`),
          L(`Continuando com casas decimais: ${a} ÷ ${b} = ${f(ans)}.`, `Continuing into the decimals: ${a} ÷ ${b} = ${f(ans)}.`),
        ],
        tips: S.divisaoDecimalTips(a, b, ans, lang),
      }
    }
  }
}

// ---------------------------------------------------------------- Frações ----
function fracoes(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  switch (level) {
    case 0: { // Simplificar — build a reducible fraction from a reduced target
      const base = reduceFraction(randInt(1, 8), randInt(2, 9))
      const k = randInt(2, 6)
      const N = base.n * k
      const D = base.d * k
      const g = gcd(N, D)
      return {
        prompt: L(`Simplifique ${N}/${D}`, `Simplify ${N}/${D}`), answer: base, kind: 'fraction',
        steps: [
          L(`Ache o MDC (maior divisor comum) de ${N} e ${D}: ${g}.`, `Find the GCD (greatest common divisor) of ${N} and ${D}: ${g}.`),
          L(`Divida os dois por ${g}: ${N} ÷ ${g} = ${base.n} e ${D} ÷ ${g} = ${base.d}.`, `Divide both by ${g}: ${N} ÷ ${g} = ${base.n} and ${D} ÷ ${g} = ${base.d}.`),
          L(`Resultado: ${fracStr(base)}.`, `Result: ${fracStr(base)}.`),
        ],
        tips: S.fracaoSimplificarTips(N, D, lang),
      }
    }
    case 1: { // Somar e subtrair — order operands so subtraction stays positive
      let a = randInt(1, 9), b = randInt(2, 9), c = randInt(1, 9), d = randInt(2, 9)
      const op = pick(['+', '-'])
      if (op === '-' && a * d < c * b) { [a, c] = [c, a]; [b, d] = [d, b] }
      const num = op === '+' ? a * d + c * b : a * d - c * b
      const answer = reduceFraction(num, b * d)
      return {
        prompt: `${a}/${b} ${op} ${c}/${d} = ?`, answer, kind: 'fraction',
        steps: [
          L(`Denominador comum de ${b} e ${d}: ${b * d}.`, `Common denominator of ${b} and ${d}: ${b * d}.`),
          L(`${a}/${b} = ${a * d}/${b * d} e ${c}/${d} = ${c * b}/${b * d}.`, `${a}/${b} = ${a * d}/${b * d} and ${c}/${d} = ${c * b}/${b * d}.`),
          L(`${a * d} ${op} ${c * b} = ${num}, então ${num}/${b * d}.`, `${a * d} ${op} ${c * b} = ${num}, so ${num}/${b * d}.`),
          L(`Simplificando: ${fracStr(answer)}.`, `Simplifying: ${fracStr(answer)}.`),
        ],
        tips: S.fracaoSomaTips(b, d, lang),
      }
    }
    case 2: { // Multiplicar
      const a = randInt(1, 9), b = randInt(2, 9), c = randInt(1, 9), d = randInt(2, 9)
      const answer = reduceFraction(a * c, b * d)
      return {
        prompt: `${a}/${b} × ${c}/${d} = ?`, answer, kind: 'fraction',
        steps: [
          L(`Multiplique os de cima: ${a} × ${c} = ${a * c}.`, `Multiply the tops: ${a} × ${c} = ${a * c}.`),
          L(`Multiplique os de baixo: ${b} × ${d} = ${b * d}.`, `Multiply the bottoms: ${b} × ${d} = ${b * d}.`),
          L(`${a * c}/${b * d} simplifica para ${fracStr(answer)}.`, `${a * c}/${b * d} simplifies to ${fracStr(answer)}.`),
        ],
        tips: S.fracaoMultiplicarTips(a, b, c, d, lang),
      }
    }
    default: { // Dividir — invert and multiply
      const a = randInt(1, 9), b = randInt(2, 9), c = randInt(1, 9), d = randInt(2, 9)
      const answer = reduceFraction(a * d, b * c)
      return {
        prompt: `${a}/${b} ÷ ${c}/${d} = ?`, answer, kind: 'fraction',
        steps: [
          L(`Dividir é multiplicar pelo inverso: ${a}/${b} × ${d}/${c}.`, `Dividing is multiplying by the reciprocal: ${a}/${b} × ${d}/${c}.`),
          `= (${a} × ${d})/(${b} × ${c}) = ${a * d}/${b * c}.`,
          L(`Simplifica para ${fracStr(answer)}.`, `Simplifies to ${fracStr(answer)}.`),
        ],
        tips: S.fracaoDividirTips(c, d, lang),
      }
    }
  }
}

// ------------------------------------------------------------ Porcentagem ----
function porcentagem(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  const f = (v) => formatNumber(v, lang)
  switch (level) {
    case 0: { // X% de Y
      const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75])
      const base = randInt(1, 20) * 10 // multiple of 10 keeps the answer clean
      const ans = round((base * pct) / 100, 2)
      return {
        prompt: L(`Quanto é ${pct}% de ${base}?`, `How much is ${pct}% of ${base}?`), answer: ans, kind: 'number',
        steps: [
          L(`${pct}% significa ${pct} de cada 100, ou seja ${pct}/100.`, `${pct}% means ${pct} out of every 100, i.e. ${pct}/100.`),
          `${base} × ${pct}/100 = ${f(ans)}.`,
        ],
        tips: S.porcentagemDeTips(pct, base, lang),
      }
    }
    case 1: { // Que porcentagem X é de Y
      const pct = pick([5, 10, 20, 25, 40, 50, 75])
      const base = randInt(2, 20) * 10
      const part = round((base * pct) / 100, 2)
      return {
        prompt: L(`${f(part)} é quantos % de ${base}?`, `${f(part)} is what % of ${base}?`), answer: pct, kind: 'number',
        steps: [
          L(`Divida a parte pelo todo: ${f(part)} ÷ ${base} = ${f(part / base)}.`, `Divide the part by the whole: ${f(part)} ÷ ${base} = ${f(part / base)}.`),
          L(`Multiplique por 100: ${f(part / base)} × 100 = ${pct}%.`, `Multiply by 100: ${f(part / base)} × 100 = ${pct}%.`),
        ],
        tips: S.quePorcentagemTips(part, base, lang),
      }
    }
    default: { // Aumento ou desconto
      const pct = pick([10, 15, 20, 25, 50])
      const base = randInt(2, 20) * 10
      const isIncrease = pick([true, false])
      const change = round((base * pct) / 100, 2)
      const ans = round(isIncrease ? base + change : base - change, 2)
      return {
        prompt: L(`${base} com ${isIncrease ? 'aumento' : 'desconto'} de ${pct}% = ?`, `${base} with a ${pct}% ${isIncrease ? 'increase' : 'discount'} = ?`),
        answer: ans, kind: 'number',
        steps: [
          L(`${pct}% de ${base} = ${f(change)}.`, `${pct}% of ${base} = ${f(change)}.`),
          isIncrease
            ? L(`Some ao valor: ${base} + ${f(change)} = ${f(ans)}.`, `Add it to the value: ${base} + ${f(change)} = ${f(ans)}.`)
            : L(`Tire do valor: ${base} − ${f(change)} = ${f(ans)}.`, `Subtract it from the value: ${base} − ${f(change)} = ${f(ans)}.`),
        ],
        tips: S.aumentoDescontoTips(pct, base, isIncrease, ans, lang),
      }
    }
  }
}

// ------------------------------------------------------- Equação de 1º grau ----
function equacao1(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  switch (level) {
    case 0: { // ax = b, with an integer solution
      const a = randInt(2, 9)
      const x = randInt(1, 12)
      const b = a * x
      return {
        prompt: L(`${a}x = ${b}. Qual o valor de x?`, `${a}x = ${b}. What is x?`), answer: x, kind: 'number',
        steps: [
          L(`Para isolar x, divida os dois lados por ${a}.`, `To isolate x, divide both sides by ${a}.`),
          `x = ${b} ÷ ${a} = ${x}.`,
        ],
        tips: S.equacaoAxbTips(a, lang),
      }
    }
    case 1: { // ax + b = c, with an integer solution
      const a = randInt(2, 9)
      const x = randInt(1, 12)
      const b = randInt(1, 20)
      const c = a * x + b
      return {
        prompt: L(`${a}x + ${b} = ${c}. Qual o valor de x?`, `${a}x + ${b} = ${c}. What is x?`), answer: x, kind: 'number',
        steps: [
          L(`Passe o ${b} para o outro lado (muda de sinal): ${a}x = ${c} − ${b} = ${c - b}.`, `Move the ${b} to the other side (sign flips): ${a}x = ${c} − ${b} = ${c - b}.`),
          L(`Divida por ${a}: x = ${c - b} ÷ ${a} = ${x}.`, `Divide by ${a}: x = ${c - b} ÷ ${a} = ${x}.`),
        ],
        tips: S.equacaoAxbcTips(a, b, lang),
      }
    }
    default: { // ax + b = cx + d — the solution can now be a fraction
      let a, c
      do { a = randInt(2, 9); c = randInt(1, 8) } while (a === c)
      const b = randInt(1, 12)
      const d = randInt(1, 12)
      const answer = reduceFraction(d - b, a - c)
      return {
        prompt: L(`${coefX(a)} + ${b} = ${coefX(c)} + ${d}. Qual o valor de x?`, `${coefX(a)} + ${b} = ${coefX(c)} + ${d}. What is x?`), answer, kind: 'fraction',
        steps: [
          L(`Junte os termos com x de um lado e os números do outro.`, `Gather the x terms on one side and the numbers on the other.`),
          `${coefX(a)} − ${coefX(c)} = ${d} − ${b}  →  ${coefX(a - c)} = ${d - b}.`,
          `x = ${d - b} ÷ ${a - c} = ${fracStr(answer)}.`,
        ],
        tips: S.equacaoDuploTips(lang),
      }
    }
  }
}

// ---------------------------------------------------------------- Funções ----
function funcoes(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  switch (level) {
    case 0: { // Calcular f(k)
      const a = randInt(2, 9)
      const b = randInt(-9, 9)
      const k = randInt(1, 9)
      const ans = a * k + b
      return {
        prompt: L(`f(x) = ${a}x${withSign(b)}. Quanto é f(${k})?`, `f(x) = ${a}x${withSign(b)}. What is f(${k})?`), answer: ans, kind: 'number', signed: true,
        steps: [
          L(`Substitua x por ${k}: f(${k}) = ${a} × ${k}${withSign(b)}.`, `Substitute x with ${k}: f(${k}) = ${a} × ${k}${withSign(b)}.`),
          `= ${a * k}${withSign(b)} = ${ans}.`,
        ],
        tips: S.funcaoValorTips(k, lang),
      }
    }
    case 1: { // Raiz: resolver ax + b = 0  ->  x = -b/a
      const a = randInt(2, 9)
      const b = randInt(1, 20)
      const answer = reduceFraction(-b, a)
      return {
        prompt: L(`Qual a raiz de f(x) = ${a}x${withSign(b)}?`, `What is the root of f(x) = ${a}x${withSign(b)}?`), answer, kind: 'fraction',
        steps: [
          L(`A raiz é onde f(x) = 0: ${a}x${withSign(b)} = 0.`, `The root is where f(x) = 0: ${a}x${withSign(b)} = 0.`),
          `${a}x = ${-b}  →  x = ${-b} ÷ ${a} = ${fracStr(answer)}.`,
        ],
        tips: S.funcaoRaizTips(lang),
      }
    }
    default: { // Coeficiente angular a partir de dois pontos: a = (y2-y1)/(x2-x1)
      const a = randInt(2, 6) * pick([1, -1])
      const b = randInt(-5, 5)
      const x1 = randInt(0, 4)
      const x2 = x1 + randInt(1, 4)
      const y1 = a * x1 + b
      const y2 = a * x2 + b
      return {
        prompt: L(`Uma reta passa por (${x1}, ${y1}) e (${x2}, ${y2}). Qual o coeficiente angular?`, `A line passes through (${x1}, ${y1}) and (${x2}, ${y2}). What is the slope?`),
        answer: a, kind: 'number', signed: true,
        steps: [
          L(`O coeficiente angular é a = (y₂ − y₁) ÷ (x₂ − x₁).`, `The slope is a = (y₂ − y₁) ÷ (x₂ − x₁).`),
          `a = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2 - y1} ÷ ${x2 - x1} = ${a}.`,
        ],
        tips: S.funcaoCoefTips(x1, y1, x2, y2, a, lang),
      }
    }
  }
}

// ----------------------------------------------------- Potências e raízes ----
function potencias(level, lang) {
  const L = (pt, en) => (lang === 'en' ? en : pt)
  const f = (v) => formatNumber(v, lang)
  switch (level) {
    case 0: { // Potências de 10 — the answer is 1 followed by e zeros
      const e = randInt(2, 6)
      const ans = 10 ** e
      return {
        prompt: `10^${e} = ?`, answer: ans, kind: 'number',
        steps: [
          L(`10^${e} é 1 seguido de ${e} zeros.`, `10^${e} is a 1 followed by ${e} zeros.`),
          `= ${f(ans)}.`,
        ],
        tips: S.potenciaDezTips(e, lang),
      }
    }
    case 1: { // Potências de base pequena — square or cube
      const b = randInt(2, 9), e = pick([2, 3])
      const ans = b ** e
      const expand = e === 3 ? `${b} × ${b} × ${b}` : `${b} × ${b}`
      return {
        prompt: `${b}^${e} = ?`, answer: ans, kind: 'number',
        steps: [
          L(`Potência é multiplicação repetida: ${b}^${e} = ${expand}.`, `A power is repeated multiplication: ${b}^${e} = ${expand}.`),
          `= ${ans}.`,
        ],
        tips: S.potenciaTips(b, e, lang),
      }
    }
    default: { // Raiz quadrada exata — of a perfect square
      const n = randInt(2, 15), sq = n * n
      return {
        prompt: `√${sq} = ?`, answer: n, kind: 'number',
        steps: [
          L(`Procure o número que, multiplicado por si mesmo, dá ${sq}.`, `Find the number that, multiplied by itself, gives ${sq}.`),
          L(`${n} × ${n} = ${sq}, então √${sq} = ${n}.`, `${n} × ${n} = ${sq}, so √${sq} = ${n}.`),
        ],
        tips: S.raizTips(n, sq, lang),
      }
    }
  }
}

// Map each topic id to its generator. To add a topic: add it to data/topics.js
// and register a function here.
const GENERATORS = { adicao, subtracao, multiplicacao, divisao, fracoes, porcentagem, equacao1, funcoes, potencias }

// Public entry point. Clamps `levelIndex` to the topic's real range so callers
// never have to worry about off-by-one at the edges. `lang` picks the language
// of the prompt/steps/tips text (default Portuguese).
export function generateQuestion(topicId, levelIndex, lang = 'pt') {
  const generate = GENERATORS[topicId]
  if (!generate) throw new Error(`sem gerador para o tópico "${topicId}"`)
  const topic = getTopic(topicId)
  const maxLevel = topic ? topic.levels.length - 1 : levelIndex
  const level = Math.max(0, Math.min(levelIndex, maxLevel))
  return generate(level, lang)
}
