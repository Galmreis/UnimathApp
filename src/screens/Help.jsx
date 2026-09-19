import styles from './Help.module.css'
import { Button } from '../components/Button.jsx'
import { PageHeader } from '../components/PageHeader.jsx'
import { useStore } from '../store/StoreProvider.jsx'

// Cada seção é um <details> nativo: colapsa sem JS e já vem acessível de graça.
// paragraphs diz quantos help_<id>_p<n> renderizar.
//
// `from` existe porque dá pra chegar aqui pelo "?" da Home, pelos Ajustes e pelo
// Mais, e a seta tem que desfazer a porta por onde a pessoa entrou.
const SECTIONS = [
  { id: 'friday', paragraphs: 5, open: true }, // a pergunta que motivou essa página
  { id: 'philosophy', paragraphs: 2 },
  { id: 'track', paragraphs: 2 },
  { id: 'levels', paragraphs: 3 },
  { id: 'session', paragraphs: 3 },
  { id: 'feedback', paragraphs: 2 },
  { id: 'pause', paragraphs: 1 },
  { id: 'progress', paragraphs: 2 },
  { id: 'papers', paragraphs: 2 },
  { id: 'rank', paragraphs: 3 },
  { id: 'data', paragraphs: 1 },
]

const FLOW = ['help_flow_1', 'help_flow_2', 'help_flow_3', 'help_flow_4', 'help_flow_5']

export function Help({ from, navigate }) {
  const { t, updateSettings } = useStore()

  return (
    <div className={styles.help}>
      <PageHeader title={t('help_title')} intro={t('help_intro')} onBack={() => navigate(from ?? 'more')} />

      <section className={styles.flow}>
        <h2 className={styles.flowTitle}>{t('help_flow_t')}</h2>
        <ol className={styles.flowSteps}>
          {FLOW.map((key, i) => (
            <li key={key} className={styles.flowStep}>
              <span className={styles.flowNum}>{i + 1}</span>
              <span>{t(key)}</span>
            </li>
          ))}
        </ol>
      </section>

      <div className={styles.sections}>
        {SECTIONS.map((section) => (
          <details key={section.id} className={styles.section} open={section.open}>
            <summary className={styles.summary}>{t(`help_${section.id}_t`)}</summary>
            <div className={styles.bodyWrap}>
              {Array.from({ length: section.paragraphs }, (_, i) => (
                <p key={i} className={styles.body}>{t(`help_${section.id}_p${i + 1}`)}</p>
              ))}
            </div>
          </details>
        ))}
      </div>

      <p className={styles.footNote}>{t('help_more')}</p>

      <Button variant="ghost" full onClick={() => updateSettings({ onboarded: false })}>
        {t('tour_replay')}
      </Button>
    </div>
  )
}
