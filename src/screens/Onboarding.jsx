import { useState } from 'react'
import styles from './Onboarding.module.css'
import { Button } from '../components/Button.jsx'
import { SessionSizePicker } from '../components/SessionSizePicker.jsx'
import { useStore } from '../store/StoreProvider.jsx'

// Tour de primeiro acesso. Toma a tela inteira enquanto settings.onboarded for
// false. O último passo embute o controle de tamanho de sessão de propósito: sem
// isso a pessoa treina sem nunca configurar tempo nem número de questões.
const STEPS = [
  { id: 'welcome', glyph: '∑', paragraphs: ['ob_welcome_p', 'ob_welcome_p2'] },
  { id: 'track', glyph: '→', paragraphs: ['ob_track_p', 'ob_track_p2'] },
  { id: 'levels', glyph: '↑', paragraphs: ['ob_levels_p', 'ob_levels_p2'] },
  { id: 'session', glyph: '⏱', paragraphs: ['ob_session_p', 'ob_session_p2'] },
  { id: 'friday', glyph: '✓', paragraphs: ['ob_friday_p', 'ob_friday_p2'] },
  { id: 'extras', glyph: '★', paragraphs: ['ob_extras_p', 'ob_extras_p2'] },
  { id: 'config', glyph: '⚙', paragraphs: ['ob_config_p'], configure: true },
]

export function Onboarding({ onDone }) {
  const { t } = useStore()
  const [index, setIndex] = useState(0)

  const step = STEPS[index]
  const isLast = index === STEPS.length - 1

  return (
    <div className={styles.tour}>
      <div className={styles.top}>
        <div className={styles.dots} role="presentation">
          {STEPS.map((s, i) => (
            <span key={s.id} className={styles.dot} data-state={i === index ? 'current' : i < index ? 'done' : 'todo'} />
          ))}
        </div>
        <button className={styles.skip} onClick={onDone}>{t('ob_skip')}</button>
      </div>

      {/* key={step.id} remonta o card a cada passo pro fade rodar de novo */}
      <div key={step.id} className={styles.card}>
        <span className={styles.glyph} aria-hidden>{step.glyph}</span>
        <span className={styles.counter}>{t('ob_stepOf', { n: index + 1, m: STEPS.length })}</span>
        <h1 className={styles.title}>{t(`ob_${step.id}_t`)}</h1>
        {step.paragraphs.map((key) => (
          <p key={key} className={styles.body}>{t(key)}</p>
        ))}

        {step.configure && (
          <div className={styles.configure}>
            <SessionSizePicker />
            <p className={styles.warn}>{t('ob_config_warn')}</p>
          </div>
        )}
      </div>

      <div className={styles.actions}>
        {isLast
          ? <Button size="big" full onClick={onDone}>{t('ob_start')}</Button>
          : <Button size="big" full onClick={() => setIndex(index + 1)}>{t('ob_next')}</Button>}
        <Button
          variant="ghost"
          full
          disabled={index === 0}
          onClick={() => setIndex(index - 1)}
        >
          {t('ob_back')}
        </Button>
      </div>
    </div>
  )
}
