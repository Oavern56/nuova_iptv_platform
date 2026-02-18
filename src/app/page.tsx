'use client';

import { useMemo, useState } from 'react';

type DtcSeverity = 'info' | 'warning' | 'critical';

interface DtcCode {
  code: string;
  description: string;
  status: 'active' | 'stored';
  severity: DtcSeverity;
}

interface EcuProfile {
  id: string;
  name: string;
  firmware: string;
  protocol: string;
  writeTime: string;
}

const dtcMockData: DtcCode[] = [
  { code: 'P0171', description: 'Miscela aria/carburante troppo magra (Bank 1)', status: 'active', severity: 'warning' },
  { code: 'P0302', description: 'Mancata accensione cilindro 2', status: 'stored', severity: 'critical' },
  { code: 'C0035', description: 'Sensore velocità ruota anteriore sinistra', status: 'stored', severity: 'info' },
  { code: 'U0100', description: 'Perdita comunicazione con ECM/PCM', status: 'active', severity: 'critical' },
];

const ecuProfiles: EcuProfile[] = [
  { id: 'eco-safe', name: 'ECO Safe', firmware: 'v1.24.7', protocol: 'CAN 500 kbps', writeTime: '03:40' },
  { id: 'stock-plus', name: 'Stock+', firmware: 'v1.24.7', protocol: 'UDS / ISO-TP', writeTime: '04:15' },
  { id: 'track-lab', name: 'Track Lab', firmware: 'v1.26.1', protocol: 'K-Line legacy', writeTime: '06:10' },
];

const severityStyles: Record<DtcSeverity, string> = {
  info: 'bg-sky-500/20 text-sky-300 border-sky-500/30',
  warning: 'bg-amber-500/20 text-amber-300 border-amber-500/30',
  critical: 'bg-red-500/20 text-red-300 border-red-500/30',
};

const tabs = ['Diagnosi OBD-II', 'Riprogrammazione ECU', 'Telemetria in tempo reale'] as const;

type TabName = (typeof tabs)[number];

