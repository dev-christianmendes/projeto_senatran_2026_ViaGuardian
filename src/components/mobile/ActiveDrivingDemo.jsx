import { useEffect, useState } from 'react'

// ─────────────────────────────────────────────────────────────────────────────
// Fala pt-BR via Web Speech API (emula o TTS do app React Native)
// ─────────────────────────────────────────────────────────────────────────────

function speak(text) {
  if (!('speechSynthesis' in window)) return
  window.speechSynthesis.cancel()
  const utterance = new SpeechSynthesisUtterance(text)
  utterance.lang = 'pt-BR'
  utterance.rate = 0.52
  utterance.pitch = 1.05
  const voices = window.speechSynthesis.getVoices()
  const ptVoice = voices.find((v) => v.lang.toLowerCase().startsWith('pt'))
  if (ptVoice) utterance.voice = ptVoice
  window.speechSynthesis.speak(utterance)
}

// Mensagens de voz (espelham mobile/src/utils/multimodalAlert.js)
const TTS_MESSAGES = {
  near_miss: 'Atenção! Veículo próximo detectado. Reduza a velocidade.',
  risk_behavior: 'Atenção! Comportamento de risco identificado à frente.',
  pothole: 'Anomalia na via detectada.',
  faded_lane: 'Sinalização comprometida à frente.',
  obstruction: 'Obstrução na pista detectada.',
}

// ─────────────────────────────────────────────────────────────────────────────
// Cenários rotativos da emulação AR
// ─────────────────────────────────────────────────────────────────────────────

const SCENARIOS = [
  {
    id: 'clear',
    label: 'Via livre',
    tts: null,
    critical: false,
    audioLabel: 'Padrão háptico: —',
    boundingBoxes: [],
  },
  {
    id: 'pedestrian',
    label: 'Pedestre a 8 m',
    tts: null,
    critical: false,
    audioLabel: 'Alvo neutro — sem alerta multimodal',
    boundingBoxes: [
      { label: 'Pedestre - 78%', color: '#FFFFFF', bgColor: 'rgba(255,255,255,0.15)', top: '32%', left: '70%', width: 11, height: 26 },
    ],
  },
  {
    id: 'pothole',
    label: 'Buraco profundo na pista',
    tts: TTS_MESSAGES.pothole,
    critical: false,
    audioLabel: '📳 Háptico de aviso · pulso único moderado (200ms)',
    boundingBoxes: [
      { label: 'Buraco Profundo - 89%', color: '#FBBF24', bgColor: 'rgba(251,191,36,0.15)', top: '70%', left: '30%', width: 30, height: 14 },
    ],
  },
  {
    id: 'near_miss',
    label: 'Veículo tangenciando à frente',
    tts: TTS_MESSAGES.near_miss,
    critical: true,
    audioLabel: '📳 Háptico CRÍTICO · longo–curto–curto (SOS)',
    boundingBoxes: [
      { label: 'Quase-acidente - 94%', color: '#EF4444', bgColor: 'rgba(239,68,68,0.18)', top: '54%', left: '33%', width: 34, height: 30, proximity: true },
    ],
  },
  {
    id: 'faded_lane',
    label: 'Faixa de sinalização apagada',
    tts: TTS_MESSAGES.faded_lane,
    critical: false,
    audioLabel: '📳 Háptico de aviso · pulso único moderado (200ms)',
    boundingBoxes: [
      { label: 'Sinalização Apagada - 72%', color: '#60A5FA', bgColor: 'rgba(96,165,250,0.12)', top: '42%', left: '28%', width: 44, height: 6 },
    ],
  },
  {
    id: 'obstruction',
    label: 'Obstrução à frente',
    tts: TTS_MESSAGES.obstruction,
    critical: false,
    audioLabel: '📳 Háptico de aviso · pulso único moderado (200ms)',
    boundingBoxes: [
      { label: 'Obstrução de Via - 85%', color: '#F97316', bgColor: 'rgba(249,115,22,0.15)', top: '50%', left: '46%', width: 26, height: 24 },
    ],
  },
  {
    id: 'risk_behavior',
    label: 'Motocicleta cortando à frente',
    tts: TTS_MESSAGES.risk_behavior,
    critical: true,
    audioLabel: '📳 Háptico CRÍTICO · longo–curto–curto (SOS)',
    boundingBoxes: [
      { label: 'Comportamento de Risco - 81%', color: '#EF4444', bgColor: 'rgba(239,68,68,0.18)', top: '56%', left: '18%', width: 24, height: 20, proximity: true },
    ],
  },
]

const SCENARIO_DURATION_MS = 6000

// ─────────────────────────────────────────────────────────────────────────────
// Cena de rua (SVG) — visão em perspectiva a partir do guidão da moto
// ─────────────────────────────────────────────────────────────────────────────

