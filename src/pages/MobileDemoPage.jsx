import { useEffect, useState } from 'react'
import {
  mobileBadgesMock,
  mobileClassMetaMock,
  mobileDetectionsMock,
  mobileLevelsMock,
  mobileSessionMock,
} from '../mocks/mobileMock'

// ─────────────────────────────────────────────────────────────────────────────
// Helpers de sessão (replicam a lógica do app mobile)
// ─────────────────────────────────────────────────────────────────────────────

function computeLevel(xp) {
  let level = mobileLevelsMock[0]
  for (const l of mobileLevelsMock) {
    if (xp >= l.minXp) level = l
  }
  return { level, nextLevel: null }
}

function totalAlerts(counts) {
  return Object.values(counts).reduce((acc, n) => acc + n, 0)
}

function totalXp(counts) {
  return mobileClassMetaMock.reduce((acc, meta) => acc + (counts[meta.key] ?? 0) * meta.xpPerHit, 0)
}

// ─────────────────────────────────────────────────────────────────────────────
// Tela 1/2 — ActiveDriving (câmera AR com bounding boxes)
// ─────────────────────────────────────────────────────────────────────────────

function DrivingScreen() {
  const [detections, setDetections] = useState([])

  useEffect(() => {
    const timer = setTimeout(() => setDetections(mobileDetectionsMock), 900)
    return () => clearTimeout(timer)
  }, [])

  return (
    <div className="relative flex h-full min-h-[560px] flex-col overflow-hidden bg-gray-900">
      {/* Fake câmera / estrada */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            'linear-gradient(180deg, rgba(15,23,42,0.35) 0%, transparent 35%, transparent 65%, rgba(15,23,42,0.6) 100%), radial-gradient(ellipse at 50% 105%, #1e293b 0%, #0f172a 55%)',
        }}
      >
        <div className="absolute inset-x-0 top-1/2 h-px bg-gray-200/5" />
        <div className="absolute left-1/2 top-0 h-full w-1.5 -translate-x-1/2 bg-gray-100/10" />
      </div>

      {/* HUD topo: telemetria reduzida */}
      <div className="absolute inset-x-0 top-0 flex gap-2 p-3">
        <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          IA Ativa
        </span>
        <span className="flex items-center gap-1.5 rounded-full bg-black/50 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
          <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
          GPS
        </span>
      </div>

      {/* Bounding boxes das detecções */}
      {detections.map((det) => (
        <div
          key={det.id}
          className="absolute rounded-md border-2"
          style={{
            top: det.top,
            left: det.left,
            width: `${det.width}%`,
            height: `${det.height}%`,
            borderColor: det.color,
            backgroundColor: det.bgColor,
          }}
        >
          <span
            className="absolute left-0 top-0 -translate-y-full rounded-t-md px-2 py-0.5 text-[10px] font-semibold"
            style={{ backgroundColor: det.color, color: '#000' }}
          >
            {det.label}
          </span>
        </div>
      ))}

      {/* HUD rodapé: zero-touch */}
      <div className="absolute inset-x-0 bottom-0 flex justify-center p-3">
        <div className="flex flex-col items-center rounded-2xl bg-black/60 px-5 py-3 backdrop-blur">
          <span className="text-base font-bold tabular-nums text-white">00:01:14</span>
          <span className="text-[11px] text-white/80">🔒 Zero-Touch ativo</span>
        </div>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Tela 2/2 — Parked (checkpoint gamificado pós-sessão)
// ─────────────────────────────────────────────────────────────────────────────

function ParkedScreen() {
  const xp = totalXp(mobileSessionMock.alertCounts)
  const { level } = computeLevel(xp)
  const high = mobileClassMetaMock.filter((m) => m.critical && (mobileSessionMock.alertCounts[m.key] ?? 0) > 0)
  const alertTotal = totalAlerts(mobileSessionMock.alertCounts)

  return (
    <div className="flex h-full min-h-[560px] flex-col gap-3 overflow-y-auto bg-gray-100 p-4">
      {/* Header do app mobile */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-blue-600">ViaGuardian</p>
          <p className="text-sm font-semibold text-gray-900">Intelligence Center</p>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1 text-[11px] font-semibold text-amber-700">
          <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
          PARADO
        </span>
      </div>

      {/* Banner XP */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center gap-3">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl border-2 text-2xl" style={{ borderColor: level.color }}>
            {level.icon}
          </div>
          <div>
            <p className="text-base font-bold" style={{ color: level.color }}>+{xp} XP</p>
            <p className="text-[11px] text-gray-500">XP ganhos nesta sessão</p>
          </div>
        </div>
        <p className="mt-3 text-xs text-gray-500">{level.desc}</p>
        <div className="mt-4 h-1.5 overflow-hidden rounded-full bg-gray-200">
          <div
            className="h-full rounded-full transition-all duration-700"
            style={{ width: `${Math.min(100, (xp % 200) / 2).toFixed(0)}%`, backgroundColor: level.color }}
          />
        </div>
        <p className="mt-2 text-center text-[11px] font-medium" style={{ color: level.color }}>
          ✦ Nível {level.title} alcançado ✦
        </p>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: `${mobileSessionMock.distanceKm.toFixed(1)} km`, label: 'Distância' },
          { value: '92/100', label: 'Score de Segurança', accent: '#22C55E' },
          { value: `+${xp} XP`, label: 'XP Ganho', accent: '#8B5CF6' },
          { value: '15 min', label: 'Duração' },
        ].map((kpi) => (
          <div key={kpi.label} className="rounded-2xl border border-gray-200 bg-white p-3 shadow-sm">
            <p className="text-lg font-bold" style={{ color: kpi.accent ?? '#3B82F6' }}>{kpi.value}</p>
            <p className="text-[11px] text-gray-500">{kpi.label}</p>
          </div>
        ))}
      </div>

      {/* Relatório de alertas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <div className="flex items-center justify-between">
          <p className="text-sm font-semibold text-gray-900">Relatório da Sessão</p>
          <span className="rounded-full bg-red-100 px-2.5 py-1 text-[11px] font-semibold text-red-600">
            {alertTotal} alerta(s)
          </span>
        </div>
        <div className="mt-3 space-y-2">
          {mobileClassMetaMock.map((meta) => {
            const count = mobileSessionMock.alertCounts[meta.key] ?? 0
            if (count === 0) return null
            return (
              <div key={meta.key} className="flex items-start gap-3 rounded-xl bg-gray-50 p-3">
                <span className="text-lg">{meta.icon}</span>
                <div className="flex-1">
                  <p className="flex items-center gap-2 text-xs font-semibold text-gray-800">
                    {meta.label}
                    {meta.critical && (
                      <span className="rounded-full bg-red-100 px-1.5 py-0.5 text-[9px] font-semibold text-red-600">CRÍTICO</span>
                    )}
                  </p>
                  <p className="text-[11px] text-gray-500">{meta.sublabel}</p>
                </div>
                <span className="text-xs font-bold tabular-nums" style={{ color: meta.color }}>×{count}</span>
              </div>
            )
          })}
        </div>
        <button className="mt-4 w-full rounded-xl bg-blue-600 py-2.5 text-sm font-semibold text-white transition-colors hover:bg-blue-500">
          Enviar Dados (Zero-Knowledge)
        </button>
        <p className="mt-2 text-center text-[10px] text-gray-400">🔐 Dados anonimizados na borda — nada sai sem seu consentimento</p>
      </div>

      {/* Conquistas */}
      <div className="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm">
        <p className="text-sm font-semibold text-gray-900">Conquistas</p>
        <div className="mt-3 grid grid-cols-3 gap-3">
          {mobileBadgesMock.map((badge) => (
            <div key={badge.id} className="flex flex-col items-center gap-1 rounded-xl border p-3 text-center" style={{ borderColor: badge.color }}>
              <span className="text-xl">{badge.icon}</span>
              <p className="text-[10px] font-semibold text-gray-800">{badge.title}</p>
              <p className="text-[9px] leading-tight text-gray-400">{badge.description}</p>
              <span className="flex h-4 w-4 items-center justify-center rounded-full text-[9px] text-white" style={{ backgroundColor: badge.color }}>✓</span>
            </div>
          ))}
        </div>
      </div>

      {/* Próximo upload */}
      {high.length > 0 && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-3">
          <p className="text-xs font-semibold text-red-700">
            ⚠️ {high.map((m) => m.label).join(' + ')} aguardando upload
          </p>
          <p className="mt-1 text-[10px] text-red-500">
            {high[0]?.count} evento(s) crítico(s) será(ão) priorizado(s) na fila de despacho tático.
          </p>
        </div>
      )}
    </div>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Página: emulação mobile (frame de celular com as 2 telas do app RN)
// ─────────────────────────────────────────────────────────────────────────────

export function MobileDemoPage() {
  const [screen, setScreen] = useState('driving')

  return (
    <section className="space-y-4">
      <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
        <h3 className="text-base font-semibold text-gray-900 dark:text-gray-100">Emulação do Aplicativo Mobile</h3>
        <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
          Preview do app React Native (ViaGuardian Mobile) executado em um frame de celular — fluxo Zero-Touch de
          detecção durante a direção e checkpoint gamificado ao estacionar.
        </p>
      </div>

      <div className="flex flex-col items-center gap-6 lg:flex-row lg:items-start lg:justify-center lg:gap-12">
        {/* Frame do celular */}
        <div className="w-full max-w-[360px] shrink-0">
          <div className="rounded-[2.5rem] border-[10px] border-gray-800 bg-gray-800 shadow-2xl">
            <div className="mx-auto my-1.5 h-5 w-28 rounded-full bg-gray-800" />
            <div className="overflow-hidden rounded-[1.9rem] bg-black">
              <div className="relative">
                {screen === 'driving' ? <DrivingScreen /> : <ParkedScreen />}
              </div>
            </div>
            <div className="h-1.5" />
          </div>

          <p className="mt-3 text-center text-xs text-gray-500 dark:text-gray-400">
            App: ViaGuardian Mobile · React Native · modo demo
          </p>
        </div>

        {/* Controles + explicação do fluxo */}
        <div className="w-full max-w-md">
          <div className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900">
            <div className="mb-4 grid grid-cols-2 gap-3">
              <button
                type="button"
                onClick={() => setScreen('driving')}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  screen === 'driving'
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                🚗 Em direção (AR)
              </button>
              <button
                type="button"
                onClick={() => setScreen('parked')}
                className={`rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                  screen === 'parked'
                    ? 'border-blue-600 bg-blue-600 text-white dark:border-blue-500 dark:bg-blue-500'
                    : 'border-gray-200 text-gray-600 hover:bg-gray-50 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800'
                }`}
              >
                🅿️ Parado (Rewards)
              </button>
            </div>

            {screen === 'driving' ? (
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">ActiveDriving — Zero-Touch</h4>
                <p>
                  A câmera traseira opera em modos <strong>IA Ativa</strong> (borda) + <strong>GPS</strong>. Detecções
                  recebem bounding boxes com classe de anomalia e confiança:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>🟡 <strong>Buraco Profundo</strong> (89%) — infraestrutura de via</li>
                  <li>⚪ <strong>Pedestre</strong> (78%) — alvo neutro (não gera alerta)</li>
                </ul>
                <p>
                  🔒 <strong>Zero-Touch:</strong> motorista não interage com o celular; detecções são registradas em
                  batch anonimizado (fingerprint criptográfico, sem dados pessoais).
                </p>
              </div>
            ) : (
              <div className="space-y-3 text-sm text-gray-600 dark:text-gray-300">
                <h4 className="font-semibold text-gray-900 dark:text-gray-100">Parked — Checkpoint Gamificado</h4>
                <p>
                  Ao estacionar, a sessão é consolidada em <strong>gamificação</strong> para recompensar o engajamento cívico:
                </p>
                <ul className="list-disc space-y-1 pl-5">
                  <li>🛡️ Níveis de XP: Viajante (0–199) → Protetor (200–499) → Sentinela (500+)</li>
                  <li>📊 KPIs: distância, score de segurança, XP ganho e duração</li>
                  <li>🏅 Conquistas: Viajante, Protetor e Sentinela</li>
                  <li>📤 <strong>Upload zero-knowledge:</strong> eventos críticos priorizados no despacho tático</li>
                </ul>
              </div>
            )}

            <div className="mt-4 flex items-start gap-2 rounded-xl bg-blue-50 p-3 text-xs text-blue-700 dark:bg-blue-950 dark:text-blue-300">
              <span>💡</span>
              <p>
                As duas telas são emulações web das telas React Native em <code className="rounded bg-blue-100 px-1 dark:bg-blue-900">mobile/src/screens/</code>.
                No Vercel, o app mobile real continua rodando apenas no dispositivo físico.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}