export default function Home() {
  const [activeTab, setActiveTab] = useState<TabName>('Diagnosi OBD-II');
  const [selectedProfile, setSelectedProfile] = useState('stock-plus');
  const [scanCompleted, setScanCompleted] = useState(false);

  const selectedProfileData = useMemo(
    () => ecuProfiles.find((profile) => profile.id === selectedProfile),
    [selectedProfile]
  );

  return (
    <main className="min-h-screen bg-slate-950 text-slate-100 p-6 md:p-12">
      <div className="mx-auto max-w-6xl space-y-8">
        <header className="space-y-4">
          <p className="inline-block rounded-full border border-cyan-400/30 bg-cyan-400/10 px-4 py-1 text-xs uppercase tracking-widest text-cyan-300">
            Prototype • Officina Digitale
          </p>
          <h1 className="text-3xl font-bold md:text-5xl">Nuova OBD Suite</h1>
          <p className="max-w-3xl text-slate-300">
            Replica funzionale di una piattaforma professionale per diagnosi OBD-II e gestione mappature ECU.
            Questa demo è pensata per ambienti di test e formazione: include simulazione scansioni DTC, selezione profili firmware
            e monitor live dei principali sensori motore.
          </p>
        </header>

        <section className="rounded-2xl border border-slate-800 bg-slate-900/70 p-3">
          <div className="grid gap-3 md:grid-cols-3">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`rounded-xl px-4 py-3 text-sm font-medium transition ${
                  activeTab === tab
                    ? 'bg-cyan-500 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {tab}
              </button>
            ))}
          </div>
        </section>

        {activeTab === 'Diagnosi OBD-II' && (
          <section className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr]">
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <div className="mb-6 flex items-center justify-between">
                <h2 className="text-xl font-semibold">Scansione codici errore</h2>
                <button
                  onClick={() => setScanCompleted(true)}
                  className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-emerald-400"
                >
                  Avvia scansione completa
                </button>
              </div>

              {scanCompleted ? (
                <ul className="space-y-3">
                  {dtcMockData.map((dtc) => (
                    <li
                      key={dtc.code}
                      className="rounded-xl border border-slate-700 bg-slate-800/60 p-4"
                    >
                      <div className="mb-2 flex items-center justify-between gap-3">
                        <p className="font-mono text-lg font-bold">{dtc.code}</p>
                        <span className={`rounded-full border px-3 py-1 text-xs uppercase ${severityStyles[dtc.severity]}`}>
                          {dtc.severity}
                        </span>
                      </div>
                      <p className="text-sm text-slate-300">{dtc.description}</p>
                      <p className="mt-2 text-xs text-slate-400">Stato: {dtc.status === 'active' ? 'attivo' : 'memorizzato'}</p>
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="rounded-xl border border-dashed border-slate-700 bg-slate-800/50 p-8 text-center text-slate-400">
                  Premi “Avvia scansione completa” per simulare la lettura DTC da centralina.
                </p>
              )}
            </article>

            <article className="space-y-4 rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-lg font-semibold">Stato connessione veicolo</h3>
              <ul className="space-y-3 text-sm text-slate-300">
                <li className="rounded-lg bg-slate-800 px-4 py-3">Interfaccia: J2534 Pass-Thru</li>
                <li className="rounded-lg bg-slate-800 px-4 py-3">Tensione batteria: 12.3V</li>
                <li className="rounded-lg bg-slate-800 px-4 py-3">Protocollo attivo: ISO 15765-4 (CAN)</li>
                <li className="rounded-lg bg-slate-800 px-4 py-3">VIN rilevato: VF3XXXXXXXXXXXXX</li>
              </ul>
            </article>
          </section>
        )}

        {activeTab === 'Riprogrammazione ECU' && (
          <section className="grid gap-6 lg:grid-cols-[1fr_1fr]">
            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h2 className="mb-4 text-xl font-semibold">Selezione profilo firmware</h2>
              <div className="space-y-3">
                {ecuProfiles.map((profile) => (
                  <label key={profile.id} className="flex cursor-pointer items-start gap-3 rounded-xl border border-slate-700 bg-slate-800/60 p-4">
                    <input
                      type="radio"
                      name="ecu-profile"
                      checked={selectedProfile === profile.id}
                      onChange={() => setSelectedProfile(profile.id)}
                      className="mt-1"
                    />
                    <span>
                      <span className="block font-semibold">{profile.name}</span>
                      <span className="block text-sm text-slate-400">Firmware: {profile.firmware}</span>
                      <span className="block text-sm text-slate-400">Protocollo: {profile.protocol}</span>
                    </span>
                  </label>
                ))}
              </div>
            </article>

            <article className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
              <h3 className="text-lg font-semibold">Riepilogo scrittura</h3>
              <div className="mt-4 space-y-3 rounded-xl bg-slate-800/60 p-4 text-sm text-slate-300">
                <p>Profilo selezionato: <strong>{selectedProfileData?.name}</strong></p>
                <p>Versione firmware: <strong>{selectedProfileData?.firmware}</strong></p>
                <p>Tempo stimato scrittura: <strong>{selectedProfileData?.writeTime}</strong></p>
                <p>Controllo checksum: <strong>abilitato</strong></p>
                <p>Backup automatico EEPROM: <strong>attivo</strong></p>
              </div>
              <button className="mt-6 w-full rounded-lg bg-cyan-500 px-4 py-3 font-semibold text-slate-950 hover:bg-cyan-400">
                Simula riprogrammazione sicura
              </button>
            </article>
          </section>
        )}

        {activeTab === 'Telemetria in tempo reale' && (
          <section className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
            <h2 className="mb-6 text-xl font-semibold">Live Data Stream</h2>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {[
                ['RPM', '1820 giri/min'],
                ['Pressione turbo', '1.12 bar'],
                ['Temperatura olio', '94 °C'],
                ['Lambda target', '0.99 λ'],
                ['Anticipo accensione', '12.5°'],
                ['Pedale acceleratore', '38%'],
                ['Velocità veicolo', '67 km/h'],
                ['Fuel trim STFT', '+2.1%'],
              ].map(([label, value]) => (
                <div key={label} className="rounded-xl border border-slate-700 bg-slate-800/70 p-4">
                  <p className="text-xs uppercase tracking-wide text-slate-400">{label}</p>
                  <p className="mt-1 text-lg font-semibold text-cyan-300">{value}</p>
                </div>
              ))}
            </div>
          </section>
        )}

        <footer className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-200">
          Nota: usa la riprogrammazione ECU solo su veicoli autorizzati e nel rispetto delle normative locali su sicurezza, emissioni e omologazione.
        </footer>
      </div>
    </main>
  );
}
