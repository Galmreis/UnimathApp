// Strategy & mental-math tips — the "smart way" to attack a question, chosen
// from the SPECIFIC numbers in it. These are separate from `steps` (which show
// the plain mechanical solution): tips teach shortcuts and habits, and they
// adapt to the numbers (÷5 → the ×2÷10 trick; 15% → the 10%+5% block method; a
// fraction with a common factor → cross-cancel).
//
// Every function returns an array of strings and takes a `lang` ('pt' | 'en',
// default 'pt'). Text is chosen with the local `L(pt, en)` helper; numbers are
// formatted with `f(value)` so decimals follow the language's convention.

import { gcd, formatNumber } from './math.js'

// digitsList(48) -> "4 + 8"   digitsSum(48) -> 12
const digitsList = (n) => String(Math.abs(n)).split('').join(' + ')
const digitsSum = (n) => String(Math.abs(n)).split('').reduce((s, d) => s + Number(d), 0)

// Per-call helpers: L picks the language string; each function that formats
// numbers defines a local `f = (v) => formatNumber(v, lang)`.
const L = (lang, pt, en) => (lang === 'en' ? en : pt)

// ------------------------------------------------------------------ Divisão --
export function divisaoExataTips(a, b, q, lang = 'pt') {
  if (b === 5) return [L(lang, `Truque do 5: dividir por 5 é × 2 e ÷ 10. ${a} × 2 = ${a * 2}, e ${a * 2} ÷ 10 = ${q}.`, `The 5 trick: dividing by 5 is × 2 then ÷ 10. ${a} × 2 = ${a * 2}, and ${a * 2} ÷ 10 = ${q}.`)]
  if (b === 2) return [L(lang, `Dividir por 2 é achar a metade: a metade de ${a} é ${q}.`, `Dividing by 2 is halving: half of ${a} is ${q}.`)]
  if (b === 4) return [L(lang, `Dividir por 4 é tirar a metade duas vezes: ${a} ÷ 2 = ${a / 2}, e ÷ 2 = ${q}.`, `Dividing by 4 is halving twice: ${a} ÷ 2 = ${a / 2}, then ÷ 2 = ${q}.`)]
  if (b === 8) return [L(lang, `Dividir por 8 é tirar a metade três vezes: ${a} → ${a / 2} → ${a / 4} → ${q}.`, `Dividing by 8 is halving three times: ${a} → ${a / 2} → ${a / 4} → ${q}.`)]
  if (b === 3 || b === 9) return [L(lang, `Some os dígitos de ${a}: ${digitsList(a)} = ${digitsSum(a)} (múltiplo de ${b}) — por isso ${a} ÷ ${b} fecha certinho.`, `Add the digits of ${a}: ${digitsList(a)} = ${digitsSum(a)} (a multiple of ${b}) — that's why ${a} ÷ ${b} comes out exact.`)]
  // Only list the first few multiples when there are enough to be worth it,
  // so the sequence never overshoots the target (e.g. avoid "7, 14, 21… até 14").
  if (q <= 3) return [L(lang, `Conte de ${b} em ${b} até chegar em ${a}: são ${q} passos.`, `Count up by ${b} until you reach ${a}: that's ${q} steps.`)]
  return [L(lang, `Conte de ${b} em ${b}: ${b}, ${b * 2}, ${b * 3}… até ${a} (são ${q} passos).`, `Count up by ${b}: ${b}, ${b * 2}, ${b * 3}… up to ${a} (that's ${q} steps).`)]
}

export function divisaoRestoTips(b, lang = 'pt') {
  return [L(lang, `Ache o maior múltiplo de ${b} sem passar do número (conte ${b}, ${b * 2}, ${b * 3}…): o último que cabe dá o quociente, e o que falta é o resto.`, `Find the largest multiple of ${b} without going over (count ${b}, ${b * 2}, ${b * 3}…): the last one that fits gives the quotient, and what's missing is the remainder.`)]
}

export function divisaoLongaTips(a, b, lang = 'pt') {
  return [L(lang, `Estime pelo tamanho: ${b} × 10 = ${b * 10} e ${b} × 100 = ${b * 100}. Como ${a} fica entre eles, o resultado tem 2 dígitos — aí é só ir ajustando.`, `Estimate by size: ${b} × 10 = ${b * 10} and ${b} × 100 = ${b * 100}. Since ${a} falls between them, the answer has 2 digits — from there just adjust.`)]
}