function RoadScene({ activeCar }) {
  return (
    <svg viewBox="0 0 400 760" className="h-full w-full" preserveAspectRatio="xMidYMid slice">
      {/* Céu */}
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#38bdf8" />
          <stop offset="100%" stopColor="#bae6fd" />
        </linearGradient>
        <linearGradient id="asphalt" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#475569" />
          <stop offset="100%" stopColor="#1e293b" />
        </linearGradient>
        <linearGradient id="sidewalk" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#cbd5e1" />
          <stop offset="100%" stopColor="#94a3b8" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="400" height="760" fill="url(#sky)" />

      {/* Sol + nuvens */}
      <circle cx="330" cy="60" r="26" fill="#fde047" opacity="0.9" />
      <circle cx="330" cy="60" r="36" fill="#fde047" opacity="0.25" />
      <g fill="#ffffff" opacity="0.85">
        <ellipse cx="90" cy="80" rx="46" ry="18" />
        <ellipse cx="125" cy="72" rx="34" ry="15" />
        <ellipse cx="250" cy="110" rx="40" ry="14" />
      </g>

      {/* Linha do horizonte: prédios */}
      <g>
        <rect x="10" y="180" width="60" height="120" fill="#94a3b8" />
        <rect x="80" y="160" width="50" height="140" fill="#64748b" />
        <rect x="150" y="190" width="42" height="110" fill="#7c8ba1" />
        <rect x="260" y="170" width="48" height="130" fill="#64748b" />
        <rect x="315" y="185" width="55" height="115" fill="#94a3b8" />
      </g>

      {/* Calçadas (esquerda e direita convergindo) */}
      <polygon points="0,300 130,300 60,760 0,760" fill="url(#sidewalk)" />
      <polygon points="400,300 270,300 340,760 400,760" fill="url(#sidewalk)" />

      {/* Pista */}
      <polygon points="130,300 270,300 340,760 60,760" fill="url(#asphalt)" />

      {/* Faixas centrais pontilhadas */}
      <g stroke="#e2e8f0" strokeWidth="4" strokeDasharray="22 26" fill="none" opacity="0.85">
        <line x1="200" y1="300" x2="200" y2="760" />
      </g>

      {/* Meio-fio */}
      <polygon points="128,300 132,300 62,760 58,760" fill="#e2e8f0" />
      <polygon points="272,300 268,300 338,760 342,760" fill="#e2e8f0" />

      {/* Árvores nos passeios */}
      <g>
        <rect x="36" y="330" width="10" height="46" fill="#78350f" />
        <circle cx="41" cy="318" r="26" fill="#16a34a" />
        <circle cx="56" cy="330" r="18" fill="#22c55e" />
        <rect x="360" y="345" width="10" height="42" fill="#78350f" />
        <circle cx="365" cy="332" r="24" fill="#16a34a" />
      </g>

      {/* Poste de iluminação */}
      <g>
        <rect x="306" y="330" width="5" height="70" fill="#334155" />
        <path d="M306 336 L322 330" stroke="#334155" strokeWidth="4" fill="none" />
        <ellipse cx="324" cy="330" rx="5" ry="4" fill="#fde047" />
      </g>

      {/* Semáforo à direita */}
      <g>
        <rect x="378" y="300" width="6" height="80" fill="#334155" />
        <rect x="376" y="290" width="12" height="30" rx="3" fill="#1e293b" />
        <circle cx="382" cy="298" r="3.2" fill="#22c55e" />
        <circle cx="382" cy="308" r="3.2" fill="#334155" />
        <circle cx="382" cy="316" r="3.2" fill="#334155" />
      </g>

      {/* Carro em movimento (faixa da esquerda) */}
      <g transform="translate(140, 420)">
        <rect x="0" y="10" width="46" height="16" rx="6" fill="#0ea5e9" />
        <rect x="10" y="0" width="22" height="14" rx="6" fill="#7dd3fc" />
        <circle cx="12" cy="28" r="5" fill="#0f172a" />
        <circle cx="34" cy="28" r="5" fill="#0f172a" />
        <ellipse cx="24" cy="30" rx="20" ry="2.5" fill="#1e293b" opacity="0.6" />
      </g>

      {/* Carro à frente (alvo do near_miss) */}
      <g transform={activeCar ? 'translate(172, 458) scale(1.14)' : 'translate(174, 468)'}>
        <rect x="0" y="12" width="52" height="20" rx="7" fill="#dc2626" />
        <rect x="11" y="0" width="26" height="16" rx="7" fill="#fca5a5" />
        <ellipse cx="26" cy="26" rx="28" ry="4" fill="#b91c1c" opacity="0.5" />
        <circle cx="14" cy="34" r="6" fill="#0f172a" />
        <circle cx="38" cy="34" r="6" fill="#0f172a" />
        <ellipse cx="26" cy="37" rx="24" ry="3" fill="#1e293b" opacity="0.7" />
      </g>

      {/* Motocicleta cortando (alvo do risk_behavior) */}
      <g transform="translate(120, 480) rotate(-12)">
        <ellipse cx="10" cy="10" rx="16" ry="9" fill="#0f172a" />
        <circle cx="6" cy="6" r="3.2" fill="#cbd5e1" />
        <ellipse cx="10" cy="10" rx="14" ry="7" fill="#334155" />
        <rect x="-4" y="0" width="4" height="18" rx="2" fill="#f59e0b" />
        <circle cx="-2" cy="2" r="4" fill="#fbbf24" />
      </g>

      {/* Carro estacionado (faixa da direita) */}
      <g transform="translate(252, 380)">
        <rect x="0" y="12" width="48" height="18" rx="7" fill="#eab308" />
        <rect x="10" y="2" width="24" height="14" rx="7" fill="#fde68a" />
        <circle cx="13" cy="32" r="5.5" fill="#0f172a" />
        <circle cx="35" cy="32" r="5.5" fill="#0f172a" />
      </g>

      {/* Pedestres nos passeios */}
      <g>
        <circle cx="96" cy="366" r="8" fill="#fcd34d" />
        <rect x="92" y="374" width="9" height="22" rx="3" fill="#60a5fa" />
        <line x1="91" y1="390" x2="89" y2="396" stroke="#60a5fa" strokeWidth="3" />
        <line x1="102" y1="390" x2="103" y2="396" stroke="#60a5fa" strokeWidth="3" />

        <circle cx="330" cy="420" r="7" fill="#fca5a5" />
        <rect x="326" y="427" width="8" height="20" rx="3" fill="#fb923c" />
        <line x1="325" y1="441" x2="323" y2="447" stroke="#fb923c" strokeWidth="3" />
        <line x1="335" y1="441" x2="336" y2="447" stroke="#fb923c" strokeWidth="3" />

        <circle cx="30" cy="520" r="8" fill="#86efac" />
        <rect x="26" y="528" width="8" height="22" rx="3" fill="#a78bfa" />
        <line x1="25" y1="544" x2="23" y2="550" stroke="#a78bfa" strokeWidth="3" />
        <line x1="35" y1="544" x2="36" y2="550" stroke="#a78bfa" strokeWidth="3" />
      </g>

      {/* Placa de sinalização */}
      <g>
        <rect x="18" y="440" width="5" height="46" fill="#334155" />
        <rect x="4" y="432" width="34" height="38" rx="4" fill="#facc15" opacity="0.95" />
        <text x="21" y="452" textAnchor="middle" fontSize="10" fontWeight="700" fill="#0f172a">SP</text>
        <text x="21" y="462" textAnchor="middle" fontSize="7" fontWeight="600" fill="#0f172a">021</text>
      </g>

      {/* Linhas de borda da pista */}
      <g stroke="#f8fafc" strokeWidth="3" fill="none" opacity="0.7">
        <line x1="132" y1="300" x2="64" y2="760" />
        <line x1="268" y1="300" x2="336" y2="760" />
      </g>
    </svg>
  )
}

