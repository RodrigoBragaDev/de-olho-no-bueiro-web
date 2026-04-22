export type NivelAlagamento = 'baixo' | 'leve' | 'medio' | 'grave';

export interface Coordenada {
  latitude: number;
  longitude: number;
}

export interface FloodArea {
  id: string;
  coordinates: Coordenada[];
  nivel: NivelAlagamento;
  descricao?: string;
  endereco?: string;
  dataHora: string;
}

export interface Manhole {
  id: string;
  latitude: number;
  longitude: number;
  descricao?: string;
  endereco?: string;
  dataHora: string;
}

export const NIVEL_LABELS: Record<NivelAlagamento, string> = {
  baixo: 'Baixo',
  leve: 'Leve',
  medio: 'Médio',
  grave: 'Grave',
};

export const NIVEL_COLORS: Record<NivelAlagamento, { fill: string; stroke: string; badge: string }> = {
  baixo:  { fill: 'rgba(0, 0, 0, 0.3)',       stroke: 'rgba(0, 0, 0, 0.6)',       badge: '#555555' },
  leve:   { fill: 'rgba(255, 235, 59, 0.4)',   stroke: 'rgba(255, 235, 59, 0.8)',  badge: '#f9a825' },
  medio:  { fill: 'rgba(255, 152, 0, 0.4)',    stroke: 'rgba(255, 152, 0, 0.8)',   badge: '#e65100' },
  grave:  { fill: 'rgba(244, 67, 54, 0.4)',    stroke: 'rgba(244, 67, 54, 0.8)',   badge: '#b71c1c' },
};
