import styles from './SessionSizePicker.module.css'
import { useStore } from '../store/StoreProvider.jsx'

// Componente separado porque Ajustes e o último passo do tour precisam do mesmo
// controle. Mudar as opções aqui muda nos dois.
export const COUNT_OPTIONS = [5, 10, 15, 20, 30, 35]
export const TIME_OPTIONS = [1, 5, 10, 20, 30, 45]

export function SessionSizePicker() {
  const { t, settings, updateSettings } = useStore()
  const byTime = settings.sessionMode === 'time'

  return (
    <div className={styles.picker}>
      <div className={styles.segmented}>
        <button
          type="button"
          data-active={!byTime}
          onClick={() => updateSettings({ sessionMode: 'count' })}
        >
          {t('byQuestions')}
        </button>
        <button
          type="button"
          data-active={byTime}
          onClick={() => updateSettings({ sessionMode: 'time' })}
        >
          {t('byTime')}
        </button>
      </div>

      <div className={styles.chips}>
        {byTime
          ? TIME_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              data-active={settings.sessionMinutes === n}
              onClick={() => updateSettings({ sessionMinutes: n })}
            >
              {t('nMin', { n })}
            </button>
          ))
          : COUNT_OPTIONS.map((n) => (
            <button
              key={n}
              type="button"
              data-active={settings.sessionCount === n}
              onClick={() => updateSettings({ sessionCount: n })}
            >
              {t('nQuestions', { n })}
            </button>
          ))}
      </div>
    </div>
  )
}
