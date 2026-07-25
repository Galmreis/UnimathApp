import styles from './Settings.module.css'
import { Button } from '../components/Button.jsx'
import { useStore } from '../store/StoreProvider.jsx'

const COUNT_OPTIONS = [5, 10, 15, 20, 30, 35]
const TIME_OPTIONS = [1, 5, 10, 20, 30, 45]
const THEMES = ['midnight', 'dim', 'sepia', 'forest', 'ocean', 'plum', 'rose', 'slate', 'clay']

export function Settings({ navigate }) {
  const { t, settings, updateSettings, resetProgress } = useStore()

  function handleReset() {
    if (window.confirm(t('resetConfirm'))) {
      resetProgress()
      navigate('home')
    }
  }

  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>{t('settingsTitle')}</h1>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('language')}</h2>
        <div className={styles.segmented}>
          <button
            data-active={settings.lang === 'pt'}
            onClick={() => updateSettings({ lang: 'pt' })}
          >
            Português
          </button>
          <button
            data-active={settings.lang === 'en'}
            onClick={() => updateSettings({ lang: 'en' })}
          >
            English
          </button>
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('sessionSize')}</h2>
        <div className={styles.segmented}>
          <button
            data-active={settings.sessionMode === 'count'}
            onClick={() => updateSettings({ sessionMode: 'count' })}
          >
            {t('byQuestions')}
          </button>
          <button
            data-active={settings.sessionMode === 'time'}
            onClick={() => updateSettings({ sessionMode: 'time' })}
          >
            {t('byTime')}
          </button>
        </div>

        {settings.sessionMode === 'count' ? (
          <div className={styles.chips}>
            {COUNT_OPTIONS.map((n) => (
              <button
                key={n}
                data-active={settings.sessionCount === n}
                onClick={() => updateSettings({ sessionCount: n })}
              >
                {t('nQuestions', { n })}
              </button>
            ))}
          </div>
        ) : (
          <div className={styles.chips}>
            {TIME_OPTIONS.map((n) => (
              <button
                key={n}
                data-active={settings.sessionMinutes === n}
                onClick={() => updateSettings({ sessionMinutes: n })}
              >
                {t('nMin', { n })}
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('feedbackGroup')}</h2>
        <label className={styles.toggleRow}>
          <span>
            {t('explanations')}
            <span className={styles.toggleHint}>{t('explanationsHint')}</span>
          </span>
          <input
            type="checkbox"
            className={styles.toggle}
            checked={settings.showExplanations}
            onChange={(e) => updateSettings({ showExplanations: e.target.checked })}
          />
        </label>
        <label className={styles.toggleRow}>
          <span>
            {t('tipsSetting')}
            <span className={styles.toggleHint}>{t('tipsHint')}</span>
          </span>
          <input
            type="checkbox"
            className={styles.toggle}
            checked={settings.showTips}
            onChange={(e) => updateSettings({ showTips: e.target.checked })}
          />
        </label>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('appearance')}</h2>
        <div className={styles.selectRow}>
          <span className={styles.preview} aria-hidden="true" />
          <div className={styles.selectWrap}>
            <select
              className={styles.select}
              value={settings.theme}
              onChange={(e) => updateSettings({ theme: e.target.value })}
              aria-label={t('theme')}
            >
              {THEMES.map((id) => (
                <option key={id} value={id}>{t(`theme_${id}`)}</option>
              ))}
            </select>
          </div>
        </div>
        <label className={styles.toggleRow}>
          <span>
            {t('animations')}
            <span className={styles.toggleHint}>{t('animationsHint')}</span>
          </span>
          <input
            type="checkbox"
            className={styles.toggle}
            checked={settings.animations}
            onChange={(e) => updateSettings({ animations: e.target.checked })}
          />
        </label>
        <label className={styles.toggleRow}>
          <span>
            {t('highContrast')}
            <span className={styles.toggleHint}>{t('highContrastHint')}</span>
          </span>
          <input
            type="checkbox"
            className={styles.toggle}
            checked={settings.highContrast}
            onChange={(e) => updateSettings({ highContrast: e.target.checked })}
          />
        </label>
        <p className={styles.note}>{t('darkNote')}</p>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('dataGroup')}</h2>
        <Button variant="danger" full onClick={handleReset}>{t('resetProgress')}</Button>
      </section>

      <p className={styles.about}>{t('about')}</p>
    </div>
  )
}
