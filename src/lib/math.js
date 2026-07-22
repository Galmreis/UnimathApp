// Small, dependency-free math helpers shared by the question generators and the
// answer checker. Keeping them here means the "risky" math lives in one place
// that we can unit-check with `npm run check`.

// Random integer in [min, max], both ends included.
export function randInt(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

// Pick a random element from a non-empty array.
export function pick(list) {
  return list[randInt(0, list.length - 1)]
}

// Greatest common divisor (Euclid's algorithm). Used to reduce fractions.
export function gcd(a, b) {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

// Reduce a fraction to lowest terms, keeping the sign on the numerator so the
// denominator is always positive. reduceFraction(6, 8) -> { n: 3, d: 4 }.
export function reduceFraction(n, d) {
  if (d === 0) throw new Error('denominador não pode ser zero')
  if (d < 0) { n = -n; d = -d } // normalise the sign onto the numerator
  const g = gcd(n, d) || 1      // gcd is 0 only when n and d are both 0
  return { n: n / g, d: d / g }
}

// Round to `places` decimals and return a Number. Avoids floating-point noise
// like 0.1 + 0.2 = 0.30000000000000004 showing up in answers.
export function round(value, places = 2) {
  const factor = 10 ** places
  return Math.round(value * factor) / factor
}

// Format a number the Brazilian way: decimal comma, no trailing ".00".
// formatNumber(6.25) -> "6,25", formatNumber(5) -> "5".
export function formatNumber(value) {
  return String(round(value, 2)).replace('.', ',')
}
