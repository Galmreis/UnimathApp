// Strategy & mental-math tips — the "smart way" to attack a question, chosen
// from the SPECIFIC numbers in it. These are separate from `steps` (which show
// the plain mechanical solution): tips teach shortcuts and habits, and they
// adapt to the numbers (÷5 → the ×2÷10 trick; 15% → the 10%+5% block method; a
// fraction with a common factor → cross-cancel).
//
// Every function returns an array of strings. Keeping them here, away from the
// generators, means all the teaching lives in one file you can browse and edit.

import { gcd, formatNumber as fmt } from './math.js'

// digitsList(48) -> "4 + 8"   digitsSum(48) -> 12
const digitsList = (n) => String(Math.abs(n)).split('').join(' + ')
const digitsSum = (n) => String(Math.abs(n)).split('').reduce((s, d) => s + Number(d), 0)

// ------------------------------------------------------------------ Divisão --
export function divisaoExataTips(a, b, q) {
  if (b === 5) return [`Truque do 5: dividir por 5 é × 2 e ÷ 10. ${a} × 2 = ${a * 2}, e ${a * 2} ÷ 10 = ${q}.`]
  if (b === 2) return [`Dividir por 2 é achar a metade: a metade de ${a} é ${q}.`]
  if (b === 4) return [`Dividir por 4 é tirar a metade duas vezes: ${a} ÷ 2 = ${a / 2}, e ÷ 2 = ${q}.`]
  if (b === 8) return [`Dividir por 8 é tirar a metade três vezes: ${a} → ${a / 2} → ${a / 4} → ${q}.`]
  if (b === 3 || b === 9) return [`Some os dígitos de ${a}: ${digitsList(a)} = ${digitsSum(a)} (múltiplo de ${b}) — por isso ${a} ÷ ${b} fecha certinho.`]
  // Only list the first few multiples when there are enough to be worth it,
  // so the sequence never overshoots the target (e.g. avoid "7, 14, 21… até 14").
  if (q <= 3) return [`Conte de ${b} em ${b} até chegar em ${a}: são ${q} passos.`]
  return [`Conte de ${b} em ${b}: ${b}, ${b * 2}, ${b * 3}… até ${a} (são ${q} passos).`]
}

export function divisaoRestoTips(b) {
  return [`Ache o maior múltiplo de ${b} sem passar do número (conte ${b}, ${b * 2}, ${b * 3}…): o último que cabe dá o quociente, e o que falta é o resto.`]
}

export function divisaoLongaTips(a, b) {
  return [`Estime pelo tamanho: ${b} × 10 = ${b * 10} e ${b} × 100 = ${b * 100}. Como ${a} fica entre eles, o resultado tem 2 dígitos — aí é só ir ajustando.`]
}

export function divisaoDecimalTips(a, b, ans) {
  if (b === 5) return [`÷ 5 = × 2 e ÷ 10: ${a} × 2 = ${a * 2}, ÷ 10 = ${fmt(ans)}.`]
  if (b === 2) return [`÷ 2 é a metade: a metade de ${a} = ${fmt(ans)}.`]
  if (b === 4) return [`÷ 4 = metade da metade: ${a} ÷ 2 = ${fmt(a / 2)}, ÷ 2 = ${fmt(ans)}.`]
  if (b === 25) return [`Truque do 25: × 4 e ÷ 100. ${a} × 4 = ${a * 4}, ÷ 100 = ${fmt(ans)}.`]
  if (b === 20) return [`÷ 20 = ÷ 10 e ÷ 2: ${a} ÷ 10 = ${fmt(a / 10)}, ÷ 2 = ${fmt(ans)}.`]
  return [`Acrescente uma vírgula e vá baixando zeros até o resto zerar.`]
}

// ------------------------------------------------------------------ Frações --
export function fracaoSimplificarTips(N, D) {
  if (N % 2 === 0 && D % 2 === 0) return [`Os dois são pares — comece dividindo por 2 (e repita enquanto der).`]
  if (N % 5 === 0 && D % 5 === 0) return [`Os dois terminam em 0 ou 5 — então dá pra dividir por 5.`]
  if (digitsSum(N) % 3 === 0 && digitsSum(D) % 3 === 0) return [`A soma dos dígitos dos dois dá múltiplo de 3 — então dá pra dividir por 3.`]
  return [`Procure o MDC: o maior número que divide ${N} e ${D} ao mesmo tempo, e divida os dois por ele de uma vez.`]
}

