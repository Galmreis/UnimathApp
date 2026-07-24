import styles from './Settings.module.css'
import { Button } from '../components/Button.jsx'
import { useStore } from '../store/StoreProvider.jsx'

const COUNT_OPTIONS = [5, 10, 15, 20, 30, 35]
const TIME_OPTIONS = [1, 5, 10, 20, 30, 45]

export function Settings({ navigate }) {
  const { settings, updateSettings, resetProgress } = useStore()

  function handleReset() {
    if (window.confirm('Apagar TODO o progresso (tópicos, sessões e provas)? Isso não pode ser desfeito.')) {
      resetProgress()
      navigate('home')
    }
  }

  return (
    <div className={styles.settings}>
      <h1 className={styles.title}>Ajustes</h1>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>Tamanho da sessão</h2>
        <div className={styles.segmented}>
          <button
            data-active={settings.sessionMode === 'count'}
            onClick={() => updateSettings({ sessionMode: 'count' })}
          >
            Por questões
          </button>
          <button
            data-active={settings.sessionMode === 'time'}
            onClick={() => updateSettings({ sessionMode: 'time' })}
          >
            Por tempo
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
                {n} questões
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
                {n} min
              </button>
            ))}
          </div>
        )}
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>Correção</h2>
        <label className={styles.toggleRow}>
          <span>
            Explicações passo a passo
            <span className={styles.toggleHint}>Mostra a resolução, passo a passo, na correção.</span>
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
            Dica (estratégia)
            <span className={styles.toggleHint}>Mostra um atalho de cálculo mental para cada questão.</span>
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
        <h2 className={styles.groupTitle}>Visual</h2>
        <label className={styles.toggleRow}>
          <span>
            Alto contraste
            <span className={styles.toggleHint}>Cores mais fortes para leitura fácil.</span>
          </span>
          <input
            type="checkbox"
            className={styles.toggle}
            checked={settings.highContrast}
            onChange={(e) => updateSettings({ highContrast: e.target.checked })}
          />
        </label>
        <p className={styles.note}>O app usa modo escuro por padrão para cansar menos a vista.</p>
      </section>

      <section className={styles.group}>
        <h2 className={styles.groupTitle}>Dados</h2>
        <Button variant="danger" full onClick={handleReset}>Zerar progresso</Button>
      </section>

      <p className={styles.about}>Unimath · treino de matemática para o vestibular. Seus dados ficam só neste navegador.</p>
    </div>
  )
}
