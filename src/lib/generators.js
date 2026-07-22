// Question generators — the heart of the app. Instead of a fixed bank of
// questions (which you'd memorise), each topic builds a fresh question from
// random parameters every time. That gives effectively infinite practice.
//
// Every generator returns a question object:
//   { prompt, answer, kind: 'number'|'fraction', steps: string[], tips: string[] }
// `steps`  = the plain mechanical solution, built from the same random numbers.
// `tips`   = strategy / mental-math advice chosen from those numbers (see
//            lib/strategies.js). Both always match this exact question.

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

// ---------------------------------------------------------------- Divisão ----
function divisao(level) {
  switch (level) {
    case 0: { // Exata — dividend is an exact multiple of the divisor
      const b = randInt(2, 9)
      const q = randInt(2, 9)
      const a = b * q
      return {
        prompt: `${a} ÷ ${b} = ?`, answer: q, kind: 'number',
        steps: [
          `Pergunte: quantas vezes ${b} cabe em ${a}?`,
          `${b} × ${q} = ${a}, então ${a} ÷ ${b} = ${q}.`,
        ],
        tips: S.divisaoExataTips(a, b, q),
      }
    }
    case 1: { // Com resto — ask for either the quotient or the remainder
      const b = randInt(3, 9)
      const q = randInt(2, 12)
      const r = randInt(1, b - 1)
      const D = b * q + r
      if (pick([true, false])) {
        return {
          prompt: `Qual o RESTO de ${D} ÷ ${b}?`, answer: r, kind: 'number',
          steps: [
            `O maior múltiplo de ${b} até ${D} é ${b} × ${q} = ${b * q}.`,
            `O resto é o que sobra: ${D} − ${b * q} = ${r}.`,
          ],
          tips: S.divisaoRestoTips(b),
        }
      }
      return {
        prompt: `Qual o QUOCIENTE inteiro de ${D} ÷ ${b}?`, answer: q, kind: 'number',
        steps: [
          `Quantas vezes ${b} cabe em ${D}? ${b} × ${q} = ${b * q} (e ${b} × ${q + 1} = ${b * (q + 1)} já passa de ${D}).`,
          `Então o quociente é ${q}.`,
        ],
        tips: S.divisaoRestoTips(b),
      }
    }
    case 2: { // Divisão longa — bigger exact division
      const b = randInt(12, 39)
      const q = randInt(11, 99)
      const a = b * q
      return {
        prompt: `${a} ÷ ${b} = ?`, answer: q, kind: 'number',
        steps: [
          `Estime quantas vezes ${b} cabe em ${a}.`,
          `Confirme: ${b} × ${q} = ${a}. Logo ${a} ÷ ${b} = ${q}.`,
        ],
        tips: S.divisaoLongaTips(a, b),
      }
    }
    default: { // Com decimais — divisors that divide 100 give clean 2-decimal answers
      const b = pick([2, 4, 5, 20, 25])
      const a = randInt(3, 99)
      const ans = round(a / b, 2)
      const whole = Math.floor(a / b)
      return {
        prompt: `${a} ÷ ${b} = ? (decimal)`, answer: ans, kind: 'number',
        steps: [
          `${b} cabe ${whole} vez(es) em ${a} (sobra ${a - whole * b}).`,
          `Continuando com casas decimais: ${a} ÷ ${b} = ${formatNumber(ans)}.`,
        ],
        tips: S.divisaoDecimalTips(a, b, ans),
      }
    }
  }
}