export function fracaoSomaTips(b, d) {
  if (b % d === 0 || d % b === 0) {
    return [`Um denominador é múltiplo do outro: use ${Math.max(b, d)} como denominador comum — não precisa multiplicar os dois.`]
  }
  const g = gcd(b, d)
  if (g > 1) {
    // e.g. 4 and 6 share the factor 2 even though neither divides the other.
    return [`${b} e ${d} têm o fator comum ${g}: dá para usar ${(b * d) / g} como denominador comum, menor que ${b} × ${d} = ${b * d}.`]
  }
  return [`${b} e ${d} não têm fator comum, então o denominador comum é ${b} × ${d} = ${b * d}.`]
}

export function fracaoMultiplicarTips(a, b, c, d) {
  if (gcd(a, d) > 1 || gcd(c, b) > 1) {
    return [`Dá pra "cortar cruzado" antes de multiplicar (${a} com ${d}, ou ${c} com ${b}, têm fator comum). Simplificar antes deixa as contas bem menores.`]
  }
  return [`Multiplique direto: de cima com de cima, de baixo com de baixo — e simplifique só no fim.`]
}

export function fracaoDividirTips(c, d) {
  return [`Regra prática: mantenha a primeira fração e multiplique pelo INVERSO da segunda (${c}/${d} vira ${d}/${c}).`]
}

// -------------------------------------------------------------- Porcentagem --
export function porcentagemDeTips(pct, base) {
  const ten = base / 10
  if (pct === 50) return [`50% é a metade: ${base} ÷ 2 = ${fmt(base / 2)}.`]
  if (pct === 25) return [`25% é um quarto: ${base} ÷ 4 = ${fmt(base / 4)}.`]
  if (pct === 75) return [`75% é três quartos: ${base} ÷ 4 = ${fmt(base / 4)}, × 3 = ${fmt((base / 4) * 3)}.`]
  if (pct === 10) return [`10% é só "andar a vírgula" uma casa: ${base} vira ${fmt(ten)}.`]
  if (pct === 5) return [`5% é a metade de 10%. 10% de ${base} = ${fmt(ten)}, então 5% = ${fmt(ten / 2)}.`]
  if (pct === 15) return [`Some blocos: 10% = ${fmt(ten)} e 5% = ${fmt(ten / 2)}, então 15% = ${fmt(ten + ten / 2)}.`]
  if (pct % 10 === 0) return [`Ache 10% (${fmt(ten)}) e multiplique: ${pct}% = ${pct / 10} × ${fmt(ten)} = ${fmt((ten * pct) / 10)}.`]
  return [`Ache 10% de ${base} (${fmt(ten)}) e use como bloco para montar ${pct}%.`]
}

export function quePorcentagemTips(part, base) {
  return [`Porcentagem é sempre parte ÷ todo × 100. Repare que fração ${fmt(part)} é de ${base} e transforme em %.`]
}

export function aumentoDescontoTips(pct, base, isIncrease, ans) {
  const mult = isIncrease ? 1 + pct / 100 : 1 - pct / 100
  return [`Atalho: ${isIncrease ? 'aumento' : 'desconto'} de ${pct}% = multiplicar por ${fmt(mult)}. ${base} × ${fmt(mult)} = ${fmt(ans)} — resolve em uma conta só.`]
}

// ------------------------------------------------------------------ Equação --
export function equacaoAxbTips(a) {
  return [`Isolar o x = desfazer a multiplicação. Como ${a} multiplica o x, divida os dois lados por ${a}.`]
}

export function equacaoAxbcTips(a, b) {
  return [`Desfaça na ordem inversa das contas: primeiro tire o "+ ${b}", depois divida pelo ${a}.`]
}

export function equacaoDuploTips() {
  return [
    `Regra de ouro: o que passa para o outro lado troca de sinal. Junte os x de um lado e os números do outro.`,
    `No fim, confira: coloque o x que achou na equação e veja se os dois lados dão o mesmo valor.`,
  ]
}

// ------------------------------------------------------------------ Funções --
export function funcaoValorTips(k) {
  return [`Calcular f(${k}) é só trocar TODO x por ${k} e fazer a conta.`]
}

export function funcaoRaizTips() {
  return [`A raiz é onde f(x) = 0 — o ponto em que a reta corta o eixo x.`]
}

export function funcaoCoefTips(x1, y1, x2, y2, a) {
  return [`Coeficiente angular = quanto o y muda quando o x anda 1. De x=${x1} a x=${x2} (andou ${x2 - x1}), o y foi de ${y1} a ${y2} (mudou ${y2 - y1}): ${y2 - y1} ÷ ${x2 - x1} = ${a}.`]
}
