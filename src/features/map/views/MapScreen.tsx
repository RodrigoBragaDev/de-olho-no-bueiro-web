'use client';

import { useState, useMemo, useEffect } from 'react';
import dynamic from 'next/dynamic';
import FloodAreaInfoCard from './FloodAreaInfoCard';
import ManholeInfoCard from './ManholeInfoCard';
import MapItemsTable from './MapItemsTable';
import ExportBar from './ExportBar';
import MonthFilter from './MonthFilter';
import { MOCK_FLOOD_AREAS, MOCK_MANHOLES, MOCK_CENTER, MOCK_ZOOM } from '@/features/map/__mocks__/mockFloodAreas';
import type { FloodArea, Manhole } from '@/features/map/models/MapTypes';
import { fetchWithAuth } from '@/core/utils/api';
import './MapScreen.css';

// Leaflet não funciona com SSR — carregamento apenas no cliente
const MapView = dynamic(() => import('@/core/components/organisms/MapView'), {
  ssr: false,
  loading: () => <div className="map-loading">Carregando mapa...</div>,
});

const mapCenter = MOCK_CENTER;
const mapZoom = MOCK_ZOOM;

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
  const [allFloodAreas, setAllFloodAreas] = useState<FloodArea[]>([]);
  const [allManholes, setAllManholes] = useState<Manhole[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const initial = useMemo(() => getInitialSelection(allFloodAreas, allManholes), [allFloodAreas, allManholes]);
  const [selectedYear, setSelectedYear] = useState(0);
  const [selectedMonth, setSelectedMonth] = useState<number>(0); // 0 = todos os meses
  const [viewMode, setViewMode] = useState<'cards' | 'table'>('cards');
  const [mapFocus, setMapFocus] = useState<{ latitude: number; longitude: number; timestamp: number } | null>(null);

  // Estados de Busca e Paginação
  const [searchQuery, setSearchQuery] = useState('');
  const [pageSize, setPageSize] = useState(10);
  const [currentPage, setCurrentPage] = useState(1);
  const [sortConfig, setSortConfig] = useState<{ key: string; direction: 'asc' | 'desc' }>({
    key: 'dataHora',
    direction: 'desc',
  });

  const handleSort = (key: string) => {
    setSortConfig((prev) => ({
      key,
      direction: prev.key === key && prev.direction === 'desc' ? 'asc' : 'desc',
    }));
  };

  const handleFocus = (lat: number, lng: number) => {
    setMapFocus({ latitude: lat, longitude: lng, timestamp: Date.now() });
    
    // Scroll suave para o topo se estiver em mobile
    if (window.innerWidth < 768) {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  // Resetar página ao mudar filtros ou busca
  useEffect(() => {
    setCurrentPage(1);
  }, [selectedYear, selectedMonth, searchQuery, pageSize]);

  // Ajusta o ano inicial quando os dados carregam pela primeira vez
  useEffect(() => {
    if (selectedYear === 0 && initial.year !== new Date().getUTCFullYear()) {
      setSelectedYear(initial.year);
    } else if (selectedYear === 0) {
      setSelectedYear(new Date().getUTCFullYear());
    }
  }, [initial, selectedYear]);

  // Carregamento de dados (Mock por padrão, use API apenas se flag for 'false')
  useEffect(() => {
    const isMock = process.env.NEXT_PUBLIC_MOCK_ENABLED !== 'false';

    if (isMock) {
      setAllFloodAreas(MOCK_FLOOD_AREAS);
      setAllManholes(MOCK_MANHOLES);
      setIsLoading(false);
      return;
    }

    async function loadData() {
      try {
        const [respAreas, respManholes] = await Promise.all([
          fetchWithAuth('/api/web/v1/flood-areas'),
          fetchWithAuth('/api/web/v1/manholes'),
        ]);

        const [areasRaw, manholesRaw] = await Promise.all([
          respAreas.json(),
          respManholes.json(),
        ]);

        // Mapeamento: Áreas (polígonos) -> FloodArea
        const areasMapped: FloodArea[] = areasRaw.map((a: any) => ({
          id: `area-${a.id}`,
          coordinates: a.latitude.map((lat: number, i: number) => ({
            latitude: lat,
            longitude: a.longitude[i],
          })),
          nivel: a.nivel || 'medio',
          descricao: a.posts?.[0]?.content || a.name,
          endereco: a.posts?.[0]?.endereco,
          dataHora: a.createdAt,
        }));

        // Mapeamento: Bueiros -> Manhole
        const manholesMapped: Manhole[] = manholesRaw.map((m: any) => ({
          id: `mh-${m.id}`,
          latitude: m.latitude,
          longitude: m.longitude,
          descricao: m.posts?.[0]?.content || m.name,
          endereco: m.posts?.[0]?.endereco,
          dataHora: m.createdAt,
        }));

        setAllFloodAreas(areasMapped);
        setAllManholes(manholesMapped);
      } catch (error) {
        console.error('Erro ao carregar dados do mapa:', error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  // Anos disponíveis em todos os dados
  const availableYears = useMemo(() => {
    const years = new Set([
      ...allFloodAreas.map((f) => getYearMonth(f.dataHora).year),
      ...allManholes.map((m) => getYearMonth(m.dataHora).year),
    ]);
    const list = Array.from(years).sort((a, b) => b - a);
    return list.length > 0 ? list : [new Date().getUTCFullYear()];
  }, [allFloodAreas, allManholes]);

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
  }, [selectedYear, allFloodAreas, allManholes]);

  // Quando o ano muda, reseta para "todos os meses"
  const handleYearChange = (year: number) => {
    setSelectedYear(year);
    setSelectedMonth(0);
  };

  // 1. Filtragem por Data e Busca
  const allFilteredFloodAreas = useMemo(() =>
    allFloodAreas.filter((f) => {
      const { year, month } = getYearMonth(f.dataHora);
      const matchesDate = year === selectedYear && (selectedMonth === 0 || month === selectedMonth);
      if (!matchesDate) return false;

      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        f.id.toLowerCase().includes(query) ||
        f.endereco?.toLowerCase().includes(query) ||
        f.descricao?.toLowerCase().includes(query)
      );
    }), [selectedYear, selectedMonth, allFloodAreas, searchQuery]);

  const allFilteredManholes = useMemo(() =>
    allManholes.filter((m) => {
      const { year, month } = getYearMonth(m.dataHora);
      const matchesDate = year === selectedYear && (selectedMonth === 0 || month === selectedMonth);
      if (!matchesDate) return false;

      if (!searchQuery) return true;
      const query = searchQuery.toLowerCase();
      return (
        m.id.toLowerCase().includes(query) ||
        m.endereco?.toLowerCase().includes(query) ||
        m.descricao?.toLowerCase().includes(query)
      );
    }), [selectedYear, selectedMonth, allManholes, searchQuery]);

  // 2. Unificação para Paginação Global (Tudo que está visível no mapa deve estar na lista paginada)
  const totalFilteredCount = allFilteredFloodAreas.length + allFilteredManholes.length;
  const totalPages = Math.ceil(totalFilteredCount / pageSize);

  // 3. Fatiamento e Ordenação para a página atual
  const paginatedData = useMemo(() => {
    const combined = [
      ...allFilteredFloodAreas.map(f => ({ type: 'floodArea' as const, data: f })),
      ...allFilteredManholes.map(m => ({ type: 'manhole' as const, data: m })),
    ];

    combined.sort((a, b) => {
      const key = sortConfig.key;
      let valA: any;
      let valB: any;

      if (key === 'type') {
        valA = a.type === 'floodArea' ? 'Área de Alagamento' : 'Bueiro';
        valB = b.type === 'floodArea' ? 'Área de Alagamento' : 'Bueiro';
      } else {
        valA = (a.data as any)[key] || '';
        valB = (b.data as any)[key] || '';
      }

      if (key === 'dataHora') {
        const timeA = new Date(valA).getTime();
        const timeB = new Date(valB).getTime();
        return sortConfig.direction === 'asc' ? timeA - timeB : timeB - timeA;
      }

      if (typeof valA === 'string') {
        const cmp = valA.localeCompare(valB, 'pt-BR');
        return sortConfig.direction === 'asc' ? cmp : -cmp;
      }

      return 0;
    });
    
    const start = (currentPage - 1) * pageSize;
    return combined.slice(start, start + pageSize);
  }, [allFilteredFloodAreas, allFilteredManholes, currentPage, pageSize, sortConfig]);

  // Precisamos extrair de volta os itens da página atual para os componentes
  const currentPageFloodAreas = paginatedData
    .filter(item => item.type === 'floodArea')
    .map(item => item.data as FloodArea);

  const currentPageManholes = paginatedData
    .filter(item => item.type === 'manhole')
    .map(item => item.data as Manhole);

  if (isLoading) {
    return <div className="map-loading">Sincronizando dados...</div>;
  }

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
          floodAreas={allFilteredFloodAreas} 
          manholes={allFilteredManholes}
          selectedYear={selectedYear}
          selectedMonth={selectedMonth}
        />
      </div>

      <div className="map-screen-search-bar">
        <div className="search-input-wrapper">
          <svg className="search-icon" xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <circle cx="11" cy="11" r="8"></circle>
            <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
          </svg>
          <input 
            type="text" 
            placeholder="Pesquisar por endereço, ID ou descrição..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />
        </div>
        
        <div className="page-size-selector">
          <label htmlFor="pageSizeSelect">Mostrar:</label>
          <select 
            id="pageSizeSelect" 
            value={pageSize} 
            onChange={(e) => setPageSize(Number(e.target.value))}
            className="page-size-select"
          >
            <option value={5}>5</option>
            <option value={10}>10</option>
            <option value={25}>25</option>
            <option value={50}>50</option>
            <option value={100}>100</option>
          </select>
        </div>
      </div>

      <div className="map-screen-container">
        <MapView 
          center={mapCenter} 
          zoom={mapZoom} 
          floodAreas={allFilteredFloodAreas} 
          manholes={allFilteredManholes} 
          focusLocation={mapFocus}
        />
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
          <MapItemsTable 
            floodAreas={currentPageFloodAreas} 
            manholes={currentPageManholes} 
            onFocus={handleFocus}
            sortConfig={sortConfig}
            onSort={handleSort}
          />
        ) : (
          <>
            {currentPageFloodAreas.map((fa) => (
              <FloodAreaInfoCard key={fa.id} floodArea={fa} onFocus={() => handleFocus(fa.coordinates[0].latitude, fa.coordinates[0].longitude)} />
            ))}
            {currentPageManholes.map((m) => (
              <ManholeInfoCard key={m.id} manhole={m} onFocus={() => handleFocus(m.latitude, m.longitude)} />
            ))}
          </>
        )}
      </div>

      {totalPages > 1 && (
        <div className="pagination-footer">
          <button 
            disabled={currentPage === 1} 
            onClick={() => setCurrentPage(prev => prev - 1)}
            className="pagination-btn"
          >
            Anterior
          </button>
          
          <div className="pagination-info">
            Página <strong>{currentPage}</strong> de {totalPages}
          </div>

          <button 
            disabled={currentPage === totalPages} 
            onClick={() => setCurrentPage(prev => prev + 1)}
            className="pagination-btn"
          >
            Próxima
          </button>
        </div>
      )}
    </div>
  );
}
