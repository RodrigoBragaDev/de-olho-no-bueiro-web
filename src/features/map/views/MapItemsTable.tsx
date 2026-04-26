import type { FloodArea, Manhole } from '@/features/map/models/MapTypes';
import { NIVEL_LABELS, NIVEL_COLORS } from '@/features/map/models/MapTypes';
import './MapItemsTable.css';

interface MapItemsTableProps {
  floodAreas: FloodArea[];
  manholes: Manhole[];
}

type MapItem = 
  | { type: 'floodArea'; data: FloodArea }
  | { type: 'manhole'; data: Manhole };

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function MapItemsTable({ floodAreas, manholes }: MapItemsTableProps) {
  const items: MapItem[] = [
    ...floodAreas.map(f => ({ type: 'floodArea' as const, data: f })),
    ...manholes.map(m => ({ type: 'manhole' as const, data: m })),
  ];
  
  // order by date (newest first)
  items.sort((a, b) => new Date(b.data.dataHora).getTime() - new Date(a.data.dataHora).getTime());

  if (items.length === 0) {
    return null;
  }

  return (
    <div className="map-items-table-container">
      <h2 className="map-items-table-title">Tabela de Ocorrências</h2>
      <div className="map-items-table-wrapper">
        <table className="map-items-table">
          <thead>
            <tr>
              <th>Tipo</th>
              <th>ID</th>
              <th>Data de criação</th>
              <th>Endereço</th>
              <th>Descrição</th>
              <th>Detalhes / Coordenadas</th>
            </tr>
          </thead>
          <tbody>
            {items.map((item) => {
              if (item.type === 'floodArea') {
                const floodArea = item.data;
                const colors = NIVEL_COLORS[floodArea.nivel];
                return (
                  <tr key={`fa-${floodArea.id}`}>
                    <td>
                      <div className="map-items-type-column">
                        <span className="map-items-table-type">Área de Alagamento</span>
                        <span
                          className="map-items-table-badge"
                          style={{ backgroundColor: colors.badge }}
                        >
                          {NIVEL_LABELS[floodArea.nivel]}
                        </span>
                      </div>
                    </td>
                    <td>{floodArea.id}</td>
                    <td>{formatDate(floodArea.dataHora)}</td>
                    <td>{floodArea.endereco || '—'}</td>
                    <td>{floodArea.descricao || '—'}</td>
                    <td>
                      <div className="map-items-table-coords-container">
                        {floodArea.coordinates.map((c, i) => (
                          <div key={i} className="map-items-table-coord-item">
                            P{i + 1}: {c.latitude.toFixed(4)}, {c.longitude.toFixed(4)}
                          </div>
                        ))}
                      </div>
                    </td>
                  </tr>
                );
              } else {
                const manhole = item.data;
                return (
                  <tr key={`mh-${manhole.id}`}>
                    <td>
                      <div className="map-items-type-column">
                        <span className="map-items-table-type">Bueiro Danificado</span>
                        <div className="map-items-table-icon">
                          <div className="map-items-table-icon-core" />
                        </div>
                      </div>
                    </td>
                    <td>{manhole.id}</td>
                    <td>{formatDate(manhole.dataHora)}</td>
                    <td>{manhole.endereco || '—'}</td>
                    <td>{manhole.descricao || '—'}</td>
                    <td>
                      <div className="map-items-table-coords-container">
                        <div className="map-items-table-coord-item">
                          Lat: {manhole.latitude.toFixed(6)}
                        </div>
                        <div className="map-items-table-coord-item">
                          Lng: {manhole.longitude.toFixed(6)}
                        </div>
                      </div>
                    </td>
                  </tr>
                );
              }
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
