import styles from './TopicGlyph.module.css'

// style inline porque o fundo é a cor do tópico com alpha concatenado no hex:
// "#7aa2f7" + "22" dá uns 13% de opacidade.
export function TopicGlyph({ topic, size }) {
  return (
    <span
      className={`${styles.glyph} ${size === 'sm' ? styles.sm : ''}`}
      style={{
        color: topic.color,
        backgroundColor: `${topic.color}22`,
        borderColor: `${topic.color}55`,
      }}
      aria-hidden
    >
      {topic.glyph}
    </span>
  )
}