export function divisaoDecimalTips(a, b, ans, lang = 'pt') {
  const f = (v) => formatNumber(v, lang)
  if (b === 5) return [L(lang, `÷ 5 = × 2 e ÷ 10: ${a} × 2 = ${a * 2}, ÷ 10 = ${f(ans)}.`, `÷ 5 = × 2 then ÷ 10: ${a} × 2 = ${a * 2}, ÷ 10 = ${f(ans)}.`)]
  if (b === 2) return [L(lang, `÷ 2 é a metade: a metade de ${a} = ${f(ans)}.`, `÷ 2 is half: half of ${a} = ${f(ans)}.`)]
  if (b === 4) return [L(lang, `÷ 4 = metade da metade: ${a} ÷ 2 = ${f(a / 2)}, ÷ 2 = ${f(ans)}.`, `÷ 4 = half of a half: ${a} ÷ 2 = ${f(a / 2)}, ÷ 2 = ${f(ans)}.`)]
  if (b === 25) return [L(lang, `Truque do 25: × 4 e ÷ 100. ${a} × 4 = ${a * 4}, ÷ 100 = ${f(ans)}.`, `The 25 trick: × 4 then ÷ 100. ${a} × 4 = ${a * 4}, ÷ 100 = ${f(ans)}.`)]
  if (b === 20) return [L(lang, `÷ 20 = ÷ 10 e ÷ 2: ${a} ÷ 10 = ${f(a / 10)}, ÷ 2 = ${f(ans)}.`, `÷ 20 = ÷ 10 then ÷ 2: ${a} ÷ 10 = ${f(a / 10)}, ÷ 2 = ${f(ans)}.`)]
  return [L(lang, `Acrescente uma vírgula e vá baixando zeros até o resto zerar.`, `Add a decimal point and bring down zeros until the remainder is zero.`)]
}

// ------------------------------------------------------------------ Frações --
export function fracaoSimplificarTips(N, D, lang = 'pt') {
  if (N % 2 === 0 && D % 2 === 0) return [L(lang, `Os dois são pares — comece dividindo por 2 (e repita enquanto der).`, `Both are even — start by dividing by 2 (and repeat while you can).`)]
  if (N % 5 === 0 && D % 5 === 0) return [L(lang, `Os dois terminam em 0 ou 5 — então dá pra dividir por 5.`, `Both end in 0 or 5 — so you can divide by 5.`)]
  if (digitsSum(N) % 3 === 0 && digitsSum(D) % 3 === 0) return [L(lang, `A soma dos dígitos dos dois dá múltiplo de 3 — então dá pra dividir por 3.`, `The digit sum of each is a multiple of 3 — so you can divide by 3.`)]
  return [L(lang, `Procure o MDC: o maior número que divide ${N} e ${D} ao mesmo tempo, e divida os dois por ele de uma vez.`, `Look for the GCD: the largest number that divides both ${N} and ${D}, and divide both by it at once.`)]
}

export function fracaoSomaTips(b, d, lang = 'pt') {
  if (b % d === 0 || d % b === 0) {
    return [L(lang, `Um denominador é múltiplo do outro: use ${Math.max(b, d)} como denominador comum — não precisa multiplicar os dois.`, `One denominator is a multiple of the other: use ${Math.max(b, d)} as the common denominator — no need to multiply them together.`)]
  }
  const g = gcd(b, d)
  if (g > 1) {
    // e.g. 4 and 6 share the factor 2 even though neither divides the other.
    return [L(lang, `${b} e ${d} têm o fator comum ${g}: dá para usar ${(b * d) / g} como denominador comum, menor que ${b} × ${d} = ${b * d}.`, `${b} and ${d} share the factor ${g}: you can use ${(b * d) / g} as the common denominator, smaller than ${b} × ${d} = ${b * d}.`)]
  }
  return [L(lang, `${b} e ${d} não têm fator comum, então o denominador comum é ${b} × ${d} = ${b * d}.`, `${b} and ${d} share no common factor, so the common denominator is ${b} × ${d} = ${b * d}.`)]
}

export function fracaoMultiplicarTips(a, b, c, d, lang = 'pt') {
  if (gcd(a, d) > 1 || gcd(c, b) > 1) {
    return [L(lang, `Dá pra "cortar cruzado" antes de multiplicar (${a} com ${d}, ou ${c} com ${b}, têm fator comum). Simplificar antes deixa as contas bem menores.`, `You can cross-cancel before multiplying (${a} with ${d}, or ${c} with ${b}, share a factor). Simplifying first keeps the numbers much smaller.`)]
  }
  return [L(lang, `Multiplique direto: de cima com de cima, de baixo com de baixo — e simplifique só no fim.`, `Multiply straight across: tops with tops, bottoms with bottoms — and simplify only at the end.`)]
}

export function fracaoDividirTips(c, d, lang = 'pt') {
  return [L(lang, `Regra prática: mantenha a primeira fração e multiplique pelo INVERSO da segunda (${c}/${d} vira ${d}/${c}).`, `Handy rule: keep the first fraction and multiply by the RECIPROCAL of the second (${c}/${d} becomes ${d}/${c}).`)]
}

