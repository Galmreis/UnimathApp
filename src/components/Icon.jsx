// SVG inline herdando currentColor, então acompanha o tema sozinho.
// viewBox 24×24, 0,0 no canto superior esquerdo.
const ICONS = {
  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h5v-6h4v6h5V9.5" />
    </>
  ),
  progress: (
    <>
      <path d="M4 20V10" />
      <path d="M10 20V4" />
      <path d="M16 20v-7" />
      <path d="M3 20h18" />
    </>
  ),
  settings: (
    <>
      <circle cx="12" cy="12" r="3" />
      <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9 7 7M17 17l2.1 2.1M19.1 4.9 17 7M7 17l-2.1 2.1" />
    </>
  ),
  // Mais
  more: (
    <>
      <circle cx="8" cy="8" r="1.6" />
      <circle cx="16" cy="8" r="1.6" />
      <circle cx="8" cy="16" r="1.6" />
      <circle cx="16" cy="16" r="1.6" />
    </>
  ),
  // Provas
  paper: (
    <>
      <path d="M6 3h9l3 3v15H6z" />
      <path d="M9 9h6M9 13h6M9 17h4" />
    </>
  ),
  // Ranking
  rank: (
    <>
      <path d="M12 3l2.6 5.3 5.4.8-4 3.9.9 5.5L12 15.9 7.1 18.5l.9-5.5-4-3.9 5.4-.8z" />
    </>
  ),
  // Como funciona
  help: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M9.6 9.2a2.5 2.5 0 1 1 3.4 2.3c-.7.3-1 .9-1 1.6v.3" />
      <path d="M12 17.2h.01" />
    </>
  ),
  // Voltar
  back: (
    <>
      <path d="M14.5 5 8 12l6.5 7" />
    </>
  ),
  // Rever o tour
  replay: (
    <>
      <path d="M20 12a8 8 0 1 1-2.6-5.9" />
      <path d="M20 4v4h-4" />
    </>
  ),
  // Pausa
  pause: (
    <>
      <path d="M9.5 5v14M14.5 5v14" />
    </>
  ),
}

export function Icon({ name, size = 22 }) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden
    >
      {ICONS[name]}
    </svg>
  )
}