// ─────────────────────────────────────────────────────────────────────────────
// Cronômetro do modo Zero-Touch
// ─────────────────────────────────────────────────────────────────────────────

function formatTimer(totalSeconds) {
  const h = Math.floor(totalSeconds / 3600)
  const m = Math.floor((totalSeconds % 3600) / 60)
  const s = totalSeconds % 60
  const mm = String(m).padStart(2, '0')
  const ss = String(s).padStart(2, '0')
  return h > 0 ? `${String(h).padStart(2, '0')}:${mm}:${ss}` : `${mm}:${ss}`
}

// ─────────────────────────────────────────────────────────────────────────────
// Tela 1/2 — ActiveDriving (emulação AR com cena de rua e alarmes)
// ─────────────────────────────────────────────────────────────────────────────

export function ActiveDrivingDemo() {
  const [scenarioIndex, setScenarioIndex] = useState(0)
  const [elapsed, setElapsed] = useState(0)
  const [audioOn, setAudioOn] = useState(false)
  const [totalAlerts, setTotalAlerts] = useState(0)

  const scenario = SCENARIOS[scenarioIndex]

  // Cronômetro (Zero-Touch tracker)
  useEffect(() => {
    const id = setInterval(() => setElapsed((t) => t + 1), 1000)
    return () => clearInterval(id)
  }, [])

  // Rotação de cenários
  useEffect(() => {
    const id = setTimeout(() => {
      const next = (scenarioIndex + 1) % SCENARIOS.length
      if (SCENARIOS[next].critical) setTotalAlerts((n) => n + 1)
      setScenarioIndex(next)
    }, SCENARIO_DURATION_MS)
    return () => clearTimeout(id)
  }, [scenarioIndex])

  // Dispara alerta multimodal ao mudar de cenário (apenas fala; contagem é feita no timer)
  useEffect(() => {
    const s = SCENARIOS[scenarioIndex]
    if (s.tts && audioOn) speak(s.tts)
  }, [scenarioIndex, audioOn])

  return (
    <div
      className="relative flex h-full min-h-[560px] flex-col overflow-hidden bg-gray-900 transition-all"
      style={scenario.critical ? { boxShadow: 'inset 0 0 90px rgba(239,68,68,0.55)' } : undefined}
    >
      {/* Cena de rua */}
      <div className="absolute inset-0">
        <RoadScene activeCar={scenario.id === 'near_miss'} />
      </div>

      {/* Borda de alerta crítico */}
      {scenario.critical && (
        <div className="pointer-events-none absolute inset-0 animate-pulse border-4 border-red-500/80" />
      )}

      {/* HUD topo: telemetria reduzida */}
      <div className="absolute inset-x-0 top-0 flex items-start justify-between gap-2 p-3">
        <div className="flex gap-2">
          <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            IA Ativa
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-green-500" />
            GPS
          </span>
          <span className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur">
            <span className="h-1.5 w-1.5 rounded-full bg-blue-400" />
            46 km/h
          </span>
        </div>
        <button
          type="button"
          onClick={() => {
            const next = !audioOn
            setAudioOn(next)
            if (next && scenario.tts) speak(scenario.tts)
          }}
          className="flex items-center gap-1.5 rounded-full bg-black/55 px-3 py-1 text-[11px] font-medium text-white backdrop-blur transition-colors hover:bg-black/75"
          title="Ativa/desativa os alertas de voz (TTS emulados via Web Speech API)"
        >
          {audioOn ? '🔊' : '🔇'} Voz {audioOn ? 'on' : 'off'}
        </button>
      </div>

      {/* Rótulo do cenário */}
      <div className="absolute left-3 top-14 rounded-lg bg-black/55 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
        {scenario.critical ? '⚠ ' : ''}
        {scenario.label}
      </div>

      {/* Bounding boxes das detecções */}
      {scenario.boundingBoxes.map((det, index) => (
        <div
          key={`${scenario.id}-${index}`}
          className="pointer-events-none absolute rounded-md border-2"
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
          {det.proximity && (
            <span className="absolute bottom-1 right-1 flex gap-1">
              <span className="h-1.5 w-1.5 animate-ping rounded-full bg-red-500" />
              <span className="h-1.5 w-1.5 rounded-full bg-red-500" />
            </span>
          )}
        </div>
      ))}

      {/* Alarme de proximidade (crítico) */}
      {scenario.critical && scenario.tts && (
        <div className="absolute inset-x-0 top-1/3 flex justify-center">
          <div className="flex flex-col items-center gap-1.5 rounded-2xl border border-red-500/70 bg-red-950/85 px-6 py-4 text-center backdrop-blur">
            <span className="text-2xl">🚨</span>
            <span className="text-sm font-bold text-red-100">RISCO DE PROXIMIDADE</span>
            <span className="text-[11px] leading-tight text-red-200/90">{scenario.tts}</span>
            <span className="mt-1 rounded-full bg-red-500/30 px-3 py-1 text-[10px] font-semibold text-red-100">
              {scenario.audioLabel}
            </span>
          </div>
        </div>
      )}

      {/* Canal de voz (não-crítico) */}
      {scenario.tts && !scenario.critical && (
        <div className="absolute inset-x-0 top-1/2 flex justify-center">
          <div className="flex flex-col items-center gap-1 rounded-xl bg-black/60 px-4 py-2.5 text-center backdrop-blur">
            <span className="flex items-center gap-1.5 text-[11px] font-semibold text-white">
              {audioOn ? '🔊' : '🔇'} {scenario.tts}
            </span>
            <span className="text-[10px] text-white/70">{scenario.audioLabel}</span>
          </div>
        </div>
      )}

      {/* Rodapé: lockdown tracker */}
      <div className="absolute inset-x-0 bottom-0 flex flex-col items-center gap-1.5 p-3">
        <div className="flex flex-col items-center rounded-2xl bg-black/60 px-6 py-3 backdrop-blur">
          <span className="text-base font-bold tabular-nums text-white">{formatTimer(elapsed)}</span>
          <span className="text-[11px] text-white/80">🔒 Zero-Touch ativo</span>
        </div>
        <span className="rounded-full bg-black/50 px-3 py-1 text-[10px] font-medium text-white/80 backdrop-blur">
          {SCENARIOS.length} cenários · {totalAlerts} alerta(s) crítico(s) na sessão
        </span>
      </div>
    </div>
  )
}