// -------------------------------------------------------------- Porcentagem --
export function porcentagemDeTips(pct, base, lang = 'pt') {
  const f = (v) => formatNumber(v, lang)
  const ten = base / 10
  if (pct === 50) return [L(lang, `50% é a metade: ${base} ÷ 2 = ${f(base / 2)}.`, `50% is half: ${base} ÷ 2 = ${f(base / 2)}.`)]
  if (pct === 25) return [L(lang, `25% é um quarto: ${base} ÷ 4 = ${f(base / 4)}.`, `25% is a quarter: ${base} ÷ 4 = ${f(base / 4)}.`)]
  if (pct === 75) return [L(lang, `75% é três quartos: ${base} ÷ 4 = ${f(base / 4)}, × 3 = ${f((base / 4) * 3)}.`, `75% is three quarters: ${base} ÷ 4 = ${f(base / 4)}, × 3 = ${f((base / 4) * 3)}.`)]
  if (pct === 10) return [L(lang, `10% é só "andar a vírgula" uma casa: ${base} vira ${f(ten)}.`, `10% is just moving the decimal one place: ${base} becomes ${f(ten)}.`)]
  if (pct === 5) return [L(lang, `5% é a metade de 10%. 10% de ${base} = ${f(ten)}, então 5% = ${f(ten / 2)}.`, `5% is half of 10%. 10% of ${base} = ${f(ten)}, so 5% = ${f(ten / 2)}.`)]
  if (pct === 15) return [L(lang, `Some blocos: 10% = ${f(ten)} e 5% = ${f(ten / 2)}, então 15% = ${f(ten + ten / 2)}.`, `Add blocks: 10% = ${f(ten)} and 5% = ${f(ten / 2)}, so 15% = ${f(ten + ten / 2)}.`)]
  if (pct % 10 === 0) return [L(lang, `Ache 10% (${f(ten)}) e multiplique: ${pct}% = ${pct / 10} × ${f(ten)} = ${f((ten * pct) / 10)}.`, `Find 10% (${f(ten)}) and multiply: ${pct}% = ${pct / 10} × ${f(ten)} = ${f((ten * pct) / 10)}.`)]
  return [L(lang, `Ache 10% de ${base} (${f(ten)}) e use como bloco para montar ${pct}%.`, `Find 10% of ${base} (${f(ten)}) and use it as a block to build ${pct}%.`)]
}

export function quePorcentagemTips(part, base, lang = 'pt') {
  const f = (v) => formatNumber(v, lang)
  return [L(lang, `Porcentagem é sempre parte ÷ todo × 100. Repare que fração ${f(part)} é de ${base} e transforme em %.`, `A percentage is always part ÷ whole × 100. See what fraction ${f(part)} is of ${base} and turn it into a %.`)]
}

export function aumentoDescontoTips(pct, base, isIncrease, ans, lang = 'pt') {
  const f = (v) => formatNumber(v, lang)
  const mult = isIncrease ? 1 + pct / 100 : 1 - pct / 100
  return [L(lang, `Atalho: ${isIncrease ? 'aumento' : 'desconto'} de ${pct}% = multiplicar por ${f(mult)}. ${base} × ${f(mult)} = ${f(ans)} — resolve em uma conta só.`, `Shortcut: a ${pct}% ${isIncrease ? 'increase' : 'discount'} = multiply by ${f(mult)}. ${base} × ${f(mult)} = ${f(ans)} — one calculation.`)]
}

// ------------------------------------------------------------------ Equação --
export function equacaoAxbTips(a, lang = 'pt') {
  return [L(lang, `Isolar o x = desfazer a multiplicação. Como ${a} multiplica o x, divida os dois lados por ${a}.`, `Isolating x = undoing the multiplication. Since ${a} multiplies x, divide both sides by ${a}.`)]
}

export function equacaoAxbcTips(a, b, lang = 'pt') {
  return [L(lang, `Desfaça na ordem inversa das contas: primeiro tire o "+ ${b}", depois divida pelo ${a}.`, `Undo in reverse order: first remove the "+ ${b}", then divide by ${a}.`)]
}

export function equacaoDuploTips(lang = 'pt') {
  return [
    L(lang, `Regra de ouro: o que passa para o outro lado troca de sinal. Junte os x de um lado e os números do outro.`, `Golden rule: whatever crosses to the other side flips its sign. Gather the x's on one side and the numbers on the other.`),
    L(lang, `No fim, confira: coloque o x que achou na equação e veja se os dois lados dão o mesmo valor.`, `At the end, check: put the x you found back into the equation and see if both sides match.`),
  ]
}

// ------------------------------------------------------------------ Funções --
export function funcaoValorTips(k, lang = 'pt') {
  return [L(lang, `Calcular f(${k}) é só trocar TODO x por ${k} e fazer a conta.`, `Computing f(${k}) is just replacing every x with ${k} and doing the arithmetic.`)]
}

export function funcaoRaizTips(lang = 'pt') {
  return [L(lang, `A raiz é onde f(x) = 0 — o ponto em que a reta corta o eixo x.`, `The root is where f(x) = 0 — the point where the line crosses the x-axis.`)]
}

export function funcaoCoefTips(x1, y1, x2, y2, a, lang = 'pt') {
  return [L(lang, `Coeficiente angular = quanto o y muda quando o x anda 1. De x=${x1} a x=${x2} (andou ${x2 - x1}), o y foi de ${y1} a ${y2} (mudou ${y2 - y1}): ${y2 - y1} ÷ ${x2 - x1} = ${a}.`, `Slope = how much y changes when x moves by 1. From x=${x1} to x=${x2} (moved ${x2 - x1}), y went from ${y1} to ${y2} (changed ${y2 - y1}): ${y2 - y1} ÷ ${x2 - x1} = ${a}.`)]
}
