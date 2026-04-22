// ─── MOCK DE DESENVOLVIMENTO ──────────────────────────────────────────────────
// TODO: remover este arquivo e substituir por dados reais do backend

import type { FloodArea, Manhole } from '@/features/map/models/MapTypes';

export const MOCK_FLOOD_AREAS: FloodArea[] = [
  {
    id: 'mock-001',
    nivel: 'grave',
    descricao: 'Alagamento severo causado por chuvas intensas. Via completamente intransponível.',
    endereco: 'Av. Santos Dumont, Aldeota — Fortaleza, CE',
    dataHora: '2026-04-21T14:30:00.000Z',
    coordinates: [
      { latitude: -3.7260, longitude: -38.5100 },
      { latitude: -3.7300, longitude: -38.5100 },
      { latitude: -3.7300, longitude: -38.5130 },
      { latitude: -3.7260, longitude: -38.5130 },
    ],
  },
  {
    id: 'mock-002',
    nivel: 'leve',
    descricao: 'Lâmina d\'água cobre a rua, trânsito lento mas transitável com cuidado.',
    endereco: 'R. Tibúrcio Cavalcante, Meireles — Fortaleza, CE',
    dataHora: '2026-03-15T11:15:00.000Z',
    coordinates: [
      { latitude: -3.7340, longitude: -38.4980 },
      { latitude: -3.7370, longitude: -38.4980 },
      { latitude: -3.7370, longitude: -38.5010 },
      { latitude: -3.7340, longitude: -38.5010 },
    ],
  },
];

// Centro calculado para o mapa exibir as duas áreas mockadas
export const MOCK_CENTER: [number, number] = [-3.7320, -38.5055];
export const MOCK_ZOOM = 14;

export const MOCK_MANHOLES: Manhole[] = [
  {
    id: 'mock-manhole-001',
    latitude: -3.7295,
    longitude: -38.5060,
    descricao: 'Bueiro sem tampa, risco de queda para pedestres. Situação agravada pela chuva.',
    endereco: 'R. Osvaldo Cruz, 210 — Meireles, Fortaleza, CE',
    dataHora: '2026-03-28T09:45:00.000Z',
  },
  {
    id: 'mock-manhole-002',
    latitude: -3.7248,
    longitude: -38.5172,
    descricao: 'Bueiro entupido causando acúmulo de água na calçada. Tampa parcialmente deslocada.',
    endereco: 'Av. Abolição, 1540 — Meireles, Fortaleza, CE',
    dataHora: '2026-04-21T08:20:00.000Z',
  },
];
// ──────────────────────────────────────────────────────────────────────────────
