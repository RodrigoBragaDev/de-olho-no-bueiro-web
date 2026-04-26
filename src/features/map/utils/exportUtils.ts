import type { FloodArea, Manhole } from '@/features/map/models/MapTypes';

export interface MonthGroup {
  key: string;        // ex: "2026-03"
  label: string;      // ex: "Março/2026"
  floodAreas: FloodArea[];
  manholes: Manhole[];
}

export const MONTH_NAMES = [
  'Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho',
  'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro',
];

function monthKey(iso: string): string {
  const d = new Date(iso);
  const y = d.getUTCFullYear();
  const m = String(d.getUTCMonth() + 1).padStart(2, '0');
  return `${y}-${m}`;
}

function monthLabel(key: string): string {
  const [year, month] = key.split('-');
  return `${MONTH_NAMES[parseInt(month) - 1]}/${year}`;
}

export function groupByMonth(floodAreas: FloodArea[], manholes: Manhole[]): MonthGroup[] {
  const map = new Map<string, MonthGroup>();

  for (const fa of floodAreas) {
    const key = monthKey(fa.dataHora);
    if (!map.has(key)) map.set(key, { key, label: monthLabel(key), floodAreas: [], manholes: [] });
    map.get(key)!.floodAreas.push(fa);
  }

  for (const m of manholes) {
    const key = monthKey(m.dataHora);
    if (!map.has(key)) map.set(key, { key, label: monthLabel(key), floodAreas: [], manholes: [] });
    map.get(key)!.manholes.push(m);
  }

  // Ordem cronológica decrescente
  return Array.from(map.values()).sort((a, b) => b.key.localeCompare(a.key));
}

export function exportMonthAsJson(group: MonthGroup): void {
  const payload = {
    mes: group.label,
    exportadoEm: new Date().toISOString(),
    alagamentos: group.floodAreas,
    bueiros: group.manholes,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `donb-${group.key}.json`;
  a.click();
  URL.revokeObjectURL(url);
}

export function exportDataAsJson(floodAreas: FloodArea[], manholes: Manhole[]): void {
  const payload = {
    exportadoEm: new Date().toISOString(),
    alagamentos: floodAreas,
    bueiros: manholes,
  };

  const blob = new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  
  const dateStr = new Date().toISOString().split('T')[0];
  a.download = `donb-export-${dateStr}.json`;
  a.click();
  URL.revokeObjectURL(url);
}