// ---------------------------------------------------------------- Frações ----
function fracoes(level) {
  switch (level) {
    case 0: { // Simplificar — build a reducible fraction from a reduced target
      const base = reduceFraction(randInt(1, 8), randInt(2, 9))
      const k = randInt(2, 6)
      const N = base.n * k
      const D = base.d * k
      const g = gcd(N, D)
      return {
        prompt: `Simplifique ${N}/${D}`, answer: base, kind: 'fraction',
        steps: [
          `Ache o MDC (maior divisor comum) de ${N} e ${D}: ${g}.`,
          `Divida os dois por ${g}: ${N} ÷ ${g} = ${base.n} e ${D} ÷ ${g} = ${base.d}.`,
          `Resultado: ${fracStr(base)}.`,
        ],
        tips: S.fracaoSimplificarTips(N, D),
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
          `Denominador comum de ${b} e ${d}: ${b * d}.`,
          `${a}/${b} = ${a * d}/${b * d} e ${c}/${d} = ${c * b}/${b * d}.`,
          `${a * d} ${op} ${c * b} = ${num}, então ${num}/${b * d}.`,
          `Simplificando: ${fracStr(answer)}.`,
        ],
        tips: S.fracaoSomaTips(b, d),
      }
    }
    case 2: { // Multiplicar
      const a = randInt(1, 9), b = randInt(2, 9), c = randInt(1, 9), d = randInt(2, 9)
      const answer = reduceFraction(a * c, b * d)
      return {
        prompt: `${a}/${b} × ${c}/${d} = ?`, answer, kind: 'fraction',
        steps: [
          `Multiplique os de cima: ${a} × ${c} = ${a * c}.`,
          `Multiplique os de baixo: ${b} × ${d} = ${b * d}.`,
          `${a * c}/${b * d} simplifica para ${fracStr(answer)}.`,
        ],
        tips: S.fracaoMultiplicarTips(a, b, c, d),
      }
    }
    default: { // Dividir — invert and multiply
      const a = randInt(1, 9), b = randInt(2, 9), c = randInt(1, 9), d = randInt(2, 9)
      const answer = reduceFraction(a * d, b * c)
      return {
        prompt: `${a}/${b} ÷ ${c}/${d} = ?`, answer, kind: 'fraction',
        steps: [
          `Dividir é multiplicar pelo inverso: ${a}/${b} × ${d}/${c}.`,
          `= (${a} × ${d})/(${b} × ${c}) = ${a * d}/${b * c}.`,
          `Simplifica para ${fracStr(answer)}.`,
        ],
        tips: S.fracaoDividirTips(c, d),
      }
    }
  }
}

// ------------------------------------------------------------ Porcentagem ----
function porcentagem(level) {
  switch (level) {
    case 0: { // X% de Y
      const pct = pick([5, 10, 15, 20, 25, 30, 40, 50, 60, 75])
      const base = randInt(1, 20) * 10 // multiple of 10 keeps the answer clean
      const ans = round((base * pct) / 100, 2)
      return {
        prompt: `Quanto é ${pct}% de ${base}?`, answer: ans, kind: 'number',
        steps: [
          `${pct}% significa ${pct} de cada 100, ou seja ${pct}/100.`,
          `${base} × ${pct}/100 = ${formatNumber(ans)}.`,
        ],
        tips: S.porcentagemDeTips(pct, base),
      }
    }
    case 1: { // Que porcentagem X é de Y
      const pct = pick([5, 10, 20, 25, 40, 50, 75])
      const base = randInt(2, 20) * 10
      const part = round((base * pct) / 100, 2)
      return {
        prompt: `${formatNumber(part)} é quantos % de ${base}?`, answer: pct, kind: 'number',
        steps: [
          `Divida a parte pelo todo: ${formatNumber(part)} ÷ ${base} = ${formatNumber(part / base)}.`,
          `Multiplique por 100: ${formatNumber(part / base)} × 100 = ${pct}%.`,
        ],
        tips: S.quePorcentagemTips(part, base),
      }
    }
    default: { // Aumento ou desconto
      const pct = pick([10, 15, 20, 25, 50])
      const base = randInt(2, 20) * 10
      const isIncrease = pick([true, false])
      const change = round((base * pct) / 100, 2)
      const ans = round(isIncrease ? base + change : base - change, 2)
      return {
        prompt: `${base} com ${isIncrease ? 'aumento' : 'desconto'} de ${pct}% = ?`,
        answer: ans, kind: 'number',
        steps: [
          `${pct}% de ${base} = ${formatNumber(change)}.`,
          isIncrease
            ? `Some ao valor: ${base} + ${formatNumber(change)} = ${formatNumber(ans)}.`
            : `Tire do valor: ${base} − ${formatNumber(change)} = ${formatNumber(ans)}.`,
        ],
        tips: S.aumentoDescontoTips(pct, base, isIncrease, ans),
      }
    }
  }
}

