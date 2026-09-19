export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

export function pick(list) {
  return list[randInt(0, list.length - 1)]
}

export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

// Sinal sempre no numerador, denominador sempre positivo. Sem isso -1/-2 e 1/2
// viram frações diferentes na comparação de resposta.
export function reduceFraction(n, d) {
  if (d === 0) throw new Error('denominador não pode ser zero')
  if (d < 0) { n = -n; d = -d }
  const g = gcd(n, d) || 1
  return { n: n / g, d: d / g }
}

// Arredonda antes de mostrar, senão 0.1 + 0.2 aparece como 0.30000000000000004
// na resposta certa.
export function round(value, places = 2) {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

export function formatNumber(value, lang = 'pt') {
  const s = String(round(value, 2))
  return lang === 'en' ? s : s.replace('.', ',')
}
