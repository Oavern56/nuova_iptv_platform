import styles from './page.module.css';

export default function Home() {
  return (
    <div className={styles.page}>
      <header className={styles.header}>
        <div className={styles.brand}>
          <span className={styles.brandMark}>Nuova</span>
          <span className={styles.brandName}>SafeSight</span>
        </div>
        <nav className={styles.nav}>
          <a href="#features">Funzionalità</a>
          <a href="#workflow">Come funziona</a>
          <a href="#privacy">Privacy</a>
          <a href="#download">Download</a>
        </nav>
      </header>

      <main className={styles.main}>
        <section className={styles.hero}>
          <div className={styles.heroContent}>
            <p className={styles.tag}>App per Mac · Rilevamento discreto</p>
            <h1>Proteggi spazi sensibili da microcamere e microspie.</h1>
            <p className={styles.subtitle}>
              SafeSight per macOS unisce scansioni RF, analisi della rete locale e
              checklist guidate per aiutarti a individuare segnali sospetti in
              modo rapido, senza disturbare l’ambiente.
            </p>
            <div className={styles.actions}>
              <button className={styles.primary}>Scarica la beta per Mac</button>
              <button className={styles.secondary}>Richiedi una demo</button>
            </div>
            <div className={styles.trust}>
              <div>
                <strong>4,8/5</strong>
                <span>Valutazioni sicurezza</span>
              </div>
              <div>
                <strong>2 min</strong>
                <span>Scansione guidata</span>
              </div>
              <div>
                <strong>Offline</strong>
                <span>Dati salvati localmente</span>
              </div>
            </div>
          </div>
          <div className={styles.heroCard}>
            <div className={styles.cardHeader}>
              <span>Panoramica scansione</span>
              <span className={styles.status}>Ambiente sicuro</span>
            </div>
            <ul className={styles.cardList}>
              <li>
                <strong>RF Sweep</strong>
                <span>Attività stabile · 0 anomalie</span>
              </li>
              <li>
                <strong>Rete locale</strong>
                <span>8 dispositivi noti</span>
              </li>
              <li>
                <strong>Occhi digitali</strong>
                <span>Filtro infrarossi attivo</span>
              </li>
              <li>
                <strong>Checklist stanza</strong>
                <span>7/7 punti completati</span>
              </li>
            </ul>
          </div>
        </section>

        <section id="features" className={styles.features}>
          <h2>Funzionalità principali</h2>
          <div className={styles.featureGrid}>
            <article>
              <h3>Scanner RF intelligente</h3>
              <p>
                Evidenzia picchi di frequenza anomali e suggerisce aree da
                controllare in tempo reale.
              </p>
            </article>
            <article>
              <h3>Analisi della rete</h3>
              <p>
                Mappa i dispositivi connessi al Wi‑Fi e segnala hardware non
                riconosciuto.
              </p>
            </article>
            <article>
              <h3>Riflessi IR</h3>
              <p>
                Usa la fotocamera del Mac per individuare riflessi tipici delle
                lenti nascoste.
              </p>
            </article>
            <article>
              <h3>Report export</h3>
              <p>
                Genera report PDF con timestamp, note e foto per audit di
                sicurezza.
              </p>
            </article>
          </div>
        </section>

        <section id="workflow" className={styles.workflow}>
          <div className={styles.workflowHeader}>
            <h2>Come funziona</h2>
            <p>
              Una procedura guidata in 3 step per ispezionare stanze d’hotel,
              uffici e location temporanee.
            </p>
          </div>
          <div className={styles.steps}>
            <div>
              <span>1</span>
              <h3>Scansione rapida</h3>
              <p>Avvia la scansione RF e ottieni la mappa delle intensità.</p>
            </div>
            <div>
              <span>2</span>
              <h3>Verifica visiva</h3>
              <p>Usa il filtro IR e la checklist per gli oggetti sospetti.</p>
            </div>
            <div>
              <span>3</span>
              <h3>Report & azioni</h3>
              <p>Salva evidenze e condividi il report con il tuo team.</p>
            </div>
          </div>
        </section>

        <section id="privacy" className={styles.privacy}>
          <div>
            <h2>Privacy by design</h2>
            <p>
              SafeSight lavora offline quando possibile. I dati della scansione
              restano sul tuo Mac e puoi eliminare tutto con un click.
            </p>
          </div>
          <ul>
            <li>Elaborazione locale senza cloud obbligatorio.</li>
            <li>Autenticazione biometrica per aprire l’app.</li>
            <li>Log cifrati e controllo sugli export.</li>
          </ul>
        </section>

        <section id="download" className={styles.cta}>
          <h2>Porta la sicurezza ovunque</h2>
          <p>
            Disponibile per macOS Sonoma e Ventura. Richiedi l’accesso anticipato
            per ricevere la build privata.
          </p>
          <div className={styles.actions}>
            <button className={styles.primary}>Iscriviti alla lista d’attesa</button>
            <button className={styles.secondary}>Parla con un esperto</button>
          </div>
        </section>
      </main>

      <footer className={styles.footer}>
        <span>© 2024 Nuova SafeSight</span>
        <div>
          <a href="mailto:security@nuova.app">security@nuova.app</a>
          <a href="tel:+390201234567">+39 02 0123 4567</a>
        </div>
      </footer>
    </div>
  );
}