// ------------------------------------------------------- Equação de 1º grau ----
function equacao1(level) {
  switch (level) {
    case 0: { // ax = b, with an integer solution
      const a = randInt(2, 9)
      const x = randInt(1, 12)
      const b = a * x
      return {
        prompt: `${a}x = ${b}. Qual o valor de x?`, answer: x, kind: 'number',
        steps: [
          `Para isolar x, divida os dois lados por ${a}.`,
          `x = ${b} ÷ ${a} = ${x}.`,
        ],
        tips: S.equacaoAxbTips(a),
      }
    }
    case 1: { // ax + b = c, with an integer solution
      const a = randInt(2, 9)
      const x = randInt(1, 12)
      const b = randInt(1, 20)
      const c = a * x + b
      return {
        prompt: `${a}x + ${b} = ${c}. Qual o valor de x?`, answer: x, kind: 'number',
        steps: [
          `Passe o ${b} para o outro lado (muda de sinal): ${a}x = ${c} − ${b} = ${c - b}.`,
          `Divida por ${a}: x = ${c - b} ÷ ${a} = ${x}.`,
        ],
        tips: S.equacaoAxbcTips(a, b),
      }
    }
    default: { // ax + b = cx + d — the solution can now be a fraction
      let a, c
      do { a = randInt(2, 9); c = randInt(1, 8) } while (a === c)
      const b = randInt(1, 12)
      const d = randInt(1, 12)
      const answer = reduceFraction(d - b, a - c)
      return {
        prompt: `${coefX(a)} + ${b} = ${coefX(c)} + ${d}. Qual o valor de x?`, answer, kind: 'fraction',
        steps: [
          `Junte os termos com x de um lado e os números do outro.`,
          `${coefX(a)} − ${coefX(c)} = ${d} − ${b}  →  ${coefX(a - c)} = ${d - b}.`,
          `x = ${d - b} ÷ ${a - c} = ${fracStr(answer)}.`,
        ],
        tips: S.equacaoDuploTips(),
      }
    }
  }
}

// ---------------------------------------------------------------- Funções ----
function funcoes(level) {
  switch (level) {
    case 0: { // Calcular f(k)
      const a = randInt(2, 9)
      const b = randInt(-9, 9)
      const k = randInt(1, 9)
      const ans = a * k + b
      return {
        prompt: `f(x) = ${a}x${withSign(b)}. Quanto é f(${k})?`, answer: ans, kind: 'number', signed: true,
        steps: [
          `Substitua x por ${k}: f(${k}) = ${a} × ${k}${withSign(b)}.`,
          `= ${a * k}${withSign(b)} = ${ans}.`,
        ],
        tips: S.funcaoValorTips(k),
      }
    }
    case 1: { // Raiz: resolver ax + b = 0  ->  x = -b/a
      const a = randInt(2, 9)
      const b = randInt(1, 20)
      const answer = reduceFraction(-b, a)
      return {
        prompt: `Qual a raiz de f(x) = ${a}x${withSign(b)}?`, answer, kind: 'fraction',
        steps: [
          `A raiz é onde f(x) = 0: ${a}x${withSign(b)} = 0.`,
          `${a}x = ${-b}  →  x = ${-b} ÷ ${a} = ${fracStr(answer)}.`,
        ],
        tips: S.funcaoRaizTips(),
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
        prompt: `Uma reta passa por (${x1}, ${y1}) e (${x2}, ${y2}). Qual o coeficiente angular?`,
        answer: a, kind: 'number', signed: true,
        steps: [
          `O coeficiente angular é a = (y₂ − y₁) ÷ (x₂ − x₁).`,
          `a = (${y2} − ${y1}) ÷ (${x2} − ${x1}) = ${y2 - y1} ÷ ${x2 - x1} = ${a}.`,
        ],
        tips: S.funcaoCoefTips(x1, y1, x2, y2, a),
      }
    }
  }
}

// Map each topic id to its generator. To add a topic: add it to data/topics.js
// and register a function here.
const GENERATORS = { divisao, fracoes, porcentagem, equacao1, funcoes }

// Public entry point. Clamps `levelIndex` to the topic's real range so callers
// never have to worry about off-by-one at the edges.
export function generateQuestion(topicId, levelIndex) {
  const generate = GENERATORS[topicId]
  if (!generate) throw new Error(`sem gerador para o tópico "${topicId}"`)
  const topic = getTopic(topicId)
  const maxLevel = topic ? topic.levels.length - 1 : levelIndex
  const level = Math.max(0, Math.min(levelIndex, maxLevel))
  return generate(level)
}
