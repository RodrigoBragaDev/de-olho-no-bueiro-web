'use client';

import { useState, useMemo } from 'react';
import dynamic from 'next/dynamic';
import FloodAreaInfoCard from './FloodAreaInfoCard';
import ManholeInfoCard from './ManholeInfoCard';
import MapItemsTable from './MapItemsTable';
import ExportBar from './ExportBar';
import MonthFilter from './MonthFilter';
import { MOCK_FLOOD_AREAS, MOCK_MANHOLES, MOCK_CENTER, MOCK_ZOOM } from '@/features/map/__mocks__/mockFloodAreas';
import type { FloodArea, Manhole } from '@/features/map/models/MapTypes';
import './MapScreen.css';

// Leaflet não funciona com SSR — carregamento apenas no cliente
const MapView = dynamic(() => import('@/core/components/organisms/MapView'), {
  ssr: false,
  loading: () => <div className="map-loading">Carregando mapa...</div>,
});

// ─── MOCK DE DESENVOLVIMENTO ──────────────────────────────────────────────────
// TODO: substituir por dados reais vindos do backend
const allFloodAreas: FloodArea[] = MOCK_FLOOD_AREAS;
const allManholes: Manhole[] = MOCK_MANHOLES;
const mapCenter = MOCK_CENTER;
const mapZoom = MOCK_ZOOM;
// ──────────────────────────────────────────────────────────────────────────────

function getYearMonth(iso: string): { year: number; month: number } {
  const d = new Date(iso);
  return { year: d.getUTCFullYear(), month: d.getUTCMonth() + 1 };
}

function getInitialSelection(floodAreas: FloodArea[], manholes: Manhole[]) {
  const all = [
    ...floodAreas.map((f) => getYearMonth(f.dataHora)),
    ...manholes.map((m) => getYearMonth(m.dataHora)),
  ];
  // Mais recente primeiro
  all.sort((a, b) => b.year - a.year || b.month - a.month);
  return all[0] ?? { year: new Date().getUTCFullYear(), month: new Date().getUTCMonth() + 1 };
}

export default function MapScreen() {
  const initial = useMemo(() => getInitialSelection(allFloodAreas, allManholes), []);
  const [selectedYear, setSelectedYear] = useState(initial.year);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = todos os meses
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');

  // Anos disponíveis em todos os dados
  const availableYears = useMemo(() => {
    const years = new Set([
      ...allFloodAreas.map((f) => getYearMonth(f.dataHora).year),
      ...allManholes.map((m) => getYearMonth(m.dataHora).year),
    ]);
    return Array.from(years).sort((a, b) => b - a);
  }, []);

  // Meses disponíveis para o ano selecionado
  const availableMonths = useMemo(() => {
    const months = new Set([
      ...allFloodAreas
        .filter((f) => getYearMonth(f.dataHora).year === selectedYear)
        .map((f) => getYearMonth(f.dataHora).month),
      ...allManholes
        .filter((m) => getYearMonth(m.dataHora).year === selectedYear)
        .map((m) => getYearMonth(m.dataHora).month),
    ]);
    return Array.from(months).sort((a, b) => b - a);
  }, [selectedYear]);

  // Quando o ano muda, reseta para "todos os meses"
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(0);
  };

  // Dados filtrados pelo ano e, opcionalmente, pelo mês selecionado (0 = todos)
  const filteredFloodAreas = useMemo(() =>
    allFloodAreas.filter((f) => {
      const { year, month } = getYearMonth(f.dataHora);
      return year === selectedYear && (selectedMonth === 0 || month === selectedMonth);
    }), [selectedYear, selectedMonth]);

  const filteredManholes = useMemo(() =>
    allManholes.filter((m) => {
      const { year, month } = getYearMonth(m.dataHora);
      return year === selectedYear && (selectedMonth === 0 || month === selectedMonth);
    }), [selectedYear, selectedMonth]);

  return (
    <div className="map-screen-page">
      <div className="map-screen-top-controls">
        <MonthFilter
          availableYears={availableYears}
          availableMonths={availableMonths}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
          onYearChange={handleYearChange}
          onMonthChange={setSelectedMonth}
        />
        <ExportBar 
          floodAreas={filteredFloodAreas} 
          manholes={filteredManholes}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      </div>

      <div className="map-screen-container">
        <MapView center={mapCenter} zoom={mapZoom} floodAreas={filteredFloodAreas} manholes={filteredManholes} />
      </div>

      <div className="map-screen-view-toggle">
        <button 
          className={`view-toggle-btn ${viewMode === 'cards' ? 'active' : ''}`}
          onClick={() => setViewMode('cards')} 
          title="Visualização em Cards"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <rect x="3" y="3" width="7" height="7"></rect>
            <rect x="14" y="3" width="7" height="7"></rect>
            <rect x="14" y="14" width="7" height="7"></rect>
            <rect x="3" y="14" width="7" height="7"></rect>
          </svg>
        </button>
        <button 
          className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
          onClick={() => setViewMode('table')} 
          title="Visualização em Tabela"
        >
          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <line x1="8" y1="6" x2="21" y2="6"></line>
            <line x1="8" y1="12" x2="21" y2="12"></line>
            <line x1="8" y1="18" x2="21" y2="18"></line>
            <line x1="3" y1="6" x2="3.01" y2="6"></line>
            <line x1="3" y1="12" x2="3.01" y2="12"></line>
            <line x1="3" y1="18" x2="3.01" y2="18"></line>
          </svg>
        </button>
      </div>

      <div className="map-screen-info">
        {viewMode === 'table' ? (
          <MapItemsTable floodAreas={filteredFloodAreas} manholes={filteredManholes} />
        ) : (
          <>
            {filteredFloodAreas.map((fa) => (
              <FloodAreaInfoCard key={fa.id} floodArea={fa} />
            ))}
            {filteredManholes.map((m) => (
              <ManholeInfoCard key={m.id} manhole={m} />
            ))}
          </>
        )}
      </div>
    </div>
  );
}
