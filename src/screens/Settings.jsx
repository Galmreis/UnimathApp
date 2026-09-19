import styles from './Settings.module.css'
import { Button } from '../components/Button.jsx'
import { SessionSizePicker } from '../components/SessionSizePicker.jsx'
import { useStore } from '../store/StoreProvider.jsx'

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
        <SessionSizePicker />
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
        <h2 className={styles.groupTitle}>{t('help_title')}</h2>
        <Button variant="ghost" full onClick={() => navigate('help', { from: 'settings' })}>{t('helpLink')}</Button>
        <div className={styles.actionRow}>
          <span>
            {t('tour_replay')}
            <span className={styles.toggleHint}>{t('tour_replayHint')}</span>
          </span>
          <button className={styles.inlineAction} onClick={() => updateSettings({ onboarded: false })}>
            {t('openAction')}
          </button>
        </div>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>{t('dataGroup')}</h2>
        <Button variant="danger" full onClick={handleReset}>{t('resetProgress')}</Button>
      </section>

      <p className={styles.about}>{t('about')}</p>
    </div>
  )
}
