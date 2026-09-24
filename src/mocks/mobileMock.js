// Mocks do app mobile (viaGuardian Mobile) — sessão simulada
// para a emulação web das telas React Native (ActiveDriving + Parked).

export const mobileDetectionsMock = [
  {
    id: 1,
    label: 'Buraco Profundo - 89%',
    anomaly_class: 'INFRA_BURACO_PROFUNDO',
    confidence_score: 0.8932,
    color: '#FBBF24',
    bgColor: 'rgba(251, 191, 36, 0.15)',
    top: '65%',
    left: '25%',
    width: 40,
    height: 30,
  },
  {
    id: 3,
    label: 'Pedestre - 78%',
    anomaly_class: 'ALVO_NEUTRO_PEDESTRE',
    confidence_score: 0.785,
    color: '#FFFFFF',
    bgColor: 'rgba(255, 255, 255, 0.15)',
    top: '38%',
    left: '68%',
    width: 22,
    height: 44,
  },
]

export const mobileSessionMock = {
  sessionStartedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
  distanceKm: 6.4,
  sessionXp: 245,
  alertCounts: {
    pothole: 4,
    faded_lane: 2,
    obstruction: 1,
    near_miss: 2,
    risk_behavior: 1,
  },
  pendingPayloads: [
    { anomaly_class: 'pothole', confidence_score: 0.89 },
    { anomaly_class: 'near_miss', confidence_score: 0.91 },
  ],
}

export const mobileLevelsMock = [
  { id: 'viajante', title: 'Viajante', icon: '🗺️', minXp: 0, maxXp: 199, color: '#3B82F6', desc: 'Iniciando a jornada cívica' },
  { id: 'protetor', title: 'Protetor', icon: '🛡️', minXp: 200, maxXp: 499, color: '#10B981', desc: 'Guardião ativo das vias' },
  { id: 'sentinela', title: 'Sentinela', icon: '👁️', minXp: 500, maxXp: Infinity, color: '#8B5CF6', desc: 'Sentinela de elite do tráfego' },
]

export const mobileBadgesMock = [
  { id: 'viajante', title: 'Viajante', icon: '🗺️', description: 'Completou uma sessão', color: '#3B82F6', unlocked: true },
  { id: 'protetor', title: 'Protetor', icon: '🛡️', description: 'Detectou 10+ anomalias', color: '#10B981', unlocked: true },
  { id: 'sentinela', title: 'Sentinela', icon: '👁️', description: 'Registrou evento crítico', color: '#8B5CF6', unlocked: true },
]

export const mobileClassMetaMock = [
  { key: 'pothole', label: 'Anomalias Geológicas', sublabel: 'Buracos e Depressões de Pavimento', icon: '⚠️', xpPerHit: 20, color: '#F59E0B', count: 4 },
  { key: 'faded_lane', label: 'Sinalização Comprometida', sublabel: 'Faixas e Marcações Apagadas', icon: '🚧', xpPerHit: 15, color: '#F59E0B', count: 2 },
  { key: 'obstruction', label: 'Obstrução de Via', sublabel: 'Bloqueios e Detritos na Pista', icon: '🚫', xpPerHit: 25, color: '#F59E0B', count: 1 },
  { key: 'near_miss', label: 'Eventos Críticos', sublabel: 'Quase-Colisões Detectadas', icon: '🔴', xpPerHit: 50, color: '#EF4444', count: 2, critical: true },
  { key: 'risk_behavior', label: 'Comportamento de Risco', sublabel: 'Manobras Perigosas Identificadas', icon: '⚡', xpPerHit: 30, color: '#EF4444', count: 1, critical: true },
]